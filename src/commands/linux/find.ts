import { Command, TerminalLine } from "@/types/types";
import { matchPattern } from "@/lib/terminalUtils";

export const find: Command = {
  name: "find",
  description: "Search for files in a directory hierarchy",
  execute: (args, fs) => {
    // First non-flag operand is the start path (defaults to current dir).
    const startArg = args.find((a) => !a.startsWith("-")) || ".";
    const startPath = fs.resolvePath(startArg);

    const nameIdx = args.indexOf("-name");
    const namePattern = nameIdx >= 0 ? args[nameIdx + 1] : null;
    const typeIdx = args.indexOf("-type");
    const typeFilter = typeIdx >= 0 ? args[typeIdx + 1] : null; // f or d

    if (!fs.pathExists(startPath)) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `find: '${startArg}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    const results: string[] = [];

    const matches = (name: string, type: "file" | "directory"): boolean => {
      if (namePattern && !matchPattern(namePattern, name)) return false;
      if (typeFilter === "f" && type !== "file") return false;
      if (typeFilter === "d" && type !== "directory") return false;
      return true;
    };

    // The starting directory itself is part of find's output.
    if (!namePattern && (!typeFilter || typeFilter === "d")) {
      results.push(startArg);
    }

    const walk = (dirPath: string, displayPath: string) => {
      const items = fs.getDirectory(dirPath);
      for (const item of items) {
        const childDisplay =
          displayPath === "/" ? "/" + item.name : `${displayPath}/${item.name}`;
        if (matches(item.name, item.type)) {
          results.push(childDisplay);
        }
        if (item.type === "directory") {
          walk(
            dirPath === "/" ? "/" + item.name : `${dirPath}/${item.name}`,
            childDisplay
          );
        }
      }
    };

    walk(startPath, startArg);

    const lines: TerminalLine[] = [
      {
        id: Date.now().toString(),
        type: "output",
        content: results.join("\n"),
        timestamp: new Date(),
      },
    ];
    return lines;
  },
};
