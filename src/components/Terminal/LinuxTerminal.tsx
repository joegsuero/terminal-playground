import React, { useState, useEffect, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Terminal } from "lucide-react";
import { useLinuxCommands } from "@/commands/useLinuxCommands";

export const LinuxTerminal: React.FC = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { history, executeCommand, getPrompt, navigateHistory } =
    useLinuxCommands();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsTyping(true);
      executeCommand(input);
      setInput("");
      setTimeout(() => setIsTyping(false), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const command = navigateHistory("up");
      if (command !== null) setInput(command);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const command = navigateHistory("down");
      if (command !== null) setInput(command);
    }
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
            className={`whitespace-pre-wrap ${
              line.type === "command"
                ? "text-green-600"
                : line.type === "error"
                ? "text-red-500"
                : "text-terminal-text"
            }`}
          >
            {line.content}
          </pre>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-terminal-prompt mr-1">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-terminal-text outline-none border-none"
          autoComplete="off"
          spellCheck={false}
        />
        <span className="text-terminal-cursor terminal-cursor">█</span>
      </form>
    </TerminalBase>
  );
};
