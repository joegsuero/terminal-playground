import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, Circle, Container } from "lucide-react";
import { dockerLessons, type DockerLesson } from "../../data/dockerLessons";

interface TutorialProps {
  onCommandSuggest: (command: string) => void;
}

export const DockerTutorial: React.FC<TutorialProps> = ({
  onCommandSuggest,
}) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);

  const lesson = dockerLessons[currentLesson];

  const handleNextCommand = () => {
    if (currentCommandIndex < lesson.commands.length - 1) {
      setCurrentCommandIndex((prev) => prev + 1);
    } else {
      // Mark lesson as completed
      setCompletedLessons((prev) => new Set([...prev, lesson.id]));

      // Move to next lesson
      if (currentLesson < dockerLessons.length - 1) {
        setCurrentLesson((prev) => prev + 1);
        setCurrentCommandIndex(0);
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
  };

  const handleTryCommand = () => {
    const command = lesson.commands[currentCommandIndex];
    onCommandSuggest(command);
  };

  const progress = Math.round(
    (completedLessons.size / dockerLessons.length) * 100
  );

  return (
    <div className="h-full bg-card border border-border rounded-lg overflow-hidden docker-theme">
      <div className="bg-secondary border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Container className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Docker Training</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Progress: {completedLessons.size}/{dockerLessons.length} lessons (
          {progress}%)
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Lesson List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Lessons</h3>
          {dockerLessons.map((l, index) => (
            <button
              key={l.id}
              onClick={() => handleLessonSelect(index)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                currentLesson === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
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
              <p className="text-sm text-muted-foreground mt-1">
                {l.description}
              </p>
            </button>
          ))}
        </div>

        {/* Current Lesson */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Container className="w-5 h-5" />
              {lesson.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{lesson.explanation}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Command {currentCommandIndex + 1} of {lesson.commands.length}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {Math.round(
                    ((currentCommandIndex + 1) / lesson.commands.length) * 100
                  )}
                  %
                </span>
              </div>

              <div className="bg-terminal-bg p-3 rounded border font-mono text-sm">
                <span className="text-terminal-prompt">$ </span>
                <span className="text-terminal-text">
                  {lesson.commands[currentCommandIndex]}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTryCommand}
                  className="flex-1"
                  variant="default"
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
                <Button onClick={handleNextCommand} variant="outline" size="sm">
                  {currentCommandIndex === lesson.commands.length - 1
                    ? "Complete"
                    : "Next"}
                </Button>
              </div>
            </div>

            {lesson.expectedOutput && (
              <div className="text-sm text-muted-foreground">
                <strong>Expected:</strong> {lesson.expectedOutput}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
