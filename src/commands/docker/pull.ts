import { DockerCommandFunction } from "./index";

export const handlePullCommand: DockerCommandFunction = (args) => {
  const imageName = args[2];
  if (!imageName) {
    return 'Error: "docker pull" requires exactly 1 argument.';
  }
  return `Using default tag: latest
latest: Pulling from library/${imageName}
Digest: sha256:abcd1234efgh5678...
Status: Downloaded newer image for ${imageName}:latest
docker.io/library/${imageName}:latest`;
};
