import { Command } from "@/types/types";

export const uniq: Command = {
  name: "uniq",
  description: "Report or filter repeated lines",
  execute: (args, fs, _history, stdin) => {
    let input: string;
    
    if (stdin) {
      input = stdin;
    } else {
      const fileArg = args.find(arg => !arg.startsWith("-"));
      if (!fileArg) {
        return [
          {
            id: Date.now().toString(),
            type: "error",
            content: "uniq: missing operand",
            timestamp: new Date(),
          },
        ];
      }
      
      const file = fs.getFile(fileArg);
      if (!file) {
        return [
          {
            id: Date.now().toString(),
            type: "error",
            content: `uniq: ${fileArg}: No such file or directory`,
            timestamp: new Date(),
          },
        ];
      }
      input = file.content;
    }
    
    const lines = input.split("\n").filter(line => line.trim() !== "");
    const unique = lines.filter((line, idx) => idx === 0 || line !== lines[idx - 1]);
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: unique.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};