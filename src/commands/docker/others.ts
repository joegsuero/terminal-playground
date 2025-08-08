// src/dockerCommands/others.ts

import { DockerCommandFunction } from "./index";

export const handleOtherCommands: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const command = args[0];
  const subcommand = args[1];

  switch (command) {
    case "docker":
    case "docker --help":
    case "docker --version": {
      if (subcommand === "--help") {
        return `Usage: docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
  --version           Show the Docker version information
  -D, --debug           Enable debug mode
  -H, --host list       Daemon socket(s) to connect to
  -l, --log-level string    Set the logging level (default "info")

Management Commands:
  container   Manage containers
  image       Manage images
  network     Manage networks
  volume      Manage volumes
  system      Manage Docker

Commands:
  build       Build an image from a Dockerfile
  pull        Pull an image or a repository from a registry
  push        Push an image or a repository to a registry
  run         Run a command in a new container
  start       Start one or more stopped containers
  stop        Stop one or more running containers
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  ps          List containers
  images      List images
  logs        Fetch the logs of a container
  exec        Run a command in a running container
  cp          Copy files/folders between a container and local filesystem
  commit      Create a new image from a container's changes
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE

Run 'docker COMMAND --help' for more information on a command.`;
      }
      if (subcommand === "--version") {
        return `Docker version 24.0.6, build ed223bc
API version: 1.43
Go version: go1.20.7
Git commit: ed223bc
Built: Mon Sep  4 12:32:48 2023
OS/Arch: linux/amd64
Context: default`;
      }
      return `docker: '${command}' is not a docker command. See 'docker --help'`;
    }

    case "system": {
      const systemSubcommand = args[2];
      if (systemSubcommand === "prune") {
        setContainers((prev) => prev.filter((c) => c.status !== "stopped"));
        return `WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache

Are you sure you want to continue? [y/N] y
Deleted Containers:
${containers
  .filter((c) => c.status === "stopped")
  .map((c) => c.id)
  .join("\n")}

Total reclaimed space: 1.234GB`;
      }
      if (systemSubcommand === "df") {
        return `TYPE              TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images            5         2         523.4MB   314.2MB (60%)
Containers        3         1         45.2MB    22.1MB (48%)
Local Volumes     2         1         123.4MB   67.8MB (54%)
Build Cache       0         0         0B        0B`;
      }
      return `Error: '${systemSubcommand}' is not a valid system command. See 'docker system --help'`;
    }

    case "network": {
      const networkSubcommand = args[2];
      if (networkSubcommand === "ls") {
        return `NETWORK ID      NAME      DRIVER      SCOPE
3a4b5c6d7e8f    bridge    bridge      local
9f8e7d6c5b4a    host      host        local
2c3d4e5f6a7b    none      null        local`;
      }
      return `Error: '${networkSubcommand}' is not a valid network command. See 'docker network --help'`;
    }

    case "volume": {
      const volumeSubcommand = args[2];
      if (volumeSubcommand === "ls") {
        return `DRIVER    VOLUME NAME
local     my_volume
local     postgres_data`;
      }
      return `Error: '${volumeSubcommand}' is not a valid volume command. See 'docker volume --help'`;
    }

    default:
      return `docker: '${subcommand}' is not a docker command. See 'docker --help'`;
  }
};
