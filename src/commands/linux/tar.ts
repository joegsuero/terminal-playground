import { Command } from "@/types/types";

export const tar: Command = {
  name: "tar",
  description: "Archive files",
  execute: (args) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "tar: you must specify one of the options",
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: "tar: archive operation simulated successfully",
        timestamp: new Date(),
      },
    ];
  },
};
