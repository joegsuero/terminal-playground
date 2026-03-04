import { useState, useCallback } from "react";
import { commands, DockerCommandFunction } from "./docker";
import { DockerContainer, DockerImage, TerminalLine } from "@/types/types";
import { useTerminalStore } from "@/store/terminalStore";

export const useDockerCommands = () => {
  const { dockerHistory, addDockerHistory, setDockerHistory } = useTerminalStore();
  
  const [containers, setContainers] = useState<DockerContainer[]>([
    {
      id: "c1a2b3c4d5e6",
      name: "my-nginx",
      image: "nginx:latest",
      status: "running",
      ports: ["80:8080"],
      created: "2 hours ago",
    },
    {
      id: "f7g8h9i0j1k2",
      name: "my-db",
      image: "postgres:13",
      status: "stopped",
      ports: ["5432:5432"],
      created: "1 day ago",
    },
  ]);

  const [images, setImages] = useState<DockerImage[]>([
    {
      id: "sha256:abcd1234",
      repository: "nginx",
      tag: "latest",
      size: "133MB",
      created: "2 weeks ago",
    },
    {
      id: "sha256:efgh5678",
      repository: "postgres",
      tag: "13",
      size: "314MB",
      created: "3 weeks ago",
    },
    {
      id: "sha256:ijkl9012",
      repository: "node",
      tag: "16-alpine",
      size: "110MB",
      created: "1 week ago",
    },
  ]);

  const getWelcomeMessage = (): TerminalLine => ({
    id: "welcome-docker",
    type: "output",
    content: "Welcome to Docker Terminal Playground!\nType 'docker --help' to see available commands.",
    timestamp: new Date(),
  });

  const history = dockerHistory.length > 0 ? dockerHistory : [getWelcomeMessage()];

  const executeDockerCommand = useCallback((input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: "command",
      content: `user@docker-playground:~$ ${trimmedInput}`,
      timestamp: new Date(),
    };

    addDockerHistory(commandLine);

    const args = trimmedInput.split(/\s+/);
    const isDocker = args[0] === "docker";
    const subcommand = isDocker ? args[1] : args[0];

    let result = "";

    if (isDocker && (!subcommand || subcommand === "--help" || subcommand === "--version")) {
      const commandHandler = commands["docker"];
      if (commandHandler) {
        result = commandHandler(args, setContainers, setImages, containers, images);
      }
    } else if (subcommand === "clear") {
      setDockerHistory([]);
      return;
    } else {
      const commandHandler = commands[subcommand] as DockerCommandFunction;
      if (commandHandler) {
        result = commandHandler(args, setContainers, setImages, containers, images);
      } else {
        result = isDocker 
          ? `docker: '${subcommand}' is not a docker command.\nSee 'docker --help'`
          : `${subcommand}: command not found`;
      }
    }


    if (result) {
      addDockerHistory({
        id: (Date.now() + 1).toString(),
        type: "output",
        content: result,
        timestamp: new Date(),
      });
    }
  }, [containers, images, addDockerHistory, setDockerHistory]);

  return { executeDockerCommand, containers, images, history };
};
