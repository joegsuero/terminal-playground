/**
 * Framework-agnostic Docker daemon state (containers + images), shared across
 * all tmux panes. The existing command handlers in src/commands/docker mutate
 * it through React-style setter shims, so they are reused unchanged.
 */
import { DockerContainer, DockerImage } from "@/types/types";

const defaultContainers = (): DockerContainer[] => [
  {
    id: "c1a2b3c4d5e6",
    name: "my-nginx",
    image: "nginx:latest",
    status: "running",
    ports: ["80:8080"],
    created: "2 hours ago",
  },
  {
    id: "f7g8h9i0j1k2",
    name: "my-db",
    image: "postgres:13",
    status: "stopped",
    ports: ["5432:5432"],
    created: "1 day ago",
  },
];

const defaultImages = (): DockerImage[] => [
  { id: "sha256:abcd1234", repository: "nginx", tag: "latest", size: "133MB", created: "2 weeks ago" },
  { id: "sha256:efgh5678", repository: "postgres", tag: "13", size: "314MB", created: "3 weeks ago" },
  { id: "sha256:ijkl9012", repository: "node", tag: "16-alpine", size: "110MB", created: "1 week ago" },
];

export class DockerEngine {
  containers: DockerContainer[];
  images: DockerImage[];

  constructor(data?: { containers: DockerContainer[]; images: DockerImage[] }) {
    this.containers = data?.containers ?? defaultContainers();
    this.images = data?.images ?? defaultImages();
  }

  setContainers(next: DockerContainer[]): void {
    this.containers = next;
  }

  setImages(next: DockerImage[]): void {
    this.images = next;
  }

  serialize(): string {
    return JSON.stringify({ containers: this.containers, images: this.images });
  }

  static deserialize(json: string): DockerEngine {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed.containers) && Array.isArray(parsed.images)) {
        return new DockerEngine(parsed);
      }
    } catch {
      /* fall through to defaults */
    }
    return new DockerEngine();
  }
}
