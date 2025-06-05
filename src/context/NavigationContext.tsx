import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useRef, useContext } from "react";

import { Command, CommandSequence } from "../keyboard/Command";
import { RustApiAction } from "./../filesystem/RustApiBridge";

import { AppContext } from "./AppContext";
import { useAppState } from "./AppContextStore";
import { KeyboardCursorHandle } from "./CommandCursorHandler";
import { NavigableItemType } from "./NavigableItem";

import { createNavigationState } from "./NavigationContextStore";
import { useStore } from "zustand";

type NavigationContextType = {
	//cmdLog: CommandSequence[];

	navRegister: (navItem: NavigationItem) => void;
	navUnregister: (id: string) => void;
	navItemsRef: React.RefObject<NavigationItem[]>;

	imagesPerRow: React.MutableRefObject<number>;

	navItemActive: string | null;
	
	itemsPerRow: number;
	setItemsPerRow: (n: number) => void;
};

export type NavigationItem = {
	id: string;
	ref: React.RefObject<HTMLElement>;
	itemType: NavigableItemType;
	data: string;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
	// Ensure AppContext is available
	const parentCtx = useContext(AppContext);
	if (!parentCtx) throw new Error("NavigationProvider must be inside VimagesCtxProvider");

	// Set up ref to zustand store for this instance
	const navigationStateRef = useRef<ReturnType<typeof createNavigationState>>();
	if (!navigationStateRef.current) {
	  navigationStateRef.current = createNavigationState();
	}
	const navigationState = navigationStateRef.current;	

	const currentDir = useAppState(state => state.currentDir);
	const setCurrentDir	= useAppState(state => state.setCurrentDir);

	//const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	
	const imagesPerRow = useRef<number>(0);

	const itemsPerRow = useStore(navigationState, s => s.navItemsPerRow);
	const setItemsPerRow = useStore(navigationState, s => s.setItemsPerRow);

	const navItems = useStore(navigationState, s => s.navItems);
	const registerNavItem = useStore(navigationState, s => s.registerNavItem);
	const unregisterNavItem = useStore(navigationState, s => s.unregisterNavItem);
	const navItemActive = useStore(navigationState, s => s.navItemActive);
	const setNavItemActive = useStore(navigationState, s => s.setNavItemActive);

	const navActiveId = useRef<string | null>(null);
	const navItemsRef = useRef<NavigationItem[]>([]);

	// Generate unique ID for this navigation container
	const navigationId = useRef(Math.random().toString(36).substring(7));

	// Handle navigation-specific commands
	const handleNavigationCmd = (seq: CommandSequence): boolean => {
		//console.log("navctx:handleCmd");

		if(navigationState.getState().navItems.length > 0 && navigationState.getState().navItemActive === null) {
			console.log("UPDATE CURSOR");
			setNavItemActive(navigationState.getState().navItems[0].id);
		}
		//setCmdLog(prev => [...prev, seq]);

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			console.log("navctx:handleCmd:escape");
		}
		if(seq.cmd === Command.Return){
			//console.log("navctx:handleCmd:return");

			let item  = navigationState.getState().navItems
				.find((i) => i.id === navigationState.getState().navItemActive);

			console.log("handleCmd:item:", item);

			// TODO: add vimage type support
			if(item?.itemType === NavigableItemType.FileBrowser){
				console.log("navctx:handleCmd:currentDir: " + useAppState.getState().currentDir);
				console.log("navctx:handleCmd:data: " + item.data);

				if (item.data === "..") {
					invoke(RustApiAction.GetParentPath, { path: useAppState.getState().currentDir })
						.then(response => {
							setCurrentDir(response as string);
						})
						.catch(console.error);
					return true;
				}

				// TODO: make platform independent - resolve on rusts end instead
				setCurrentDir(useAppState.getState().currentDir + "\\" + item.data);
				return true;					
			}
		}
		if(seq.cmd === Command.Error){
			console.log("navctx:handleCmd:error");
			return false;
		}

		if(navActiveId.current === null) navActiveId.current = (navItemsRef.current[0].id);

		// Navigation keys
		console.log("handleCmd", navigationState.getState());
		
		let cur = KeyboardCursorHandle(
			seq, 
			navigationState.getState().navItems, 
			navigationState.getState().navItemsPerRow, 
			navigationState.getState().navItemActive
		);
		if(cur != null)  {
			//navActiveId.current = (navItemsRef.current[cur].id);

			navigationState.getState().setNavItemActive(
				navigationState.getState().navItems[cur].id
			);

			return true;
		}
		return false;
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
	
	useEffect(() => {
		if(navItems.length > 0) setNavItemActive(navItems[0].id);
	}, [navItems]);

	const navRegister = (navItem: NavigationItem) => {
		registerNavItem(navItem);
		//console.log("REG", navigationState.getState());

		// TODO: remove after refactoring VimageGrid
		navItemsRef.current?.push(navItem);
		if (navItemsRef.current?.length === 1) navActiveId.current = navItem.id;
	};

	const navUnregister = (id: string) => {
		if(navItems.length === 1) setNavItemActive(null);
		unregisterNavItem(id);

		// TODO: remove after refactoring VimageGrid
		navItemsRef.current = navItemsRef.current?.filter((i) => i.id !== id);
		if (navActiveId.current === id) navActiveId.current = null;
	}

	//
	// Command handling
	//

	return (
		<NavigationContext.Provider value={{ 
			//cmdLog, 

			navRegister,
			navUnregister,
			navItemsRef,

			imagesPerRow,

			itemsPerRow,
			setItemsPerRow,
			navItemActive,
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
