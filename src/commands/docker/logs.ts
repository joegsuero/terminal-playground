import { DockerCommandFunction } from "./index";

export const handleLogsCommand: DockerCommandFunction = (
  args,
  setContainers,
  setImages,
  containers
) => {
  const logsTarget = args[2];
  if (!logsTarget) {
    return 'Error: "docker logs" requires exactly 1 argument.';
  }

  const containerForLogs = containers.find(
    (c) => c.id.startsWith(logsTarget) || c.name === logsTarget
  );

  if (containerForLogs) {
    return `2023-11-15T10:30:25.123456789Z Application starting...
2023-11-15T10:30:25.234567890Z Server listening on port 80
2023-11-15T10:30:26.345678901Z Ready to accept connections
2023-11-15T10:30:30.456789012Z GET / 200 OK (15ms)
2023-11-15T10:30:35.567890123Z GET /health 200 OK (2ms)`;
  }
  return `Error: No such container: ${logsTarget}`;
};
