/**
 * Lightweight POSIX-like shell parser.
 *
 * Turns a raw command line into a structure the terminal engine can execute:
 *   - tokenization with single/double quote and backslash handling
 *   - pipelines (cmd | cmd | cmd)
 *   - redirections (>, >>, <)
 *   - command lists joined by ;, && and ||
 *
 * Word expansion (variables, tilde, globbing) is intentionally left to the
 * execution engine, which has access to the environment and file system.
 */

export interface WordToken {
  value: string;
  /** True if any part of the token was wrapped in quotes. */
  quoted: boolean;
  /** True if the whole token came from a single-quoted string. */
  singleQuoted: boolean;
}

export interface Redirect {
  /**
   * in        : <  file        (stdin from file)
   * out       : >  file        (stdout, truncate)
   * append    : >> file        (stdout, append)
   * errout    : 2> file        (stderr, truncate)
   * errappend : 2>>file        (stderr, append)
   * bothout   : &> file        (stdout+stderr, truncate)
   * bothappend: &>>file        (stdout+stderr, append)
   * mergeerr  : 2>&1           (send stderr to current stdout target)
   */
  type:
    | "in"
    | "out"
    | "append"
    | "errout"
    | "errappend"
    | "bothout"
    | "bothappend"
    | "mergeerr";
  file?: string;
}

export interface ParsedStage {
  words: WordToken[];
}

export interface ParsedPipeline {
  stages: ParsedStage[];
  redirects: Redirect[];
  /** Operator connecting this pipeline to the next one (null for the last). */
  connector: ";" | "&&" | "||" | null;
}

type RawToken =
  | { type: "word"; value: string; quoted: boolean; singleQuoted: boolean }
  | { type: "op"; value: string };

// Longest first so e.g. `2>&1` wins over `2>` and `&&` over `&>`.
const MULTI_OPERATORS = ["2>&1", "&>>", "2>>", "&&", "||", ">>", "&>", "2>"];
const OPERATORS_1 = ["|", ">", "<", ";"];

/**
 * Split a raw command line into word and operator tokens, honoring quotes
 * and escapes the way a POSIX shell roughly would.
 */
export const tokenize = (input: string): RawToken[] => {
  const tokens: RawToken[] = [];
  let i = 0;

  let cur = "";
  let hasCur = false;
  let quoted = false;
  let singleQuoted = false;
  let sawUnquoted = false;

  const flushWord = () => {
    if (!hasCur) return;
    tokens.push({
      type: "word",
      value: cur,
      quoted,
      // singleQuoted only counts when the entire token was single quoted
      singleQuoted: singleQuoted && !sawUnquoted,
    });
    cur = "";
    hasCur = false;
    quoted = false;
    singleQuoted = false;
    sawUnquoted = false;
  };

  while (i < input.length) {
    const c = input[i];

    // Single quotes: everything literal until the next single quote.
    if (c === "'") {
      hasCur = true;
      quoted = true;
      singleQuoted = true;
      i++;
      while (i < input.length && input[i] !== "'") {
        cur += input[i];
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    // Double quotes: literal except for escaped chars.
    if (c === '"') {
      hasCur = true;
      quoted = true;
      sawUnquoted = sawUnquoted || false;
      // mark that not the whole token is single quoted
      singleQuoted = false;
      sawUnquoted = true;
      i++;
      while (i < input.length && input[i] !== '"') {
        if (
          input[i] === "\\" &&
          i + 1 < input.length &&
          '"\\$`'.includes(input[i + 1])
        ) {
          cur += input[i + 1];
          i += 2;
        } else {
          cur += input[i];
          i++;
        }
      }
      i++; // skip closing quote
      continue;
    }

    // Backslash escape outside quotes.
    if (c === "\\") {
      if (i + 1 < input.length) {
        cur += input[i + 1];
        hasCur = true;
        sawUnquoted = true;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // Whitespace separates words.
    if (c === " " || c === "\t" || c === "\n") {
      flushWord();
      i++;
      continue;
    }

    // Multi-character operators (longest match first).
    const multi = MULTI_OPERATORS.find((op) => input.startsWith(op, i));
    if (multi) {
      flushWord();
      tokens.push({ type: "op", value: multi });
      i += multi.length;
      continue;
    }

    // Single-character operators.
    if (OPERATORS_1.includes(c)) {
      flushWord();
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    cur += c;
    hasCur = true;
    sawUnquoted = true;
    i++;
  }

  flushWord();
  return tokens;
};

/**
 * Parse a command line into a list of pipelines connected by ; && ||.
 * Returns null when the syntax is invalid (e.g. dangling operator).
 */
export const parseCommandLine = (
  input: string
): { pipelines: ParsedPipeline[]; error?: string } => {
  const tokens = tokenize(input);

  const pipelines: ParsedPipeline[] = [];

  let stages: ParsedStage[] = [];
  let currentWords: WordToken[] = [];
  let redirects: Redirect[] = [];

  const finishStage = () => {
    stages.push({ words: currentWords });
    currentWords = [];
  };

  const finishPipeline = (connector: ParsedPipeline["connector"]) => {
    finishStage();
    pipelines.push({ stages, redirects, connector });
    stages = [];
    redirects = [];
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === "word") {
      currentWords.push({
        value: tok.value,
        quoted: tok.quoted,
        singleQuoted: tok.singleQuoted,
      });
      continue;
    }

    // Operator handling
    switch (tok.value) {
      case "|":
        if (currentWords.length === 0) {
          return { pipelines: [], error: "syntax error near unexpected token '|'" };
        }
        finishStage();
        break;
      case "2>&1":
        redirects.push({ type: "mergeerr" });
        break;
      case ">":
      case ">>":
      case "<":
      case "2>":
      case "2>>":
      case "&>":
      case "&>>": {
        const next = tokens[i + 1];
        if (!next || next.type !== "word") {
          return {
            pipelines: [],
            error: "syntax error near unexpected token 'newline'",
          };
        }
        const typeMap: Record<string, Redirect["type"]> = {
          "<": "in",
          ">": "out",
          ">>": "append",
          "2>": "errout",
          "2>>": "errappend",
          "&>": "bothout",
          "&>>": "bothappend",
        };
        redirects.push({ type: typeMap[tok.value], file: next.value });
        i++; // consume filename
        break;
      }
      case ";":
      case "&&":
      case "||":
        if (currentWords.length === 0 && stages.length === 0) {
          return {
            pipelines: [],
            error: `syntax error near unexpected token '${tok.value}'`,
          };
        }
        finishPipeline(tok.value as ParsedPipeline["connector"]);
        break;
    }
  }

  // Flush trailing pipeline (only if something is pending).
  if (currentWords.length > 0 || stages.length > 0 || redirects.length > 0) {
    finishPipeline(null);
  }

  // An empty stage means a dangling/duplicated pipe (e.g. `ls |` or `a || `).
  for (const pl of pipelines) {
    if (pl.stages.some((s) => s.words.length === 0)) {
      return { pipelines: [], error: "syntax error near unexpected token '|'" };
    }
  }

  return { pipelines };
};

/** Split on a separator that appears at brace-nesting depth 0. */
const splitTopLevel = (s: string, sep: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    if (c === sep && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  parts.push(cur);
  return parts;
};

/** Expand a numeric ({1..5}) or character ({a..e}) range, or null if invalid. */
const expandRange = (body: string): string[] | null => {
  const m = body.match(/^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/);
  if (m) {
    const start = parseInt(m[1], 10);
    const end = parseInt(m[2], 10);
    const step = Math.abs(m[3] ? parseInt(m[3], 10) : 1) || 1;
    const width = Math.max(m[1].replace("-", "").length, m[2].replace("-", "").length);
    const pad = /^-?0\d/.test(m[1]) || /^-?0\d/.test(m[2]);
    const out: string[] = [];
    if (start <= end) for (let n = start; n <= end; n += step) out.push(fmt(n, pad, width));
    else for (let n = start; n >= end; n -= step) out.push(fmt(n, pad, width));
    return out;
  }
  const cm = body.match(/^([a-zA-Z])\.\.([a-zA-Z])$/);
  if (cm) {
    const a = cm[1].charCodeAt(0);
    const b = cm[2].charCodeAt(0);
    const out: string[] = [];
    if (a <= b) for (let c = a; c <= b; c++) out.push(String.fromCharCode(c));
    else for (let c = a; c >= b; c--) out.push(String.fromCharCode(c));
    return out;
  }
  return null;
};

const fmt = (n: number, pad: boolean, width: number): string => {
  if (!pad) return String(n);
  const neg = n < 0;
  const digits = Math.abs(n).toString().padStart(width, "0");
  return (neg ? "-" : "") + digits;
};

/**
 * Brace expansion: foo{a,b}bar -> [fooabar, foobbar], {1..3} -> [1,2,3].
 * Applied before other expansions, recursively, ignoring quoted braces is the
 * caller's job (only call on unquoted words).
 */
export const expandBraces = (input: string): string[] => {
  // Find the first balanced {...} that contains a top-level comma or range.
  let start = -1;
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (input[i] === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        const body = input.slice(start + 1, i);
        const hasComma = splitTopLevel(body, ",").length > 1;
        const range = hasComma ? null : expandRange(body);
        if (!hasComma && !range) {
          // Not an expandable group; keep scanning after it.
          start = -1;
          continue;
        }
        const pre = input.slice(0, start);
        const post = input.slice(i + 1);
        const options = hasComma ? splitTopLevel(body, ",") : (range as string[]);
        const results: string[] = [];
        for (const opt of options) {
          // Expand the option (it may itself contain braces) and the tail.
          for (const expandedOpt of expandBraces(opt)) {
            for (const expandedPost of expandBraces(post)) {
              results.push(pre + expandedOpt + expandedPost);
            }
          }
        }
        return results;
      }
    }
  }
  return [input];
};
