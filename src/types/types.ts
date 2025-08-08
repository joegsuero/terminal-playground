/* eslint-disable @typescript-eslint/no-explicit-any */
export type TrainingMode = "linux" | "docker";

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "created";
  ports: string[];
  created: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  content: string;
  timestamp: Date;
}

export interface Command {
  name: string;
  description: string;
  execute: (
    args: string[],
    fs: any,
    commandHistory?: string[]
  ) => TerminalLine[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  commands: string[];
  commandExplanations: string[];
  expectedOutputs?: string[];
}
