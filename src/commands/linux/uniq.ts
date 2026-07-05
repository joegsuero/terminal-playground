import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

export const uniq: Command = {
  name: "uniq",
  description: "Report or filter repeated lines",
  execute: (args, fs, _history, stdin) => {
    const count = args.includes("-c");
    const onlyDup = args.includes("-d");
    const onlyUnique = args.includes("-u");

    let input: string;
    if (stdin !== undefined) {
      input = stdin;
    } else {
      const fileArg = args.find((arg) => !arg.startsWith("-"));
      if (!fileArg) return [line("error", "uniq: missing operand")];
      const file = fs.getFile(fileArg);
      if (!file) {
        return [line("error", `uniq: ${fileArg}: No such file or directory`)];
      }
      input = file.content || "";
    }

    const lines = input.split("\n");
    if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

    // Collapse runs of identical adjacent lines, tracking their counts.
    const groups: { value: string; n: number }[] = [];
    for (const l of lines) {
      const last = groups[groups.length - 1];
      if (last && last.value === l) last.n++;
      else groups.push({ value: l, n: 1 });
    }

    let filtered = groups;
    if (onlyDup) filtered = groups.filter((g) => g.n > 1);
    if (onlyUnique) filtered = groups.filter((g) => g.n === 1);

    const out = filtered
      .map((g) => (count ? `${g.n.toString().padStart(7)} ${g.value}` : g.value))
      .join("\n");

    return [line("output", out)];
  },
};
