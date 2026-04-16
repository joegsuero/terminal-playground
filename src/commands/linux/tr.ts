import { Command } from "@/types/types";

export const tr: Command = {
  name: "tr",
  description: "Translate characters",
  execute: (args, fs, _history, stdin) => {
    if (args.length < 2) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "tr: missing operand",
          timestamp: new Date(),
        },
      ];
    }
    
    let input: string;
    
    if (stdin) {
      input = stdin;
    } else {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "tr: missing stdin (use pipe or here-string)",
          timestamp: new Date(),
        },
      ];
    }
    
    const [set1, set2] = args.slice(0, 2);
    const result = input.split("").map(char => {
      const idx = set1.indexOf(char);
      return idx >= 0 && set2[idx] ? set2[idx] : char;
    }).join("");
    
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