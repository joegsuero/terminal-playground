import { Command } from "@/types/types";

export const cd: Command = {
  name: "cd",
  description: "Change directory",
  execute: (args, fs) => {
    const path = args[0] || "/home/user";
    const resolvedPath = fs.resolvePath(path);

    if (!fs.pathExists(resolvedPath)) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `cd: no such file or directory: ${path}`,
          timestamp: new Date(),
        },
      ];
    }

    fs.setCurrentPath(resolvedPath);
    return [];
  },
};
