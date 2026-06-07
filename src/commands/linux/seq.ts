import { Command } from "@/types/types";

export const seq: Command = {
  name: "seq",
  description: "Print a sequence of numbers",
  execute: (args) => {
    const nums = args.filter((a) => !a.startsWith("-")).map(Number);
    let first = 1;
    let incr = 1;
    let last = 0;
    if (nums.length === 1) [last] = nums;
    else if (nums.length === 2) [first, last] = nums;
    else if (nums.length >= 3) [first, incr, last] = nums;
    else {
      return [{ id: Date.now().toString(), type: "error", content: "seq: missing operand", timestamp: new Date() }];
    }

    if (incr === 0 || nums.some((n) => Number.isNaN(n))) {
      return [{ id: Date.now().toString(), type: "error", content: "seq: invalid argument", timestamp: new Date() }];
    }

    const out: number[] = [];
    if (incr > 0) for (let n = first; n <= last; n += incr) out.push(n);
    else for (let n = first; n >= last; n += incr) out.push(n);

    return [{ id: Date.now().toString(), type: "output", content: out.join("\n"), timestamp: new Date() }];
  },
};
