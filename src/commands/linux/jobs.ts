import { Command } from "@/types/types";

const jobs: Array<{ id: number; command: string; status: "Running" | "Stopped" }> = [];

let jobIdCounter = 1;

export const jobList: Command = {
  name: "jobs",
  description: "List active jobs",
  execute: () => {
    if (jobs.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: "No active jobs",
          timestamp: new Date(),
        },
      ];
    }
    
    const content = jobs
      .map(j => `[${j.id}]  ${j.status}\t${j.command}`)
      .join("\n");
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content,
        timestamp: new Date(),
      },
    ];
  },
};