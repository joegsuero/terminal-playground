import { Maximize2, Minimize2 } from "lucide-react";
import React, { ReactNode, useRef } from "react";

interface TerminalBaseProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onTerminalClick?: () => void;
  onClear?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  theme?: "linux" | "docker";
}

export const TerminalBase: React.FC<TerminalBaseProps> = ({
  title,
  icon,
  children,
  onTerminalClick,
  onClear,
  onMaximize,
  isMaximized = false,
  theme = "linux",
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  const themeClasses = {
    linux: {
      prompt: "text-green-600",
      text: "text-terminal-text",
      error: "text-red-500",
      bg: "bg-terminal-bg",
    },
    docker: {
      prompt: "text-blue-500",
      text: "text-terminal-text",
      error: "text-red-400",
      bg: "bg-terminal-bg",
    },
  };

  return (
    <div
      className={`h-full min-h-96 max-h-[34rem] ${
        themeClasses[theme].bg
      } border border-border rounded-lg flex flex-col overflow-hidden ${
        theme === "docker" ? "shadow-2xl docker-theme" : ""
      }`}
    >
      {/* Terminal Header */}
      <div className="bg-secondary border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <div className="ml-2">{icon}</div>
          <span className="text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto terminal-scroll cursor-text"
        onClick={onTerminalClick}
      >
        {children}
      </div>
    </div>
  );
};
