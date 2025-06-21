import { invoke } from "@tauri-apps/api/core";
import { createContext, useEffect, useRef, useContext } from "react";

import { Command, CommandSequence } from "@keyboard/Command";
import { RustApiAction } from "@filesystem/RustApiBridge";

import { AppContext } from "./AppContext";
import { useAppState } from "./AppContextStore";
import { KeyboardCursorHandle } from "./CommandCursorHandler";
import { NavigableItemType } from "./NavigableItem";
import { EntityDirectory } from "./ContextTypes";

import { createNavigationState } from "./NavigationContextStore";
import { NavigationContextType, NavigationItem } from "./NavigationContextTypes";
import { useStore } from "zustand";

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

	//
	// State
	//

	// global state
	const setCurrentDir = useAppState(state => state.setCurrentDir);
	const setImages = useAppState(state => state.setImages);
	const setDirectories = useAppState(state => state.setDirectories);
	const setFullscreenImage = useAppState(state => state.setFullscreenImage);
	const setFullscreenImagePath = useAppState(state => state.setFullscreenImagePath);

	// navigation context instanced state
	const itemsPerRow = useStore(navigationState, s => s.navItemsPerRow);
	const setItemsPerRow = useStore(navigationState, s => s.setItemsPerRow);

	const navCtxId = useStore(navigationState, s => s.navigationContextId);
	const setNavCtxId = useStore(navigationState, s => s.setNavigationContextId);
	const navItems = useStore(navigationState, s => s.navItems);
	const registerNavItem = useStore(navigationState, s => s.registerNavItem);
	const unregisterNavItem = useStore(navigationState, s => s.unregisterNavItem);
	const navItemActive = useStore(navigationState, s => s.navItemActive);
	const setNavItemActive = useStore(navigationState, s => s.setNavItemActive);

	// Generate unique ID for this navigation container
	const navigationId = useRef(Math.random().toString(36).substring(7));

	//
	// Command handler
	//

	const handleNavigationCmd = (seq: CommandSequence): boolean => {
		if(navigationState.getState().navItems.length > 0 && navigationState.getState().navItemActive === null) {
			setNavItemActive(navigationState.getState().navItems[0].id);
		}

		//setCmdLog(prev => [...prev, seq]);

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			if(useAppState.getState().fullscreenImage)
				setFullscreenImage(false);
		}
		if(seq.cmd === Command.Return){
			console.log("navctx:handleCmd:return:currentDir: " + useAppState.getState().currentDir);

			let item  = navigationState.getState().navItems
			.find((i) => i.id === navigationState.getState().navItemActive);

			if(item?.itemType === NavigableItemType.FileBrowser){
				invoke(RustApiAction.GetDir, { 
					path: useAppState.getState().currentDir, 
					relPath: item.data 
				})
					.then(response => {
						const res = response as EntityDirectory;
						setCurrentDir(res.path);
						setImages(res.images);
						setDirectories(res.sub_dirs);
					})
					.catch(console.error);
				return true;
			}
			else if(item?.itemType === NavigableItemType.Image){
				setFullscreenImage(true);
				console.log("Setting fullscreen image path to: " + item.data);
				setFullscreenImagePath(item.data);
			}
		}
		if(seq.cmd === Command.Error){
			console.log("navctx:handleCmd:error");

			return false;
		}

		// Handle no available elements being selected: move cursor to first element.
		if(navigationState.getState().navItemActive === null && navItems.length > 0) {
			setNavItemActive(navItems[0].id);
		}

		// Navigation keys
		let cur = KeyboardCursorHandle(
			seq, 
			navigationState.getState().navItems, 
			navigationState.getState().navItemsPerRow, 
			navigationState.getState().navItemActive
		);
		if(cur != null)  {
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
		setNavCtxId(navigationId.current);
		console.log("navctx:register_navctx_id", navigationState.getState().navigationContextId);
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
	};

	const navUnregister = (id: string) => {
		if(navItems.length === 1) setNavItemActive(null);
		unregisterNavItem(id);
	}

	//
	// Exports
	//

	return (
		<NavigationContext.Provider value={{ 
			//cmdLog, 
			navCtxId,

			navRegister,
			navUnregister,

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
