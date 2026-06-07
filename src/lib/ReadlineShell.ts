/**
 * A readline-style line editor that drives one xterm terminal against one
 * ShellSession. xterm only renders and emits raw key data, so all line editing
 * (cursor movement, kill/yank, history, completion, reverse search) lives here.
 */
import type { Terminal } from "@xterm/xterm";
import { ShellSession } from "./ShellSession";
import { EditorRequest } from "./ShellSession";
import { buildPrompt, lineToAnsi, ANSI } from "./ansi";

interface ReadlineOptions {
  onEditor: (req: EditorRequest) => void;
  onExit: () => void;
  onUpdate: () => void; // after each command (refresh status bar + persist)
}

export class ReadlineShell {
  private term: Terminal;
  private session: ShellSession;
  private opts: ReadlineOptions;

  private buffer = "";
  private cursor = 0;
  private histIndex = -1; // -1 == editing a fresh line
  private stash = "";
  private killRing = "";

  private editorOpen = false;
  private disposed = false;

  // Reverse search (Ctrl+R) state.
  private rsActive = false;
  private rsQuery = "";

  private dataSub?: { dispose: () => void };

  constructor(term: Terminal, session: ShellSession, opts: ReadlineOptions) {
    this.term = term;
    this.session = session;
    this.opts = opts;
  }

  start(welcome = true) {
    if (welcome) {
      this.term.write(
        ANSI.brightGreen +
          "Welcome to Linux Terminal Playground" +
          ANSI.reset +
          "\r\n" +
          ANSI.dim +
          'Type "help". Multiplexing: Ctrl+B then % (vsplit), " (hsplit), arrows, c, x.' +
          ANSI.reset +
          "\r\n\r\n"
      );
    }
    this.dataSub = this.term.onData((d) => this.onData(d));
    this.prompt();
  }

  dispose() {
    this.disposed = true;
    this.dataSub?.dispose();
  }

  focus() {
    this.term.focus();
  }

  private prompt() {
    this.term.write(buildPrompt(this.session));
  }

  /** Re-render the current input line in place. */
  private refresh() {
    if (this.rsActive) {
      this.renderReverseSearch();
      return;
    }
    const prompt = buildPrompt(this.session);
    this.term.write("\r\x1b[K" + prompt + this.buffer);
    const back = this.buffer.length - this.cursor;
    if (back > 0) this.term.write(`\x1b[${back}D`);
  }

  // ---- Input dispatch -----------------------------------------------------

  private onData(data: string) {
    if (this.disposed || this.editorOpen) return;

    let i = 0;
    while (i < data.length) {
      const c = data[i];

      // Escape sequences (arrows, home/end, delete).
      if (c === "\x1b") {
        const seq = data.slice(i);
        const consumed = this.handleEscape(seq);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        // Unknown escape: consume the whole CSI so it never leaks as text.
        // eslint-disable-next-line no-control-regex
        const m = seq.match(/^\x1b\[[0-9;]*[A-Za-z~]/) || seq.match(/^\x1b./);
        i += m ? m[0].length : 1;
        continue;
      }

      if (this.rsActive) {
        i += this.handleReverseSearchKey(c);
        continue;
      }

      switch (c) {
        case "\r": // Enter
        case "\n":
          this.acceptLine();
          break;
        case "\x7f": // Backspace
          this.backspace();
          break;
        case "\t": // Tab
          this.complete();
          break;
        case "\x03": // Ctrl+C
          this.term.write("^C\r\n");
          this.buffer = "";
          this.cursor = 0;
          this.histIndex = -1;
          this.prompt();
          break;
        case "\x04": // Ctrl+D
          if (this.buffer.length === 0) {
            this.term.write("exit\r\n");
            this.opts.onExit();
          }
          break;
        case "\x01": // Ctrl+A -> start of line
          this.cursor = 0;
          this.refresh();
          break;
        case "\x05": // Ctrl+E -> end of line
          this.cursor = this.buffer.length;
          this.refresh();
          break;
        case "\x02": // Ctrl+B -> left
          if (this.cursor > 0) this.cursor--;
          this.refresh();
          break;
        case "\x06": // Ctrl+F -> right
          if (this.cursor < this.buffer.length) this.cursor++;
          this.refresh();
          break;
        case "\x0b": // Ctrl+K -> kill to end
          this.killRing = this.buffer.slice(this.cursor);
          this.buffer = this.buffer.slice(0, this.cursor);
          this.refresh();
          break;
        case "\x15": // Ctrl+U -> kill to start
          this.killRing = this.buffer.slice(0, this.cursor);
          this.buffer = this.buffer.slice(this.cursor);
          this.cursor = 0;
          this.refresh();
          break;
        case "\x17": // Ctrl+W -> kill previous word
          this.killWord();
          break;
        case "\x19": // Ctrl+Y -> yank
          this.insert(this.killRing);
          break;
        case "\x0c": // Ctrl+L -> clear screen
          this.term.write("\x1b[2J\x1b[H");
          this.refresh();
          break;
        case "\x12": // Ctrl+R -> reverse search
          this.startReverseSearch();
          break;
        default:
          if (c >= " " && c !== "\x7f") this.insert(c);
      }
      i++;
    }
  }

  /** Returns the number of input chars consumed (0 if not an escape we know). */
  private handleEscape(seq: string): number {
    const map: Record<string, () => void> = {
      "\x1b[A": () => this.historyPrev(),
      "\x1b[B": () => this.historyNext(),
      "\x1b[C": () => {
        if (this.cursor < this.buffer.length) this.cursor++;
        this.refresh();
      },
      "\x1b[D": () => {
        if (this.cursor > 0) this.cursor--;
        this.refresh();
      },
      "\x1b[H": () => {
        this.cursor = 0;
        this.refresh();
      },
      "\x1b[F": () => {
        this.cursor = this.buffer.length;
        this.refresh();
      },
      "\x1b[1~": () => {
        this.cursor = 0;
        this.refresh();
      },
      "\x1b[4~": () => {
        this.cursor = this.buffer.length;
        this.refresh();
      },
      "\x1b[3~": () => this.deleteForward(),
      "\x1bb": () => {
        this.cursor = this.prevWordStart();
        this.refresh();
      },
      "\x1bf": () => {
        this.cursor = this.nextWordEnd();
        this.refresh();
      },
    };
    const keys = Object.keys(map).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (seq.startsWith(k)) {
        if (this.rsActive && (k === "\x1b[A" || k === "\x1b[B")) this.endReverseSearch(true);
        map[k]();
        return k.length;
      }
    }
    return 0;
  }

  // ---- Editing primitives -------------------------------------------------

  private insert(text: string) {
    this.buffer = this.buffer.slice(0, this.cursor) + text + this.buffer.slice(this.cursor);
    this.cursor += text.length;
    this.refresh();
  }

  private backspace() {
    if (this.cursor === 0) return;
    this.buffer = this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
    this.cursor--;
    this.refresh();
  }

  private deleteForward() {
    if (this.cursor >= this.buffer.length) return;
    this.buffer = this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1);
    this.refresh();
  }

  private prevWordStart(): number {
    let i = this.cursor;
    while (i > 0 && this.buffer[i - 1] === " ") i--;
    while (i > 0 && this.buffer[i - 1] !== " ") i--;
    return i;
  }

  private nextWordEnd(): number {
    let i = this.cursor;
    while (i < this.buffer.length && this.buffer[i] === " ") i++;
    while (i < this.buffer.length && this.buffer[i] !== " ") i++;
    return i;
  }

  private killWord() {
    const start = this.prevWordStart();
    this.killRing = this.buffer.slice(start, this.cursor);
    this.buffer = this.buffer.slice(0, start) + this.buffer.slice(this.cursor);
    this.cursor = start;
    this.refresh();
  }

  // ---- History ------------------------------------------------------------

  private historyPrev() {
    const hist = this.session.commandHistory;
    if (hist.length === 0) return;
    if (this.histIndex === -1) this.stash = this.buffer;
    this.histIndex = Math.min(this.histIndex + 1, hist.length - 1);
    this.buffer = hist[hist.length - 1 - this.histIndex];
    this.cursor = this.buffer.length;
    this.refresh();
  }

  private historyNext() {
    const hist = this.session.commandHistory;
    if (this.histIndex === -1) return;
    this.histIndex--;
    this.buffer = this.histIndex === -1 ? this.stash : hist[hist.length - 1 - this.histIndex];
    this.cursor = this.buffer.length;
    this.refresh();
  }

  // ---- Reverse search (Ctrl+R) -------------------------------------------

  private startReverseSearch() {
    this.rsActive = true;
    this.rsQuery = "";
    this.renderReverseSearch();
  }

  private renderReverseSearch() {
    const match = this.findReverseMatch();
    this.term.write("\r\x1b[K" + `(reverse-i-search)\`${this.rsQuery}': ` + (match || ""));
  }

  private findReverseMatch(): string {
    const hist = this.session.commandHistory;
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i].includes(this.rsQuery)) return hist[i];
    }
    return "";
  }

  private handleReverseSearchKey(c: string): number {
    if (c === "\r" || c === "\n") {
      this.endReverseSearch(true);
      this.acceptLine();
      return 1;
    }
    if (c === "\x03" || c === "\x07") {
      // Ctrl+C / Ctrl+G cancels.
      this.endReverseSearch(false);
      return 1;
    }
    if (c === "\x7f") {
      this.rsQuery = this.rsQuery.slice(0, -1);
      this.renderReverseSearch();
      return 1;
    }
    if (c === "\x12") {
      // another Ctrl+R: keep current match (simplified)
      this.renderReverseSearch();
      return 1;
    }
    if (c >= " ") {
      this.rsQuery += c;
      this.renderReverseSearch();
      return 1;
    }
    return 1;
  }

  private endReverseSearch(accept: boolean) {
    if (!this.rsActive) return;
    this.rsActive = false;
    if (accept) {
      this.buffer = this.findReverseMatch();
      this.cursor = this.buffer.length;
    }
    this.histIndex = -1;
    this.refresh();
  }

  // ---- Tab completion -----------------------------------------------------

  private complete() {
    const before = this.buffer.slice(0, this.cursor);
    const tokens = before.split(/\s+/);
    const isFirst = tokens.length <= 1 && !before.includes(" ");
    const word = before.match(/(\S*)$/)?.[1] ?? "";

    let candidates: string[];
    let dirPrefix = "";

    if (isFirst) {
      candidates = this.session.commandNames
        .filter((n) => n.startsWith(word))
        .sort();
    } else {
      const slash = word.lastIndexOf("/");
      const baseDir = slash >= 0 ? word.slice(0, slash + 1) : "";
      dirPrefix = baseDir;
      const base = slash >= 0 ? word.slice(slash + 1) : word;
      const dirAbs = this.session.resolvePath(baseDir || ".");
      candidates = this.session
        .getDirectory(dirAbs)
        .filter((it) => it.name.startsWith(base))
        .map((it) => it.name + (it.type === "directory" ? "/" : ""))
        .sort();
    }

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      const completed = dirPrefix + candidates[0];
      this.replaceWord(word, completed.endsWith("/") ? completed : completed + " ");
      return;
    }

    const common = this.commonPrefix(candidates);
    const wordBase = dirPrefix ? word.slice(dirPrefix.length) : word;
    if (common.length > wordBase.length) {
      this.replaceWord(word, dirPrefix + common);
    } else {
      // List the options, then redraw the prompt and buffer.
      this.term.write("\r\n" + candidates.join("  ") + "\r\n");
      this.refresh();
    }
  }

  private replaceWord(oldWord: string, replacement: string) {
    const start = this.cursor - oldWord.length;
    this.buffer = this.buffer.slice(0, start) + replacement + this.buffer.slice(this.cursor);
    this.cursor = start + replacement.length;
    this.refresh();
  }

  private commonPrefix(items: string[]): string {
    if (items.length === 0) return "";
    let prefix = items[0];
    for (const it of items) {
      while (!it.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    return prefix;
  }

  // ---- Command execution --------------------------------------------------

  private acceptLine() {
    const line = this.buffer;
    this.term.write("\r\n");
    this.buffer = "";
    this.cursor = 0;
    this.histIndex = -1;

    if (line.trim() === "") {
      this.prompt();
      return;
    }

    const res = this.session.execute(line);

    if (res.echo && res.echo !== line) {
      this.term.write(res.echo + "\r\n");
    }

    if (res.clear) {
      this.term.write("\x1b[2J\x1b[H");
      this.opts.onUpdate();
      this.prompt();
      return;
    }

    if (res.editor) {
      this.editorOpen = true;
      this.opts.onEditor(res.editor);
      return;
    }

    if (res.exit) {
      this.opts.onExit();
      return;
    }

    if (res.lines.length > 0) {
      const text = res.lines.map(lineToAnsi).join("\r\n");
      this.term.write(text + "\r\n");
    }

    this.opts.onUpdate();
    this.prompt();
  }

  // ---- External control (tutorial suggestions, editor return) ------------

  /** Type a command into the prompt without running it. */
  setBuffer(cmd: string) {
    this.buffer = cmd;
    this.cursor = cmd.length;
    this.histIndex = -1;
    this.refresh();
    this.focus();
  }

  /** Called by the editor overlay after it closes. */
  resumeAfterEditor(savedMessage?: string) {
    this.editorOpen = false;
    if (savedMessage) this.term.write(savedMessage + "\r\n");
    this.opts.onUpdate();
    this.prompt();
    this.focus();
  }
}
