import { Command, TerminalLine } from "@/types/types";

export const mkdir: Command = {
  name: "mkdir",
  description: "Create directory",
  execute: (args, fs) => {
    const parents = args.includes("-p");
    const dirs = args.filter((a) => !a.startsWith("-"));

    if (dirs.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "mkdir: missing operand",
          timestamp: new Date(),
        },
      ];
    }

    const results: TerminalLine[] = [];
    for (const dir of dirs) {
      if (!fs.createDirectory(dir, parents)) {
        const reason = fs.pathExists(dir)
          ? "File exists"
          : "No such file or directory";
        results.push({
          id: Date.now().toString() + dir,
          type: "error",
          content: `mkdir: cannot create directory '${dir}': ${reason}`,
          timestamp: new Date(),
        });
      }
    }
    return results;
  },
};
