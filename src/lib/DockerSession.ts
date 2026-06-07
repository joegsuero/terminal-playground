/**
 * A Docker shell session implementing ReplSession. It dispatches to the
 * existing docker command handlers (reused as-is) against a shared DockerEngine,
 * and renders their string output as terminal lines.
 */
import type { Dispatch, SetStateAction } from "react";
import { DockerEngine } from "./DockerEngine";
import { commands, DockerCommandFunction } from "@/commands/docker";
import { ReplSession, ExecResult, CompletionResult } from "./repl";
import { TerminalLine, DockerContainer, DockerImage } from "@/types/types";
import { generateId } from "./terminalUtils";
import { ANSI } from "./ansi";

const SUBCOMMANDS = [
  "ps", "images", "pull", "run", "stop", "start", "rm", "logs", "exec",
  "build", "version", "system", "network", "volume", "--help", "--version",
];

const CONTAINER_SUBS = ["stop", "start", "rm", "logs", "exec"];

export class DockerSession implements ReplSession {
  engine: DockerEngine;
  commandHistory: string[] = [];

  constructor(engine: DockerEngine) {
    this.engine = engine;
  }

  private line(type: TerminalLine["type"], content: string): TerminalLine {
    return { id: generateId(), type, content, timestamp: new Date() };
  }

  private get setContainers(): Dispatch<SetStateAction<DockerContainer[]>> {
    return (u) =>
      this.engine.setContainers(
        typeof u === "function" ? (u as (p: DockerContainer[]) => DockerContainer[])(this.engine.containers) : u
      );
  }

  private get setImages(): Dispatch<SetStateAction<DockerImage[]>> {
    return (u) =>
      this.engine.setImages(
        typeof u === "function" ? (u as (p: DockerImage[]) => DockerImage[])(this.engine.images) : u
      );
  }

  private call(handler: DockerCommandFunction, args: string[]): string {
    return handler(args, this.setContainers, this.setImages, this.engine.containers, this.engine.images);
  }

  execute(input: string): ExecResult {
    const trimmed = input.trim();
    if (!trimmed) return { lines: [] };

    this.commandHistory.push(trimmed);
    if (trimmed.startsWith("#")) return { lines: [] };

    const args = trimmed.split(/\s+/);
    const isDocker = args[0] === "docker";
    const subcommand = isDocker ? args[1] : args[0];

    if (args[0] === "clear" || subcommand === "clear") return { lines: [], clear: true };
    if (args[0] === "exit") return { lines: [], exit: true };
    if (args[0] === "help") {
      return { lines: [this.line("output", this.call(commands["docker"], ["docker", "--help"]))] };
    }

    let result = "";
    if (isDocker && (!subcommand || subcommand === "--help" || subcommand === "help")) {
      result = this.call(commands["docker"], ["docker", "--help"]);
    } else if (isDocker && (subcommand === "--version" || subcommand === "version")) {
      result = this.call(commands["docker"], ["docker", "--version"]);
    } else {
      const handler = commands[subcommand];
      if (handler) {
        result = this.call(handler, args);
      } else {
        result = isDocker
          ? `docker: '${subcommand}' is not a docker command.\nSee 'docker --help'`
          : `${subcommand}: command not found`;
      }
    }

    if (!result) return { lines: [] };

    const isError = /^Error\b|is not a (docker|valid)|command not found|requires|No such/.test(result);
    return { lines: [this.line(isError ? "error" : "output", result)] };
  }

  prompt(): string {
    return (
      ANSI.bold + ANSI.brightCyan + "user@docker-playground" + ANSI.reset +
      ":" + ANSI.bold + ANSI.brightBlue + "~" + ANSI.reset + "$ "
    );
  }

  welcome(): string {
    return (
      ANSI.brightCyan + "Welcome to Docker Terminal Playground" + ANSI.reset + "\r\n" +
      ANSI.dim + "Type \"docker --help\". Multiplexing: Ctrl+B then % (vsplit), \" (hsplit), arrows, c, x." +
      ANSI.reset + "\r\n\r\n"
    );
  }

  getStatus(): string {
    const running = this.engine.containers.filter((c) => c.status === "running").length;
    return `${running}/${this.engine.containers.length} running`;
  }

  complete(before: string): CompletionResult {
    const word = before.endsWith(" ") ? "" : before.split(/\s+/).pop() ?? "";
    const segs = before.replace(/^\s+/, "").split(/\s+/).filter(Boolean);
    const prior = before.endsWith(" ") ? segs : segs.slice(0, -1);

    let options: string[] = [];

    if (prior.length === 0) {
      options = ["docker", "clear", "exit", "help"];
    } else if (prior[0] === "docker") {
      if (prior.length === 1) {
        options = SUBCOMMANDS;
      } else if (prior.length === 2) {
        const sub = prior[1];
        if (CONTAINER_SUBS.includes(sub)) {
          options = this.engine.containers.map((c) => c.name);
        } else if (sub === "system") {
          options = ["prune", "df", "--help"];
        } else if (sub === "network" || sub === "volume") {
          options = ["ls"];
        } else if (sub === "pull" || sub === "run") {
          options = this.engine.images.map((i) => `${i.repository}:${i.tag}`);
        }
      }
    }

    return { word, options: options.filter((o) => o.startsWith(word)).sort() };
  }
}
