import { Command } from "@/types/types";

const envVars: Record<string, string> = {
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  HOME: "/home/user",
  USER: "user",
  SHELL: "/bin/bash",
  TERM: "xterm-256color",
  LANG: "en_US.UTF-8",
};

export const env: Command = {
  name: "env",
  description: "Display environment variables",
  execute: () => {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
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