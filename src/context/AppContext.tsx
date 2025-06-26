import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useContext } from "react";

import { RustApiAction } from "@filesystem/RustApiBridge";
import { CommandSequence } from "@keyboard/Command";

import { useAppState } from "./AppContextStore";
import { NormalModeHandler } from "./ModeHandlers/NormalModeHandler";
import { CommandModeHandler } from "./ModeHandlers/CommandModeHandler";
import { VisualModeHandler } from "./ModeHandlers/VisualModeHandler";
import { InsertModeHandler } from "./ModeHandlers/InsertModeHandler";

export type NavigationHandler = (cmd: CommandSequence) => boolean; // returns true if handled

type AppContextType = {
	// Navigation container management
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
	const setAxumPort = useAppState(state => state.setAxumPort);

	useEffect(() => {
		invoke(RustApiAction.GetAxumPort)
			.then(res => {setAxumPort(res as string)});
		invoke(RustApiAction.GetCurrentPath)
			.then(res => {setCurrentDir(res as string)
			});
	}, []);

	//
	// NavigationContainers
	//

	const registerNavigationContainer = (id: string, handler: NavigationHandler) => {
		useAppState.getState().registerNavigationHandler(id, handler);
	};

	const unregisterNavigationContainer = (id: string) => {
		useAppState.getState().unregisterNavigationHandler(id);
	};	

	//
	// Input handling
	//

	const handleModeVisual = (selection: string[], sequence: CommandSequence) => {
		VisualModeHandler(selection, sequence);
	}
	const handleModeInsert = (input: string, sequence: CommandSequence) => {
		InsertModeHandler(input, sequence);
	}

	const handleModeCommand = (input: string, sequence: CommandSequence) => {
		CommandModeHandler(input, sequence);
	}

	const handleModeNormal = (seq: CommandSequence) => {
		NormalModeHandler(seq);
	}

	return (
		<AppContext.Provider value={{ 
			handleModeNormal,
			handleModeVisual,
			handleModeInsert,
			handleModeCommand,
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
