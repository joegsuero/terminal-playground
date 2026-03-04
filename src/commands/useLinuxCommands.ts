import { useFileSystem } from "@/hooks/useLinuxFileSystem";
import { TerminalLine } from "@/types/types";
import { useCallback, useState } from "react";
import { commands } from "./linux";
import { useTerminalStore } from "@/store/terminalStore";

export const useLinuxCommands = () => {
  const { linuxHistory, addLinuxHistory, setLinuxHistory } = useTerminalStore();
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fs = useFileSystem();

  const getWelcomeMessage = (): TerminalLine => ({
    id: "welcome-linux",
    type: "output",
    content:
      'Welcome to Linux Terminal Playground!\nType "help" to see available commands or start with the tutorial.',
    timestamp: new Date(),
  });

  const history =
    linuxHistory.length > 0 ? linuxHistory : [getWelcomeMessage()];

  const executeCommand = useCallback(
    (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      const commandLine: TerminalLine = {
        id: Date.now().toString(),
        type: "command",
        content: `user@linux-playground:${fs.currentPath}$ ${trimmedInput}`,
        timestamp: new Date(),
      };

      addLinuxHistory(commandLine);
      setCommandHistory((prev) => [...prev, trimmedInput]);
      setHistoryIndex(-1);

      const parts = trimmedInput.split(" ").filter(Boolean);
      const commandName = parts[0];
      const args = parts.slice(1);

      const command = commands[commandName];
      if (!command) {
        const errorLine: TerminalLine = {
          id: (Date.now() + 1).toString(),
          type: "error",
          content: `${commandName}: command not found`,
          timestamp: new Date(),
        };
        addLinuxHistory(errorLine);
        return;
      }

      if (commandName === "clear") {
        setLinuxHistory([]);
        return;
      }

      const output = command.execute(args, fs, commandHistory);
      if (output.length > 0) {
        output.forEach((line) => addLinuxHistory(line));
      }
    },
    [fs, commandHistory, addLinuxHistory, setLinuxHistory]
  );

  const getPrompt = useCallback(() => {
    return `user@linux-playground:${fs.currentPath}$ `;
  }, [fs.currentPath]);

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        return commandHistory[commandHistory.length - 1 - newIndex];
      } else if (direction === "down") {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        return newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex];
      }
      return null;
    },
    [commandHistory, historyIndex]
  );

  return {
    history,
    executeCommand,
    getPrompt,
    navigateHistory,
    currentPath: fs.currentPath,
    getDirectory: fs.getDirectory,
  };
};


