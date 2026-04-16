import { Command } from "@/types/types";

export const nano: Command = {
  name: "nano",
  description: "Open file in nano editor (basic simulation)",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "nano: No file specified. Usage: nano <filename>",
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
          content: `[ New File "${filename}" ]`,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          type: "output",
          content: "^G Get Help  ^O Write Out  ^X Exit",
          timestamp: new Date(),
        },
      ];
    }

    if (file.type === "directory") {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `nano: ${filename}: Is a directory`,
          timestamp: new Date(),
        },
      ];
    }

    const lines = (file.content || "").split("\n");
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: lines.join("\n"),
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "^G Get Help  ^O Write Out  ^X Exit",
        timestamp: new Date(),
      },
    ];
  },
};
