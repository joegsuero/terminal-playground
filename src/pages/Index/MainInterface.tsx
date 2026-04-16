import React from "react";
import { LinuxTerminal } from "@/components/Terminal/LinuxTerminal";
import { DockerTerminal } from "@/components/Terminal/DockerTerminal";
import { LinuxTutorial } from "@/components/Tutorial/LinuxTutorial";
import { DockerTutorial } from "@/components/Tutorial/DockerTutorial";
import { TrainingMode } from "@/types/types";
import { useTheme } from "next-themes";

interface MainInterfaceProps {
  mode: TrainingMode;
  onCommandSuggest: (command: string) => void;
}

export const MainInterface: React.FC<MainInterfaceProps> = ({
  mode,
  onCommandSuggest,
}) => {
  const { theme } = useTheme();
  const themeMode = (theme === "light" ? "light" : "dark") as "light" | "dark";

  const renderTerminal = () => {
    switch (mode) {
      case "docker":
        return <DockerTerminal themeMode={themeMode} />;
      case "linux":
      default:
        return <LinuxTerminal themeMode={themeMode} />;
    }
  };

  const renderTutorial = () => {
    switch (mode) {
      case "docker":
        return <DockerTutorial onCommandSuggest={onCommandSuggest} />;
      case "linux":
      default:
        return <LinuxTutorial onCommandSuggest={onCommandSuggest} />;
    }
  };

  return (
    <section className="px-4 pt-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">{renderTutorial()}</div>
          <div className="lg:col-span-2">{renderTerminal()}</div>
        </div>
      </div>
    </section>
  );
};
