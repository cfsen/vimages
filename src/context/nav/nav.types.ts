import { StoreApi } from "zustand";
import { INavigationState } from "./nav.provider.store";

// Navigation state for a registry of NavigationItem
export type NavigationContextType = {
	navCtxId: string;

	navRegister: (navItem: NavigationItem) => void;
	navUnregister: (id: string) => void;

	navItemActive: string | null;
	
	itemsPerRow: number;
	setItemsPerRow: (n: number) => void;

	active: boolean;
	setActive: (active: boolean) => void;

	navigationState: StoreApi<INavigationState>;
};

// Encapsulates a navigable HTML element
export type NavigationItem = {
	id: string;
	ref: React.RefObject<HTMLElement>;
	itemType: NavWrapperItemType;
	data: string;
};

// Type key for NavigationItem 
export enum NavWrapperItemType {
	Image,
	FileBrowser,
	Menu,
}

// UI state key for NavigationContextType
export enum NavWrapperUIState {
	Active,
	InactiveProvider,
	Inactive,
	TrailingSelection,
}
