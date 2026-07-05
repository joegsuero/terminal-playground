import { Command, TerminalLine } from "@/types/types";

export const rm: Command = {
  name: "rm",
  description: "Remove files or directories",
  execute: (args, fs) => {
    const flags = new Set<string>();
    const targets: string[] = [];
    for (const arg of args) {
      if (arg.startsWith("-") && arg.length > 1) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        targets.push(arg);
      }
    }

    const recursive = flags.has("r") || flags.has("R");
    const force = flags.has("f");

    if (targets.length === 0) {
      if (force) return [];
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "rm: missing operand",
          timestamp: new Date(),
        },
      ];
    }

    const results: TerminalLine[] = [];
    for (const item of targets) {
      const file = fs.getFile(item);
      if (!file) {
        if (!force) {
          results.push({
            id: Date.now().toString() + item,
            type: "error",
            content: `rm: cannot remove '${item}': No such file or directory`,
            timestamp: new Date(),
          });
        }
        continue;
      }
      if (file.type === "directory" && !recursive) {
        results.push({
          id: Date.now().toString() + item,
          type: "error",
          content: `rm: cannot remove '${item}': Is a directory`,
          timestamp: new Date(),
        });
        continue;
      }
      fs.removeItem(item, recursive);
    }
    return results;
  },
};
