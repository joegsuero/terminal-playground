import { Command } from "@/types/types";

export const uptime: Command = {
  name: "uptime",
  description: "System uptime",
  execute: () => [
    {
      id: Date.now().toString(),
      type: "output",
      content: ` ${new Date().toLocaleTimeString()}  up 1:23,  1 user,  load average: 0.15, 0.25, 0.18`,
      timestamp: new Date(),
    },
  ],
};
