import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

export const basename: Command = {
  name: "basename",
  description: "Strip directory and suffix from filenames",
  execute: (args) => {
    if (args.length === 0) return [line("error", "basename: missing operand")];
    let name = args[0].replace(/\/+$/, "");
    name = name.substring(name.lastIndexOf("/") + 1);
    if (args[1] && name.endsWith(args[1]) && name !== args[1]) {
      name = name.slice(0, -args[1].length);
    }
    return [line("output", name)];
  },
};

export const dirname: Command = {
  name: "dirname",
  description: "Strip last component from file name",
  execute: (args) => {
    if (args.length === 0) return [line("error", "dirname: missing operand")];
    const p = args[0].replace(/\/+$/, "");
    const idx = p.lastIndexOf("/");
    return [line("output", idx <= 0 ? (idx === 0 ? "/" : ".") : p.slice(0, idx))];
  },
};

export const stat: Command = {
  name: "stat",
  description: "Display file or file system status",
  execute: (args, fs) => {
    if (args.length === 0) return [line("error", "stat: missing operand")];
    const f = fs.getFile(args[0]);
    if (!f) return [line("error", `stat: cannot stat '${args[0]}': No such file or directory`)];
    const type = f.type === "directory" ? "directory" : "regular file";
    const mod = (f.modified as Date).toString();
    return [
      line(
        "output",
        `  File: ${args[0]}\n  Size: ${f.size}\tType: ${type}\nAccess: (${f.permissions})  Uid: (1000/${f.owner})  Gid: (1000/${f.group})\nModify: ${mod}`
      ),
    ];
  },
};

export const diff: Command = {
  name: "diff",
  description: "Compare files line by line",
  execute: (args, fs) => {
    const files = args.filter((a) => !a.startsWith("-"));
    if (files.length < 2) return [line("error", "diff: missing operand")];
    const a = fs.getFile(files[0]);
    const b = fs.getFile(files[1]);
    if (!a) return [line("error", `diff: ${files[0]}: No such file or directory`)];
    if (!b) return [line("error", `diff: ${files[1]}: No such file or directory`)];

    const la = (a.content || "").split("\n");
    const lb = (b.content || "").split("\n");
    const out: string[] = [];
    const max = Math.max(la.length, lb.length);
    for (let i = 0; i < max; i++) {
      if (la[i] !== lb[i]) {
        if (la[i] !== undefined) out.push(`${i + 1}c${i + 1}`);
        if (la[i] !== undefined) out.push(`< ${la[i]}`);
        if (lb[i] !== undefined) out.push(`> ${lb[i]}`);
      }
    }
    return [line("output", out.join("\n"))];
  },
};

export const sleep: Command = {
  name: "sleep",
  description: "Delay (no-op in the playground)",
  execute: () => [],
};

export const exitCmd: Command = {
  name: "exit",
  description: "Close the current shell/pane",
  execute: () => [],
};
