import { Command } from "@/types/types";

export const rm: Command = {
  name: "rm",
  description: "Remove files",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "rm: missing operand",
          timestamp: new Date(),
        },
      ];
    }

    const results = [];
    for (const item of args) {
      if (!fs.removeItem(item)) {
        results.push({
          id: Date.now().toString() + item,
          type: "error",
          content: `rm: cannot remove '${item}': No such file or directory`,
          timestamp: new Date(),
        });
      }
    }

    return results;
  },
};
