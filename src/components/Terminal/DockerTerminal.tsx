import React, { useState, useEffect, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Container, Maximize2, Minimize2 } from "lucide-react";
import { useDockerCommands } from "@/commands/useDockerCommands";

export const DockerTerminal: React.FC = () => {
  const { executeDockerCommand } = useDockerCommands();
  const [currentCommand, setCurrentCommand] = useState("");
  const [output, setOutput] = useState<
    Array<{
      type: "command" | "output" | "error";
      content: string;
      timestamp: number;
    }>
  >([
    {
      type: "output",
      content:
        'Welcome to Docker Terminal! Type "docker --help" to get started.\nLearn containerization step by step with interactive commands.',
      timestamp: Date.now(),
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    setOutput((prev) => [
      ...prev,
      {
        type: "command",
        content: `user@docker-host:~$ ${trimmedCmd}`,
        timestamp: Date.now(),
      },
    ]);

    const result = executeDockerCommand(trimmedCmd);

    setOutput((prev) => [
      ...prev,
      {
        type: result.includes("error") ? "error" : "output",
        content: result,
        timestamp: Date.now(),
      },
    ]);

    setCurrentCommand("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand == "clear") {
      handleClear();
      setCurrentCommand("");
    } else {
      handleCommand(currentCommand);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setCurrentCommand(history[newIndex]);
        } else {
          setHistoryIndex(-1);
          setCurrentCommand("");
        }
      }
    }
  };

  const handleClear = () => {
    setOutput([
      {
        type: "output",
        content:
          'Welcome to Docker Terminal! Type "docker --help" to get started.',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <TerminalBase
      title="Docker Terminal"
      icon={<Container className="w-4 h-4" />}
      onTerminalClick={handleTerminalClick}
      onClear={handleClear}
      onMaximize={() => setIsMaximized(!isMaximized)}
      isMaximized={isMaximized}
      theme="docker"
    >
      {output.map((item, index) => (
        <div key={`${index}-${item.timestamp}`} className="mb-1">
          <pre
            className={`whitespace-pre-wrap font-mono ${
              item.type === "command"
                ? "text-blue-500 font-bold"
                : item.type === "error"
                ? "text-red-400"
                : "text-terminal-text"
            }`}
          >
            {item.content}
          </pre>
        </div>
      ))}

      <div className="flex items-center">
        <span className="text-blue-500 font-bold mr-2">
          user@docker-host:~$
        </span>
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-terminal-text outline-none border-none font-mono"
            autoComplete="off"
            spellCheck="false"
            placeholder="Try 'docker --help'"
          />
        </form>
        <span className="text-terminal-cursor terminal-cursor ml-1">█</span>
      </div>
    </TerminalBase>
  );
};
