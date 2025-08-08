import { DockerCommandFunction } from "./index";

export const handleStopCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const stopTarget = args[2];
  if (!stopTarget) {
    return 'Error: "docker stop" requires at least 1 argument.';
  }

  const containerToStop = containers.find(
    (c) => c.id.startsWith(stopTarget) || c.name === stopTarget
  );

  if (containerToStop) {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerToStop.id ? { ...c, status: "stopped" as const } : c
      )
    );
    return stopTarget;
  }
  return `Error: No such container: ${stopTarget}`;
};
