import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";

import { createContext, useEffect, useContext } from "react";

import { useAppState } from "./app.context.store";
import { getDirectory, getDirectorySkipLock, nextNavProvider, setWorkspace } from "./app.context.actions";

import { NormalModeHandler } from "@app/handler/mode.normal";
import { CommandModeHandler } from "@app/handler/mode.command";
import { VisualModeHandler } from "@app/handler/mode.visual";
import { InsertModeHandler } from "@app/handler/mode.insert";
import { eventHandleMsgInfoWindow, eventHandleQueueState } from "@app/app.event.listeners";
import { IPC_MsgInfoWindow, IPC_QueueStatus } from "@app/app.event.types";

import { NavigationHandle, RustApiAction, VimagesConfig, Workspace } from "@context/context.types";

import { Command, CommandSequence, getDefaultKeyMap } from "@key/key.command";
import { resultModeCommand } from "@key/key.module.handler.cmd";
import { resultModeNormal } from "@key/key.module.handler.normal";
import { parseCommand, setKeybinds } from "@key/key.module";

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
				// NOTE: lock doesn't clean up properly in react strict mode
				// the callback is cleared before it can remove the path from the lock
				getDirectorySkipLock(useAppState, res.last_path);

				let keyMap = new Map<string, Command>();
				let defaultKeybinds = getDefaultKeyMap();
				let expectedKeybinds = defaultKeybinds.size;
				let mappedKeys = 0;

				for(const k of res.keybinds) {
					let cmd = parseCommand(k.command);
					if(cmd !== null) {
						keyMap.set(k.keybind, cmd);
						// console.log("Mapping: " + k.keybind + " -> " + Command[cmd]);
						mappedKeys += 1;
					}
					else {
						console.log("Failed to map: " + k.keybind);
					}
				}

				// NOTE: needs to be updated in the future.
				// should only revert to defaults if core commands are unbound,
				// which the app can't work without.
				// this will regenerate eagerly, which is good enough for now.
				if(mappedKeys != expectedKeybinds) {
					console.error(`Mapped ${mappedKeys} keys, expected ${expectedKeybinds}`);
					console.error("Failed to map keys, restoring defaults.");
					keyMap = defaultKeybinds;
				}

				if(!setKeybinds(keyMap))
					console.error("Failed to set keybinds"); // TODO: fallback
			});

		setWorkspace(useAppState, Workspace.DirectoryBrowser);
	}, []);

	//
	// event listener registration 
	//

	useEffect(() => {
		const setupListenerMsgInfoWindow = async () => {
			return await listen<IPC_MsgInfoWindow>(
				'msg-info-window', (event) => { eventHandleMsgInfoWindow(event, useAppState) }, { target: 'global-handler' });
		};
		const setupListenerQueueState = async () => {
			return await listen<IPC_QueueStatus>(
				'msg-queue-status', 
				(event) => { eventHandleQueueState(event, useAppState) }, 
				{ target: 'global-handler' });
		};

		const cleanupMsgInfoWindow = setupListenerMsgInfoWindow();
		const cleanupQueueState = setupListenerQueueState();

		return () => {
			cleanupMsgInfoWindow.then(unlisten => unlisten?.());
			cleanupQueueState.then(unlisten => unlisten?.());
		};
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
