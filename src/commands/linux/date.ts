import { Command } from "@/types/types";

export const date: Command = {
  name: "date",
  description: "Current date and time",
  execute: () => [
    {
      id: Date.now().toString(),
      type: "output",
      content: new Date().toString(),
      timestamp: new Date(),
    },
  ],
};
