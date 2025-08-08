import { Command } from "@/types/types";

export const wc: Command = {
  name: "wc",
  description: "Word, line, character count",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "wc: missing file operand",
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
          content: `wc: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const content = file.content || "";
    const lines = content.split("\n").length;
    const words = content.split(/\s+/).filter((w) => w.length > 0).length;
    const chars = content.length;

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `  ${lines}  ${words}  ${chars} ${filename}`,
        timestamp: new Date(),
      },
    ];
  },
};
