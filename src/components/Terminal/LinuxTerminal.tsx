import React, { useState, useEffect, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Terminal } from "lucide-react";
import { useLinuxCommands } from "@/commands/useLinuxCommands";
import { useTerminalStore } from "@/store/terminalStore";

export const LinuxTerminal: React.FC = () => {
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { history, executeCommand, getPrompt, navigateHistory } =
    useLinuxCommands();
  const inputRef = useRef<HTMLInputElement>(null);
  const { commandToExecute, clearCommand } = useTerminalStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (commandToExecute) {
      setInput(commandToExecute);
      inputRef.current?.focus();
      clearCommand();
    }
  }, [commandToExecute, clearCommand]);

  const handleCursorChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsTyping(true);
      executeCommand(input);
      setInput("");
      setCursorPosition(0);
      setTimeout(() => setIsTyping(false), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const command = navigateHistory("up");
      if (command !== null) {
        setInput(command);
        setTimeout(() => {
          setCursorPosition(command.length);
          inputRef.current?.setSelectionRange(command.length, command.length);
        }, 0);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const command = navigateHistory("down");
      if (command !== null) {
        setInput(command);
        setTimeout(() => {
          setCursorPosition(command.length);
          inputRef.current?.setSelectionRange(command.length, command.length);
        }, 0);
      } else {
        setInput("");
        setCursorPosition(0);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputClick = () => {
    handleCursorChange();
  };

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPosition(target.selectionStart || 0);
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <TerminalBase
      title="Linux Terminal"
      icon={<Terminal className="w-4 h-4" />}
      onTerminalClick={handleTerminalClick}
      theme="linux"
    >
      {history.map((line) => (
        <div key={`${line.id}-${line.timestamp.getTime()}`} className="mb-1">
          <pre
            className={`whitespace-pre-wrap font-mono ${
              line.type === "command"
                ? "text-terminal-prompt font-bold"
                : line.type === "error"
                ? "text-red-500"
                : "text-terminal-text"
            }`}
          >
            {line.content}
          </pre>
        </div>
      ))}

      <div className="flex items-center font-mono">
        <span className="text-terminal-prompt font-bold mr-2">
          {getPrompt()}
        </span>
        <div className="relative flex-1">
          <form onSubmit={handleSubmit} className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onSelect={handleInputSelect}
              className="w-full bg-transparent text-terminal-text outline-none border-none caret-transparent"
              autoComplete="off"
              spellCheck="false"
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
