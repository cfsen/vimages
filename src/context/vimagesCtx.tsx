import { Command, CommandSequence } from '../keyboard/Command';
import { createContext, useEffect, useRef, useContext, useState, useCallback, useMemo } from "react";
import { useRustApi, RustApiAction, RustApiCall } from "./../filesystem/RustApiBridge";

type NavigationHandler = (cmd: CommandSequence) => boolean; // returns true if handled

type vimagesCtxType = {
	currentDir: React.MutableRefObject<string>;

	showConsole: boolean;
	cmdLog: CommandSequence[];
	showLeader: boolean;
	updateDirectory: (newPath: string) => void;

	// Navigation container management
	activeNavigationId: string | null;
	setActiveNavigationId: (id: string) => void;
	
	registerNavigationContainer: (id: string, handler: NavigationHandler) => void;
	unregisterNavigationContainer: (id: string) => void;

	// Main command handler
	handleCmd: (seq: CommandSequence) => void;
};

export const vimagesCtx = createContext<vimagesCtxType | undefined>(undefined);

export const VimagesCtxProvider = ({ children }: { children: React.ReactNode }) => {
	//const [currentDir, setCurrentDir] = useState(".");
	const currentDir = useRef<string>(".");
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	const [showLeader, setShowLeader] = useState<boolean>(false);
	const [showConsole, setShowConsole] = useState<boolean>(false);

	const [activeNavigationId, setActiveNavigationId] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	const rustApiInitParams = useMemo<RustApiCall>(() => ({
		action: RustApiAction.GetCurrentPath,
		path: "."
	}), []);
	const { response, loading, error } = useRustApi(rustApiInitParams);

	// TODO: this is janky and needs a proper fix
	const [, setForceDraw] = useState<boolean>(false);
	const updateDirectory = useCallback((newPath: string) => {
		console.log("ctx:updateDirectory");
		currentDir.current = newPath;
		setForceDraw(prev => !prev);
	}, []);

	// Set initial working directory ONCE
	useEffect(() => {
		if (!loading && !error && response && !isInitialized) {
			currentDir.current = response as any;
			setIsInitialized(true);
			console.log("Initial currentDir set to:", response);
		}
	}, [loading, error, response, isInitialized]);

	//
	// NavigationContainers
	//

	const navigationHandlers = useRef<Map<string, NavigationHandler>>(new Map());

	const registerNavigationContainer = (id: string, handler: NavigationHandler) => {
		navigationHandlers.current.set(id, handler);

		// If this is the first container, make it active
		if (navigationHandlers.current.size === 1) {
			setActiveNavigationId(id);
		}
	};

	const unregisterNavigationContainer = (id: string) => {
		//console.log("ctx:unregister: " + id);
		navigationHandlers.current.delete(id);

		// If we removed the active container, pick a new one
		if (activeNavigationId === id) {
			const remaining = Array.from(navigationHandlers.current.keys());
			setActiveNavigationId(remaining[0] || null);
		}
	};

	//
	// Command handling
	//

//useEffect(() => {
//    console.log("activeNavigationId changed to:", activeNavigationId);
//}, [activeNavigationId]);

	const handleCmd = (seq: CommandSequence) => {
		//console.log("vimagesCtx:handleCmd:", seq);
		setCmdLog(prev => [...prev, seq]);

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			console.log("ctx:handleCmd:escape");
		}
		if(seq.cmd === Command.Console){
			console.log("ctx:handleCmd:console");
			setShowConsole(!showConsole);
		}
		if(seq.cmd === Command.Leader){ 
			console.log("ctx:handleCmd:leader");
			setShowLeader(!showLeader);
		}
		if(seq.cmd === Command.Error){
			console.log("ctx:handleCmd:error");
		}
		if(seq.cmd === Command.Tab){
			console.log("ctx:handleCmd:tab"); 
			// Cycle activeNavigationId sequentially
			const handlerIds = Array.from(navigationHandlers.current.keys());

			if (handlerIds.length > 1) {
				const currentIndex = activeNavigationId ? handlerIds.indexOf(activeNavigationId) : -1;
				const nextIndex = (currentIndex + 1) % handlerIds.length;
				const nextId = handlerIds[nextIndex];
				setActiveNavigationId(nextId);
				return; // Exit early to avoid further processing
			}
		}

		// Navigation commands - delegate to active container
		if (activeNavigationId) {
			const handler = navigationHandlers.current.get(activeNavigationId);
			if (handler) {
				const wasHandled = handler(seq);
				if (wasHandled) return;
			}
		}

		console.log("Unhandled command:", seq);
	}

	return (
		<vimagesCtx.Provider value={{ 
			currentDir, 
			cmdLog,
			handleCmd,
			showLeader,
			showConsole,
			activeNavigationId,
			setActiveNavigationId,
			registerNavigationContainer,
			unregisterNavigationContainer,
			updateDirectory,
		}}>
			{children}
		</vimagesCtx.Provider>
	);
};

export const useGlobalCtx = (): vimagesCtxType => {
	const ctx = useContext(vimagesCtx);
	if (!ctx) throw new Error("useCommand must be used within CommandProvider");
	return ctx;
};


// Reminder:
// Access context from any nested component:
//
//import { useCommand } from "../context/vimagesCtx";
//
//const { cmdLog, navigate, handleCmd, updatecurrentDir } = useCommand();
//navigate(seq); // shared function, updates state
