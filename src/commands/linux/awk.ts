import { Command, TerminalLine } from "@/types/types";

const line = (type: TerminalLine["type"], content: string): TerminalLine => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  type,
  content,
  timestamp: new Date(),
});

/**
 * Small awk subset: supports -F<sep>, an optional pattern and a single
 * { print ... } action. Field refs $0..$N, NF, NR and comma-separated
 * print lists are understood. Enough for common teaching examples.
 */
export const awk: Command = {
  name: "awk",
  description: "Pattern scanning and processing language",
  execute: (args, fs, _history, stdin) => {
    let fs_sep = /\s+/;
    const rest: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-F") {
        fs_sep = new RegExp(escapeRe(args[++i]));
      } else if (args[i].startsWith("-F")) {
        fs_sep = new RegExp(escapeRe(args[i].slice(2)));
      } else {
        rest.push(args[i]);
      }
    }

    const program = rest[0];
    const fileArg = rest[1];
    if (!program) return [line("error", "usage: awk [-F sep] 'program' [file]")];

    let input: string;
    if (fileArg) {
      const f = fs.getFile(fileArg);
      if (!f) return [line("error", `awk: can't open file ${fileArg}`)];
      input = f.content || "";
    } else {
      input = stdin ?? "";
    }

    // Parse: optional pattern then { action }
    const m = program.match(/^\s*(.*?)\s*\{\s*(.*?)\s*\}\s*$/) || program.match(/^\s*()(print.*)$/);
    if (!m) return [line("error", "awk: syntax error in program"), ];
    const pattern = m[1].trim();
    const action = m[2].trim();

    const rows = input.split("\n");
    // Drop trailing empty line from a final newline.
    if (rows.length > 1 && rows[rows.length - 1] === "") rows.pop();

    const out: string[] = [];
    rows.forEach((row, idx) => {
      const NR = idx + 1;
      const fields = row.split(fs_sep);
      const NF = fields.length;

      if (!matchPattern(pattern, row, fields, NR, NF)) return;

      // Only `print` is supported.
      const printMatch = action.match(/^print\b(.*)$/);
      if (printMatch) {
        const exprList = printMatch[1].trim();
        if (exprList === "") {
          out.push(row);
        } else {
          const parts = splitArgs(exprList).map((e) => evalExpr(e, row, fields, NR, NF));
          out.push(parts.join(" "));
        }
      }
    });

    return [line("output", out.join("\n"))];
  },
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitArgs = (s: string): string[] => {
  const parts: string[] = [];
  let cur = "";
  let inStr = false;
  for (const c of s) {
    if (c === '"') inStr = !inStr;
    if (c === "," && !inStr) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
};

const evalExpr = (expr: string, row: string, fields: string[], NR: number, NF: number): string => {
  expr = expr.trim();
  if (/^".*"$/.test(expr)) return expr.slice(1, -1);
  if (expr === "$0") return row;
  if (expr === "NR") return String(NR);
  if (expr === "NF") return String(NF);
  const f = expr.match(/^\$(\d+)$/);
  if (f) return fields[parseInt(f[1], 10) - 1] ?? "";
  const fnf = expr.match(/^\$NF$/);
  if (fnf) return fields[NF - 1] ?? "";
  return expr;
};

const matchPattern = (
  pattern: string,
  row: string,
  fields: string[],
  NR: number,
  NF: number
): boolean => {
  if (pattern === "") return true;
  // /regex/
  const re = pattern.match(/^\/(.*)\/$/);
  if (re) return new RegExp(re[1]).test(row);
  // NR==n / NR>n / NR<n
  const cmp = pattern.match(/^(NR|NF)\s*(==|>=|<=|>|<|!=)\s*(\d+)$/);
  if (cmp) {
    const lhs = cmp[1] === "NR" ? NR : NF;
    const rhs = parseInt(cmp[3], 10);
    switch (cmp[2]) {
      case "==": return lhs === rhs;
      case "!=": return lhs !== rhs;
      case ">": return lhs > rhs;
      case "<": return lhs < rhs;
      case ">=": return lhs >= rhs;
      case "<=": return lhs <= rhs;
    }
  }
  // $n=="str"
  const feq = pattern.match(/^\$(\d+)\s*(==|!=)\s*"(.*)"$/);
  if (feq) {
    const val = fields[parseInt(feq[1], 10) - 1] ?? "";
    return feq[2] === "==" ? val === feq[3] : val !== feq[3];
  }
  return true;
};
