import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useRef, useContext, useState } from "react";

import { RustApiAction } from "@filesystem/RustApiBridge";
import { Command, CommandSequence } from "@keyboard/Command";

import { useAppState } from "./AppContextStore";

type NavigationHandler = (cmd: CommandSequence) => boolean; // returns true if handled

type AppContextType = {
	showConsole: boolean;
	cmdLog: CommandSequence[];
	showLeader: boolean;

	// Navigation container management
	activeNavigationId: string | null;
	setActiveNavigationId: (id: string) => void;

	registerNavigationContainer: (id: string, handler: NavigationHandler) => void;
	unregisterNavigationContainer: (id: string) => void;

	// Main command handler
	handleCmd: (seq: CommandSequence) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
	const setCurrentDir = useAppState(state => state.setCurrentDir);

	const activeNavigationId = useAppState(state => state.activeNavigationContext);
	const setActiveNavigationId = useAppState(state => state.setActiveNavigationContext);

	// TODO: refactor, move to zustand
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);

	const [showLeader, setShowLeader] = useState<boolean>(false);
	const [showConsole, setShowConsole] = useState<boolean>(false);

	const navigationHandlers = useRef<Map<string, NavigationHandler>>(new Map());

	useEffect(() => {
		invoke(RustApiAction.GetCurrentPath)
			.then(res => {setCurrentDir(res as string)
			});
	}, []);

	//
	// NavigationContainers
	//

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

	const handleCmd = (seq: CommandSequence) => {
		//console.log("AppContext:handleCmd:", seq);
		setCmdLog(prev => [...prev, seq]);
		
		if(seq.cmd === Command.Debug){
			console.log("[DEBUG] AppContext:");
			console.log("> Zustand store:", useAppState.getState());
			console.log("> Navigation handlers:", navigationHandlers.current);
		}
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
				console.log("ctx:active nav context changed:" + nextId);
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
		<AppContext.Provider value={{ 
			cmdLog,
			handleCmd,
			showLeader,
			showConsole,
			activeNavigationId,
			setActiveNavigationId,
			registerNavigationContainer,
			unregisterNavigationContainer,
		}}>
			{children}
		</AppContext.Provider>
	);
};

export const useGlobalCtx = (): AppContextType => {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error("useGlobalCtx must be used within CommandProvider");
	return ctx;
};
