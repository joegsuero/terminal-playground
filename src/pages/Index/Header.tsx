import React from "react";
import { ModeSelector } from "@/components/ModeSelector";
import { Badge } from "@/components/ui/badge";
import { modeSpecificData } from "./features";
import { TrainingMode } from "@/types/types";
import { Github } from "lucide-react";

interface HeaderProps {
  mode: TrainingMode;
  onModeChange: (mode: TrainingMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange }) => {
  const data = modeSpecificData[mode];
  const Icon = data.icon;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="container mx-auto px-2 py-4 fix">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{data.title}</h1>
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeSelector currentMode={mode} onModeChange={onModeChange} />
            <Badge variant="secondary">Beta</Badge>
            <a
              href="https://github.com/joegsuero/terminal-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ver en GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
