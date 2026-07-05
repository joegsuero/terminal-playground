import React, { useCallback, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Container } from "lucide-react";
import { TmuxTerminal } from "./TmuxTerminal";
import { DockerEngine } from "@/lib/DockerEngine";
import { DockerSession } from "@/lib/DockerSession";

const STORAGE_KEY = "docker-engine-v1";

interface DockerTerminalProps {
  themeMode?: "light" | "dark";
}

export const DockerTerminal: React.FC<DockerTerminalProps> = ({ themeMode = "dark" }) => {
  // One Docker daemon state shared by every pane; persisted to localStorage.
  const engineRef = useRef<DockerEngine>();
  if (!engineRef.current) {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    engineRef.current = stored ? DockerEngine.deserialize(stored) : new DockerEngine();
  }

  const createSession = useCallback(() => new DockerSession(engineRef.current!), []);
  const serialize = useCallback(() => engineRef.current!.serialize(), []);

  return (
    <TerminalBase
      title="Docker Terminal — tmux"
      icon={<Container className="w-4 h-4" />}
      theme="docker"
      themeMode={themeMode}
      noPadding
    >
      <TmuxTerminal
        themeMode={themeMode}
        createSession={createSession}
        serialize={serialize}
        storageKey={STORAGE_KEY}
        accent="cyan"
        label="docker"
      />
    </TerminalBase>
  );
};
