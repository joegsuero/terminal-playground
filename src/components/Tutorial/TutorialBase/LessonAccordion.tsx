import React from "react";
import { CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Lesson } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTerminalStore } from "@/store/terminalStore";

interface LessonAccordionProps {
  lesson: Lesson;
  isExpanded: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  currentCommandIndex: number;
  onSelect: () => void;
  onTryCommand: (command: string) => void;
  onPrevCommand: () => void;
  onNextCommand: () => void;
  innerRef?: React.Ref<HTMLDivElement>;
}

export const LessonAccordion: React.FC<LessonAccordionProps> = ({
  lesson,
  isExpanded,
  isCurrent,
  isCompleted,
  currentCommandIndex,
  onSelect,
  onPrevCommand,
  onNextCommand,
  innerRef,
}) => {
  const { setCommandToExecute } = useTerminalStore();

  const handleTryCommand = () => {
    setCommandToExecute(lesson.commands[currentCommandIndex]);
  };

  return (
    <div ref={innerRef} className="border-border rounded-lg overflow-hidden">
      <button
        onClick={onSelect}
        className={`w-full text-left p-3 transition-colors flex justify-between items-center ${
          isCurrent ? "bg-primary/10" : "hover:bg-muted"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-primary" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium">{lesson.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-muted/10 border-t">
          <p className="text-sm text-muted-foreground">{lesson.description}</p>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Command {currentCommandIndex + 1} of {lesson.commands.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="font-medium text-sm">
                    {lesson.commandExplanations[currentCommandIndex]}
                  </h6>
                </div>

                <div className="bg-terminal-bg p-3 rounded border font-mono text-sm">
                  <span className="text-terminal-prompt">$ </span>
                  <span className="text-terminal-text">
                    {lesson.commands[currentCommandIndex]}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleTryCommand}
                    className="flex-1 py-2"
                    variant="default"
                    size="sm"
                  >
                    Try This Command
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={onPrevCommand}
                      disabled={currentCommandIndex === 0}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={onNextCommand}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {currentCommandIndex === lesson.commands.length - 1
                        ? "Complete"
                        : "Next"}
                    </Button>
                  </div>
                </div>
              </div>

              {lesson.expectedOutputs && (
                <div className="text-sm text-muted-foreground">
                  <strong>Expected:</strong>{" "}
                  {lesson.expectedOutputs[currentCommandIndex]}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
