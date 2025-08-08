import { Command } from "@/types/types";

export const free: Command = {
  name: "free",
  description: "Memory usage",
  execute: (args) => {
    const human = args.includes("-h");
    const content = human
      ? "              total        used        free      shared  buff/cache   available\nMem:           8.0G        1.2G        6.4G        164M        536M        6.5G\nSwap:          2.0G          0B        2.0G"
      : "              total        used        free      shared  buff/cache   available\nMem:        8388608     1258496     6553600      167936      549376     6717440\nSwap:       2097152           0     2097152";

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content,
        timestamp: new Date(),
      },
    ];
  },
};
