import { useEffect, useRef } from "react";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "@nav/nav.provider";

import { NavWrapperItemType } from "@nav/nav.types";

function scrollToCursor(el: HTMLElement){
	const rect = el.getBoundingClientRect();
	const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);

	scrollTo({
		left: 0,
		top: targetY,
		behavior: "smooth",
	});
}

interface NavigableItemProps {
	id: string;
	children: React.ReactNode;
	itemType: NavWrapperItemType;
	data: string;
	parentNavCtxId: string;
}

export const NavWrapper: React.FC<NavigableItemProps> = ({ 
	id, 
	children, 
	itemType, 
	data,
	parentNavCtxId
}) => {
	const activeNavigationContext = useAppState(state => state.activeNavigationContext === parentNavCtxId);
	const ref = useRef<HTMLDivElement>(null);
	const { navItemActive , navUnregister , navRegister } = useCommand();

	useEffect(() => {
		navRegister({ id, ref, itemType, data });
		return () => navUnregister(id);
	}, [id]);

	useEffect(() => {
		if(navItemActive === id && ref.current){
			scrollToCursor(ref.current);
		}
	}, [navItemActive]);

	// TODO: move to css
	const getItemColor = (): string => { 
		if(navItemActive === id && activeNavigationContext)
			return 'var(--primary-700)';
			//return '#4c606d';
		if(navItemActive === id)
			return 'var(--neutral-800)';
		return 'var(--neutral-900)';
	};

	return (
		<div
			ref={ref}
			style={{ 
				backgroundColor: getItemColor(),
				margin: 'auto',
			}}
		>
			{children}
		</div>
	);
};
