import { Command } from "@/types/types";

export const tree: Command = {
  name: "tree",
  description: "List contents of directories in a tree-like format",
  execute: (args, fs) => {
    const showAll = args.includes("-a");
    const start = args.find((a) => !a.startsWith("-")) || ".";
    const startAbs = fs.resolvePath(start);

    if (!fs.isDirectory(startAbs)) {
      return [{ id: Date.now().toString(), type: "error", content: `${start} [error opening dir]`, timestamp: new Date() }];
    }

    const lines: string[] = [start];
    let dirs = 0;
    let files = 0;

    const walk = (abs: string, prefix: string) => {
      const items = fs
        .getDirectory(abs)
        .filter((it: { name: string }) => showAll || !it.name.startsWith("."))
        .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
      items.forEach((item: { name: string; type: string }, idx: number) => {
        const isLast = idx === items.length - 1;
        const branch = isLast ? "└── " : "├── ";
        lines.push(prefix + branch + item.name);
        if (item.type === "directory") {
          dirs++;
          walk(abs + "/" + item.name, prefix + (isLast ? "    " : "│   "));
        } else {
          files++;
        }
      });
    };

    walk(startAbs, "");
    lines.push("");
    lines.push(`${dirs} ${dirs === 1 ? "directory" : "directories"}, ${files} ${files === 1 ? "file" : "files"}`);

    return [{ id: Date.now().toString(), type: "output", content: lines.join("\n"), timestamp: new Date() }];
  },
};
