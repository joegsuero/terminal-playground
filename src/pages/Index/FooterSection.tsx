import React from "react";
import { modeSpecificData } from "./features";
import { TrainingMode } from "@/types/types";

interface FooterSectionProps {
  mode: TrainingMode;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ mode }) => {
  const data = modeSpecificData[mode];

  return (
    <footer className="text-center text-muted-foreground pb-10">
      <p className="mb-2">{data.footerText}</p>
      <p className="text-sm">
        Try commands like:{" "}
        {data.exampleCommands.map((cmd, i) => (
          <React.Fragment key={cmd}>
            <code className="bg-muted px-2 py-1 rounded">{cmd}</code>
            {i < data.exampleCommands.length - 1 && ","}
          </React.Fragment>
        ))}
      </p>
    </footer>
  );
};
