import { Command } from "@/types/types";

export const mkdir: Command = {
  name: "mkdir",
  description: "Create directory",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "mkdir: missing operand",
          timestamp: new Date(),
        },
      ];
    }

    const results = [];
    for (const dir of args) {
      if (!fs.createDirectory(dir)) {
        results.push({
          id: Date.now().toString() + dir,
          type: "error",
          content: `mkdir: cannot create directory '${dir}': File exists or parent directory not found`,
          timestamp: new Date(),
        });
      }
    }

    return results;
  },
};
