import { NavigableItem, NavigableItemType } from "./../context/NavigableItem";
import { useCommand } from "./../context/NavigationContext";
import { useRustApi, RustApiAction } from "./RustApiBridge";
import styles from "./FilesystemBrowser.module.css";
import { useEffect } from "react";

function FileSystemBrowser(){
	const { currentDir, imagesPerRow } = useCommand();
	const { response, loading, error } = useRustApi({ action: RustApiAction.GetDirectories, path: currentDir.current });

	useEffect(() => {
		imagesPerRow.current = 1;
	}, []);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<ul>
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
		</ul>
	);
}

export default FileSystemBrowser;
