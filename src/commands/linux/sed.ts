import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

/**
 * Minimal sed supporting the substitution command:
 *   s/pattern/replacement/[g][i]
 * with any single-character delimiter. Reads from a file or from stdin.
 */
export const sed: Command = {
  name: "sed",
  description: "Stream editor",
  execute: (args, fs, _history, stdin) => {
    const operands = args.filter((a) => a !== "-e");
    if (operands.length === 0) {
      return [line("error", "usage: sed s/old/new/[g] [file]")];
    }

    const script = operands[0];
    const fileArg = operands[1];

    // Parse s<delim>pattern<delim>replacement<delim>flags
    if (script[0] !== "s" || script.length < 4) {
      return [line("error", `sed: -e expression #1: unknown command: '${script[0]}'`)];
    }
    const delim = script[1];
    const parts: string[] = [];
    let cur = "";
    for (let i = 2; i < script.length; i++) {
      if (script[i] === "\\" && script[i + 1] === delim) {
        cur += delim;
        i++;
      } else if (script[i] === delim) {
        parts.push(cur);
        cur = "";
      } else {
        cur += script[i];
      }
    }
    parts.push(cur);

    if (parts.length < 3) {
      return [line("error", "sed: -e expression #1: unterminated `s' command")];
    }

    const [pattern, replacement, flags = ""] = parts;
    const global = flags.includes("g");
    const ignoreCase = flags.includes("i");

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, (global ? "g" : "") + (ignoreCase ? "i" : ""));
    } catch {
      regex = new RegExp(
        pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        (global ? "g" : "") + (ignoreCase ? "i" : "")
      );
    }

    let input: string;
    if (fileArg) {
      const file = fs.getFile(fileArg);
      if (!file) {
        return [line("error", `sed: can't read ${fileArg}: No such file or directory`)];
      }
      if (file.type === "directory") {
        return [line("error", `sed: read error on ${fileArg}: Is a directory`)];
      }
      input = file.content || "";
    } else {
      if (stdin === undefined) return [line("error", "sed: no input file")];
      input = stdin;
    }

    const result = input
      .split("\n")
      .map((l) => l.replace(regex, replacement))
      .join("\n");

    return [line("output", result)];
  },
};
