import { Command } from "@/types/types";

export const uname: Command = {
  name: "uname",
  description: "System information",
  execute: (args) => {
    if (args.includes("-a")) {
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content:
            "Linux linux-playground 5.15.0-generic #72-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux",
          timestamp: new Date(),
        },
      ];
    }
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: "Linux",
        timestamp: new Date(),
      },
    ];
  },
};
