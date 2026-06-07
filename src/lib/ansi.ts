/** ANSI rendering helpers for the xterm-based terminal. */
import { TerminalLine, TerminalSegment } from "@/types/types";
import { ShellSession } from "./ShellSession";
import { HOME } from "./vfs";

export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightBlue: "\x1b[94m",
  brightCyan: "\x1b[96m",
};

const segmentColor = (color: TerminalSegment["color"]): string => {
  switch (color) {
    case "dir":
      return ANSI.bold + ANSI.brightBlue;
    case "exec":
      return ANSI.bold + ANSI.brightGreen;
    case "link":
      return ANSI.brightCyan;
    case "compressed":
      return ANSI.red;
    default:
      return "";
  }
};

/** Render one command-output line to an ANSI string (no trailing newline). */
export const lineToAnsi = (line: TerminalLine): string => {
  if (line.segments && line.segments.length > 0) {
    return line.segments
      .map((seg) => {
        const c = segmentColor(seg.color);
        return c ? c + seg.text + ANSI.reset : seg.text;
      })
      .join("");
  }
  if (line.type === "error") {
    return ANSI.red + line.content + ANSI.reset;
  }
  return line.content;
};

/** Collapse $HOME to ~ for display in the prompt. */
export const prettyCwd = (cwd: string): string => {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
};

/** Build the colored shell prompt for a session. */
export const buildPrompt = (session: ShellSession): string => {
  const user = session.envVars.USER || "user";
  const host = session.envVars.HOSTNAME || "linux-playground";
  const cwd = prettyCwd(session.currentPath);
  return (
    ANSI.bold +
    ANSI.brightGreen +
    `${user}@${host}` +
    ANSI.reset +
    ":" +
    ANSI.bold +
    ANSI.brightBlue +
    cwd +
    ANSI.reset +
    "$ "
  );
};

/** Visible length of the prompt, ignoring escape sequences. */
export const promptVisibleLength = (session: ShellSession): string => {
  const user = session.envVars.USER || "user";
  const host = session.envVars.HOSTNAME || "linux-playground";
  const cwd = prettyCwd(session.currentPath);
  return `${user}@${host}:${cwd}$ `;
};
