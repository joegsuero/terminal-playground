import { Command } from "@/types/types";

export const chmod: Command = {
  name: "chmod",
  description: "Change file permissions",
  execute: (args, fs) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "chmod: missing operand",
          timestamp: new Date(),
        },
      ];
    }

    const permissions = args[0];
    const filename = args[1];
    const file = fs.getFile(filename);

    if (!file) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `chmod: cannot access '${filename}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `Changed permissions of '${filename}' to ${permissions}`,
        timestamp: new Date(),
      },
    ];
  },
};
