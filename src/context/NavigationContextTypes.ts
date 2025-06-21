import { NavigableItemType } from "./NavigableItem";

export type NavigationContextType = {
	//cmdLog: CommandSequence[];
	navCtxId: string;

	navRegister: (navItem: NavigationItem) => void;
	navUnregister: (id: string) => void;

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
