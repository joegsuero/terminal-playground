import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Lesson } from "@/types/types";

interface TutorialBaseProps {
  lessons: Lesson[];
  onCommandSuggest: (command: string) => void;
  title: string;
  icon: React.ReactNode;
}

export const TutorialBase: React.FC<TutorialBaseProps> = ({
  lessons,
  onCommandSuggest,
  title,
  icon,
}) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  const lesson = lessons[currentLesson];

  const handleNextCommand = () => {
    if (currentCommandIndex < lesson.commands.length - 1) {
      setCurrentCommandIndex((prev) => prev + 1);
    } else {
      setCompletedLessons((prev) => new Set([...prev, lesson.id]));
      if (currentLesson < lessons.length - 1) {
        setCurrentLesson((prev) => prev + 1);
        setCurrentCommandIndex(0);
        setExpandedLesson(currentLesson + 1); // Auto-expand next lesson
      } else {
        setExpandedLesson(null); // Collapse when finished last lesson
      }
    }
  };

  const handlePrevCommand = () => {
    if (currentCommandIndex > 0) {
      setCurrentCommandIndex((prev) => prev - 1);
    }
  };

  const handleLessonSelect = (index: number) => {
    setCurrentLesson(index);
    setCurrentCommandIndex(0);
    setExpandedLesson(expandedLesson === index ? null : index);
  };

  const handleTryCommand = () => {
    const command = lesson.commands[currentCommandIndex];
    onCommandSuggest(command);
  };

  const progress = Math.round((completedLessons.size / lessons.length) * 100);

  return (
    <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header with progress */}
      <div className="bg-secondary border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Progress: {completedLessons.size}/{lessons.length} lessons ({progress}
          %)
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lessons list with accordion */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-card pb-2">
          Lessons
        </h3>

        {lessons.map((l, index) => (
          <div key={l.id} className="border-border rounded-lg overflow-hidden">
            <button
              onClick={() => handleLessonSelect(index)}
              className={`w-full text-left p-3 transition-colors flex justify-between items-center ${
                currentLesson === index ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                {completedLessons.has(l.id) ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium">{l.title}</span>
              </div>
              {expandedLesson === index ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedLesson === index && (
              <div className="p-4 space-y-4 bg-muted/10 border-t">
                <p className="text-sm text-muted-foreground">{l.description}</p>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Command {currentCommandIndex + 1} of {l.commands.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Current Command</h4>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(
                            ((currentCommandIndex + 1) / l.commands.length) *
                              100
                          )}
                          %
                        </span>
                      </div>

                      <div className="bg-terminal-bg p-3 rounded border font-mono text-sm">
                        <span className="text-terminal-prompt">$ </span>
                        <span className="text-terminal-text">
                          {l.commands[currentCommandIndex]}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleTryCommand}
                          className="flex-1"
                          variant="default"
                          size="sm"
                        >
                          Try This Command
                        </Button>
                        <Button
                          onClick={handlePrevCommand}
                          disabled={currentCommandIndex === 0}
                          variant="outline"
                          size="sm"
                        >
                          Prev
                        </Button>
                        <Button
                          onClick={handleNextCommand}
                          variant="outline"
                          size="sm"
                        >
                          {currentCommandIndex === l.commands.length - 1
                            ? "Complete"
                            : "Next"}
                        </Button>
                      </div>
                    </div>

                    {l.expectedOutputs && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Expected:</strong>{" "}
                        {l.expectedOutputs[currentCommandIndex]}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
