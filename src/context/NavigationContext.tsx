import { Command, CommandSequence } from '../keyboard/Command';
import { createContext, useEffect, useRef, useContext, useState } from "react";
import { KeyboardCursorHandle } from "./CommandCursorHandler";
import { NavigableItemType } from "./NavigableItem";
import { RustApiAction } from "./../filesystem/RustApiBridge";
import { invoke } from "@tauri-apps/api/core";
import { vimagesCtx, useGlobalCtx } from './vimagesCtx';

type NavigationContextType = {
	currentDir: React.MutableRefObject<string>;
	cmdLog: CommandSequence[];

	navActiveId: React.RefObject<string | null>;
	navRegister: (navItem: NavigationItem) => void;
	navUnregister: (id: string) => void;
	navItemsRef: React.RefObject<NavigationItem[]>;

	imagesPerRow: React.MutableRefObject<number>;
};

export type NavigationItem = {
	id: string;
	ref: React.RefObject<HTMLElement>;
	itemType: NavigableItemType;
	data: string;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
	const parentCtx = useContext(vimagesCtx);
	if (!parentCtx) throw new Error("NavigationProvider must be inside AppProvider");

	const { currentDir, updateDirectory } = useGlobalCtx();

	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	const imagesPerRow = useRef<number>(0);

	const navActiveId = useRef<string | null>(null);
	const navItemsRef = useRef<NavigationItem[]>([]);

	// Generate unique ID for this navigation container
	const navigationId = useRef(Math.random().toString(36).substring(7));

	const handleNavigationCmd = (seq: CommandSequence): boolean => {
		// Handle navigation-specific commands
		//console.log("navctx:handleCmd");

		setCmdLog(prev => [...prev, seq]);

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			console.log("navctx:handleCmd:escape");
		}
		if(seq.cmd === Command.Return){
			//console.log("navctx:handleCmd:return");

			let item = navItemsRef.current.find((i) => i.id === navActiveId.current);
			if(item?.itemType === NavigableItemType.FileBrowser){
				//console.log("navctx:handleCmd:currentDir: " + currentDir.current);
				//console.log("navctx:handleCmd:data: " + item.data);

				if (item.data === "..") {
					invoke(RustApiAction.GetParentPath, { path: currentDir.current })
						.then(response => {
							//console.log("New currentDir:", response);
							//currentDir.current = response as string;
							// TODO: janky and needs a proper fix
							updateDirectory(response as string);
						})
						.catch(console.error);
					return true;
				}

				// TODO: platform independent - resolve on rusts end instead
				currentDir.current = currentDir.current + "\\" + item.data;
				return true;					

			}
		}
		if(seq.cmd === Command.Error){
			console.log("navctx:handleCmd:error");
			return false;
		}

		if(navActiveId.current === null) navActiveId.current = (navItemsRef.current[0].id);

		// Navigation keys
		// TODO: error handling
		let cur = KeyboardCursorHandle(seq, navItemsRef, imagesPerRow, navActiveId);
		if(cur != null)  {
			navActiveId.current = (navItemsRef.current[cur].id);
			return true;
		}
		else {
			navActiveId.current = (navItemsRef.current[0].id);
			return true;
		}
	};

	//
	// Parent context registration
	//

	useEffect(() => {
		parentCtx.registerNavigationContainer(navigationId.current, handleNavigationCmd);
		return () => {
			parentCtx.unregisterNavigationContainer(navigationId.current);
		};
	}, []);

	//
	// Child navigation element registration
	//

	const navRegister = (navItem: NavigationItem) => {
		//console.log("ctx:navRegister:", navItem);
		navItemsRef.current?.push(navItem);
		if (navItemsRef.current?.length === 1) navActiveId.current = navItem.id;
	};

	const navUnregister = (id: string) => {
		//console.log("navctx:unregister: " + id);
		navItemsRef.current = navItemsRef.current?.filter((i) => i.id !== id);
		if (navActiveId.current === id) navActiveId.current = null;
	}

	//
	// Command handling
	//

	return (
		<NavigationContext.Provider value={{ 
			currentDir, 
			cmdLog, 

			navRegister,
			navUnregister,
			navActiveId,
			navItemsRef,

			imagesPerRow,
		}}>
			{children}
		</NavigationContext.Provider>
	);
};

export const useCommand = (): NavigationContextType => {
	const ctx = useContext(NavigationContext);
	if (!ctx) throw new Error("useCommand must be used within CommandProvider");
	return ctx;
};
