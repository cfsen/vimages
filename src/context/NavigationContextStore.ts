import { createStore } from 'zustand';
import { NavigationItem } from "./NavigationContextTypes";

interface INavigationStateProps {
	navigationContextId: string,
	navItems: NavigationItem[],
	navItemsPerRow: number,
	navItemActive: string | null,
}

export interface INavigationState extends INavigationStateProps {
	navigationContextId: string,
	setNavigationContextId: (id: string) => void,

	registerNavItem: (item: NavigationItem) => void,
	unregisterNavItem: (item: string) => void,
	clearNavItems: () => void,

	setNavItemActive: (item: string | null) => void,

	setItemsPerRow: (perRow: number) => void,
}

export type NavigationState = ReturnType<typeof createNavigationState>

export const createNavigationState = (initProps?: Partial<INavigationState>) => {
	const DEFAULT_PROPS: INavigationStateProps = {
		navigationContextId: "",
		navItems: [],
		navItemsPerRow: 1,
		navItemActive: null
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
	}));
}
