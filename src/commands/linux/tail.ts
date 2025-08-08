import { Command } from "@/types/types";

export const tail: Command = {
  name: "tail",
  description: "Display last lines of file",
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
          content: "tail: missing file operand",
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
          content: `tail: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n");
    const tailLines = lines.slice(-numLines);
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: tailLines.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};