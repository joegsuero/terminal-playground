import { Command, TerminalLine } from "@/types/types";
import { commands } from "./index";

export const xargs: Command = {
  name: "xargs",
  description: "Build and execute commands from standard input",
  execute: (args, fs, history, stdin) => {
    // Flags: -n N (args per command), -I {} (replace string).
    let perCommand = 0;
    let replaceStr: string | null = null;
    const rest: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n") perCommand = parseInt(args[++i], 10) || 0;
      else if (args[i] === "-I") replaceStr = args[++i];
      else rest.push(args[i]);
    }

    const cmdName = rest[0] || "echo";
    const baseArgs = rest.slice(1);
    const command = commands[cmdName];
    if (!command) {
      return [{ id: Date.now().toString(), type: "error", content: `xargs: ${cmdName}: command not found`, timestamp: new Date() }];
    }

    const input = stdin ?? "";
    const items = input.split(/\s+/).filter(Boolean);
    const lines: TerminalLine[] = [];

    const runOnce = (argv: string[]) => {
      lines.push(...command.execute(argv, fs, history));
    };

    if (replaceStr) {
      const perItem = input.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const item of perItem) {
        runOnce(baseArgs.map((a) => a.split(replaceStr!).join(item)));
      }
    } else if (perCommand > 0) {
      for (let i = 0; i < items.length; i += perCommand) {
        runOnce([...baseArgs, ...items.slice(i, i + perCommand)]);
      }
    } else {
      runOnce([...baseArgs, ...items]);
    }

    return lines;
  },
};
