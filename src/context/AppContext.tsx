import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useRef, useContext, useState } from "react";

import { RustApiAction } from "@filesystem/RustApiBridge";
import { Command, CommandSequence } from "@keyboard/Command";

import { useAppState } from "./AppContextStore";
import { Modal } from "@/keyboard/KeyboardTypes";

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

	// Main command handlers
	handleModeNormal: (sequence: CommandSequence) => void;
	handleModeVisual: (selection: string[], sequence: CommandSequence) => void;
	handleModeInsert: (input: string, sequence: CommandSequence) => void;
	handleModeCommand: (input: string, sequence: CommandSequence) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
	const setCurrentDir = useAppState(state => state.setCurrentDir);
	const setMode = useAppState(state => state.setMode);

	const showHelp = useAppState(state => state.showHelp);
	const setShowHelp = useAppState(state => state.setShowHelp);

	const setInputBufferModeCommand = useAppState(state => state.setInputBufferCommand);

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
	// Input handling
	//

	const handleModeVisual = (selection: string[], sequence: CommandSequence) => {

	}
	const handleModeInsert = (input: string, sequence: CommandSequence) => {

	}

	const handleModeCommand = (input: string, sequence: CommandSequence) => {
		//console.log("AppContext:handleModeCommand:Return" + input);
		//console.log(sequence);

		// update buffer
		setInputBufferModeCommand(input);

		if(sequence.cmd !== Command.Return) return;

		// TODO:
		// use cmd to filter actions with parameters, like :set, :e, etc

		switch(input){
			case ":q":
				console.log("exit vimages");
				break;
			case ":help":
				setShowHelp(true);
				break;
			default:
				console.log("invalid command");
				break;
		};

		// reset to normal, clear buffer
		setMode(Modal.Normal);
		setInputBufferModeCommand(":");
	}

	const handleModeNormal = (seq: CommandSequence) => {
		//console.log("AppContext:handleCmd:", seq);
		setCmdLog(prev => [...prev, seq]);

		if(seq.cmd === Command.ModeVisual) {
			console.log("MODE SWAP -> Visual");
			setMode(Modal.Visual);
		}
		if(seq.cmd === Command.ModeInsert) {
			console.log("MODE SWAP -> Insert");
			setMode(Modal.Insert);
		}
		if(seq.cmd === Command.Console) {
			console.log("MODE SWAP -> Commmand");
			setMode(Modal.Command);
		}
		
		if(seq.cmd === Command.Debug){
			console.log("[DEBUG] AppContext:");
			console.log("Zustand store:", useAppState.getState());
			console.log("Navigation handlers:", navigationHandlers.current);
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
			handleModeNormal,
			handleModeVisual,
			handleModeInsert,
			handleModeCommand,
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
