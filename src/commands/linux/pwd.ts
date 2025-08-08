import { Command } from "@/types/types";

export const pwd: Command = {
  name: "pwd",
  description: "Print working directory",
  execute: (_, fs) => [
    {
      id: Date.now().toString(),
      type: "output",
      content: fs.currentPath,
      timestamp: new Date(),
    },
  ],
};
