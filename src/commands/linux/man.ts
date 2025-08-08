import { Command } from "@/types/types";

export const man: Command = {
  name: "man",
  description: "Manual pages",
  execute: (args) => {
    const command = args[0];
    if (!command) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "What manual page do you want?",
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `NAME\n       ${command} - Linux command\n\nSYNOPSIS\n       ${command} [OPTION]... [FILE]...\n\nDESCRIPTION\n       This is a simulated manual page for ${command}.\n       In a real system, this would show detailed documentation.\n\n       Use 'help' to see available commands in this playground.`,
        timestamp: new Date(),
      },
    ];
  },
};
