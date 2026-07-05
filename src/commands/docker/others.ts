import { DockerCommandFunction } from "./index";

const HELP_TEXT = `Usage: docker [OPTIONS] COMMAND

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

const VERSION_TEXT = `Docker version 24.0.6, build ed223bc
API version: 1.43
Go version: go1.20.7
Git commit: ed223bc
Built: Mon Sep  4 12:32:48 2023
OS/Arch: linux/amd64
Context: default`;

export const handleOtherCommands: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  // Normalize an optional leading "docker" so management commands work both as
  // `docker system df` and `system df`.
  const parts = args[0] === "docker" ? args.slice(1) : args;
  const command = parts[0] ?? "docker";
  const sub = parts[1];

  switch (command) {
    case "docker":
    case "--help":
      return HELP_TEXT;

    case "--version":
      return VERSION_TEXT;

    case "system": {
      if (sub === "prune") {
        const removed = containers.filter((c) => c.status === "stopped").map((c) => c.id);
        setContainers((prev) => prev.filter((c) => c.status !== "stopped"));
        return `WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache

Are you sure you want to continue? [y/N] y
Deleted Containers:
${removed.join("\n")}

Total reclaimed space: 1.234GB`;
      }
      if (sub === "df") {
        return `TYPE              TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images            5         2         523.4MB   314.2MB (60%)
Containers        3         1         45.2MB    22.1MB (48%)
Local Volumes     2         1         123.4MB   67.8MB (54%)
Build Cache       0         0         0B        0B`;
      }
      return `Error: '${sub ?? ""}' is not a valid system command. See 'docker system --help'`;
    }

    case "network": {
      if (sub === "ls") {
        return `NETWORK ID      NAME      DRIVER      SCOPE
3a4b5c6d7e8f    bridge    bridge      local
9f8e7d6c5b4a    host      host        local
2c3d4e5f6a7b    none      null        local`;
      }
      return `Error: '${sub ?? ""}' is not a valid network command. See 'docker network --help'`;
    }

    case "volume": {
      if (sub === "ls") {
        return `DRIVER    VOLUME NAME
local     my_volume
local     postgres_data`;
      }
      return `Error: '${sub ?? ""}' is not a valid volume command. See 'docker volume --help'`;
    }

    case "ls":
      return `docker-compose.yml  data/  logs/  nginx.conf`;

    default:
      return `docker: '${command}' is not a docker command. See 'docker --help'`;
  }
};
