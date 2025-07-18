import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useContext } from "react";

import { useAppState } from "./app.context.store";
import { getDirectory, nextNavProvider } from "./app.context.actions";

import { NormalModeHandler } from "@app/handler/mode.normal";
import { CommandModeHandler } from "@app/handler/mode.command";
import { VisualModeHandler } from "@app/handler/mode.visual";
import { InsertModeHandler } from "@app/handler/mode.insert";
import { NavigationHandle, RustApiAction, VimagesConfig } from "@context/context.types";

import { CommandSequence } from "@key/key.command";
import { resultModeCommand } from "@key/key.module.handler.cmd";
import { resultModeNormal } from "@key/key.module.handler.normal";

import { getVersion } from "@tauri-apps/api/app";

type AppContextType = {
	// Navigation container management
	registerNavigationContainer: (id: string, handler: NavigationHandle) => void;
	unregisterNavigationContainer: (id: string) => void;

	// Main command handlers
	handleModeNormal: (resultNormal: resultModeNormal) => void;
	handleModeVisual: (selection: string[], sequence: CommandSequence) => void;
	handleModeInsert: (input: string, sequence: CommandSequence) => void;
	handleModeCommand: (resultCommand: resultModeCommand) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
	const setAxumPort = useAppState(state => state.setAxumPort);
	const setVersion = useAppState(state => state.setVimagesVersion);

	useEffect(() => {
		getVersion().then(setVersion);

		invoke(RustApiAction.GetAxumPort)
			.then(res => { setAxumPort(res as string) });
		// TODO: proper result parsing, version check, etc.
		invoke(RustApiAction.GetConfig)
			.then(response => {
				const res = response as VimagesConfig;
				getDirectory(useAppState, res.last_path);
			});

		useAppState.getState().setWorkspace("DirBrowser", true);
		nextNavProvider(useAppState);
	}, []);

	//
	// NavigationContainers
	//

	const registerNavigationContainer = (id: string, handler: NavigationHandle) => {
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

	const handleModeCommand = (resultCmd: resultModeCommand) => {
		CommandModeHandler(resultCmd);
	}

	const handleModeNormal = (resultNormal: resultModeNormal) => {
		NormalModeHandler(resultNormal);
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
