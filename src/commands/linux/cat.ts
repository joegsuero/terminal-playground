import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

const numberContent = (content: string): string =>
  content
    .split("\n")
    .map((l, i) => `${(i + 1).toString().padStart(6)}\t${l}`)
    .join("\n");

export const cat: Command = {
  name: "cat",
  description: "Display file content",
  execute: (args, fs, _history, stdin) => {
    const numberLines = args.includes("-n");
    const files = args.filter((a) => !a.startsWith("-"));

    // No file operands: act as a pass-through filter over stdin.
    if (files.length === 0) {
      const content = stdin ?? "";
      return [line("output", numberLines ? numberContent(content) : content)];
    }

    const results: TerminalLine[] = [];
    for (const filename of files) {
      const file = fs.getFile(filename);
      if (!file) {
        results.push(line("error", `cat: ${filename}: No such file or directory`));
      } else if (file.type === "directory") {
        results.push(line("error", `cat: ${filename}: Is a directory`));
      } else {
        const content = file.content || "";
        results.push(
          line("output", numberLines ? numberContent(content) : content)
        );
      }
    }
    return results;
  },
};
