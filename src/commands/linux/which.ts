import { Command } from "@/types/types";

export const which: Command = {
  name: "which",
  description: "Locate command",
  execute: (args) => {
    const command = args[0];
    if (!command) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "which: missing argument",
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `/usr/bin/${command}`,
        timestamp: new Date(),
      },
    ];
  },
};
