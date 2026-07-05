import { Command, TerminalLine } from "@/types/types";

export const touch: Command = {
  name: "touch",
  description: "Create file or update timestamp",
  execute: (args, fs) => {
    const files = args.filter((a) => !a.startsWith("-"));
    if (files.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "touch: missing file operand",
          timestamp: new Date(),
        },
      ];
    }

    const results: TerminalLine[] = [];
    for (const file of files) {
      if (!fs.touchFile(file)) {
        results.push({
          id: Date.now().toString() + file,
          type: "error",
          content: `touch: cannot touch '${file}': No such file or directory`,
          timestamp: new Date(),
        });
      }
    }
    return results;
  },
};
