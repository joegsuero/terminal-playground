import { Command } from "@/types/types";

export const find: Command = {
  name: "find",
  description: "Search for files",
  execute: (args, fs) => {
    const path = args[0] || fs.currentPath;
    const namePattern = args.includes("-name")
      ? args[args.indexOf("-name") + 1]
      : null;

    const searchDirectory = (dirPath, pattern) => {
      const items = fs.getDirectory(dirPath);
      let results = [];

      for (const item of items) {
        const fullPath = `${dirPath}/${item.name}`.replace("//", "/");
        if (!pattern || item.name.includes(pattern.replace(/\*/g, ""))) {
          results.push(fullPath);
        }
        if (
          item.type === "directory" &&
          item.name !== "." &&
          item.name !== ".."
        ) {
          results = results.concat(searchDirectory(fullPath, pattern));
        }
      }
      return results;
    };

    const results = searchDirectory(path, namePattern);

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: results.length > 0 ? results.join("\n") : "No files found",
        timestamp: new Date(),
      },
    ];
  },
};
