import { StoreApi } from "zustand";
import { INavigationState } from "@nav/nav.provider.store";
import { NavWrapperUIState } from "@nav/nav.types";
import { IAppState } from "../app/app.context.store";

export function activeNavWrapper(navProviderStore: StoreApi<INavigationState>, activeProvider: boolean, id: string): NavWrapperUIState {
	let navItemActive = navProviderStore.getState().navItemActive;
	if(navItemActive !== id) 
		return NavWrapperUIState.Inactive;

	if(!activeProvider)
		return NavWrapperUIState.InactiveProvider;

	return NavWrapperUIState.Active;
}

export function scrollToActive(navProvider: StoreApi<INavigationState>){
	const cursorElement = navProvider.getState().navItems
	.filter((a) => a.id === navProvider.getState().navItemActive);

	if(cursorElement.length !== 1 || cursorElement[0].ref.current === null) return;

	const rect = cursorElement[0].ref.current.getBoundingClientRect();
	// TODO: get rid of magic number tuned layout
	const targetY = window.scrollY + rect.top - (window.innerHeight / 2) - (rect.height * 4.5);

	scrollTo({
		left: 0,
		top: targetY,
		behavior: "instant",
	});
}

export function scrollToActive_Delayed(navProvider: StoreApi<INavigationState>, appStore: StoreApi<IAppState>){
	// KNOWN_ISSUE_WEBKIT_SCROLLTO
	// As of July 2025, webkit on Linux fails to calculate the final position of grid elements in time
	// for scrollToActive to correctly scroll to the element. Adding a slight delay works around the issue,
	// however this value will likely need to be configurable to account for system speed.
	setTimeout(() => {
		scrollToActive(navProvider);
	}, appStore.getState().workaroundScrollToDelay);
}
