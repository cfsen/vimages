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
	activeSelection: Set<string> | null

	//
	// UI state
	// key_uistate
	mode: Modal
	workspace: Workspaces

	fullscreenImage: boolean
	fullscreenImagePath: string

	showHelp: boolean
	showInfo: boolean
	keepOpenInfo: boolean
	infoMessages: string[]
	showError: boolean
	errorMsg: string

	inputBufferCommand: string
	inputBufferCursor: number

	titlebarRender: boolean

	uiWindowInnerWidth: number

	workaroundScrollToDelay: number

	searchHitIndexes: number[]
	searchHitIds: string[]
	searchHitLastJump: number | null

	//
	// Image grid UI
	// key_imgrid
	imageGridSize: number
	imageGridScale: number
	imageGridGap: number
	imageGridBorder: number
	imageGridWindowPadding: number
	imageGridMaxFilenameLength: number

	//
	// Fullscreen image UI
	// key_fullscreen
	fullscreenRotate: number // 0.25 -> 90 deg CW
	fullscreenOffsetY: number | null
	fullscreenOffsetX: number | null
	fullscreenZoom: number | null // 1.0 -> full sized image

	fullscreenInvertCursor: number
	fullscreenMoveStep: number
	fullscreenRotateStep: number
	fullscreenZoomStep: number

	//
	// Command mode 
	// key_cmd
	modeCmdHistory: string[]

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
	setActiveSelection: (items: Set<string> | null) => void

	//
	// UI state
	// key_uistate
	setMode: (mode: Modal) => void
	setWorkspace: (ws: keyof Workspaces, active: boolean) => void
	toggleWorkspace: (ws: keyof Workspaces) => void

	setFullscreenImage: (bool: boolean) => void
	setFullscreenImagePath: (path: string) => void

	setShowHelp: (_: boolean) => void
	setShowInfo: (_: boolean) => void
	setKeepOpenInfo: (state: boolean) => void
	addInfoMessage: (msg: string) => void
	setShowError: (_: boolean) => void
	setErrorMsg: (_: string) => void

	setInputBufferCommand: (_: string) => void
	setInputBufferCursor: (_: number) => void

	setTitlebarRender: (render: boolean) => void

	setSearchHitIndexes: (hits: number[]) => void
	setSearchHitIds: (ids: string[]) => void
	setSearchHitLastJump: (jump: number) => void
	
	//
	// Image grid UI
	// key_imgrid
	setImageGridSize: (pixels: number) => void
	setImageGridScale: (scalar: number) => void
	setImageGridGap: (pixels: number) => void
	setImageGridBorder: (pixels: number) => void
	setImageGridWindowPadding: (pixels: number) => void
	setImageGridMaxFilenameLength: (pixels: number) => void
	setUiWindowInnerWidth: (pixels: number) => void
	setWorkaroundScrollToDelay: (ms: number) => void

	//
	// Fullscreen image UI
	// key_fullscreen
	setFullscreenRotate: (turns: number) => void
	setFullscreenOffsetY: (pixels: number | null) => void
	setFullscreenOffsetX: (pixels: number | null) => void
	setFullscreenZoom: (scalar: number | null) => void
	
	setFullscreenInvertCursor: (invert: number) => void
	setFullscreenMoveStep: (step: number) => void
	setFullscreenRotateStep: (step: number) => void
	setFullscreenZoomStep: (step: number) => void

	//
	// Command mode
	// key_cmd
	modeCmdAddHistory: (cmd: string) => void

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
	activeSelection: null,
	setActiveSelection: (items: Set<string> | null) => set({
		activeSelection: items
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

	showInfo: false,
	setShowInfo: (display) => set({ showInfo: display }),
	keepOpenInfo: false,
	setKeepOpenInfo: (display) => set({ keepOpenInfo: display }),
	infoMessages: [],
	addInfoMessage: (msg) => set((state) => {
		const maxMessages = 10;
		return {
			infoMessages: [...state.infoMessages, msg].slice(-maxMessages)
		}
	}),
	
	showError: false,
	setShowError: (bool) => set({ showError: bool }),
	errorMsg: "",
	setErrorMsg: (_) => set({ errorMsg: _}),

	inputBufferCommand: ":",
	setInputBufferCommand: (_) => set({ inputBufferCommand: _ }),
	inputBufferCursor: 1,
	setInputBufferCursor: (_) => set ({ inputBufferCursor: _ }),

	titlebarRender: true, // TODO persistent config
	setTitlebarRender: (render) => set({ titlebarRender: render }),

	uiWindowInnerWidth: window.innerWidth,
	setUiWindowInnerWidth: (pixels: number) => set({ uiWindowInnerWidth: pixels }),

	workaroundScrollToDelay: 100,
	setWorkaroundScrollToDelay: (ms: number) => set({ workaroundScrollToDelay: ms }),

	searchHitIndexes: [],
	setSearchHitIndexes: (hits: number[]) => set({ searchHitIndexes: hits }),
	searchHitIds: [],
	setSearchHitIds: (ids: string[]) => set({ searchHitIds: ids }),
	searchHitLastJump: null,
	setSearchHitLastJump: (jump: number) => set({ searchHitLastJump: jump }),

	//
	// Image grid UI
	// key_imgrid
	imageGridSize: 400,
	setImageGridSize: (pixels) => set({ imageGridSize: pixels }),
	imageGridScale: 1,
	setImageGridScale: (scalar) => set({ imageGridScale: scalar }),
	imageGridGap: 7,
	setImageGridGap: (pixels: number) => set({ imageGridGap: pixels }),
	imageGridBorder: 1,
	setImageGridBorder: (pixels: number) => set({ imageGridBorder: pixels }),
	imageGridWindowPadding: 0,
	setImageGridWindowPadding: (pixels: number) => set({ imageGridWindowPadding: pixels }),
	imageGridMaxFilenameLength: 50,
	setImageGridMaxFilenameLength: (pixels: number) => set({ imageGridMaxFilenameLength: pixels }),
	
	//
	// Fullscreen image UI
	// key_fullscreen
	fullscreenRotate: 0,
	setFullscreenRotate: (turns) => set({ fullscreenRotate: turns }),
	fullscreenOffsetY: null,
	setFullscreenOffsetY: (pixels) => set({ fullscreenOffsetY: pixels }),
	fullscreenOffsetX: null,
	setFullscreenOffsetX: (pixels) => set({ fullscreenOffsetX: pixels }),
	fullscreenZoom: null,
	setFullscreenZoom: (scalar) => set({ fullscreenZoom: scalar }),
	
	fullscreenInvertCursor: -1,
	setFullscreenInvertCursor: (invert) => set({ fullscreenInvertCursor: invert }),
	fullscreenMoveStep: 200,
	setFullscreenMoveStep: (step) => set({ fullscreenMoveStep: step }),
	fullscreenRotateStep: 0.25,
	setFullscreenRotateStep: (step) => set({ fullscreenRotateStep: step }),
	fullscreenZoomStep: 0.25,
	setFullscreenZoomStep: (step) => set({ fullscreenZoomStep: step }),

	//
	// Command mode
	// key_cmd
	modeCmdHistory: [],
	modeCmdAddHistory: (cmd) => set((state) => {
		const modeCmdHistoryLimit = 100;
		return {
			modeCmdHistory: [...state.modeCmdHistory, cmd].slice(-modeCmdHistoryLimit)
		}
	}),

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


