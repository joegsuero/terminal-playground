import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TerminalLine } from "@/types/types";
import { Achievement } from "@/hooks/useAchievements";

interface Stats {
  commandsExecuted: number;
  filesCreated: number;
  filesDeleted: number;
  directoriesNavigated: number;
  grepUsed: number;
  pipesUsed: number;
  clearUsed: number;
  vimUsed: number;
  helpUsed: number;
}

interface TerminalState {
  commandToExecute: string;
  linuxHistory: TerminalLine[];
  dockerHistory: TerminalLine[];
  linuxProgress: string[];
  dockerProgress: string[];
  stats: Stats;
  achievements: Achievement[];
  streak: number;
  lastVisit: string;
  setCommandToExecute: (command: string) => void;
  clearCommand: () => void;
  addLinuxHistory: (line: TerminalLine) => void;
  addDockerHistory: (line: TerminalLine) => void;
  setLinuxHistory: (history: TerminalLine[]) => void;
  setDockerHistory: (history: TerminalLine[]) => void;
  completeLinuxLesson: (lessonId: string) => void;
  completeDockerLesson: (lessonId: string) => void;
  resetAll: () => void;
  updateStats: (stat: keyof Stats, increment?: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateStreak: () => void;
}

const initialStats: Stats = {
  commandsExecuted: 0,
  filesCreated: 0,
  filesDeleted: 0,
  directoriesNavigated: 0,
  grepUsed: 0,
  pipesUsed: 0,
  clearUsed: 0,
  vimUsed: 0,
  helpUsed: 0,
};

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      commandToExecute: "",
      linuxHistory: [],
      dockerHistory: [],
      linuxProgress: [],
      dockerProgress: [],
      stats: initialStats,
      achievements: [],
      streak: 0,
      lastVisit: "",
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
          stats: initialStats,
          achievements: [],
          streak: 0,
          lastVisit: "",
        }),
      updateStats: (stat, increment = 1) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [stat]: state.stats[stat] + increment,
          },
        })),
      unlockAchievement: (achievement) =>
        set((state) => {
          const exists = state.achievements.find(a => a.id === achievement.id);
          if (exists) {
            return state;
          }
          return {
            achievements: [...state.achievements, achievement],
          };
        }),
      updateStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          if (state.lastVisit === today) {
            return state;
          }
          
          let newStreak = 1;
          if (state.lastVisit === yesterday) {
            newStreak = state.streak + 1;
          }
          
          return {
            streak: newStreak,
            lastVisit: today,
          };
        }),
    }),
    {
      name: "terminal-storage",
    }
  )
);

