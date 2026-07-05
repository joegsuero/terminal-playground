import React, { useCallback, useRef } from "react";
import { TerminalBase } from "./TerminalBase";
import { Terminal } from "lucide-react";
import { TmuxTerminal } from "./TmuxTerminal";
import { VirtualFileSystem } from "@/lib/vfs";
import { ShellSession } from "@/lib/ShellSession";

const STORAGE_KEY = "linux-vfs-v1";

interface LinuxTerminalProps {
  themeMode?: "light" | "dark";
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({
  themeMode = "dark",
}) => {
  // One VFS shared by every pane; loaded from localStorage if present.
  const vfsRef = useRef<VirtualFileSystem>();
  if (!vfsRef.current) {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    vfsRef.current = stored ? VirtualFileSystem.deserialize(stored) : new VirtualFileSystem();
  }

  const createSession = useCallback(() => new ShellSession(vfsRef.current!), []);
  const serialize = useCallback(() => vfsRef.current!.serialize(), []);

  return (
    <TerminalBase
      title="Linux Terminal — tmux"
      icon={<Terminal className="w-4 h-4" />}
      theme="linux"
      themeMode={themeMode}
      noPadding
    >
      <TmuxTerminal
        themeMode={themeMode}
        createSession={createSession}
        serialize={serialize}
        storageKey={STORAGE_KEY}
        accent="green"
        label="playground"
      />
    </TerminalBase>
  );
};
