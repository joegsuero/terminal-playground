import { Command } from "@/types/types";

export const curl: Command = {
  name: "curl",
  description: "Transfer data from servers",
  execute: (args) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "curl: try 'curl --help' for more information",
          timestamp: new Date(),
        },
      ];
    }

    const url = args[0];
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `<!DOCTYPE html>\n<html>\n<head>\n    <title>Example Domain</title>\n</head>\n<body>\n    <h1>Example Domain</h1>\n    <p>This domain is for use in illustrative examples.</p>\n</body>\n</html>`,
        timestamp: new Date(),
      },
    ];
  },
};
