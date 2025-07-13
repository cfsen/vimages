import { StoreApi } from "zustand";
import { INavigationState } from "@nav/nav.provider.store";
import { NavWrapperUIState } from "@nav/nav.types";

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
	const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);

	scrollTo({
		left: 0,
		top: targetY,
		behavior: "smooth",
	});
}
