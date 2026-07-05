import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

export const exportCmd: Command = {
  name: "export",
  description: "Set environment variables",
  execute: (args, fs) => {
    // `export` with no args lists exported variables.
    if (args.length === 0) {
      const list = Object.entries(fs.envVars)
        .map(([k, v]) => `declare -x ${k}="${v}"`)
        .join("\n");
      return [line("output", list)];
    }

    for (const assignment of args) {
      const eq = assignment.indexOf("=");
      if (eq === -1) {
        // export NAME (mark existing as exported) — no value, no output.
        continue;
      }
      const name = assignment.slice(0, eq);
      const value = assignment.slice(eq + 1).replace(/^["']|["']$/g, "");
      fs.envVars[name] = value;
    }
    // A successful assignment produces no output, like bash.
    return [];
  },
};

export const env: Command = {
  name: "env",
  description: "Print environment variables",
  execute: (_args, fs) => {
    const vars = Object.entries(fs.envVars).map(([k, v]) => `${k}=${v}`);
    return [line("output", vars.join("\n"))];
  },
};

export const unset: Command = {
  name: "unset",
  description: "Remove environment variables",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [line("error", "unset: not enough arguments")];
    }
    for (const name of args) delete fs.envVars[name];
    return [];
  },
};
