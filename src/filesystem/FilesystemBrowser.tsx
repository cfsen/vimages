import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

import { useAppState } from "./../context/AppContextStore";
import { NavigableItem, NavigableItemType } from "./../context/NavigableItem";
import { useCommand } from "./../context/NavigationContext";

import styles from "./FilesystemBrowser.module.css";
import { RustApiAction } from "./RustApiBridge";

function FileSystemBrowser(){
	const currentDir = useAppState(state => state.currentDir);
	const { imagesPerRow, setItemsPerRow } = useCommand();

	const [response, setResponse] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	


	useEffect(() => {
		imagesPerRow.current = 1;
		setItemsPerRow(1);
	}, []);

	useEffect(() => {
		setLoading(true);
		invoke(RustApiAction.GetDirectories, { path: currentDir })
			.then(res => {
				setResponse(res as string[])
				setLoading(false);
			});
	}, [currentDir]);

	if(loading) {
		return (
			<div>Fetching directories.<br /><i>If this takes a while, something has gone wrong.</i></div>
		);
	}
	
	return (
		<div>
			{response.map((entry, index) => (
				<NavigableItem
					key={"fileBrowserItem" + index}
					id={"fileBrowserItem" + index}
					itemType={NavigableItemType.FileBrowser}
					data={entry}
				>
					<div key={"fbrowseridx" + index} className={styles.fsElement}>{entry}</div>
				</NavigableItem>
			))}
		</div>
	);
}

export default FileSystemBrowser;
