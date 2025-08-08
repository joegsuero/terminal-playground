import { Command } from "@/types/types";

export const grep: Command = {
  name: "grep",
  description: "Search text patterns",
  execute: (args, fs) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "grep: missing pattern or file",
          timestamp: new Date(),
        },
      ];
    }

    const pattern = args[0];
    const filename = args[1];
    const file = fs.getFile(filename);

    if (!file) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `grep: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    if (file.type === "directory") {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `grep: ${filename}: Is a directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n");
    const matchingLines = lines.filter((line) => line.includes(pattern));

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content:
          matchingLines.length > 0
            ? matchingLines.join("\n")
            : `grep: no matches found for '${pattern}'`,
        timestamp: new Date(),
      },
    ];
  },
};