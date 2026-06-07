import { Command, TerminalSegment, TerminalLine } from "@/types/types";
import { FileSystemItem } from "@/hooks/useLinuxFileSystem";
import { formatDateForLs } from "@/lib/terminalUtils";

const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}`;
  const units = ["K", "M", "G", "T"];
  let size = bytes / 1024;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)}${units[i]}`;
};

export const ls: Command = {
  name: "ls",
  description: "List directory contents",
  execute: (args, fs) => {
    const flags = new Set<string>();
    const operands: string[] = [];
    for (const arg of args) {
      if (arg.startsWith("-") && arg.length > 1) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        operands.push(arg);
      }
    }

    const isLong = flags.has("l");
    const showAll = flags.has("a");
    const onePerLine = flags.has("1");
    const human = flags.has("h");
    const reverse = flags.has("r");
    const sortByTime = flags.has("t");

    const path = operands[0] || fs.currentPath;

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

    // Listing a single file just prints its name.
    const stat = fs.getFile(path);
    if (stat && stat.type === "file") {
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: path,
          timestamp: new Date(),
        },
      ];
    }

    const dotEntries: FileSystemItem[] = showAll
      ? [
          { name: ".", type: "directory", permissions: "drwxr-xr-x", owner: "user", group: "user", size: 4096, modified: new Date() },
          { name: "..", type: "directory", permissions: "drwxr-xr-x", owner: "user", group: "user", size: 4096, modified: new Date() },
        ]
      : [];

    const visible = fs
      .getDirectory(path)
      .filter((item) => showAll || !item.name.startsWith("."));

    visible.sort((a, b) =>
      sortByTime
        ? b.modified.getTime() - a.modified.getTime()
        : a.name.localeCompare(b.name)
    );
    if (reverse) visible.reverse();

    const items = [...dotEntries, ...visible];

    if (isLong) {
      const totalBlocks = items.reduce(
        (sum, it) => sum + Math.ceil(it.size / 1024),
        0
      );
      const body = items
        .map((item) => {
          const date = formatDateForLs(item.modified);
          const sizeStr = (human ? humanSize(item.size) : item.size.toString()).padStart(
            human ? 5 : 8
          );
          return `${item.permissions} 1 ${item.owner} ${item.group} ${sizeStr} ${date} ${item.name}`;
        })
        .join("\n");

      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: `total ${totalBlocks}\n${body}`,
          timestamp: new Date(),
        },
      ];
    }

    const colorOf = (item: FileSystemItem): TerminalSegment["color"] => {
      if (item.type === "directory") return "dir";
      if (item.permissions.includes("x")) return "exec";
      return "default";
    };

    const separator = onePerLine ? "\n" : "  ";
    const segments: TerminalSegment[] = items.map((item, i) => ({
      text: item.name + (i < items.length - 1 ? separator : ""),
      color: colorOf(item),
    }));

    const result: TerminalLine = {
      id: Date.now().toString(),
      type: "output",
      content: items.map((item) => item.name).join(separator),
      segments,
      timestamp: new Date(),
    };
    return [result];
  },
};
