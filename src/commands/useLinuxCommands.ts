import { useFileSystem } from "@/hooks/useLinuxFileSystem";
import { TerminalLine } from "@/types/types";
import { useCallback, useState } from "react";
import { commands } from "./linux";
import { useTerminalStore } from "@/store/terminalStore";
import {
  parseCommandLine,
  tokenize,
  WordToken,
  ParsedPipeline,
} from "@/lib/shell";
import { matchPattern, generateId } from "@/lib/terminalUtils";

const HOME = "/home/user";

export const useLinuxCommands = () => {
  const { linuxHistory, addLinuxHistory, setLinuxHistory } = useTerminalStore();
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fs = useFileSystem();

  const getWelcomeMessage = (): TerminalLine => ({
    id: "welcome-linux",
    type: "output",
    content:
      'Welcome to Linux Terminal Playground!\nType "help" to see available commands or start with the tutorial.',
    timestamp: new Date(),
  });

  const history = linuxHistory.length > 0 ? linuxHistory : [getWelcomeMessage()];

  const makeLine = useCallback(
    (type: TerminalLine["type"], content: string): TerminalLine => ({
      id: generateId(),
      type,
      content,
      timestamp: new Date(),
    }),
    []
  );

  // ---- Word expansion (variables, tilde, globbing) -------------------------

  const expandVars = useCallback(
    (s: string): string =>
      s.replace(
        /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)|\$\?|\$\$/g,
        (match, braced, bare) => {
          if (match === "$?") return String(fs.getLastExit());
          if (match === "$$") return "1234";
          const name = braced || bare;
          return fs.envVars[name] ?? "";
        }
      ),
    [fs]
  );

  const globExpand = useCallback(
    (pattern: string): string[] => {
      const slash = pattern.lastIndexOf("/");
      const dirPart = slash >= 0 ? pattern.slice(0, slash) || "/" : ".";
      const base = slash >= 0 ? pattern.slice(slash + 1) : pattern;
      const dirPath = fs.resolvePath(dirPart);

      if (!fs.isDirectory(dirPath)) return [];

      const items = fs.getDirectory(dirPath);
      return items
        .filter((it) => base.startsWith(".") || !it.name.startsWith("."))
        .filter((it) => matchPattern(base, it.name))
        .map((it) =>
          slash >= 0
            ? dirPart === "/"
              ? "/" + it.name
              : dirPart + "/" + it.name
            : it.name
        )
        .sort((a, b) => a.localeCompare(b));
    },
    [fs]
  );

  const expandWord = useCallback(
    (token: WordToken): string[] => {
      if (token.singleQuoted) return [token.value];

      let value = expandVars(token.value);

      if (!token.quoted && (value === "~" || value.startsWith("~/"))) {
        value = value === "~" ? HOME : HOME + value.slice(1);
      }

      if (!token.quoted && /[*?]/.test(value)) {
        const matches = globExpand(value);
        if (matches.length > 0) return matches;
      }

      return [value];
    },
    [expandVars, globExpand]
  );

  const resolveAlias = useCallback(
    (argv: string[], seen: Set<string>): string[] => {
      if (argv.length === 0) return argv;
      const name = argv[0];
      if (fs.aliases[name] && !seen.has(name)) {
        seen.add(name);
        const aliasWords = tokenize(fs.aliases[name])
          .filter((t) => t.type === "word")
          .map((t) => (t as { value: string }).value);
        return resolveAlias([...aliasWords, ...argv.slice(1)], seen);
      }
      return argv;
    },
    [fs]
  );

  const buildArgv = useCallback(
    (words: WordToken[]): string[] => {
      const argv: string[] = [];
      for (const w of words) argv.push(...expandWord(w));
      return resolveAlias(argv, new Set());
    },
    [expandWord, resolveAlias]
  );

  // ---- Pipeline execution --------------------------------------------------

  const runPipeline = useCallback(
    (
      pl: ParsedPipeline
    ): { lines: TerminalLine[]; success: boolean; cleared: boolean } => {
      const outLines: TerminalLine[] = [];

      // Input redirection (<file) feeds the first stage.
      let initialStdin: string | undefined;
      const inRedirect = pl.redirects.find((r) => r.type === "in");
      if (inRedirect) {
        const f = fs.getFile(inRedirect.file);
        if (!f) {
          return {
            lines: [
              makeLine(
                "error",
                `bash: ${inRedirect.file}: No such file or directory`
              ),
            ],
            success: false,
            cleared: false,
          };
        }
        if (f.type === "directory") {
          return {
            lines: [
              makeLine("error", `bash: ${inRedirect.file}: Is a directory`),
            ],
            success: false,
            cleared: false,
          };
        }
        initialStdin = f.content || "";
      }

      const outRedirect = pl.redirects.find(
        (r) => r.type === "out" || r.type === "append"
      );

      let success = true;
      let lastStdout = "";

      for (let s = 0; s < pl.stages.length; s++) {
        const argv = buildArgv(pl.stages[s].words);
        if (argv.length === 0) continue;

        const name = argv[0];
        const cmdArgs = argv.slice(1);
        const isLast = s === pl.stages.length - 1;

        if (name === "clear") {
          return { lines: [], success: true, cleared: true };
        }

        const command = commands[name];
        if (!command) {
          outLines.push(makeLine("error", `${name}: command not found`));
          success = false;
          lastStdout = "";
          break;
        }

        const stageStdin = s === 0 ? initialStdin : lastStdout;
        const result = command.execute(cmdArgs, fs, commandHistory, stageStdin);

        const stdoutParts: string[] = [];
        let hadError = false;
        for (const line of result) {
          if (line.type === "error") hadError = true;
          else stdoutParts.push(line.content);
        }
        if (hadError) success = false;
        lastStdout = stdoutParts.join("\n");

        if (isLast && outRedirect) {
          const previous =
            outRedirect.type === "append"
              ? fs.getFile(outRedirect.file)?.content ?? ""
              : "";
          const combined =
            outRedirect.type === "append" && previous
              ? previous + "\n" + lastStdout
              : lastStdout;
          // Overwrite/append by removing then recreating to bypass the guard.
          if (fs.getFile(outRedirect.file)) fs.removeItem(outRedirect.file);
          fs.createFile(outRedirect.file, combined);
          for (const line of result)
            if (line.type === "error") outLines.push(line);
        } else if (isLast) {
          for (const line of result) outLines.push(line);
        } else {
          // Intermediate stage: errors are shown, stdout is piped onward.
          for (const line of result)
            if (line.type === "error") outLines.push(line);
        }
      }

      return { lines: outLines, success, cleared: false };
    },
    [fs, commandHistory, buildArgv, makeLine]
  );

  const executeCommand = useCallback(
    (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      addLinuxHistory({
        id: generateId(),
        type: "command",
        content: `user@linux-playground:${fs.currentPath}$ ${trimmedInput}`,
        timestamp: new Date(),
      });

      setCommandHistory((prev) => [...prev, trimmedInput]);
      setHistoryIndex(-1);

      // Ignore full-line comments.
      if (trimmedInput.startsWith("#")) return;

      const { pipelines, error } = parseCommandLine(trimmedInput);
      if (error) {
        addLinuxHistory(makeLine("error", `bash: ${error}`));
        fs.setLastExit(2);
        return;
      }
      if (pipelines.length === 0) return;

      const collected: TerminalLine[] = [];
      let lastSuccess = true;
      let cleared = false;

      for (let i = 0; i < pipelines.length; i++) {
        if (i > 0) {
          const connector = pipelines[i - 1].connector;
          if (connector === "&&" && !lastSuccess) continue;
          if (connector === "||" && lastSuccess) continue;
        }

        const res = runPipeline(pipelines[i]);
        if (res.cleared) {
          cleared = true;
          lastSuccess = true;
          continue;
        }
        collected.push(...res.lines);
        lastSuccess = res.success;
      }

      fs.setLastExit(lastSuccess ? 0 : 1);

      if (cleared) {
        setLinuxHistory([]);
        return;
      }

      collected.forEach((line) => addLinuxHistory(line));
    },
    [fs, runPipeline, addLinuxHistory, setLinuxHistory, makeLine]
  );

  const getPrompt = useCallback(() => {
    return `user@linux-playground:${fs.currentPath}$ `;
  }, [fs.currentPath]);

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        return commandHistory[commandHistory.length - 1 - newIndex];
      } else if (direction === "down") {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        return newIndex === -1
          ? ""
          : commandHistory[commandHistory.length - 1 - newIndex];
      }
      return null;
    },
    [commandHistory, historyIndex]
  );

  return {
    history,
    executeCommand,
    getPrompt,
    navigateHistory,
    currentPath: fs.currentPath,
    getDirectory: fs.getDirectory,
  };
};
