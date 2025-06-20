import { create } from 'zustand';
import { EntityDirectory, EntityImage } from "./ContextTypes";

interface IAppProps {
	currentDir: string

	activeNavigationContext: string | null

	fullscreenImage: boolean
	fullscreenImagePath: string

	directories: EntityDirectory[]
	images: EntityImage[]
}

export interface IAppState extends IAppProps {
	setCurrentDir: (dir: string) => void
	setActiveNavigationContext: (id: string | null) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

	setDirectories: (dirs: EntityDirectory[]) => void
	setImages: (images: EntityImage[]) => void
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

	directories: [],
	setDirectories: (dirs) => set({ directories: dirs }),

	images: [],
	setImages: (images) => set({ images: images }),
}))

