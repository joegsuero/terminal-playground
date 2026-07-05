import { Command, TerminalLine } from "@/types/types";

export const cp: Command = {
  name: "cp",
  description: "Copy files and directories",
  execute: (args, fs) => {
    const recursive =
      args.includes("-r") || args.includes("-R") || args.includes("-a");
    const operands = args.filter((a) => !a.startsWith("-"));

    if (operands.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "cp: missing destination file operand",
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
          content: `cp: target '${dest}' is not a directory`,
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
          content: `cp: cannot stat '${source}': No such file or directory`,
          timestamp: new Date(),
        });
        continue;
      }
      if (sourceFile.type === "directory" && !recursive) {
        results.push({
          id: Date.now().toString() + source,
          type: "error",
          content: `cp: -r not specified; omitting directory '${source}'`,
          timestamp: new Date(),
        });
        continue;
      }
      if (!fs.copyItem(source, dest, recursive)) {
        results.push({
          id: Date.now().toString() + source,
          type: "error",
          content: `cp: cannot copy '${source}' to '${dest}'`,
          timestamp: new Date(),
        });
      }
    }
    return results;
  },
};
