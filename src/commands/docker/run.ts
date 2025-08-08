import { DockerCommandFunction } from "./index";
import { DockerContainer } from "../useDockerCommands";

export const handleRunCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const runArgs = args.slice(2);
  const detached = runArgs.includes("-d") || runArgs.includes("--detach");
  const portMapping = runArgs.find((arg) => arg.startsWith("-p"));
  const imageArg = runArgs.find((arg) => !arg.startsWith("-") && arg !== "run");

  if (!imageArg) {
    return "Error: No image specified";
  }

  const newContainerId = Math.random().toString(36).substring(2, 14);

  if (detached) {
    const newContainer: DockerContainer = {
      id: newContainerId,
      name: `confident_${Math.random().toString(36).substring(2, 8)}`,
      image: imageArg,
      status: "running",
      ports: portMapping ? [portMapping.split("=")[1] || "80:80"] : [],
      created: "Just now",
    };
    setContainers((prev) => [...prev, newContainer]);
    return newContainerId;
  }

  return `Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "${imageArg}" image from the Docker Hub.
 3. The Docker daemon created a new container from that image.
 4. The Docker daemon streamed that output to the Docker client.`;
};
