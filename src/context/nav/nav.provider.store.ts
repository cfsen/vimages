import { createStore } from 'zustand';
import { NavigationItem } from "./nav.types";

interface INavigationStateProps {
	navigationContextId: string,
	navItems: NavigationItem[],
	navItemsPerRow: number,
	navItemActive: string | null,
	active: boolean,

	selectionStart: number | null,
	selectionEnd: number | null,
	selectionBuffer: Set<string> | null,
}

export interface INavigationState extends INavigationStateProps {
	setNavigationContextId: (id: string) => void,

	registerNavItem: (item: NavigationItem) => void,
	unregisterNavItem: (item: string) => void,
	clearNavItems: () => void,

	setNavItemActive: (item: string | null) => void,

	setItemsPerRow: (perRow: number) => void,
	setActive: (state: boolean) => boolean,

	setSelectionStart: (itemIdx: number | null) => void,
	setSelectionEnd: (itemIdx: number | null) => void,
	setSelectionBuffer: (items: Set<string> | null) => void,
}

export type NavigationState = ReturnType<typeof createNavigationState>

export const createNavigationState = (initProps?: Partial<INavigationState>) => {
	const DEFAULT_PROPS: INavigationStateProps = {
		navigationContextId: "",
		navItems: [],
		navItemsPerRow: 1,
		navItemActive: null,
		active: true,
		selectionStart: null,
		selectionEnd: null,
		selectionBuffer: null,
	}
	return createStore<INavigationState>()((set) => ({
		...DEFAULT_PROPS,
		...initProps,
		
		setNavigationContextId: (id) => set(() => ({ navigationContextId: id })),

		registerNavItem: (item: NavigationItem) => set(
			(state) => ({ 
				navItems: [...state.navItems, item] 
			})
		),
		unregisterNavItem: (id: string) => set(
			(state) => ({
				navItems: state.navItems.filter((i) => i.id !== id),
			})
		),
		clearNavItems: () => set({ navItems: [] }),

		setNavItemActive: (item: string | null) => set(() => ({ navItemActive: item })),

		setItemsPerRow: (perRow: number) => set({ navItemsPerRow: perRow }),

		setActive: (state: boolean) => { 
			set({active: state});
			return state;
		},

		setSelectionStart: (itemIdx) => set({ selectionStart: itemIdx }),
		setSelectionEnd: (itemIdx) => set({ selectionEnd: itemIdx }),
		setSelectionBuffer: (items) => set({ selectionBuffer: items }),
	}));
}

