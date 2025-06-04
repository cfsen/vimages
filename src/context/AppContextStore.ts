import { create } from 'zustand';

interface IAppState {
  currentDir: string
  setCurrentDir: (dir: string) => void
}

export const useAppState = create<IAppState>((set) => ({
  currentDir: ".",
  setCurrentDir: (dir) => set({ currentDir: dir }),
}))

