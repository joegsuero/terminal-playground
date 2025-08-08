import {
  TerminalIcon,
  BookOpen,
  Zap,
  Shield,
  Users,
  Code,
  Container,
} from "lucide-react";

export const commonFeatures = [
  {
    icon: TerminalIcon,
    title: "Real Terminal Experience",
    description: "Authentic Linux/Docker terminal with full command support",
  },
  {
    icon: BookOpen,
    title: "Step-by-Step Learning",
    description: "Guided tutorials from basics to advanced commands",
  },
  {
    icon: Users,
    title: "Beginner Friendly",
    description: "No installation required, start learning immediately",
  },
  {
    icon: Zap,
    title: "Interactive Practice",
    description: "Practice commands in a safe, simulated environment",
  },
  {
    icon: Shield,
    title: "Safe Environment",
    description: "Learn without fear of breaking your system",
  },
  {
    icon: Code,
    title: "Real Commands",
    description: "Practice with actual command syntax and responses",
  },
];

export const modeSpecificData = {
  linux: {
    title: "Linux Terminal Playground",
    description: "Learn Linux commands interactively",
    heroTitle: "Master Linux Commands",
    heroDescription:
      "Learn Linux terminal commands in an interactive, safe environment. No installation required - start practicing immediately with our step-by-step tutorials.",
    footerText: "Master the command line with hands-on practice",
    exampleCommands: ["ls", "cd", "mkdir", "grep"],
    icon: TerminalIcon,
  },
  docker: {
    title: "Docker Training Playground",
    description: "Learn Docker containerization step by step",
    heroTitle: "Master Docker Containerization",
    heroDescription:
      "Learn Docker containerization in an interactive environment. Practice with real Docker commands, manage containers, and understand containerization concepts without any installation.",
    footerText: "Master containerization with hands-on Docker practice",
    exampleCommands: [
      "docker ps",
      "docker run",
      "docker images",
      "docker build",
    ],
    icon: Container,
  },
};
