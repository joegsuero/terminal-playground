import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TerminalLine } from "@/types/types";

interface TerminalState {
  commandToExecute: string;
  linuxHistory: TerminalLine[];
  dockerHistory: TerminalLine[];
  linuxProgress: string[];
  dockerProgress: string[];
  setCommandToExecute: (command: string) => void;
  clearCommand: () => void;
  addLinuxHistory: (line: TerminalLine) => void;
  addDockerHistory: (line: TerminalLine) => void;
  setLinuxHistory: (history: TerminalLine[]) => void;
  setDockerHistory: (history: TerminalLine[]) => void;
  completeLinuxLesson: (lessonId: string) => void;
  completeDockerLesson: (lessonId: string) => void;
  resetAll: () => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      commandToExecute: "",
      linuxHistory: [],
      dockerHistory: [],
      linuxProgress: [],
      dockerProgress: [],
      setCommandToExecute: (command) => set({ commandToExecute: command }),
      clearCommand: () => set({ commandToExecute: "" }),
      addLinuxHistory: (line) =>
        set((state) => ({ linuxHistory: [...state.linuxHistory, line] })),
      addDockerHistory: (line) =>
        set((state) => ({ dockerHistory: [...state.dockerHistory, line] })),
      setLinuxHistory: (history) => set({ linuxHistory: history }),
      setDockerHistory: (history) => set({ dockerHistory: history }),
      completeLinuxLesson: (lessonId) =>
        set((state) => ({
          linuxProgress: state.linuxProgress.includes(lessonId)
            ? state.linuxProgress
            : [...state.linuxProgress, lessonId],
        })),
      completeDockerLesson: (lessonId) =>
        set((state) => ({
          dockerProgress: state.dockerProgress.includes(lessonId)
            ? state.dockerProgress
            : [...state.dockerProgress, lessonId],
        })),
      resetAll: () =>
        set({
          linuxHistory: [],
          dockerHistory: [],
          linuxProgress: [],
          dockerProgress: [],
        }),
    }),
    {
      name: "terminal-storage",
    }
  )
);

