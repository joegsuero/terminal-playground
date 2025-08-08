import { Command } from "@/types/types";

export const ping: Command = {
  name: "ping",
  description: "Ping a host (simulated)",
  execute: (args) => {
    const host = args[0] || "localhost";
    return [
      {
        id: Date.now().toString(),
        type: "output",
        content: `PING ${host} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 time=0.123 ms\n64 bytes from 127.0.0.1: icmp_seq=1 time=0.089 ms\n64 bytes from 127.0.0.1: icmp_seq=2 time=0.156 ms\n\n--- ${host} ping statistics ---\n3 packets transmitted, 3 packets received, 0.0% packet loss`,
        timestamp: new Date(),
      },
    ];
  },
};
