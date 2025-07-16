import { create } from 'zustand';

import { EntityDirectory, EntityImage, NavigationHandle, UIComponent, Workspaces } from "@context/context.types";
import { Modal } from "@key/key.types";

interface IAppProps {
	//
	// Backend
	// key_backend
	axum_port: string | null
	vimages_version: string

	//
	// Current directory, subdirectories and images
	// key_dirstate
	currentDir: string
	currentDirHash: string | null
	directories: EntityDirectory[]
	siblingDirs: EntityDirectory[]
	images: EntityImage[]
	dirHistory: Map<string, string>

	//
	// UI state
	// key_uistate
	mode: Modal
	workspace: Workspaces

	fullscreenImage: boolean
	fullscreenImagePath: string

	showHelp: boolean
	showError: boolean
	errorMsg: string

	inputBufferCommand: string

	//
	// Image grid UI
	// key_imgrid
	imageGridSize: number
	imageGridScale: number

	//
	// Navigation contexts
	// key_navctx
	navigationHandlers: Map<string, NavigationHandle>
	navigationHandlersByComp: Map<UIComponent, NavigationHandle>
	navigationHandlersArray: NavigationHandle[]
	activeNavigationContext: string | null
}

export interface IAppState extends IAppProps {
	//
	// Backend
	// key_backend
	setAxumPort: (port: string) => void
	setVimagesVersion: (version: string) => void

	//
	// Current directory, subdirectories and images
	// key_dirstate
	setCurrentDir: (dir: string) => void
	setCurrentDirHash: (hash: string | null) => void
	setDirectories: (dirs: EntityDirectory[]) => void
	setSiblingDirs: (dirs: EntityDirectory[]) => void
	setImages: (images: EntityImage[]) => void
	setDirHistory: (dir: string) => void

	//
	// UI state
	// key_uistate
	setMode: (mode: Modal) => void
	setWorkspace: (ws: keyof Workspaces, active: boolean) => void
	toggleWorkspace: (ws: keyof Workspaces) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

	setShowHelp: (_: boolean) => void
	setShowError: (_: boolean) => void
	setErrorMsg: (_: string) => void

	setInputBufferCommand: (_: string) => void
	
	//
	// Image grid UI
	// key_imgrid
	setImageGridSize: (pixels: number) => void
	setImageGridScale: (scalar: number) => void

	//
	// Navigation contexts
	// key_navctx
	setActiveNavigationContext: (id: string | null) => void
	registerNavigationHandler: (id: string, handler: NavigationHandle) => void
	unregisterNavigationHandler: (id: string) => void
}

export const useAppState = create<IAppState>((set) => ({
	//
	// Backend
	// key_backend
	axum_port: null,
	setAxumPort: (port) => set({ axum_port: port }),
	vimages_version: "",
	setVimagesVersion: (version) => set({ vimages_version: version }),

	//
	// Current directory, subdirectories and images
	// key_dirstate
	currentDir: ".",
	setCurrentDir: (dir) => set({ currentDir: dir }),
	currentDirHash: null,
	setCurrentDirHash: (hash) => set({ currentDirHash: hash }),
	directories: [],
	setDirectories: (dirs) => set({ directories: dirs }),
	siblingDirs: [],
	setSiblingDirs: (dirs) => set({ siblingDirs: dirs }),
	images: [],
	setImages: (images) => set({ images: images }),
	dirHistory: new Map<string, string>(),
	setDirHistory: (id: string) => set((state) => { 
		const hist = state.dirHistory;

		if(hist.get(state.currentDir) !== id) {
			hist.set(state.currentDir, id);
		}

		const updates: Partial<IAppState> = {
			dirHistory: hist
		};
		return updates;
	}),

	//
	// UI state
	// key_uistate
	mode: Modal.Normal,
	setMode: (mode) => set({ mode: mode }),
	workspace: {
		DirBrowser: true,
		ImgGrid: false,
	},
	setWorkspace: (ws, active) => {
		set((state) => ({
			workspace: {
				...state.workspace,
				[ws]: active
			},
		}));
	},
	toggleWorkspace: (ws) => {
		set((state) => ({
			workspace: {
				...state.workspace,
				[ws]: !state.workspace[ws] 
			},
		}));
	},

	fullscreenImage: false,
	setFullscreenImage: (bool) => set({ fullscreenImage: bool }),
	fullscreenImagePath: ".",
	setFullscreenImagePath: (path) => set({ fullscreenImagePath: path }),

	showHelp: false,
	setShowHelp: (_) => set({ showHelp: _ }),
	
	showError: false,
	setShowError: (bool) => set({ showError: bool }),
	errorMsg: "",
	setErrorMsg: (_) => set({ errorMsg: _}),

	inputBufferCommand: ":",
	setInputBufferCommand: (_) => set({ inputBufferCommand: _ }),

	//
	// Image grid UI
	// key_imgrid
	imageGridSize: 400,
	setImageGridSize: (pixels) => set({ imageGridSize: pixels }),
	imageGridScale: 1,
	setImageGridScale: (scalar) => set({ imageGridScale: scalar }),

	//
	// Navigation contexts
	// key_navctx
	activeNavigationContext: "",
	setActiveNavigationContext: (id) => set({ activeNavigationContext: id }),

	// Navigation handlers maps and arrays
	// TODO: review TODO_NAVCTX_DS
	// sub-optimal approach to accessing navctx based on different properties
	// performant, but sub-par readability
	// leaving as is for now to unblock progress on workspaces
	navigationHandlers: new Map<string, NavigationHandle>(),
	navigationHandlersArray: [],
	navigationHandlersByComp: new Map<UIComponent, NavigationHandle>(),
	registerNavigationHandler: (id: string, handler: NavigationHandle) => set((state) => {
		const newMap = new Map(state.navigationHandlers);
		const newCompMap = new Map(state.navigationHandlersByComp);
		const newArray = [...state.navigationHandlersArray, handler]
		.sort((a, b) => a.tabOrder - b.tabOrder);

		newMap.set(id, handler);
		newCompMap.set(handler.component, handler);

		// If this is the first container, make it active
		const updates: Partial<IAppState> = { 
			navigationHandlers: newMap,
			navigationHandlersByComp: newCompMap,
			navigationHandlersArray: newArray
		};
		if (newMap.size === 1 && !state.activeNavigationContext) {
			updates.activeNavigationContext = id;
		}
		return updates;
	}),
	unregisterNavigationHandler: (id: string) => set((state) => {
		const handler = state.navigationHandlers.get(id);
		if (!handler) return state;

		const newMap = new Map(state.navigationHandlers);
		const newCompMap = new Map(state.navigationHandlersByComp);
		const newArray = state.navigationHandlersArray.filter(h => h !== handler);

		newMap.delete(id);
		newCompMap.delete(handler.component);

		const updates: Partial<IAppState> = { 
			navigationHandlers: newMap,
			navigationHandlersByComp: newCompMap,
			navigationHandlersArray: newArray
		};

		// If we removed the active container, pick a new one
		if (state.activeNavigationContext === id) {
			const remaining = Array.from(newMap.keys());
			updates.activeNavigationContext = remaining[0] || null;
		}

		return updates;
	}),
}))


