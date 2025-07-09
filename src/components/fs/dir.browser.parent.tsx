import { useEffect } from "react";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "@nav/nav.provider";
import { NavigableItem, NavigableItemType } from "@nav/nav.element.wrapper";

import styles from "./fs.module.css";
import { nextNavProvider } from "@/context/app/app.context.actions";

function DirBrowserParentSiblings(){
	const parent_siblings = useAppState(s => s.siblingDirs);
	const path = useAppState(s => s.currentDir);
	const { active, setActive, setItemsPerRow, navCtxId } = useCommand();

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
				<div className={styles.fsElement}>
					../
				</div>
				{parent_siblings.map((dir, idx) => (
					<NavigableItem
						key={"fs.dir.browser.parent.i." + idx + ".h." + dir.path_hash}
						id={"fs.dir.browser.parent.i." + idx + ".h." + dir.path_hash}
						itemType={NavigableItemType.FileBrowser}
						data={"../" + dir.name}
						parentNavCtxId={navCtxId}
					>
						<div className={path === dir.path ? styles.fsElementOpen : styles.fsElement}>
							{dir.name}
						</div>
					</NavigableItem>
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
