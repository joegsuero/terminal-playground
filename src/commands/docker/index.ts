import { DockerContainer, DockerImage } from "@/types/types";
import { handleBuildCommand } from "./build";
import { handleExecCommand } from "./exec";
import { handleImagesCommand } from "./images";
import { handleLogsCommand } from "./logs";
import { handleOtherCommands } from "./others";
import { handlePsCommand } from "./ps";
import { handlePullCommand } from "./pull";
import { handleRmCommand } from "./rm";
import { handleRunCommand } from "./run";
import { handleStartCommand } from "./start";
import { handleStopCommand } from "./stop";

export type DockerCommandFunction = (
  args: string[],
  setContainers: React.Dispatch<React.SetStateAction<DockerContainer[]>>,
  setImages: React.Dispatch<React.SetStateAction<DockerImage[]>>,
  containers: DockerContainer[],
  images: DockerImage[]
) => string;

export const commands: Record<string, DockerCommandFunction> = {
  ps: handlePsCommand,
  images: handleImagesCommand,
  pull: handlePullCommand,
  run: handleRunCommand,
  stop: handleStopCommand,
  start: handleStartCommand,
  rm: handleRmCommand,
  logs: handleLogsCommand,
  exec: handleExecCommand,
  build: handleBuildCommand,
  version: handleOtherCommands,
  docker: handleOtherCommands,
  "--help": handleOtherCommands,
  system: handleOtherCommands,
  network: handleOtherCommands,
  volume: handleOtherCommands,
};
