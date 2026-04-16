import React, { useState, useEffect, useRef, useCallback } from "react";
import { TerminalBase } from "./TerminalBase";
import { Terminal } from "lucide-react";
import { useLinuxCommands } from "@/commands/useLinuxCommands";
import { useTerminalStore } from "@/store/terminalStore";
import { commands } from "@/commands/linux";

interface LinuxTerminalProps {
  themeMode?: "light" | "dark";
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({ themeMode = "dark" }) => {
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { history, executeCommand, getPrompt, navigateHistory, currentPath, getDirectory } =
    useLinuxCommands();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { commandToExecute, clearCommand } = useTerminalStore();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (commandToExecute) {
      setInput(commandToExecute);
      setCursorPosition(commandToExecute.length);
      textareaRef.current?.focus();
      clearCommand();
    }
  }, [commandToExecute, clearCommand]);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [history]);

  const handleCursorChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  };

  const updateCursorPosition = useCallback(() => {
    if (!ghostRef.current || !cursorRef.current || !textareaRef.current) return;

    const ghost = ghostRef.current;
    const textarea = textareaRef.current;

    ghost.style.width = `${textarea.offsetWidth}px`;

    const span = ghost.querySelector('#cursor-measure') as HTMLSpanElement;
    if (span) {
      const spanRect = span.getBoundingClientRect();
      const ghostRect = ghost.getBoundingClientRect();
      cursorRef.current.style.left = `${spanRect.left - ghostRect.left}px`;
      cursorRef.current.style.top = `${spanRect.top - ghostRect.top}px`;
    }
  }, []);

  useEffect(() => {
    updateCursorPosition();
  }, [input, cursorPosition, updateCursorPosition]);

  const handleSubmit = () => {
    if (input.trim()) {
      setIsTyping(true);
      executeCommand(input);
      setInput("");
      setCursorPosition(0);
      setTimeout(() => setIsTyping(false), 100);
    }
  };

  const [tabMatches, setTabMatches] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(-1);
  const [lastTabPrefix, setLastTabPrefix] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setCursorPosition(e.target.selectionStart || 0);
    // Reset tab completion state on input change
    setTabMatches([]);
    setTabIndex(-1);
    setLastTabPrefix("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const command = navigateHistory("up");
      if (command !== null) {
        setInput(command);
        setCursorPosition(command.length);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const command = navigateHistory("down");
      if (command !== null) {
        setInput(command);
        setCursorPosition(command.length);
      } else {
        setInput("");
        setCursorPosition(0);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      
      const textBeforeCursor = input.slice(0, cursorPosition);
      const tokens = textBeforeCursor.trim().split(/\s+/);
      const isFirstToken = tokens.length <= 1 && !textBeforeCursor.endsWith(' ');
      
      const match = textBeforeCursor.match(/(\S+)$/);
      
      if (!match) return;
      
      const currentWord = match[0];
      const prefix = textBeforeCursor.slice(0, textBeforeCursor.length - currentWord.length);
      
      // If we are already cycling through matches for the same word
      if (currentWord === lastTabPrefix && tabMatches.length > 0) {
        const nextIndex = (tabIndex + 1) % tabMatches.length;
        const completedName = tabMatches[nextIndex];
        const newInput = prefix + completedName + input.slice(cursorPosition);
        setInput(newInput);
        setCursorPosition(prefix.length + completedName.length);
        setTabIndex(nextIndex);
        setLastTabPrefix(completedName);
        return;
      }

      // First time pressing Tab or new word - check if first token or args
      let matches: string[];

      if (isFirstToken) {
        // Autocomplete commands
        const availableCommands = Object.keys(commands);
        matches = availableCommands
          .filter((cmd) => cmd.toLowerCase().startsWith(currentWord.toLowerCase()))
          .sort((a, b) => a.localeCompare(b));
      } else {
        // Autocomplete files/directories
        const dirContents = getDirectory(currentPath);
        matches = dirContents
          .filter((item) => item.name.toLowerCase().startsWith(currentWord.toLowerCase()))
          .map(item => item.name)
          .sort((a, b) => a.localeCompare(b));
      }

      if (matches.length > 0) {
        const completedName = matches[0];
        const newInput = prefix + completedName + input.slice(cursorPosition);
        setInput(newInput);
        setCursorPosition(prefix.length + completedName.length);
        
        setTabMatches(matches);
        setTabIndex(0);
        setLastTabPrefix(completedName);
      }
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      setInput("");
      setCursorPosition(0);
    }
  };

  const handleTerminalClick = () => {
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (

    <TerminalBase
      title="Linux Terminal"
      icon={<Terminal className="w-4 h-4" />}
      onTerminalClick={handleTerminalClick}
      theme="linux"
      themeMode={themeMode}
      contentRef={terminalContentRef}
    >
      {history.map((line, index) => (
        <div key={`${line.id}-${index}`} className="mb-1">
          {line.segments ? (
            <pre className="whitespace-pre-wrap break-all font-mono">
              {line.segments.map((seg, i) => (
                <span
                  key={i}
                  className={
                    seg.color === 'dir' ? 'text-blue-400 font-medium' :
                    seg.color === 'exec' ? 'text-green-400' :
                    'text-terminal-text'
                  }
                >
                  {seg.text}
                </span>
              ))}
            </pre>
          ) : (
            <pre
              className={`whitespace-pre-wrap break-all font-mono ${
                line.type === "command"
                  ? "text-terminal-prompt font-bold"
                  : line.type === "error"
                  ? "text-red-500"
                  : "text-terminal-text"
              }`}
            >
              {line.content}
            </pre>
          )}
        </div>
      ))}

      <div className="flex font-mono relative items-start">
        <span className="text-terminal-prompt font-bold mr-2 whitespace-nowrap leading-6">
          {getPrompt()}
        </span>
        <div className="relative flex-1 leading-6">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={handleCursorChange}
            onSelect={handleCursorChange}
            className="w-full bg-transparent text-transparent outline-none border-none resize-none p-0 overflow-hidden leading-6 caret-transparent break-all whitespace-pre-wrap"
            autoComplete="off"
            spellCheck="false"
            rows={1}
            style={{ height: "auto", minHeight: "1.5rem" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 font-mono text-sm pointer-events-none whitespace-pre-wrap break-all leading-6 text-terminal-text"
          >
            {input.slice(0, cursorPosition)}
            <span id="cursor-measure">|</span>
            {input.slice(cursorPosition)}
          </div>
          <div
            ref={cursorRef}
            className="absolute top-0 w-[1ch] bg-terminal-cursor terminal-cursor pointer-events-none"
            style={{
              height: "1.2rem",
              marginTop: "0.2rem",
              animation: "blink 1s step-end infinite",
            }}
          />
          <div
            ref={ghostRef}
            className="absolute opacity-0 pointer-events-none whitespace-pre-wrap break-all font-mono text-sm"
            style={{ 
              width: textareaRef.current?.offsetWidth 
                ? `${textareaRef.current.offsetWidth}px` 
                : '100%',
              lineHeight: '1.5rem'
            }}
          >
            {input.slice(0, cursorPosition)}
            <span id="cursor-measure">|</span>
            {input.slice(cursorPosition)}
          </div>
        </div>
      </div>
    </TerminalBase>
  );
};


