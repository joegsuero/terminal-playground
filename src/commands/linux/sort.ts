import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

export const sort: Command = {
  name: "sort",
  description: "Sort lines of text",
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

    const reverse = flags.has("r");
    const numeric = flags.has("n");
    const unique = flags.has("u");

    let input: string;
    if (files.length > 0) {
      const file = fs.getFile(files[0]);
      if (!file) {
        return [line("error", `sort: cannot read: ${files[0]}: No such file or directory`)];
      }
      if (file.type === "directory") {
        return [line("error", `sort: read failed: ${files[0]}: Is a directory`)];
      }
      input = file.content || "";
    } else {
      if (stdin === undefined) return [line("error", "sort: missing file operand")];
      input = stdin;
    }

    let lines = input.split("\n");
    // Drop a single trailing empty line produced by a final newline.
    if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

    lines.sort((a, b) =>
      numeric ? (parseFloat(a) || 0) - (parseFloat(b) || 0) : a.localeCompare(b)
    );
    if (reverse) lines.reverse();
    if (unique) lines = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);

    return [line("output", lines.join("\n"))];
  },
};
