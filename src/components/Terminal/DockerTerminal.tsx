import React, { useState, useEffect, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Container, Maximize2, Minimize2 } from "lucide-react";
import { useDockerCommands } from "@/commands/useDockerCommands";
import { useTerminalStore } from "@/store/terminalStore";

export const DockerTerminal: React.FC = () => {
  const { executeDockerCommand } = useDockerCommands();
  const [currentCommand, setCurrentCommand] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
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
  const { commandToExecute, clearCommand } = useTerminalStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (commandToExecute) {
      setCurrentCommand(commandToExecute);
      setCursorPosition(commandToExecute.length);
      inputRef.current?.focus();
      clearCommand();
    }
  }, [commandToExecute, clearCommand]);

  const handleCursorChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

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
    setCursorPosition(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() === "clear") {
      handleClear();
      setCurrentCommand("");
      setCursorPosition(0);
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
        const command = history[newIndex];
        setCurrentCommand(command);
        setTimeout(() => {
          setCursorPosition(command.length);
          inputRef.current?.setSelectionRange(command.length, command.length);
        }, 0);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          const command = history[newIndex];
          setCurrentCommand(command);
          setTimeout(() => {
            setCursorPosition(command.length);
            inputRef.current?.setSelectionRange(command.length, command.length);
          }, 0);
        } else {
          setHistoryIndex(-1);
          setCurrentCommand("");
          setCursorPosition(0);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
    // No actualizamos cursorPosition aquí para evitar conflictos con selección
  };

  const handleInputClick = () => {
    handleCursorChange();
  };

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPosition(target.selectionStart || 0);
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

      <div className="flex items-center font-mono">
        <span className="text-blue-500 font-bold mr-2">
          user@docker-host:~$
        </span>
        <div className="relative flex-1">
          <form onSubmit={handleSubmit} className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onSelect={handleInputSelect}
              className="w-full bg-transparent text-terminal-text outline-none border-none caret-transparent"
              autoComplete="off"
              spellCheck="false"
              placeholder=""
            />
          </form>
          <span
            className="absolute top-0 text-terminal-cursor terminal-cursor"
            style={{
              left: `${cursorPosition}ch`,
              animation: "blink 1s step-end infinite",
            }}
          >
            █
          </span>
        </div>
      </div>
    </TerminalBase>
  );
};
