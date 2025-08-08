export interface DockerLesson {
  id: string;
  title: string;
  description: string;
  commands: string[];
  explanation: string;
  expectedOutput?: string;
}

export const dockerLessons: DockerLesson[] = [
  {
    id: "1",
    title: "Docker Basics",
    description: "Learn Docker fundamentals and basic commands",
    commands: ["docker --version", "docker info", "docker --help"],
    explanation:
      "Start by checking Docker installation and getting familiar with basic Docker commands. docker --version shows version info, docker info displays system information.",
    expectedOutput:
      "Version information, system details, and help documentation",
  },
  {
    id: "2",
    title: "Working with Images",
    description: "Learn to manage Docker images",
    commands: [
      "docker images",
      "docker pull nginx",
      "docker pull node:16-alpine",
      "docker images",
    ],
    explanation:
      "Docker images are templates for containers. docker images lists local images, docker pull downloads images from Docker Hub.",
    expectedOutput: "List of images, download progress, and updated image list",
  },
  {
    id: "3",
    title: "Running Containers",
    description: "Create and run your first containers",
    commands: [
      "docker run hello-world",
      "docker run -d --name my-nginx -p 8080:80 nginx",
      "docker ps",
    ],
    explanation:
      "docker run creates and starts containers. -d runs in detached mode, --name assigns a name, -p maps ports. docker ps shows running containers.",
    expectedOutput: "Hello world message, container ID, and container listing",
  },
  {
    id: "4",
    title: "Container Management",
    description: "Stop, start, and manage containers",
    commands: [
      "docker ps",
      "docker stop my-nginx",
      "docker ps -a",
      "docker start my-nginx",
      "docker ps",
    ],
    explanation:
      "Learn to control container lifecycle. docker stop stops containers, docker start restarts them. Use -a with ps to see all containers.",
    expectedOutput: "Container status changes and updated listings",
  },
  {
    id: "5",
    title: "Container Logs and Inspection",
    description: "View container logs and details",
    commands: [
      "docker logs my-nginx",
      "docker inspect my-nginx",
      "docker stats",
    ],
    explanation:
      "docker logs shows container output, docker inspect provides detailed info, docker stats displays resource usage in real-time.",
    expectedOutput:
      "Application logs, detailed container information, and resource statistics",
  },
  {
    id: "6",
    title: "Interactive Containers",
    description: "Run interactive commands in containers",
    commands: [
      "docker run -it ubuntu bash",
      "docker exec -it my-nginx bash",
      "exit",
    ],
    explanation:
      "Use -it for interactive terminals. docker exec runs commands in existing containers. Practice entering and exiting container shells.",
    expectedOutput:
      "Interactive shell access and command execution inside containers",
  },
  {
    id: "7",
    title: "Building Custom Images",
    description: "Create your own Docker images",
    commands: [
      "docker build -t my-app .",
      "docker images",
      "docker run my-app",
    ],
    explanation:
      "docker build creates images from Dockerfiles. -t tags the image with a name. Learn the fundamentals of image creation.",
    expectedOutput:
      "Build process output, new image in listing, and successful container run",
  },
  {
    id: "8",
    title: "Data Management",
    description: "Work with volumes and data persistence",
    commands: [
      "docker volume create my_volume",
      "docker volume ls",
      "docker run -v my_volume:/data alpine",
      "docker volume inspect my_volume",
    ],
    explanation:
      "Volumes persist data beyond container lifecycle. docker volume manages volumes, -v mounts volumes to containers.",
    expectedOutput:
      "Volume creation confirmation, volume listings, and detailed volume information",
  },
  {
    id: "9",
    title: "Networking",
    description: "Understand Docker networking concepts",
    commands: [
      "docker network ls",
      "docker network create my-network",
      "docker run --network my-network --name web nginx",
      "docker network inspect my-network",
    ],
    explanation:
      "Docker networks enable container communication. Learn about bridge, host, and custom networks. Connect containers to networks.",
    expectedOutput:
      "Network listings, creation confirmations, and network configuration details",
  },
  {
    id: "10",
    title: "Multi-container Applications",
    description: "Run multiple connected containers",
    commands: [
      "docker run -d --name db -e POSTGRES_PASSWORD=secret postgres",
      "docker run -d --name app --link db:database node:16-alpine",
      "docker ps",
      "docker logs app",
    ],
    explanation:
      "Learn to connect multiple containers. Use environment variables with -e, link containers with --link (deprecated but educational).",
    expectedOutput:
      "Multiple running containers, connection establishment, and application logs",
  },
  {
    id: "11",
    title: "Cleanup and Maintenance",
    description: "Clean up Docker resources",
    commands: [
      "docker stop $(docker ps -q)",
      "docker rm $(docker ps -aq)",
      "docker rmi $(docker images -q)",
      "docker system prune",
    ],
    explanation:
      "Important housekeeping commands. Stop all containers, remove containers and images, and clean up system resources with prune.",
    expectedOutput:
      "Cleanup confirmations and reclaimed storage space information",
  },
  {
    id: "12",
    title: "Advanced Operations",
    description: "Advanced Docker techniques",
    commands: [
      "docker commit my-nginx my-custom-nginx",
      "docker save -o nginx.tar nginx",
      "docker load -i nginx.tar",
      "docker tag nginx my-registry/nginx",
    ],
    explanation:
      "Learn advanced operations: commit containers to images, save/load images as tar files, and tag images for registries.",
    expectedOutput:
      "New image creation, file operations, and successful image tagging",
  },
];
