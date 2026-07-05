import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

const parseCount = (args: string[], fallback: number): [number, string[]] => {
  const rest: string[] = [];
  let count = fallback;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-n" && args[i + 1] !== undefined) {
      count = parseInt(args[++i].replace(/^\+/, ""), 10);
    } else if (/^-n\d+$/.test(a)) {
      count = parseInt(a.slice(2), 10);
    } else if (/^-\d+$/.test(a)) {
      count = parseInt(a.slice(1), 10);
    } else {
      rest.push(a);
    }
  }
  if (Number.isNaN(count)) count = fallback;
  return [count, rest];
};

export const tail: Command = {
  name: "tail",
  description: "Display last lines of file",
  execute: (args, fs, _history, stdin) => {
    const [numLines, files] = parseCount(args, 10);

    if (files.length === 0) {
      if (stdin === undefined) return [line("error", "tail: missing file operand")];
      return [line("output", stdin.split("\n").slice(-numLines).join("\n"))];
    }

    const results: TerminalLine[] = [];
    const showHeader = files.length > 1;
    for (const filename of files) {
      const file = fs.getFile(filename);
      if (!file) {
        results.push(line("error", `tail: cannot open '${filename}' for reading: No such file or directory`));
        continue;
      }
      if (file.type === "directory") {
        results.push(line("error", `tail: error reading '${filename}': Is a directory`));
        continue;
      }
      const body = (file.content || "").split("\n").slice(-numLines).join("\n");
      results.push(line("output", showHeader ? `==> ${filename} <==\n${body}` : body));
    }
    return results;
  },
};
