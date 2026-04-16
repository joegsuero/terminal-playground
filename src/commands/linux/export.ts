import { Command } from "@/types/types";
import { useTerminalStore } from "@/store/terminalStore";

const envVars: Record<string, string> = {
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  HOME: "/home/user",
  USER: "user",
  SHELL: "/bin/bash",
  TERM: "xterm-256color",
  LANG: "en_US.UTF-8",
};

export const setExport = {
  name: "export",
  description: "Set environment variables",
  execute: (args) => {
    if (args.length === 0) {
      const content = Object.entries(envVars)
        .map(([key, value]) => `declare -x ${key}="${value}"`)
        .join("\n");
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content,
          timestamp: new Date(),
        },
      ];
    }
    
    for (const arg of args) {
      const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key] = value;
      }
    }
    
    return [];
  },
};