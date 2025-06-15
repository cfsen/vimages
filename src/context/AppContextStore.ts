import { create } from 'zustand';

interface IAppState {
	currentDir: string
	setCurrentDir: (dir: string) => void
	fullscreenImage: boolean
	setFullscreenImage: (bool: boolean) => void
	fullscreenImagePath: string
	setFullscreenImagePath: (path: string) => void
}

export const useAppState = create<IAppState>((set) => ({
	currentDir: ".",
	setCurrentDir: (dir) => set({ currentDir: dir }),
	fullscreenImage: false,
	setFullscreenImage: (bool) => set({ fullscreenImage: bool }),
	fullscreenImagePath: ".",
	setFullscreenImagePath: (path) => set({ fullscreenImagePath: path })
}))

