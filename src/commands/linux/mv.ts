import { Command, TerminalLine } from "@/types/types";

export const mv: Command = {
  name: "mv",
  description: "Move/rename files and directories",
  execute: (args, fs) => {
    const operands = args.filter((a) => !a.startsWith("-"));

    if (operands.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "mv: missing destination file operand",
          timestamp: new Date(),
        },
      ];
    }

    const dest = operands[operands.length - 1];
    const sources = operands.slice(0, -1);
    const destIsDir = fs.isDirectory(dest);

    if (sources.length > 1 && !destIsDir) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `mv: target '${dest}' is not a directory`,
          timestamp: new Date(),
        },
      ];
    }

    const results: TerminalLine[] = [];
    for (const source of sources) {
      const sourceFile = fs.getFile(source);
      if (!sourceFile) {
        results.push({
          id: Date.now().toString() + source,
          type: "error",
          content: `mv: cannot stat '${source}': No such file or directory`,
          timestamp: new Date(),
        });
        continue;
      }
      const isDir = sourceFile.type === "directory";
      // Copy (recursively for directories) then remove the original.
      if (fs.copyItem(source, dest, isDir) && fs.removeItem(source, isDir)) {
        continue;
      }
      results.push({
        id: Date.now().toString() + source,
        type: "error",
        content: `mv: cannot move '${source}' to '${dest}'`,
        timestamp: new Date(),
      });
    }
    return results;
  },
};
