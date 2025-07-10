import { createContext, useEffect, useRef, useContext } from "react";
import { useStore } from "zustand";

import { AppContext } from "@app/app.context";
import { useAppState } from "@app/app.context.store";
import { KeyboardCursorHandle } from "@app/app.cursor.handler";
import { getDirectory } from "@app/app.context.actions";

import { createNavigationState } from "./nav.provider.store";
import { NavigationContextType, NavWrapperItemType, NavigationItem } from "@nav/nav.types";

import { UIComponent } from "@context/context.types";
import { Command, CommandSequence } from "@key/key.command";

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
	// Active handler
	//
	const active = useStore(navigationState, s => s.active);
	const setActive = useStore(navigationState, s => s.setActive);
	const isActive = (): boolean => { return navigationState.getState().active; }

	const getRegisteredElements = (): number => { return navigationState.getState().navItems.length }

	//
	// Command handler
	//

	const handleNavigationCmd = (seq: CommandSequence): boolean => {
		if(navigationState.getState().navItems.length > 0 && navigationState.getState().navItemActive === null) {
			setNavItemActive(navigationState.getState().navItems[0].id);
		}

		//setCmdLog(prev => [...prev, seq]);

		if(seq.cmd === Command.Debug){
			console.log(">>> Active NavigationContext (" + navigationId.current + ")");
			console.log("> Instanced Zustand store:", navigationState.getState());
			return true;
		}

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			if(useAppState.getState().fullscreenImage)
				setFullscreenImage(false);
			return true;
		}
		if(seq.cmd === Command.Return){
			let item  = navigationState.getState().navItems
			.find((i) => i.id === navigationState.getState().navItemActive);

			if(item?.itemType === NavWrapperItemType.FileBrowser){
				getDirectory(useAppState, item.data);
			}
			else if(item?.itemType === NavWrapperItemType.Image){
				setFullscreenImage(true);
				setFullscreenImagePath(item.data);
			}
			return true;
		}
		if(seq.cmd === Command.Error){
			console.log("navctx:handleCmd:error");

			return false;
		}

		// Navigation keys
		let cur = KeyboardCursorHandle(
			seq, 
			navigationState.getState().navItems, 
			navigationState.getState().navItemsPerRow, 
			navigationState.getState().navItemActive
		);
		if(cur != null)  {
			if(component === UIComponent.dirBrowserMain && seq.cmd === Command.CursorLeft){
				getDirectory(useAppState, "..");
				return true;
			}
			if(component === UIComponent.dirBrowserMain && seq.cmd === Command.CursorRight){
				let path  = navigationState.getState().navItems
				.find((i) => i.id === navigationState.getState().navItemActive);
				if(path !== undefined) {
					getDirectory(useAppState, path.data)
					return true;
				}
			}
			// update cursor position
			navigationState.getState().setNavItemActive(
				navigationState.getState().navItems[cur].id
			);
			// Swap images in fullscreen
			if(useAppState.getState().fullscreenImage){
				setFullscreenImagePath(navigationState.getState().navItems[cur].data);
			}

			return true;
		}
		return false;
	};

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
			active: isActive,
			setActive,
			tabOrder,
			getRegisteredElements
		});
		return () => {
			parentCtx.unregisterNavigationContainer(navigationId.current);
		};
	}, []);

	//
	// Child navigation element registration
	//

	// default cursor to first nav element
	useEffect(() => {
		if(navItems.length > 0) setNavItemActive(navItems[0].id);
	}, [navItems]);

	// scroll to cursor
	useEffect(() => {
		const cursorElement = navItems
		.filter((a) => a.id === navItemActive);

		if(cursorElement.length !== 1 || cursorElement[0].ref.current === null) return;

		const rect = cursorElement[0].ref.current.getBoundingClientRect();
		const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);

		scrollTo({
			left: 0,
			top: targetY,
			behavior: "smooth",
		});
	}, [navItemActive]);

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
