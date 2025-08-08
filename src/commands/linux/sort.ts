import { Command } from "@/types/types";

export const sort: Command = {
  name: "sort",
  description: "Sort lines of text",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "sort: missing file operand",
          timestamp: new Date(),
        },
      ];
    }

    const filename = args[0];
    const file = fs.getFile(filename);

    if (!file) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `sort: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n").sort();
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: lines.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};
