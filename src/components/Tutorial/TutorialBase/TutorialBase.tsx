import React, { useState, useRef, useCallback } from "react";
import { ProgressHeader } from "./ProgressHeader";
import { LessonAccordion } from "./LessonAccordion";
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

  // Usamos un callback ref para manejar las referencias
  const lessonRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setLessonRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      lessonRefs.current[index] = el;
    },
    []
  );

  const handleNextCommand = () => {
    const lesson = lessons[currentLesson];
    if (currentCommandIndex < lesson.commands.length - 1) {
      setCurrentCommandIndex((prev) => prev + 1);
    } else {
      setCompletedLessons((prev) => new Set([...prev, lesson.id]));
      if (currentLesson < lessons.length - 1) {
        const nextLesson = currentLesson + 1;
        setCurrentLesson(nextLesson);
        setCurrentCommandIndex(0);
        setExpandedLesson(nextLesson);
      } else {
        setExpandedLesson(null);
      }
    }
  };

  const handlePrevCommand = () => {
    if (currentCommandIndex > 0) {
      setCurrentCommandIndex((prev) => prev - 1);
    }
  };

  const handleTryCommand = (command: string) => {
    onCommandSuggest(command);
  };

  const handleLessonSelect = (index: number) => {
    setCurrentLesson(index);
    setCurrentCommandIndex(0);
    setExpandedLesson(expandedLesson === index ? null : index);

    // Scroll después de que el estado se haya actualizado
    setTimeout(() => {
      lessonRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 0);
  };

  // ... (otras funciones permanecen iguales)

  return (
    <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <ProgressHeader
        title={title}
        icon={icon}
        completed={completedLessons.size}
        total={lessons.length}
      />

      <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-card p-4 pb-2 z-10">
        Lessons
      </h3>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-96">
        {lessons.map((lesson, index) => (
          <LessonAccordion
            key={lesson.id}
            innerRef={setLessonRef(index)}
            lesson={lesson}
            isExpanded={expandedLesson === index}
            isCurrent={currentLesson === index}
            isCompleted={completedLessons.has(lesson.id)}
            currentCommandIndex={currentCommandIndex}
            onSelect={() => handleLessonSelect(index)}
            onTryCommand={handleTryCommand}
            onPrevCommand={handlePrevCommand}
            onNextCommand={handleNextCommand}
          />
        ))}
      </div>
    </div>
  );
};
