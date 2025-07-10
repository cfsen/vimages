import { useEffect, useRef } from "react";
import { StoreApi } from "zustand";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "@nav/nav.provider";

import { activeNavWrapper } from "@nav/nav.provider.actions";
import { INavigationState } from "@nav/nav.provider.store";
import { NavWrapperItemType, NavWrapperUIState } from "@nav/nav.types";

import styles from "@nav/nav.element.wrapper.module.css";

interface NavWrapperProps {
	id: string;
	children: React.ReactNode;
	itemType: NavWrapperItemType;
	data: string;
}

export const NavWrapper: React.FC<NavWrapperProps> = ({
	id,
	children,
	itemType,
	data,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const { navUnregister, navRegister, navCtxId, navigationState } = useCommand();
	const activeProvider = useAppState(s => s.activeNavigationContext === navCtxId);

	useEffect(() => {
		navRegister({ id, ref, itemType, data });
		return () => navUnregister(id);
	}, [id]);

	return (
		<div
			ref={ref}
			className={getBgColor(navigationState, activeProvider, id)}
		>
			{children}
		</div>
	);
};

function getBgColor (provider: StoreApi<INavigationState>, activeProvider: boolean, id: string): string  { 
	let uiState = activeNavWrapper(provider, activeProvider, id);
	switch(uiState){
		case NavWrapperUIState.Active:
			return styles.navElementWrapperActive;
		case NavWrapperUIState.InactiveProvider:
			return styles.navElementWrapperInactiveProvider;
		default:
			return styles.navElementWrapperInactive;
	};
};
