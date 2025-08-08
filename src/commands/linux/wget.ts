import { Command } from "@/types/types";

export const wget: Command = {
  name: "wget",
  description: "Download files from web",
  execute: (args) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "wget: missing URL",
          timestamp: new Date(),
        },
      ];
    }

    const url = args[0];
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `--${new Date().toISOString()}--  ${url}\nResolving example.com... 93.184.216.34\nConnecting to example.com|93.184.216.34|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1.0K) [text/html]\nSaving to: 'index.html'\n\nindex.html      100%[===================>]   1.00K  --.-KB/s    in 0s\n\n${new Date().toISOString()} (5.23 MB/s) - 'index.html' saved [1024/1024]`,
        timestamp: new Date(),
      },
    ];
  },
};
