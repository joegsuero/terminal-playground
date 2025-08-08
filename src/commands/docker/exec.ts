import { DockerCommandFunction } from "./index";

export const handleExecCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const execArgs = args.slice(2);
  const containerName = execArgs.find((arg) => !arg.startsWith("-"));
  const execCommand = execArgs
    .slice(execArgs.indexOf(containerName) + 1)
    .join(" ");

  if (!containerName) {
    return "Error: Container name required";
  }

  const execContainer = containers.find(
    (c) => c.id.startsWith(containerName) || c.name === containerName
  );

  if (!execContainer) {
    return `Error: No such container: ${containerName}`;
  }

  if (execContainer.status !== "running") {
    return `Error: Container "${containerName}" is not running`;
  }

  if (execCommand === "bash" || execCommand === "/bin/bash") {
    return "root@" + containerName.substring(0, 12) + ":/#";
  }

  return `Executing command "${execCommand}" in container ${containerName}`;
};
