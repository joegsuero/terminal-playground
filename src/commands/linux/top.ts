import { Command } from "@/types/types";

export const top: Command = {
  name: "top",
  description: "Display system processes",
  execute: () => [
    {
      id: Date.now().toString(),
      type: "output",
      content: `top - ${new Date().toLocaleTimeString()} up 1:23, 1 user, load average: 0.15, 0.25, 0.18\nTasks: 156 total, 1 running, 155 sleeping, 0 stopped, 0 zombie\n%Cpu(s): 2.3 us, 1.2 sy, 0.0 ni, 96.5 id, 0.0 wa, 0.0 hi, 0.0 si, 0.0 st\nMiB Mem : 8192.0 total, 6421.3 free, 1234.5 used, 536.2 buff/cache\nMiB Swap: 2048.0 total, 2048.0 free, 0.0 used. 6543.2 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n    1 root      20   0  169364  13584   8756 S   0.0   0.2   0:01.23 systemd\n  123 user      20   0   21464   5208   3456 S   0.0   0.1   0:00.12 bash\n  456 user      20   0  632184  45672  23456 S   1.3   0.6   0:02.34 node`,
      timestamp: new Date(),
    },
  ],
};
