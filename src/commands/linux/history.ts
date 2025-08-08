import { Command } from "@/types/types";

export const history: Command = {
  name: "history",
  description: "Command history",
  execute: (args, fs, commandHistory) => {
    const historyLines = (commandHistory || []).map(
      (cmd, index) => `${(index + 1).toString().padStart(4)} ${cmd}`
    );
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: historyLines.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};
