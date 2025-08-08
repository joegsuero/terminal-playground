import { Command } from "@/types/types";

export const df: Command = {
  name: "df",
  description: "Disk space usage",
  execute: (args) => {
    const human = args.includes("-h");
    const content = human
      ? "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  8.5G   11G  45% /\n/dev/sda2       100G   45G   50G  48% /home\ntmpfs           4.0G     0  4.0G   0% /tmp"
      : "Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1       20971520  8912896  11534336  45% /\n/dev/sda2      104857600 47185920  52428800  48% /home\ntmpfs            4194304        0   4194304   0% /tmp";

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
