/**
 * Shared contract between the xterm readline/tmux UI and a backend "session".
 * Both the Linux ShellSession and the DockerSession implement ReplSession, so
 * the terminal emulator, line editor and multiplexer are backend-agnostic.
 */
import { TerminalLine } from "@/types/types";

export interface EditorRequest {
  editor: "vim" | "nano";
  path: string;
  content: string;
  existed: boolean;
}

export interface ExecResult {
  lines: TerminalLine[];
  clear?: boolean;
  exit?: boolean;
  editor?: EditorRequest;
  /** When the input was rewritten (e.g. history expansion), the echoed line. */
  echo?: string;
}

export interface CompletionResult {
  /** The token under the cursor that will be replaced. */
  word: string;
  /** Full replacements for `word` (may end in "/" to denote a directory). */
  options: string[];
}

export interface ReplSession {
  /** Raw command history, newest last. The line editor reads/writes this. */
  commandHistory: string[];
  /** Run a line and return its rendered output / control signals. */
  execute(input: string): ExecResult;
  /** ANSI-coloured prompt string. */
  prompt(): string;
  /** ANSI welcome banner shown once when the pane starts ("" for none). */
  welcome(): string;
  /** Tab-completion candidates for the text before the cursor. */
  complete(before: string): CompletionResult;
  /** Short text for the tmux status bar (cwd, container counts, ...). */
  getStatus(): string;
  /** Persist an editor buffer to the backing store (Linux only). */
  saveEditorFile?(path: string, content: string): void;
}
