import { DockerCommandFunction } from "./index";

export const handleStartCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const startTarget = args[2];
  if (!startTarget) {
    return 'Error: "docker start" requires at least 1 argument.';
  }

  const containerToStart = containers.find(
    (c) => c.id.startsWith(startTarget) || c.name === startTarget
  );

  if (containerToStart) {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerToStart.id ? { ...c, status: "running" as const } : c
      )
    );
    return startTarget;
  }
  return `Error: No such container: ${startTarget}`;
};
