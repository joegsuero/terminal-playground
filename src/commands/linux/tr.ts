import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

/** Expand ranges like a-z and a few POSIX classes into a flat character list. */
const expandSet = (set: string): string[] => {
  const classes: Record<string, string> = {
    "[:lower:]": "abcdefghijklmnopqrstuvwxyz",
    "[:upper:]": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "[:digit:]": "0123456789",
    "[:alpha:]": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "[:space:]": " \t\n",
  };
  for (const [name, value] of Object.entries(classes)) {
    set = set.split(name).join(value);
  }

  const chars: string[] = [];
  for (let i = 0; i < set.length; i++) {
    if (set[i + 1] === "-" && set[i + 2] !== undefined) {
      const start = set.charCodeAt(i);
      const end = set.charCodeAt(i + 2);
      for (let c = start; c <= end; c++) chars.push(String.fromCharCode(c));
      i += 2;
    } else {
      chars.push(set[i]);
    }
  }
  return chars;
};

export const tr: Command = {
  name: "tr",
  description: "Translate or delete characters",
  execute: (args, fs, _history, stdin) => {
    const del = args.includes("-d");
    const operands = args.filter((a) => !a.startsWith("-"));

    if ((del && operands.length < 1) || (!del && operands.length < 2)) {
      return [line("error", "tr: missing operand")];
    }
    if (stdin === undefined) {
      return [line("error", "tr: read from stdin (use a pipe)")];
    }

    const set1 = expandSet(operands[0]);

    if (del) {
      const remove = new Set(set1);
      const result = stdin
        .split("")
        .filter((ch) => !remove.has(ch))
        .join("");
      return [line("output", result)];
    }

    const set2 = expandSet(operands[1]);
    const map = new Map<string, string>();
    set1.forEach((ch, i) => {
      // Like coreutils, the last char of set2 fills the remainder.
      map.set(ch, set2[i] ?? set2[set2.length - 1]);
    });

    const result = stdin
      .split("")
      .map((ch) => map.get(ch) ?? ch)
      .join("");
    return [line("output", result)];
  },
};
