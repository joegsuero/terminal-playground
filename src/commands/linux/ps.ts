import { Command } from "@/types/types";

export const ps: Command = {
  name: "ps",
  description: "Show running processes",
  execute: () => {
    const processes = [
      "PID TTY          TIME CMD",
      "  1 ?        00:00:01 systemd",
      "  2 ?        00:00:00 kthreadd",
      "  3 ?        00:00:00 rcu_gp",
      "  4 ?        00:00:00 rcu_par_gp",
      "123 pts/0    00:00:00 bash",
      "456 pts/0    00:00:00 node",
      "789 pts/0    00:00:00 ps",
    ];

    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: processes.join("\n"),
        timestamp: new Date(),
      },
    ];
  },
};
