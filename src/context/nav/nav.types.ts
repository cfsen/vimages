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
