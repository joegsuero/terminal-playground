import { Command } from "@/types/types";

export const echo: Command = {
  name: "echo",
  description: "Display text",
  execute: (args) => [
    {
      id: Date.now().toString(),
      type: "output",
      content: args.join(" "),
      timestamp: new Date(),
    },
  ],
};
