import { createContext, useEffect, useRef, useContext } from "react";
import { useStore } from "zustand";

import { AppContext } from "@app/app.context";
import { useAppState } from "@app/app.context.store";
import { getDirectory, getDirectoryHistory } from "@app/app.context.actions";

import { createNavigationState } from "./nav.provider.store";
import { scrollToActive, scrollToActive_Delayed, updateSelectionBuffer } from "@nav/nav.provider.actions";
import { NavigationContextType, NavWrapperItemType, NavigationItem } from "@nav/nav.types";

import { UIComponent } from "@context/context.types";
import { Command } from "@key/key.command";
import { KeyboardCursorHandle } from "@key/key.cursor.handler";
import { resultModeNormal } from "@key/key.module.handler.normal";

import { platform } from "@tauri-apps/plugin-os";

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children, component, initActive, tabOrder }: { children: React.ReactNode, component: UIComponent, initActive: boolean, tabOrder: number }) => {
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
	const fullscreenImage = useAppState(state => state.fullscreenImage);
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

	// selection
	const setSelectionStart = useStore(navigationState, s => s.setSelectionStart);
	const setSelectionEnd = useStore(navigationState, s => s.setSelectionEnd);

	// Generate unique ID for this navigation container
	const navigationId = useRef(Math.random().toString(36).substring(7));

	//
	// Events
	//
	const eventScrollToActive = () => { 
		console.log("scrolling");
		scrollToActive(navigationState);
	}

	//
	// Active handler
	//
	const active = useStore(navigationState, s => s.active);
	const setActive = useStore(navigationState, s => s.setActive);
	const isActive = (): boolean => { return navigationState.getState().active; }

	const getRegisteredElements = (): number => { return navigationState.getState().navItems.length }

	//
	// Command handler
	//

	const handleNavigationCmd = (seq: resultModeNormal): boolean => {
		if(seq.cmd === Command.Debug) {
			console.log(">>> Active NavigationContext (" + navigationId.current + ")");
			console.log("> Instanced Zustand store:", navigationState.getState());
			return true;
		}

		let length = navigationState.getState().navItems.length;

		// no items to navigate
		if(length === 0)
			return false;

		let activeItemID = navigationState.getState().navItemActive;

		// no active item, set first in array as active
		if(activeItemID === null) {
			activeItemID = navigationState.getState().navItems[0].id;
			setNavItemActive(activeItemID);
		}

		let item = navigationState.getState().navItems.find((i) => i.id === activeItemID);

		// this should never occur
		if(item === undefined) return false;

		// handle input for directory browser
		if(component === UIComponent.dirBrowserMain) {
			switch(seq.cmd){
				case Command.CursorLeft:
					getDirectory(useAppState, "..");
					return true;

				case Command.CursorRight:
					// ensure CursorRight will not ascend in the directory tree even when ".." is selected
					if(item.data === "..")
						return false;
					
					getDirectory(useAppState, item.data);
					return true;

				case Command.Return:
					getDirectory(useAppState, item.data);
					return true;
			};
		}

		switch(seq.cmd){
			case Command.Return:
				setFullscreenImage(true);
				setFullscreenImagePath(item.data);
				return true;
		};

		let curpos = navigationState.getState().navItems.findIndex((i) => i.id === activeItemID);
		let perRow = navigationState.getState().navItemsPerRow;
		// TODO: FEAT: FEAT_DYNAMIC_HALFPAGE
		// should be determined dynamically based on shown elements.
		// placeholder: directory browser jumps 10 rows, thumbnail grid 3 rows
		let halfPage = component === UIComponent.dirBrowserMain ? 10 : 3;

		if(curpos === -1 || length === 0 || perRow === 0) {
			// TODO: FEAT: FEAT_FRONTEND_LOGGING
			console.error(`nav.provider: invalid cursor state: length=${length}, curpos=${curpos}, perRow=${perRow}`);
			return false;
		}

		let cur = KeyboardCursorHandle(seq.cmdSequence, length, curpos, perRow, halfPage);

		if(cur === null)
			return false;

		// update cursor position
		navigationState.getState().setNavItemActive(
			navigationState.getState().navItems[cur].id
		);

		// Swap images in fullscreen
		if(useAppState.getState().fullscreenImage) {
			setFullscreenImagePath(navigationState.getState().navItems[cur].data);
		}

		return true;
	};

	//
	// Selection handling
	//

	const handleSelectionCmd = (resultNormal: resultModeNormal): boolean => {
		switch(resultNormal.cmd) {
			case Command.ModeVisualExit:
				console.info("Visual->ModeVisualExit called");

				if(navigationState.getState().selectionStart !== null) {
					console.info("Visual->ModeVisualExit: Selection cleanup.");
					setSelectionStart(null);
					setSelectionEnd(null);
				}

				// TODO: store selection state for 'gv'

				updateSelectionBuffer(useAppState, navigationState);
				return true;
			case Command.Return:
				console.log("Visual->Command.Return");

				// TODO: handle return

				return true;
		};

		let selectionStart = navigationState.getState().selectionStart;

		if(selectionStart === null){
			let activeItemID = navigationState.getState().navItemActive;
			let curpos = navigationState.getState().navItems.findIndex((i) => i.id === activeItemID);
			setSelectionStart(curpos);

			console.log(`handleSelectionCmd->selection start: ${curpos}`);
		}


		let cursorHandler = handleNavigationCmd(resultNormal);

		let postActiveItemID = navigationState.getState().navItemActive;
		let postpos = navigationState.getState().navItems.findIndex((i) => i.id === postActiveItemID);
		setSelectionEnd(postpos);

		console.log(`handleSelectionCmd->selection end: ${postpos}`);
		
		updateSelectionBuffer(useAppState, navigationState);
		return cursorHandler;
	}

	//
	// Parent context registration
	//

	useEffect(() => {
		setActive(initActive);
		setNavCtxId(navigationId.current);
		console.log("navctx:register_navctx_id", navigationState.getState().navigationContextId);
		parentCtx.registerNavigationContainer(navigationId.current, {
			id: navigationId.current,
			component,
			handleNavCmd: handleNavigationCmd,
			handleSelectionCmd: handleSelectionCmd,
			eventScrollToActive,
			active: isActive,
			setActive,
			tabOrder,
			getRegisteredElements,
		});
		return () => {
			parentCtx.unregisterNavigationContainer(navigationId.current);
		};
	}, []);

	//
	// Child navigation element registration
	//

	// nav element registration
	const navRegister = (navItem: NavigationItem) => {
		registerNavItem(navItem);
	};

	// nav element unregistration
	const navUnregister = (id: string) => {
		if(navItems.length === 1) setNavItemActive(null);
		unregisterNavItem(id);
	}

	//
	// Effects
	//

	// default cursor to first nav element
	useEffect(() => {
		if(component === UIComponent.dirBrowserMain) {
			const historyId = getDirectoryHistory(useAppState);
			const lastItem = historyId && navItems.find((a) => a.data === historyId);

			if(lastItem) {
				setNavItemActive(lastItem.id);
				return;
			}
		}
		if(navItems.length > 0) setNavItemActive(navItems[0].id);
	}, [navItems]);

	// scroll to cursor
	useEffect(() => {
		scrollToActive(navigationState);
	}, [navItemActive]);

	// scroll to cursor on display
	useEffect(() => {
		if(!active) return;

		// delay scroll call on linux to give DOM time to finish, see: KNOWN_ISSUE_WEBKIT_SCROLLTO
		if(platform() === 'linux'){
			scrollToActive_Delayed(navigationState, useAppState);
			return;
		}

		scrollToActive(navigationState);
	}, [active, fullscreenImage]);


	//
	// Exports
	//

	return (
		<NavigationContext.Provider value={{ 
			//cmdLog, 
			navCtxId,
			navigationState,

			navRegister,
			navUnregister,

			itemsPerRow,
			setItemsPerRow,

			navItemActive,
			active,
			setActive,
		}}>
			<div style={{
				display: active ? 'block' : 'none'
			}}>
				{children}
			</div>
		</NavigationContext.Provider>
	);
};

export const useCommand = (): NavigationContextType => {
	const ctx = useContext(NavigationContext);
	if (!ctx) throw new Error("useCommand must be used within CommandProvider");
	return ctx;
};
