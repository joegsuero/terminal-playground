import React from "react";
import { LinuxTerminal } from "@/components/Terminal/LinuxTerminal";
import { DockerTerminal } from "@/components/Terminal/DockerTerminal";
import { Tutorial } from "@/components/Tutorial/LinuxTutorial";
import { DockerTutorial } from "@/components/Tutorial/DockerTutorial";
import { TrainingMode } from "@/types/types";

interface MainInterfaceProps {
  mode: TrainingMode;
  onCommandSuggest: (command: string) => void;
}

export const MainInterface: React.FC<MainInterfaceProps> = ({
  mode,
  onCommandSuggest,
}) => {
  const renderTerminal = () => {
    switch (mode) {
      case "docker":
        return <DockerTerminal />;
      case "linux":
      default:
        return <LinuxTerminal />;
    }
  };

  const renderTutorial = () => {
    switch (mode) {
      case "docker":
        return <DockerTutorial onCommandSuggest={onCommandSuggest} />;
      case "linux":
      default:
        return <Tutorial onCommandSuggest={onCommandSuggest} />;
    }
  };

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">{renderTutorial()}</div>
          <div className="lg:col-span-2">{renderTerminal()}</div>
        </div>
      </div>
    </section>
  );
};
