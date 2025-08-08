import { Command } from "@/types/types";

export const mv: Command = {
  name: "mv",
  description: "Move/rename files",
  execute: (args, fs) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "mv: missing destination file operand",
          timestamp: new Date(),
        },
      ];
    }

    const source = args[0];
    const dest = args[1];
    const sourceFile = fs.getFile(source);

    if (!sourceFile) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `mv: cannot stat '${source}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    if (fs.createFile(dest, sourceFile.content) && fs.removeItem(source)) {
      return [];
    } else {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `mv: cannot move '${source}' to '${dest}': Operation failed`,
          timestamp: new Date(),
        },
      ];
    }
  },
};
