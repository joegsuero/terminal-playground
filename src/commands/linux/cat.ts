import { Command } from "@/types/types";

export const cat: Command = {
  name: "cat",
  description: "Display file content",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "cat: missing file operand",
          timestamp: new Date(),
        },
      ];
    }

    const results = [];
    for (const filename of args) {
      const file = fs.getFile(filename);
      if (!file) {
        results.push({
          id: Date.now().toString() + filename,
          type: "error",
          content: `cat: ${filename}: No such file or directory`,
          timestamp: new Date(),
        });
      } else if (file.type === "directory") {
        results.push({
          id: Date.now().toString() + filename,
          type: "error",
          content: `cat: ${filename}: Is a directory`,
          timestamp: new Date(),
        });
      } else {
        results.push({
          id: Date.now().toString() + filename,
          type: "output",
          content: file.content || "",
          timestamp: new Date(),
        });
      }
    }

    return results;
  },
};
