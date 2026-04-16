import { Command } from "@/types/types";

export const kill: Command = {
  name: "kill",
  description: "Terminate a process",
  execute: (args) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "kill: usage: kill [-s sigspec] pid [pid ...]",
          timestamp: new Date(),
        },
      ];
    }
    
    const force = args.includes("-9") || args.includes("-KILL");
    const pids = args.filter(arg => /^\d+$/.test(arg));
    
    if (pids.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "kill: usage: kill [-s sigspec] pid [pid ...]",
          timestamp: new Date(),
        },
      ];
    }
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `Terminated process(es): ${pids.join(", ")}${force ? " (forced)" : ""}`,
        timestamp: new Date(),
      },
    ];
  },
};