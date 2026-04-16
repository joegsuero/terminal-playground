import { Command } from "@/types/types";

export const alias: Command = {
  name: "alias",
  description: "Create command aliases",
  execute: (args, fs) => {
    if (args.length === 0) {
      // Show all aliases
      const aliases = fs.aliases || {};
      const aliasList = Object.entries(aliases).map(([key, value]) => `alias ${key}='${value}'`);
      
      if (aliasList.length === 0) {
        return [
          {
            id: Date.now().toString(),
            type: "output",
            content: "No aliases defined",
            timestamp: new Date(),
          },
        ];
      }
      
      return [
        {
          id: Date.now().toString(),
          type: "output",
          content: aliasList.join("\n"),
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
          content: `alias: Invalid format. Usage: alias name='value'`,
          timestamp: new Date(),
        },
      ];
    }

    const aliasName = parts[0];
    const aliasValue = parts.slice(1).join("=").replace(/^'|'$/g, "");

    if (!fs.aliases) {
      fs.aliases = {};
    }
    fs.aliases[aliasName] = aliasValue;

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `alias ${aliasName}='${aliasValue}'`,
        timestamp: new Date(),
      },
    ];
  },
};

export const unalias: Command = {
  name: "unalias",
  description: "Remove command aliases",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "unalias: Usage: unalias name",
          timestamp: new Date(),
        },
      ];
    }

    const aliasName = args[0];

    if (fs.aliases && fs.aliases[aliasName]) {
      delete fs.aliases[aliasName];
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
        type: "error",
        content: `unalias: ${aliasName}: not found`,
        timestamp: new Date(),
      },
    ];
  },
};
