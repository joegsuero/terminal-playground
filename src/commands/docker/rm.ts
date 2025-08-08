import { DockerCommandFunction } from "./index";

export const handleRmCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const rmTarget = args[2];
  if (!rmTarget) {
    return 'Error: "docker rm" requires at least 1 argument.';
  }

  const containerToRemove = containers.find(
    (c) => c.id.startsWith(rmTarget) || c.name === rmTarget
  );

  if (containerToRemove) {
    if (containerToRemove.status === "running") {
      return `Error: Cannot remove a running container "${rmTarget}". Stop the container before attempting removal or force remove`;
    }
    setContainers((prev) => prev.filter((c) => c.id !== containerToRemove.id));
    return rmTarget;
  }
  return `Error: No such container: ${rmTarget}`;
};
