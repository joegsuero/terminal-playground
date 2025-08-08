// src/hooks/useDockerCommands.ts

import { useState } from "react";
import { commands, DockerCommandFunction } from "./docker";
import { DockerContainer, DockerImage } from "@/types/types";

export const useDockerCommands = () => {
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

  const executeDockerCommand = (command: string): string => {
    const args = command.trim().split(/\s+/);
    const subcommand = args[1];

    // Trata casos especiales de ayuda
    if (
      command.trim() === "docker" ||
      command.trim() === "docker --help" ||
      command.trim() === "docker --version"
    ) {
      const commandHandler = commands["docker"];
      if (commandHandler) {
        return commandHandler(
          args,
          setContainers,
          setImages,
          containers,
          images
        );
      }
    }

    // Busca el manejador de comando en el mapa
    const commandHandler = commands[subcommand] as DockerCommandFunction;

    if (commandHandler) {
      return commandHandler(args, setContainers, setImages, containers, images);
    }

    // Maneja comandos de gestión (system, network, volume)
    if (commands[args[0]]) {
      const managementCommandHandler = commands[args[0]];
      if (managementCommandHandler) {
        return managementCommandHandler(
          args,
          setContainers,
          setImages,
          containers,
          images
        );
      }
    }

    return `docker: '${subcommand}' is not a docker command.
See 'docker --help'`;
  };

  return { executeDockerCommand, containers, images };
};
