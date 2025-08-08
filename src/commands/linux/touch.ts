import { Command } from "@/types/types";

export const touch: Command = {
  name: "touch",
  description: "Create file",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "touch: missing file operand",
          timestamp: new Date(),
        },
      ];
    }

    const results = [];
    for (const file of args) {
      if (!fs.createFile(file)) {
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
