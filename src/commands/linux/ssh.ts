import { Command } from "@/types/types";

export const ssh: Command = {
  name: "ssh",
  description: "SSH connection simulation",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "ssh: Usage: ssh [user@]hostname",
          timestamp: new Date(),
        },
      ];
    }

    const target = args[0];
    const parts = target.split("@");
    const user = parts.length > 1 ? parts[0] : "user";
    const hostname = parts.length > 1 ? parts[1] : parts[0];

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `The authenticity of host '${hostname}' can't be established.`,
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "ECDSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.",
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 2).toString(),
        type: "output",
        content: "Are you sure you want to continue connecting (yes/no/[fingerprint])? ",
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 3).toString(),
        type: "output",
        content: `(Simulation: SSH connection to ${user}@${hostname} would be established here)`,
        timestamp: new Date(),
      },
    ];
  },
};

export const scp: Command = {
  name: "scp",
  description: "Secure copy simulation",
  execute: (args, fs) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "scp: Usage: scp <source> <destination>",
          timestamp: new Date(),
        },
      ];
    }

    const source = args[0];
    const dest = args[1];

    // Check if source exists
    const sourceFile = fs.getFile(source);
    if (!sourceFile && !source.includes(":")) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `scp: ${source}: No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `${source}                                    100%    0     0.0KB/s   00:00`,
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: `(Simulation: File would be copied from ${source} to ${dest})`,
        timestamp: new Date(),
      },
    ];
  },
};
