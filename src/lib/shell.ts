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
  type: "in" | "out" | "append";
  file: string;
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

const OPERATORS_2 = ["&&", "||", ">>"];
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

    // Two-character operators.
    const two = input.substr(i, 2);
    if (OPERATORS_2.includes(two)) {
      flushWord();
      tokens.push({ type: "op", value: two });
      i += 2;
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
      case ">":
      case ">>":
      case "<": {
        const next = tokens[i + 1];
        if (!next || next.type !== "word") {
          return {
            pipelines: [],
            error: "syntax error near unexpected token 'newline'",
          };
        }
        redirects.push({
          type: tok.value === "<" ? "in" : tok.value === ">>" ? "append" : "out",
          file: next.value,
        });
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
