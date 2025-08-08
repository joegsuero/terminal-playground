import { Command } from "@/types/types";

export const head: Command = {
  name: "head",
  description: "Display first lines of file",
  execute: (args, fs) => {
    const filename = args[args.length - 1];
    const numLines = args.includes("-n")
      ? parseInt(args[args.indexOf("-n") + 1])
      : 10;

    if (!filename || filename.startsWith("-")) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "head: missing file operand",
          timestamp: new Date(),
        },
      ];
    }

    const file = fs.getFile(filename);
    if (!file) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `head: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n").slice(0, numLines);
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