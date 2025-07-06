import { useEffect } from "react";

import { useAppState } from "@context/AppContextStore";
import { NavigableItem, NavigableItemType } from "@context/NavigableItem";
import { useCommand } from "@context/NavigationContext";

import styles from "./fs.module.css";

function DirBrowserMain(){
	const directories = useAppState(state => state.directories);
	const { setItemsPerRow, navCtxId } = useCommand();

	useEffect(() => {
		setItemsPerRow(1);
	}, []);

	return (
		<div className={styles.fsActiveColumn}>
					<div className={styles.fsElement}>
						./
					</div>
			<NavigableItem
				key={"fileBrowserItemGoParentDir"}
				id={"fileBrowserItemGoParentDir"}
				itemType={NavigableItemType.FileBrowser}
				data={".."}
				parentNavCtxId={navCtxId} 
			>
				<div key={"fbrowseridxGoParentDir"} className={styles.fsElement}>
					..
				</div>
			</NavigableItem>

			{directories.map((entry, index) => (
				<NavigableItem
					key={"fileBrowserItem" + index + "_" + entry.path_hash}
					id={"fileBrowserItem" + index + "_" + entry.path_hash}
					itemType={NavigableItemType.FileBrowser}
					data={entry.name}
					parentNavCtxId={navCtxId} 
				>
					<div 
						key={"fbrowseridx" + index + "_" + entry.path_hash} 
						className={styles.fsElement}>
						{entry.name}
					</div>
				</NavigableItem>
			))}
		</div>
	);
}

export default DirBrowserMain;
