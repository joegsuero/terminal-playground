import { Command } from "@/types/types";

export const exportCmd: Command = {
  name: "export",
  description: "Set environment variables",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "export: Usage: export VAR=value",
          timestamp: new Date(),
        },
      ];
    }

    const arg = args.join(" ");
    const parts = arg.split("=");
    
    if (parts.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `export: Invalid format. Usage: export VAR=value`,
          timestamp: new Date(),
        },
      ];
    }

    const varName = parts[0];
    const varValue = parts.slice(1).join("=");

    // Store in a pseudo-environment (simulated)
    if (!fs.envVars) {
      fs.envVars = {};
    }
    fs.envVars[varName] = varValue;

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `export ${varName}="${varValue}"`,
        timestamp: new Date(),
      },
    ];
  },
};

export const env: Command = {
  name: "env",
  description: "Print environment variables",
  execute: (_args, fs) => {
    const envVars = fs.envVars || {};
    const vars = Object.entries(envVars).map(([key, value]) => `${key}=${value}`);
    
    if (vars.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: "PATH=/usr/local/bin:/usr/bin:/bin\nHOME=/home/user\nUSER=user",
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: vars.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};

export const unset: Command = {
  name: "unset",
  description: "Remove environment variables",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "unset: Usage: unset VAR",
          timestamp: new Date(),
        },
      ];
    }

    const varName = args[0];

    if (fs.envVars && fs.envVars[varName]) {
      delete fs.envVars[varName];
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: "",
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: "",
        timestamp: new Date(),
      },
    ];
  },
};
