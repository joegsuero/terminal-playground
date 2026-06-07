import { Command } from "@/types/types";

export const whoami: Command = {
  name: "whoami",
  description: "Current user",
  execute: (_args, fs) => [
    {
      id: Date.now().toString(),
      type: "output",
      content: fs.envVars?.USER || "user",
      timestamp: new Date(),
    },
  ],
};
