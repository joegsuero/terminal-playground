import React, { useState } from "react";
import { Button } from "./ui/button";
import { Terminal, Container, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TrainingMode } from "@/types/types";

interface ModeSelectorProps {
  currentMode: TrainingMode;
  onModeChange: (mode: TrainingMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [open, setOpen] = useState(false);

  const modeData = {
    linux: {
      icon: <Terminal className="w-4 h-4" />,
      label: "Linux Terminal",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
      borderColor: "border-green-500/30",
    },
    docker: {
      icon: <Container className="w-4 h-4" />,
      label: "Docker Training",
      textColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      borderColor: "border-blue-500/30",
    },
  };

  const currentModeData = modeData[currentMode];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 pl-3 pr-2 ${currentModeData.bgColor} ${currentModeData.textColor} ${currentModeData.borderColor}`}
        >
          {currentModeData.icon}
          <span>{currentModeData.label}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            onModeChange("linux");
            setOpen(false);
          }}
          className={`flex items-center gap-2 cursor-pointer ${modeData.linux.textColor}`}
        >
          <Terminal className="w-4 h-4" />
          Linux Terminal
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onModeChange("docker");
            setOpen(false);
          }}
          className={`flex items-center gap-2 cursor-pointer ${modeData.docker.textColor}`}
        >
          <Container className="w-4 h-4" />
          Docker Training
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
