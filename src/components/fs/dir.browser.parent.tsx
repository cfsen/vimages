import { useEffect } from "react";

import { useAppState } from "@context/AppContextStore";
import { useCommand } from "@context/NavigationContext";
import { NavigableItem, NavigableItemType } from "@/context/NavigableItem";

import styles from "./fs.module.css";

function DirBrowserParentSiblings(){
	const parent_siblings = useAppState(s => s.siblingDirs);
	const path = useAppState(s => s.currentDir);
	const { setItemsPerRow, navCtxId } = useCommand();

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
