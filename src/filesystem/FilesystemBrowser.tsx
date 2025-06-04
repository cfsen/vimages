import { NavigableItem, NavigableItemType } from "./../context/NavigableItem";
import { useCommand } from "./../context/NavigationContext";
import { RustApiAction } from "./RustApiBridge";
import styles from "./FilesystemBrowser.module.css";
import { useEffect, useState } from "react";
import { useGlobalStore } from "./../context/store";
import { invoke } from "@tauri-apps/api/core";

function FileSystemBrowser(){
	const currentDir = useGlobalStore(state => state.currentDir);
	const { imagesPerRow } = useCommand();
	const [response, setResponse] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		imagesPerRow.current = 1;
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
			<div>Loading</div>
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
