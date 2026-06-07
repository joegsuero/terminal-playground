import { Command } from "@/types/types";

export const cd: Command = {
  name: "cd",
  description: "Change directory",
  execute: (args, fs) => {
    const target = args[0];

    // `cd -` switches to the previous directory.
    let path: string;
    if (target === "-") {
      path = fs.envVars.OLDPWD || fs.currentPath;
    } else {
      path = target || fs.envVars.HOME || "/home/user";
    }

    const resolvedPath = fs.resolvePath(path);

    if (!fs.isDirectory(resolvedPath)) {
      const exists = fs.pathExists(resolvedPath);
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: exists
            ? `cd: not a directory: ${path}`
            : `cd: no such file or directory: ${path}`,
          timestamp: new Date(),
        },
      ];
    }

    fs.setCurrentPath(resolvedPath);
    // `cd -` echoes the new directory like bash does.
    if (target === "-") {
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: resolvedPath,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  },
};
