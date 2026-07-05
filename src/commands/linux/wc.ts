import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

const counts = (content: string) => {
  // Match coreutils: line count is the number of newline characters.
  const lineCount =
    content.length === 0
      ? 0
      : content.split("\n").length - 1 + (content.endsWith("\n") ? 0 : 1);
  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  const chars = content.length;
  return { lineCount, words, chars };
};

export const wc: Command = {
  name: "wc",
  description: "Word, line, character count",
  execute: (args, fs, _history, stdin) => {
    const flags = new Set<string>();
    const files: string[] = [];
    for (const arg of args) {
      if (arg.startsWith("-") && arg.length > 1) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        files.push(arg);
      }
    }

    const format = (c: ReturnType<typeof counts>, label: string): string => {
      const parts: string[] = [];
      const showAll = !flags.has("l") && !flags.has("w") && !flags.has("c");
      if (showAll || flags.has("l")) parts.push(c.lineCount.toString().padStart(7));
      if (showAll || flags.has("w")) parts.push(c.words.toString().padStart(7));
      if (showAll || flags.has("c")) parts.push(c.chars.toString().padStart(7));
      return parts.join("") + (label ? ` ${label}` : "");
    };

    if (files.length === 0) {
      if (stdin === undefined) return [line("error", "wc: missing file operand")];
      return [line("output", format(counts(stdin), ""))];
    }

    const results: TerminalLine[] = [];
    const total = { lineCount: 0, words: 0, chars: 0 };
    for (const filename of files) {
      const file = fs.getFile(filename);
      if (!file) {
        results.push(line("error", `wc: ${filename}: No such file or directory`));
        continue;
      }
      if (file.type === "directory") {
        results.push(line("error", `wc: ${filename}: Is a directory`));
        continue;
      }
      const c = counts(file.content || "");
      total.lineCount += c.lineCount;
      total.words += c.words;
      total.chars += c.chars;
      results.push(line("output", format(c, filename)));
    }
    if (files.length > 1) results.push(line("output", format(total, "total")));
    return results;
  },
};
