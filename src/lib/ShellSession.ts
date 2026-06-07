/**
 * A single interactive shell session: cwd, environment, aliases, history and
 * the execution engine. It is framework-agnostic so multiple sessions (tmux
 * panes) can run against one shared VirtualFileSystem.
 *
 * Commands receive `this` as their `fs` argument; the session implements the
 * file-system facade they expect (resolvePath, getFile, createFile, ...).
 */
import { VirtualFileSystem, FileSystemItem, HOME } from "./vfs";
import {
  parseCommandLine,
  tokenize,
  expandBraces,
  WordToken,
  ParsedPipeline,
  Redirect,
} from "./shell";
import { matchPattern, generateId } from "./terminalUtils";
import { commands } from "@/commands/linux";
import { TerminalLine } from "@/types/types";

export interface EditorRequest {
  editor: "vim" | "nano";
  path: string;
  content: string;
  existed: boolean;
}

export interface ExecResult {
  lines: TerminalLine[];
  clear?: boolean;
  exit?: boolean;
  editor?: EditorRequest;
  /** When history expansion rewrote the line, the line bash would echo. */
  echo?: string;
}

const defaultEnv = (): Record<string, string> => ({
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  HOME,
  USER: "user",
  LOGNAME: "user",
  SHELL: "/bin/bash",
  TERM: "xterm-256color",
  LANG: "en_US.UTF-8",
  PWD: HOME,
  OLDPWD: HOME,
  HOSTNAME: "linux-playground",
});

export class ShellSession {
  vfs: VirtualFileSystem;
  cwd: string = HOME;
  envVars: Record<string, string> = defaultEnv();
  aliases: Record<string, string> = {};
  commandHistory: string[] = [];
  private lastExit = 0;

  constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
  }

  // ---- File-system facade (consumed by command modules) ------------------

  get currentPath(): string {
    return this.cwd;
  }

  setCurrentPath(path: string): void {
    this.envVars.OLDPWD = this.cwd;
    this.cwd = path;
    this.envVars.PWD = path;
  }

  resolvePath(path: string, current: string = this.cwd): string {
    if (!path) return current;
    if (path === "~") path = HOME;
    else if (path.startsWith("~/")) path = HOME + path.slice(1);

    const isAbsolute = path.startsWith("/");
    const baseParts = isAbsolute ? [] : current.split("/").filter(Boolean);
    const parts = [...baseParts];
    for (const part of path.split("/").filter(Boolean)) {
      if (part === "..") parts.pop();
      else if (part !== ".") parts.push(part);
    }
    return parts.length === 0 ? "/" : "/" + parts.join("/");
  }

  isDirectory(path: string): boolean {
    return this.vfs.isDir(this.resolvePath(path));
  }

  pathExists(path: string): boolean {
    return this.vfs.exists(this.resolvePath(path));
  }

  getFile(path: string): FileSystemItem | null {
    return this.vfs.getItem(this.resolvePath(path));
  }

  getDirectory(path: string): FileSystemItem[] {
    return this.vfs.list(this.resolvePath(path));
  }

  createDirectory(path: string, parents = false): boolean {
    return this.vfs.mkdir(this.resolvePath(path), parents);
  }

  createFile(path: string, content = ""): boolean {
    if (path === "/dev/null") return true; // discard
    return this.vfs.writeFile(this.resolvePath(path), content);
  }

  touchFile(path: string): boolean {
    return this.vfs.touch(this.resolvePath(path));
  }

  removeItem(path: string, recursive = false): boolean {
    return this.vfs.remove(this.resolvePath(path), recursive);
  }

  copyItem(src: string, dest: string, recursive = false): boolean {
    return this.vfs.copy(this.resolvePath(src), this.resolvePath(dest), recursive);
  }

  getLastExit(): number {
    return this.lastExit;
  }

  setLastExit(code: number): void {
    this.lastExit = code;
  }

  get commandNames(): string[] {
    return [...Object.keys(commands), ...Object.keys(this.aliases)];
  }

  // ---- Expansion helpers --------------------------------------------------

  private expandVars(s: string): string {
    return s.replace(
      /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)|\$\?|\$\$/g,
      (match, braced, bare) => {
        if (match === "$?") return String(this.lastExit);
        if (match === "$$") return "1234";
        return this.envVars[braced || bare] ?? "";
      }
    );
  }

  private globExpand(pattern: string): string[] {
    const slash = pattern.lastIndexOf("/");
    const dirPart = slash >= 0 ? pattern.slice(0, slash) || "/" : ".";
    const base = slash >= 0 ? pattern.slice(slash + 1) : pattern;
    const dirPath = this.resolvePath(dirPart);
    if (!this.vfs.isDir(dirPath)) return [];
    return this.vfs
      .list(dirPath)
      .filter((it) => base.startsWith(".") || !it.name.startsWith("."))
      .filter((it) => matchPattern(base, it.name))
      .map((it) =>
        slash >= 0 ? (dirPart === "/" ? "/" + it.name : dirPart + "/" + it.name) : it.name
      )
      .sort((a, b) => a.localeCompare(b));
  }

  private expandWord(token: WordToken): string[] {
    if (token.singleQuoted) return [token.value];

    // Brace expansion happens first, on the raw (unquoted) word.
    const braceParts = token.quoted ? [token.value] : expandBraces(token.value);

    const out: string[] = [];
    for (const part of braceParts) {
      let value = this.expandVars(part);
      if (!token.quoted && (value === "~" || value.startsWith("~/"))) {
        value = value === "~" ? HOME : HOME + value.slice(1);
      }
      if (!token.quoted && /[*?]/.test(value)) {
        const matches = this.globExpand(value);
        if (matches.length > 0) {
          out.push(...matches);
          continue;
        }
      }
      out.push(value);
    }
    return out;
  }

  private resolveAlias(argv: string[], seen: Set<string>): string[] {
    if (argv.length === 0) return argv;
    const name = argv[0];
    if (this.aliases[name] && !seen.has(name)) {
      seen.add(name);
      const aliasWords = tokenize(this.aliases[name])
        .filter((t) => t.type === "word")
        .map((t) => (t as { value: string }).value);
      return this.resolveAlias([...aliasWords, ...argv.slice(1)], seen);
    }
    return argv;
  }

  private buildArgv(words: WordToken[]): string[] {
    const argv: string[] = [];
    for (const w of words) argv.push(...this.expandWord(w));
    return this.resolveAlias(argv, new Set());
  }

  /** Run command substitution $(...) and `...`, returning the new line. */
  private expandCommandSubstitution(line: string, depth = 0): string {
    if (depth > 8) return line;
    let result = "";
    let i = 0;
    let inSingle = false;
    while (i < line.length) {
      const c = line[i];
      if (c === "'" && !inSingle) {
        inSingle = true;
        result += c;
        i++;
        continue;
      }
      if (c === "'" && inSingle) {
        inSingle = false;
        result += c;
        i++;
        continue;
      }
      if (!inSingle && c === "$" && line[i + 1] === "(") {
        // Find matching close paren.
        let depthP = 1;
        let j = i + 2;
        while (j < line.length && depthP > 0) {
          if (line[j] === "(") depthP++;
          else if (line[j] === ")") depthP--;
          if (depthP === 0) break;
          j++;
        }
        const inner = line.slice(i + 2, j);
        result += this.captureStdout(inner, depth + 1);
        i = j + 1;
        continue;
      }
      if (!inSingle && c === "`") {
        const j = line.indexOf("`", i + 1);
        if (j > i) {
          const inner = line.slice(i + 1, j);
          result += this.captureStdout(inner, depth + 1);
          i = j + 1;
          continue;
        }
      }
      result += c;
      i++;
    }
    return result;
  }

  private captureStdout(inner: string, depth: number): string {
    const res = this.run(inner, depth);
    const text = res.lines
      .filter((l) => l.type !== "error" && l.type !== "command")
      .map((l) => l.content)
      .join("\n");
    // Command substitution strips trailing newlines and folds the rest.
    return text.replace(/\n+$/, "").replace(/\n/g, " ");
  }

  // ---- History expansion --------------------------------------------------

  private expandHistory(line: string): string | null {
    if (!line.includes("!")) return null;
    let changed = false;
    const replaced = line.replace(/!(!|-?\d+|[A-Za-z][\w-]*)/g, (m, ref) => {
      let found: string | undefined;
      if (ref === "!") {
        found = this.commandHistory[this.commandHistory.length - 1];
      } else if (/^-?\d+$/.test(ref)) {
        const n = parseInt(ref, 10);
        found = n < 0 ? this.commandHistory[this.commandHistory.length + n] : this.commandHistory[n - 1];
      } else {
        found = [...this.commandHistory].reverse().find((c) => c.startsWith(ref));
      }
      if (found !== undefined) {
        changed = true;
        return found;
      }
      return m;
    });
    return changed ? replaced : null;
  }

  // ---- Execution ----------------------------------------------------------

  private makeLine(type: TerminalLine["type"], content: string): TerminalLine {
    return { id: generateId(), type, content, timestamp: new Date() };
  }

  private runPipeline(pl: ParsedPipeline, depth: number): { lines: TerminalLine[]; success: boolean; clear?: boolean; exit?: boolean; editor?: EditorRequest } {
    const out: TerminalLine[] = [];

    const find = (...types: Redirect["type"][]) => pl.redirects.find((r) => types.includes(r.type));
    const inR = find("in");
    let initialStdin: string | undefined;
    if (inR && inR.file) {
      const f = this.getFile(inR.file);
      if (!f) return { lines: [this.makeLine("error", `bash: ${inR.file}: No such file or directory`)], success: false };
      if (f.type === "directory") return { lines: [this.makeLine("error", `bash: ${inR.file}: Is a directory`)], success: false };
      initialStdin = f.content || "";
    }

    const outR = find("out", "append", "bothout", "bothappend");
    const errR = find("errout", "errappend", "bothout", "bothappend");
    const mergeErr = !!find("mergeerr");

    let success = true;
    let lastStdout = "";

    for (let s = 0; s < pl.stages.length; s++) {
      const argv = this.buildArgv(pl.stages[s].words);
      if (argv.length === 0) continue;
      const name = argv[0];
      const cmdArgs = argv.slice(1);
      const isLast = s === pl.stages.length - 1;

      if (name === "clear") return { lines: [], success: true, clear: true };
      if (name === "exit") return { lines: [], success: true, exit: true };

      // Editors take over the screen; only valid as a lone command.
      if ((name === "vim" || name === "vi" || name === "nano") && pl.stages.length === 1 && depth === 0) {
        const target = cmdArgs.find((a) => !a.startsWith("-"));
        if (target) {
          const resolved = this.getFile(target);
          if (resolved && resolved.type === "directory") {
            return { lines: [this.makeLine("error", `${name}: ${target}: Is a directory`)], success: false };
          }
          return {
            lines: [],
            success: true,
            editor: {
              editor: name === "nano" ? "nano" : "vim",
              path: target,
              content: resolved?.content || "",
              existed: !!resolved,
            },
          };
        }
      }

      const command = commands[name];
      if (!command) {
        out.push(this.makeLine("error", `${name}: command not found`));
        success = false;
        lastStdout = "";
        break;
      }

      const stdin = s === 0 ? initialStdin : lastStdout;
      const result = command.execute(cmdArgs, this, this.commandHistory, stdin);

      const stdoutParts: string[] = [];
      const errParts: TerminalLine[] = [];
      let hadError = false;
      for (const line of result) {
        if (line.type === "error") {
          hadError = true;
          if (mergeErr) stdoutParts.push(line.content);
          else errParts.push(line);
        } else {
          stdoutParts.push(line.content);
        }
      }
      if (hadError) success = false;
      lastStdout = stdoutParts.join("\n");

      // stderr handling for every stage.
      if (errParts.length > 0) {
        if (errR && errR.file) {
          this.writeRedirect(errR, errParts.map((l) => l.content).join("\n"));
        } else {
          out.push(...errParts);
        }
      }

      if (isLast) {
        // stdout of the final stage: file or screen.
        const stageLines = result.filter((l) => l.type !== "error" || mergeErr);
        if (outR && outR.file) {
          this.writeRedirect(outR, lastStdout);
        } else {
          out.push(...stageLines);
        }
      }
    }

    return { lines: out, success };
  }

  private writeRedirect(r: Redirect, content: string): void {
    if (!r.file) return;
    if (r.file === "/dev/null") return;
    const append = r.type === "append" || r.type === "errappend" || r.type === "bothappend";
    if (append) {
      const prev = this.getFile(r.file)?.content ?? "";
      this.createFile(r.file, prev ? prev + "\n" + content : content);
    } else {
      this.createFile(r.file, content);
    }
  }

  /** Internal run without history side-effects (used for substitution). */
  private run(input: string, depth: number): ExecResult {
    const substituted = this.expandCommandSubstitution(input, depth);
    const { pipelines, error } = parseCommandLine(substituted);
    if (error) {
      this.lastExit = 2;
      return { lines: [this.makeLine("error", `bash: ${error}`)] };
    }
    if (pipelines.length === 0) return { lines: [] };

    const collected: TerminalLine[] = [];
    let lastSuccess = true;
    let clear = false;
    let exit = false;
    let editor: EditorRequest | undefined;

    for (let i = 0; i < pipelines.length; i++) {
      if (i > 0) {
        const connector = pipelines[i - 1].connector;
        if (connector === "&&" && !lastSuccess) continue;
        if (connector === "||" && lastSuccess) continue;
      }
      const res = this.runPipeline(pipelines[i], depth);
      if (res.clear) {
        clear = true;
        lastSuccess = true;
        continue;
      }
      if (res.exit) {
        exit = true;
        break;
      }
      if (res.editor) {
        editor = res.editor;
        break;
      }
      collected.push(...res.lines);
      lastSuccess = res.success;
    }

    this.lastExit = lastSuccess ? 0 : 1;
    return { lines: collected, clear, exit, editor };
  }

  /** Public entry point: runs a line and records it in history. */
  execute(input: string): ExecResult {
    const trimmed = input.trim();
    if (!trimmed) return { lines: [] };

    // History expansion (!!, !n, !prefix) before recording.
    let line = trimmed;
    let echo: string | undefined;
    const expanded = this.expandHistory(trimmed);
    if (expanded !== null) {
      line = expanded;
      echo = expanded;
    }

    this.commandHistory.push(line);
    if (line.startsWith("#")) return { lines: [], echo };

    const res = this.run(line, 0);
    return { ...res, echo };
  }
}
