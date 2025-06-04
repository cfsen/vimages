import { create } from 'zustand';

interface GlobalState {
  currentDir: string
  setCurrentDir: (dir: string) => void
  // ... other state and methods
}

export const useGlobalStore = create<GlobalState>((set) => ({
  currentDir: ".",
  setCurrentDir: (dir) => set({ currentDir: dir }),
  // ...
}))

