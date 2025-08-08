import React from "react";
import { Container } from "lucide-react";
import { dockerLessons } from "../../data/dockerLessons";
import { TutorialBase } from "./TutorialBase";

interface TutorialProps {
  onCommandSuggest: (command: string) => void;
}

export const DockerTutorial: React.FC<TutorialProps> = ({
  onCommandSuggest,
}) => {
  return (
    <div className="docker-theme">
      <TutorialBase
        lessons={dockerLessons}
        onCommandSuggest={onCommandSuggest}
        title="Docker Training"
        icon={<Container className="w-5 h-5 text-primary" />}
      />
    </div>
  );
};
