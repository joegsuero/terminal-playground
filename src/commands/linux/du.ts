import { Command } from "@/types/types";

export const du: Command = {
  name: "du",
  description: "Estimate file space usage",
  execute: (args, fs) => {
    const human = args.includes("-h") || args.includes("--human-readable");
    const showTotal = !args.includes("--summarize") && !args.includes("-s");
    
    const path = args.find((arg) => !arg.startsWith("-")) || fs.currentPath;
    
    if (!fs.pathExists(path)) {
      return [
        {
          id: Date.now().toString(),
          type: "error",
          content: `du: cannot access '${path}': No such file or directory`,
          timestamp: new Date(),
        },
      ];
    }
    
    const items = fs.getDirectory(path);
    let totalSize = 0;
    const lines: string[] = [];
    
    for (const item of items) {
      const size = item.type === "directory" ? 4096 : (item.content?.length || 0);
      totalSize += size;
      const sizeStr = human 
        ? (size < 1024 ? `${size}B` : `${(size/1024).toFixed(1)}K`)
        : Math.ceil(size/1024).toString();
      lines.push(`${sizeStr}\t${item.name}`);
    }
    
    if (showTotal) {
      const total = human 
        ? (totalSize < 1024 ? `${totalSize}B` : `${(totalSize/1024).toFixed(1)}K`)
        : Math.ceil(totalSize/1024).toString();
      lines.push(`${total}\t.`);
    }
    
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: lines.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};