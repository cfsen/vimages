import { StoreApi } from "zustand";
import { INavigationState } from "./nav.provider.store";

export type NavigationContextType = {
	//cmdLog: CommandSequence[];
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

export type NavigationItem = {
	id: string;
	ref: React.RefObject<HTMLElement>;
	itemType: NavWrapperItemType;
	data: string;
};

export enum NavWrapperItemType {
	Image,
	FileBrowser,
}

export enum NavWrapperUIState {
	Active,
	InactiveProvider,
	Inactive
}
