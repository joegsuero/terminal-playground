import { Command } from "@/types/types";

export const cut: Command = {
  name: "cut",
  description: "Cut out sections of lines",
  execute: (args, fs, _history, stdin) => {
    const delimArg = args.find(arg => arg.startsWith("-d"));
    const fieldArg = args.find(arg => arg.startsWith("-f"));
    
    const delimiter = delimArg ? delimArg.replace("-d", "").replace(/['"]/g, "") : "\t";
    const fields = fieldArg ? fieldArg.replace("-f", "").split(",").map(Number) : [];
    
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
            content: "cut: missing file operand",
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
            content: `cut: ${fileArg}: No such file or directory`,
            timestamp: new Date(),
          },
        ];
      }
      input = file.content;
    }
    
    const lines = input.split("\n");
    const result = lines.map(line => {
      const parts = line.split(delimiter);
      if (fields.length > 0) {
        return fields.map(f => parts[f - 1] || "").join(delimiter);
      }
      return parts.join(delimiter);
    }).join("\n");
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: result,
        timestamp: new Date(),
      },
    ];
  },
};