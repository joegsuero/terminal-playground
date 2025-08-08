import { DockerCommandFunction } from "./index";

export const handlePsCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const showAll = args.includes("-a") || args.includes("--all");
  const containersToShow = showAll
    ? containers
    : containers.filter((c) => c.status === "running");

  if (containersToShow.length === 0) {
    return "CONTAINER ID   IMAGE     COMMAND    CREATED    STATUS    PORTS     NAMES";
  }

  let output =
    "CONTAINER ID   IMAGE              COMMAND              CREATED             STATUS                       PORTS                      NAMES\n";
  containersToShow.forEach((container) => {
    const status =
      container.status === "running" ? "Up 2 hours" : "Exited (0) 1 hour ago";
    const ports =
      container.ports.length > 0 ? `0.0.0.0:${container.ports[0]}->80/tcp` : "";
    output += `${container.id.substring(0, 12)}   ${container.image.padEnd(
      18
    )} "/docker-entrypoint.…"   ${container.created.padEnd(
      14
    )}   ${status.padEnd(25)} ${ports.padEnd(24)} ${container.name}\n`;
  });
  return output.trim();
};
