import { Command } from "@/types/types";

export const cp: Command = {
  name: "cp",
  description: "Copy files",
  execute: (args, fs) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "cp: missing destination file operand",
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
          content: `cp: cannot stat '${source}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    if (sourceFile.type === "directory") {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `cp: ${source}: Is a directory (use -r for recursive copy)`,
          timestamp: new Date(),
        },
      ];
    }

    if (fs.createFile(dest, sourceFile.content)) {
      return [];
    } else {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `cp: cannot create regular file '${dest}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }
  },
};
