import React from "react";
import { TerminalBase } from "./TerminalBase";
import { Terminal } from "lucide-react";
import { TmuxTerminal } from "./TmuxTerminal";

interface LinuxTerminalProps {
  themeMode?: "light" | "dark";
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({
  themeMode = "dark",
}) => {
  return (
    <TerminalBase
      title="Linux Terminal — tmux"
      icon={<Terminal className="w-4 h-4" />}
      theme="linux"
      themeMode={themeMode}
      noPadding
    >
      <TmuxTerminal themeMode={themeMode} />
    </TerminalBase>
  );
};
