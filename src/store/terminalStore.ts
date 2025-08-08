import { create } from "zustand";

interface TerminalState {
  commandToExecute: string;
  setCommandToExecute: (command: string) => void;
  clearCommand: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  commandToExecute: "",
  setCommandToExecute: (command) => set({ commandToExecute: command }),
  clearCommand: () => set({ commandToExecute: "" }),
}));
