import React from "react";
import { BookOpen, Terminal as TerminalIcon } from "lucide-react";
import { lessons } from "@/data/linuxLessons";
import { TutorialBase } from "./TutorialBase/TutorialBase";

interface TutorialProps {
  onCommandSuggest: (command: string) => void;
}

export const LinuxTutorial: React.FC<TutorialProps> = ({
  onCommandSuggest,
}) => {
  return (
    <TutorialBase
      lessons={lessons}
      onCommandSuggest={onCommandSuggest}
      title="Linux Tutorial"
      icon={<BookOpen className="w-5 h-5 text-primary" />}
    />
  );
};
