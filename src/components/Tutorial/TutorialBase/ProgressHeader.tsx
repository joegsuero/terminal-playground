import React from "react";

interface ProgressHeaderProps {
  title: string;
  icon: React.ReactNode;
  completed: number;
  total: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  title,
  icon,
  completed,
  total,
}) => {
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="bg-secondary border-b border-border px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground">
        Progress: {completed}/{total} lessons ({progress}%)
      </div>
      <div className="w-full bg-muted rounded-full h-2 mt-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
