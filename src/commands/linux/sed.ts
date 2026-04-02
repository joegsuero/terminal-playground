import { Command } from "@/types/types";

export const sed: Command = {
  name: "sed",
  description: "Stream editor",
  execute: (args, fs) => {
    if (args.length === 0) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "sed: missing script",
          timestamp: new Date(),
        },
      ];
    }
    
    const script = args[0];
    const fileArg = args[1];
    
    if (!fileArg || fileArg.startsWith("-")) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "sed: missing file operand",
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
          content: `sed: cannot read '${fileArg}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }
    
    const match = script.match(/^s([^~]+)~([^~]*)~([g]?)$/);
    if (!match) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: "sed: invalid substitution pattern. Use: s/old/new/[g]",
          timestamp: new Date(),
        },
      ];
    }
    
    const [, delimiter, oldStr, flag] = match;
    const newStr = "";
    const isGlobal = flag === "g";
    
    const lines = file.content.split("\n");
    const result = lines.map(line => {
      if (isGlobal) {
        return line.split(delimiter + oldStr + delimiter).join(delimiter + newStr + delimiter);
      } else {
        const firstIdx = line.indexOf(delimiter + oldStr + delimiter);
        if (firstIdx === -1) return line;
        return line.substring(0, firstIdx) + delimiter + newStr + delimiter + line.substring(firstIdx + delimiter.length * 2 + oldStr.length);
      }
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