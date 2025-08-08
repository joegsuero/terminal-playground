import { Command } from "@/types/types";

export const whoami: Command = {
  name: "whoami",
  description: "Current user",
  execute: () => [
    {
      id: Date.now().toString(),
      type: "output",
      content: "user",
      timestamp: new Date(),
    },
  ],
};
