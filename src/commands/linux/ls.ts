import { Command } from "@/types/types";

export const ls: Command = {
  name: "ls",
  description: "List directory contents",
  execute: (args, fs) => {
    const isLong = args.includes("-l") || args.includes("-la");
    const showAll = args.includes("-a") || args.includes("-la");
    const path = args.find((arg) => !arg.startsWith("-")) || fs.currentPath;

    if (!fs.pathExists(path)) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `ls: cannot access '${path}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const items = fs.getDirectory(path);
    const filteredItems = showAll
      ? [
          {
            name: ".",
            type: "directory",
            permissions: "drwxr-xr-x",
            owner: "user",
            group: "user",
            size: 4096,
            modified: new Date(),
          },
          {
            name: "..",
            type: "directory",
            permissions: "drwxr-xr-x",
            owner: "user",
            group: "user",
            size: 4096,
            modified: new Date(),
          },
          ...items,
        ]
      : items;

    if (isLong) {
      const content = filteredItems
        .map((item) => {
          const date = item.modified.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${item.permissions} 1 ${item.owner} ${item.group} ${item.size
            .toString()
            .padStart(8)} ${date} ${item.name}`;
        })
        .join("\n");

      return [
        {
          id: Date.now().toString(),
          type: "output",
          content,
          timestamp: new Date(),
        },
      ];
    } else {
      const content = filteredItems.map((item) => item.name).join("  ");
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content,
          timestamp: new Date(),
        },
      ];
    }
  },
};
