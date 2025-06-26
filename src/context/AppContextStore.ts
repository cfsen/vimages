import { create } from 'zustand';
import { EntityDirectory, EntityImage } from "./ContextTypes";
import { Modal } from "@keyboard/KeyboardTypes";
import { NavigationHandler } from './AppContext';

interface IAppProps {
	axum_port: string | null

	currentDir: string
	currentDirHash: string | null

	mode: Modal

	navigationHandlers: Map<string, NavigationHandler>
	activeNavigationContext: string | null

	fullscreenImage: boolean
	fullscreenImagePath: string

	showHelp: boolean

	directories: EntityDirectory[]
	images: EntityImage[]

	inputBufferCommand: string
}

export interface IAppState extends IAppProps {
	setAxumPort: (port: string) => void

	setCurrentDir: (dir: string) => void
	setCurrentDirHash: (hash: string | null) => void

	setMode: (mode: Modal) => void

	setActiveNavigationContext: (id: string | null) => void
	registerNavigationHandler: (id: string, handler: NavigationHandler) => void
	unregisterNavigationHandler: (id: string) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

	setShowHelp: (_: boolean) => void

	setDirectories: (dirs: EntityDirectory[]) => void
	setImages: (images: EntityImage[]) => void

	setInputBufferCommand: (_: string) => void

}

export const useAppState = create<IAppState>((set) => ({
	axum_port: null,
	setAxumPort: (port) => set({ axum_port: port }),

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

	// Navigation handlers Map
	navigationHandlers: new Map<string, NavigationHandler>(),
	registerNavigationHandler: (id: string, handler: NavigationHandler) => set((state) => {
		const newMap = new Map(state.navigationHandlers);
		newMap.set(id, handler);

		// If this is the first container, make it active
		const updates: Partial<IAppState> = { navigationHandlers: newMap };
		if (newMap.size === 1 && !state.activeNavigationContext) {
			updates.activeNavigationContext = id;
		}

		return updates;
	}),
	unregisterNavigationHandler: (id: string) => set((state) => {
		const newMap = new Map(state.navigationHandlers);
		newMap.delete(id);

		const updates: Partial<IAppState> = { navigationHandlers: newMap };

		// If we removed the active container, pick a new one
		if (state.activeNavigationContext === id) {
			const remaining = Array.from(newMap.keys());
			updates.activeNavigationContext = remaining[0] || null;
		}

		return updates;
	}),
}))

