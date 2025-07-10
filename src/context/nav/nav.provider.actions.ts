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
