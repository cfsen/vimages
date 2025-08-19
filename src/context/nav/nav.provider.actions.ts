import { StoreApi } from "zustand";
import { INavigationState } from "@nav/nav.provider.store";
import { NavigationItem, NavWrapperItemType, NavWrapperUIState } from "@nav/nav.types";
import { IAppState } from "../app/app.context.store";

//
// visual mode/selection
//

export function getSelectionItemIds(navStore: StoreApi<INavigationState>): Set<string> | null {
	let { selectionStart, selectionEnd, navItems } = navStore.getState();

	if(selectionStart === null || selectionEnd === null) 
		return null;

	let itemIds: Set<string> = new Set();
	if(selectionStart === selectionEnd) {
		itemIds.add(navItems[selectionStart].id);
		return itemIds;
	}

	let [firstItem, lastItem] = selectionStart < selectionEnd 
		? [selectionStart, selectionEnd]
		: [selectionEnd, selectionStart];

	for(let i = firstItem; i <= lastItem; i++){
		itemIds.add(navItems[i].id);
	}

	return itemIds;
}

export function updateSelectionBuffer(navStore: StoreApi<INavigationState>){
	let selection = getSelectionItemIds(navStore);
	navStore.getState().setSelectionBuffer(selection);
}

//
// UI hiding
//

/**
 * Used to determine if the wrapped elements parent is the active navigation provider.
 * Enables using different styling for: active element & provider, active element & inactive provider,
 * */
export function activeNavWrapper(navProviderStore: StoreApi<INavigationState>, activeProvider: boolean, id: string): NavWrapperUIState {
	let navItemActive = navProviderStore.getState().navItemActive;
	let selectionBuffer = navProviderStore.getState().selectionBuffer;
	
	if((selectionBuffer?.has(id) ?? false) && navItemActive !== id) {
		return NavWrapperUIState.TrailingSelection;
	}

	if(navItemActive !== id) 
		return NavWrapperUIState.Inactive;

	if(!activeProvider)
		return NavWrapperUIState.InactiveProvider;

	return NavWrapperUIState.Active;
}

//
// UI scrolling
//

export function scrollToActive(navProvider: StoreApi<INavigationState>){
	const cursorElement = navProvider.getState().navItems
	.find((a) => a.id === navProvider.getState().navItemActive);

	if(cursorElement === undefined) {
		console.error("scrollToActive was called on undefined element.");
		return;
	}
	if(cursorElement.ref.current === null) { 
		console.error("scrollToActive was called on null ref.");
		return;
	}

	let targetY = null;

	switch(cursorElement.itemType){
		case NavWrapperItemType.Image:
			targetY = getScrollPositionImageGrid(cursorElement);
			break;
		case NavWrapperItemType.FileBrowser:
			targetY = getScrollPositionFileBrowser(cursorElement);
			break;
	};

	if(targetY === null) {
		console.error("scollToActive failed to calculate targetY.");
		return;
	}

	scrollTo({
		left: 0,
		top: targetY,
		behavior: "instant",
	});
}

function getScrollPositionFileBrowser(navElement: NavigationItem){
	const rect = navElement.ref.current?.getBoundingClientRect() ?? null;
	if(rect === null){
		console.error("navElement was null, failed to scroll.");
		return null;
	}

	const targetY = window.scrollY + rect.top - (rect.height / 2) - (window.innerHeight / 2);
	return targetY;
}

function getScrollPositionImageGrid(navElement: NavigationItem){
	const imageElement = navElement.ref.current?.parentElement?.getBoundingClientRect() ?? null;
	if(imageElement === null) {
		console.warn("imageElement was null, falling back to scrollToActive");
		return getScrollPositionFileBrowser(navElement);
	}

	const targetY = window.scrollY + imageElement.top - (4*imageElement.height) - (window.innerHeight / 2);
	return targetY;
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
