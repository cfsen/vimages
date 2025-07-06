import { useEffect, useRef } from "react";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "./nav.provider";

function scrollToElementCenteredSmoothly(el: HTMLElement, duration = 150) {
	const rect = el.getBoundingClientRect();
	const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
	const startY = window.scrollY;
	const diff = targetY - startY;

	let startTime: number | null = null;

	function easeInOutQuad(t: number) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	function step(timestamp: number) {
		if (startTime === null) startTime = timestamp;
		const elapsed = timestamp - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const ease = easeInOutQuad(progress);

		window.scrollTo(0, startY + diff * ease);

		if (elapsed < duration) {
			requestAnimationFrame(step);
		}
	}

	requestAnimationFrame(step);
}

export enum NavigableItemType {
	Image,
	FileBrowser,
}

interface NavigableItemProps {
	id: string;
	children: React.ReactNode;
	itemType: NavigableItemType;
	data: string;
	parentNavCtxId: string;
}

export const NavigableItem: React.FC<NavigableItemProps> = ({ 
	id, 
	children, 
	itemType, 
	data,
	parentNavCtxId
}) => {
	const activeNavigationContext = useAppState(state => state.activeNavigationContext);
	const ref = useRef<HTMLDivElement>(null);
	const { navItemActive , navUnregister , navRegister } = useCommand();

	useEffect(() => {
		navRegister({ id, ref, itemType, data });
		return () => navUnregister(id);
	}, [id]);

	useEffect(() => {
		//console.log("navigable effect:", navItemActive);
		if(navItemActive === id && ref.current){
			scrollToElementCenteredSmoothly(ref.current);
			// TODO: allow opt in to no animations:
			//ref.current.scrollIntoView({
			//  behavior: 'smooth',
			//  block: 'center',
			//  inline: 'nearest',
			//});
		}
	}, [navItemActive]);

	// TODO: move to css
	const getItemColor = (): string => { 
		if(navItemActive === id && activeNavigationContext === parentNavCtxId)
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
