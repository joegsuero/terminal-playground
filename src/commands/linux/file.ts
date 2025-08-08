import { Command } from "@/types/types";

export const file: Command = {
  name: "file",
  description: "Determine file type",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "file: missing file operand",
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
          content: `file: ${filename}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const fileType = file.type === "directory" ? "directory" : "ASCII text";
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `${filename}: ${fileType}`,
        timestamp: new Date(),
      },
    ];
  },
};
