import { create } from 'zustand';

interface IAppProps {
	currentDir: string

	activeNavigationContext: string | null

	fullscreenImage: boolean
	fullscreenImagePath: string
}

export interface IAppState extends IAppProps {
	setCurrentDir: (dir: string) => void
	setActiveNavigationContext: (id: string | null) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

}

export const useAppState = create<IAppState>((set) => ({
	currentDir: ".",
	setCurrentDir: (dir) => set({ currentDir: dir }),

	activeNavigationContext: "",
	setActiveNavigationContext: (id) => set({ activeNavigationContext: id }),

	fullscreenImage: false,
	setFullscreenImage: (bool) => set({ fullscreenImage: bool }),

	fullscreenImagePath: ".",
	setFullscreenImagePath: (path) => set({ fullscreenImagePath: path }),
}))

