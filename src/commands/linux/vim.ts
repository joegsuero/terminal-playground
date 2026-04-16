import { Command } from "@/types/types";

export const vim: Command = {
  name: "vim",
  description: "Open file in vim editor (basic simulation)",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "vim: No file specified. Usage: vim <filename>",
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
          type: "output",
          content: `"${filename}" [New File]`,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          type: "output",
          content: "-- INSERT -- (Press ESC to exit, :w to save, :q to quit)",
          timestamp: new Date(),
        },
      ];
    }

    if (file.type === "directory") {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `vim: ${filename}: Is a directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n");
    const lineCount = lines.length;
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `"${filename}" ${lineCount}L, ${file.content?.length || 0}C`,
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "-- NORMAL -- (Press i to insert, ESC for normal mode, :wq to save and quit)",
        timestamp: new Date(),
      },
    ];
  },
};
