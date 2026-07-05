import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

export const grep: Command = {
  name: "grep",
  description: "Search text patterns",
  execute: (args, fs, _history, stdin) => {
    // Parse flags (supports combined forms like -in).
    const flags = new Set<string>();
    const operands: string[] = [];
    for (const arg of args) {
      if (arg.startsWith("-") && arg.length > 1) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        operands.push(arg);
      }
    }

    if (operands.length === 0) {
      return [line("error", "usage: grep [-ivncE] PATTERN [FILE...]")];
    }

    const patternStr = operands[0];
    const files = operands.slice(1);

    const ignoreCase = flags.has("i");
    const invert = flags.has("v");
    const showNumber = flags.has("n");
    const countOnly = flags.has("c");

    let regex: RegExp;
    try {
      regex = new RegExp(patternStr, ignoreCase ? "i" : "");
    } catch {
      regex = new RegExp(
        patternStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        ignoreCase ? "i" : ""
      );
    }

    const prefixName = files.length > 1;

    const searchText = (text: string, name?: string): string[] => {
      const lines = text.split("\n");
      const matched: string[] = [];
      lines.forEach((l, idx) => {
        const isMatch = regex.test(l);
        if (isMatch !== invert) {
          let out = l;
          if (showNumber) out = `${idx + 1}:${out}`;
          if (name && prefixName) out = `${name}:${out}`;
          matched.push(out);
        }
      });
      return matched;
    };

    // stdin mode (used in pipelines).
    if (files.length === 0) {
      if (stdin === undefined) {
        return [line("error", "grep: no input")];
      }
      const matched = searchText(stdin);
      if (countOnly) return [line("output", String(matched.length))];
      return matched.length > 0 ? [line("output", matched.join("\n"))] : [];
    }

    const results: TerminalLine[] = [];
    for (const filename of files) {
      const file = fs.getFile(filename);
      if (!file) {
        results.push(line("error", `grep: ${filename}: No such file or directory`));
        continue;
      }
      if (file.type === "directory") {
        results.push(line("error", `grep: ${filename}: Is a directory`));
        continue;
      }
      const matched = searchText(file.content || "", filename);
      if (countOnly) {
        results.push(line("output", `${prefixName ? filename + ":" : ""}${matched.length}`));
      } else if (matched.length > 0) {
        results.push(line("output", matched.join("\n")));
      }
    }
    return results;
  },
};
