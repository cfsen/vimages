import { useEffect } from "react";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "@nav/nav.provider";
import { nextNavProvider } from "@app/app.context.actions";

import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@/context/nav/nav.types";

import styles from "./fs.module.css";

function DirBrowserParentSiblings(){
	const parent_siblings = useAppState(s => s.siblingDirs);
	const path = useAppState(s => s.currentDir);
	const { active, setActive, setItemsPerRow } = useCommand();

	// Resize handler
	useEffect(() => {
		const handleResize = () => {
			if(!active && window.innerWidth <= 1440) {
				return;
			}
			if(active && window.innerWidth <= 1440) {
				nextNavProvider(useAppState);
				setActive(false);
				return;
			}
			setActive(true);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		setItemsPerRow(1);
	}, []);

	if(parent_siblings.length > 0) {
		return (
			<div className={styles.fsParentColumn}>
				{parent_siblings.map((dir, idx) => (
					<NavWrapper
						key={"fs.dir.browser.parent.i." + idx + ".h." + dir.path_hash}
						id={"fs.dir.browser.parent.i." + idx + ".h." + dir.path_hash}
						itemType={NavWrapperItemType.FileBrowser}
						data={"../" + dir.name}
					>
						<div className={path === dir.path ? styles.fsElementOpen : styles.fsElement}>
							{dir.name}
						</div>
					</NavWrapper>
				))}
			</div>
		);
	}
	else {
		return (
			<div className={styles.fsParentColumn}>
				root directory
			</div>
		);
	}
}

export default DirBrowserParentSiblings;
