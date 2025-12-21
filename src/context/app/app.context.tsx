import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";

import { createContext, useEffect, useContext } from "react";

import { useAppState } from "./app.context.store";
import { addInfoMessage, getDirectory, raiseError, switchToWorkspace } from "./app.context.actions";

import { NormalModeHandler } from "@app/handler/mode.normal";
import { CommandModeHandler } from "@app/handler/mode.command";
import { VisualModeHandler } from "@app/handler/mode.visual";
import { InsertModeHandler } from "@app/handler/mode.insert";
import { eventHandleMsgInfoWindow, eventHandleQueueState, eventHandleQueueStringArray } from "@app/app.event.listeners";
import { IPC_DataStringArray, IPC_MsgInfoWindow, IPC_QueueStatus } from "@app/app.event.types";

import { NavigationHandle, RustApiAction, UIComponent, VimagesConfig, Workspace } from "@context/context.types";

import { Command, getDefaultKeyMap } from "@key/key.command";
import { resultModeCommand } from "@key/key.module.handler.cmd";
import { resultModeNormal } from "@key/key.module.handler.normal";
import { parseCommand, setKeybinds } from "@key/key.module";

//
// Critical error handling
//

// Prevents any input from propagating from the orchestrator (this file) when true.
let APP_ERROR_LOCK = false;

export function raiseCriticalAppError(callpoint: string, reason: string, rawError = undefined){
	APP_ERROR_LOCK = true;
	console.error("raiseCriticalAppError was called.");
	console.error(" -> callpoint: " + callpoint);
	console.error(" -> reason: " + reason);
	console.error("error dump:");
	console.error(rawError);
}

//
// Global context
//

type AppContextType = {
	// Navigation container management
	registerNavigationContainer: (id: string, handler: NavigationHandle) => void;
	unregisterNavigationContainer: (id: string, component: UIComponent, workspace: Workspace) => void;

	// Main command handlers
	handleModeNormal: (resultNormal: resultModeNormal) => void;
	handleModeVisual: (resultNormal: resultModeNormal) => void;
	handleModeInsert: (resultInsert: resultModeCommand) => void;
	handleModeCommand: (resultCommand: resultModeCommand) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

	//
	// Initialization
	//

	useEffect(() => {
		// Get vimages version
		getVersion().then(ver => useAppState.getState().setVimagesVersion(ver));

		// Get port for binaries pipeline
		invoke(RustApiAction.GetAxumPort)
			.then(res => { 
				useAppState.getState().setAxumPort(res as string) 
			})
			.catch(error => {
				raiseCriticalAppError("APP_INIT", "Failed to get axum port.", error);
			});

		// Get config or default
		invoke(RustApiAction.GetConfig)
			.then(response => {
				const res = response as VimagesConfig;

				if(res.vimages_version !== useAppState.getState().vimages_version) {
					let expVer = useAppState.getState().vimages_version;
					let confVer = res.vimages_version;

					console.warn("Mismatching vimages config version.");
					console.warn(` -> Found config for '${confVer}'`);
					console.warn(` -> Expected '${expVer}'`);

					addInfoMessage(useAppState, `Found config for ${confVer}, expected ${expVer}.`);
				}

				// load last directory
				getDirectory(useAppState, res.last_path);

				// set ui options
				useAppState.getState().setTitlebarRender(res.titlebar);
				useAppState.getState().setErrorDisplayGeneric(res.generic_errors);

				// set workarounds
				useAppState.getState().setWorkaroundScrollToDelay(res.scroll_delay);

				// setup keybindings
				let keyMap = new Map<string, Command>();
				let defaultKeybinds = getDefaultKeyMap();
				let expectedKeybinds = defaultKeybinds.size;
				let mappedKeys = 0;

				for(const k of res.keybinds) {
					let cmd = parseCommand(k.command);
					if(cmd !== null) {
						keyMap.set(k.keybind, cmd);
						mappedKeys += 1;
					}
					else {
						console.log("Failed to map: " + k.keybind);
						addInfoMessage(useAppState, `Failed to map: '${k.keybind}'.`);
					}
				}

				// NOTE: needs to be updated in the future.
				// should only revert to defaults if core commands are unbound,
				// which the app can't work without.
				// this will regenerate eagerly, which is good enough for now.
				if(mappedKeys != expectedKeybinds) {
					console.error(`Mapped ${mappedKeys} keys, expected ${expectedKeybinds}`);
					console.error(" -> Failed to map keys, restoring defaults.");

					addInfoMessage(useAppState, `Mapped ${mappedKeys} keys, expected ${expectedKeybinds}.`);
					addInfoMessage(useAppState, "Restoring default keybindings.");

					keyMap = defaultKeybinds;
				}

				if(setKeybinds(keyMap)) return;

				// attempt falling back to default keybinds
				console.error("Failed to set keybinds, trying again with defaults.");
				addInfoMessage(useAppState, "Failed to set keybinds, trying again with defaults.");

				if(!setKeybinds(defaultKeybinds)) {
					addInfoMessage(useAppState, "Critical: Failed to set default keybinds.");
					raiseCriticalAppError("INIT", "Failed to set default keybinds");
				}
			})
		.catch(error => {
				raiseCriticalAppError("INIT", "Failed to load config", error);
			});

		if(APP_ERROR_LOCK) {
			addInfoMessage(useAppState, "Critical error occurred during initialization.");
			raiseError(useAppState, "Critical error occurred during initialization.");
			return;
		}

		switchToWorkspace(useAppState, Workspace.DirectoryBrowser);
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
		const setupListenerQueueData = async () => {
			return await listen<IPC_DataStringArray>(
				'msg-queue-string-array', 
				(event) => { eventHandleQueueStringArray(event, useAppState) }, 
				{ target: 'global-handler' });
		};

		const cleanupMsgInfoWindow = setupListenerMsgInfoWindow();
		const cleanupQueueState = setupListenerQueueState();
		const cleanupQueueData = setupListenerQueueData();

		return () => {
			cleanupMsgInfoWindow.then(unlisten => unlisten?.());
			cleanupQueueState.then(unlisten => unlisten?.());
			cleanupQueueData.then(unlisten => unlisten?.());
		};
	}, []);

	//
	// NavigationContainers
	//

	const registerNavigationContainer = (id: string, handler: NavigationHandle) => {
		if(APP_ERROR_LOCK) return;

		useAppState.getState().registerNavigationHandler(id, handler);
		useAppState.getState().addWorkspace(handler.workspace, handler.component);
	};

	const unregisterNavigationContainer = (id: string, component: UIComponent, workspace: Workspace) => {
		if(APP_ERROR_LOCK) return;

		useAppState.getState().unregisterNavigationHandler(id);
		useAppState.getState().removeWorkspace(workspace, component);
	};	

	//
	// Input handling
	//

	const handleModeVisual = (sequence: resultModeNormal) => {
		if(APP_ERROR_LOCK) return;

		VisualModeHandler(sequence);
	}
	const handleModeInsert = (resultInsert: resultModeCommand) => {
		if(APP_ERROR_LOCK) return;

		InsertModeHandler(resultInsert);
	}

	const handleModeCommand = (resultCmd: resultModeCommand) => {
		if(APP_ERROR_LOCK) return;

		CommandModeHandler(resultCmd);
	}

	const handleModeNormal = (resultNormal: resultModeNormal) => {
		if(APP_ERROR_LOCK) return;

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
