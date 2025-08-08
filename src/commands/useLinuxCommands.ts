import { useFileSystem } from "@/hooks/useLinuxFileSystem";
import { TerminalLine } from "@/types/types";
import { useState, useCallback } from "react";
import { commands } from "./linux";

export const useLinuxCommands = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: "1",
      type: "output",
      content:
        'Welcome to Linux Terminal Playground!\nType "help" to see available commands or start with the tutorial.',
      timestamp: new Date(),
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fs = useFileSystem();

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

      setHistory((prev) => [...prev, commandLine]);
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
        setHistory((prev) => [...prev, errorLine]);
        return;
      }

      if (commandName === "clear") {
        setHistory([]);
        return;
      }

      const output = command.execute(args, fs, commandHistory);
      if (output.length > 0) {
        setHistory((prev) => [...prev, ...output]);
      }
    },
    [fs, commandHistory]
  );

  const getPrompt = useCallback(() => {
    return `user@linux-playground:${fs.currentPath}$ `;
  }, [fs.currentPath]);

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        return commandHistory[commandHistory.length - 1 - newIndex];
      } else if (direction === "down" && historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        return newIndex === -1
          ? ""
          : commandHistory[commandHistory.length - 1 - newIndex];
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
  };
};
