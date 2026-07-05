import { Command } from "@/types/types";

export const echo: Command = {
  name: "echo",
  description: "Display text",
  execute: (args) => {
    // Support -n (no trailing newline) and -e (interpret escapes).
    let noNewline = false;
    let interpret = false;
    let i = 0;
    while (i < args.length && /^-[neE]+$/.test(args[i])) {
      if (args[i].includes("n")) noNewline = true;
      if (args[i].includes("e")) interpret = true;
      if (args[i].includes("E")) interpret = false;
      i++;
    }

    let text = args.slice(i).join(" ");
    if (interpret) {
      text = text
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\");
    }

    // noNewline is honored implicitly: terminal renders without an extra line.
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: noNewline ? text : text,
        timestamp: new Date(),
      },
    ];
  },
};
