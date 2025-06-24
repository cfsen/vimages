import { create } from 'zustand';
import { EntityDirectory, EntityImage } from "./ContextTypes";
import { Modal } from "@keyboard/KeyboardTypes";

interface IAppProps {
	currentDir: string
	currentDirHash: string | null

	mode: Modal

	activeNavigationContext: string | null

	fullscreenImage: boolean
	fullscreenImagePath: string

	showHelp: boolean

	directories: EntityDirectory[]
	images: EntityImage[]

	inputBufferCommand: string
}

export interface IAppState extends IAppProps {
	setCurrentDir: (dir: string) => void
	setCurrentDirHash: (hash: string | null) => void

	setMode: (mode: Modal) => void

	setActiveNavigationContext: (id: string | null) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

	setShowHelp: (_: boolean) => void

	setDirectories: (dirs: EntityDirectory[]) => void
	setImages: (images: EntityImage[]) => void

	setInputBufferCommand: (_: string) => void
}

export const useAppState = create<IAppState>((set) => ({
	currentDir: ".",
	setCurrentDir: (dir) => set({ currentDir: dir }),

	mode: Modal.Normal,
	setMode: (mode) => set({ mode: mode }),

	currentDirHash: null,
	setCurrentDirHash: (hash) => set({ currentDirHash: hash }),

	activeNavigationContext: "",
	setActiveNavigationContext: (id) => set({ activeNavigationContext: id }),

	fullscreenImage: false,
	setFullscreenImage: (bool) => set({ fullscreenImage: bool }),

	fullscreenImagePath: ".",
	setFullscreenImagePath: (path) => set({ fullscreenImagePath: path }),

	showHelp: false,
	setShowHelp: (_) => set({ showHelp: _ }),

	directories: [],
	setDirectories: (dirs) => set({ directories: dirs }),

	images: [],
	setImages: (images) => set({ images: images }),

	inputBufferCommand: ":",
	setInputBufferCommand: (_) => set({ inputBufferCommand: _ }),
}))

