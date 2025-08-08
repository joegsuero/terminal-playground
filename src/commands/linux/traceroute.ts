import { Command } from "@/types/types";

export const traceroute: Command = {
  name: "traceroute",
  description: "Trace route to host (simulated)",
  execute: (args) => {
    const host = args[0] || "google.com";
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `traceroute to ${host} (8.8.8.8), 30 hops max, 60 byte packets\n 1  gateway (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms\n 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.890 ms\n 3  ${host} (8.8.8.8)  12.345 ms  12.123 ms  12.567 ms`,
        timestamp: new Date(),
      },
    ];
  },
};
