import { useEffect } from "react";

import { useAppState } from "@app/app.context.store";
import { useCommand } from "@nav/nav.provider";

import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@nav/nav.types";

import styles from "./fs.module.css";

function DirBrowserMain(){
	const directories = useAppState(state => state.directories);
	const currentDirHash = useAppState(state => state.currentDirHash);
	const { setItemsPerRow } = useCommand();

	useEffect(() => {
		setItemsPerRow(1);
	}, []);

	return (
		<div className={styles.fsActiveColumn}>
			<NavWrapper
				key={"fileBrowserItemGoParentDir.h." + currentDirHash}
				id={"fileBrowserItemGoParentDir"}
				itemType={NavWrapperItemType.FileBrowser}
				data={".."}
			>
				<div key={"fbrowseridxGoParentDir"} className={styles.fsElement}>
					..
				</div>
			</NavWrapper>

			{directories.map((entry, index) => (
				<NavWrapper
					key={"fileBrowserItem" + index + "_" + entry.path_hash}
					id={"fileBrowserItem" + index + "_" + entry.path_hash}
					itemType={NavWrapperItemType.FileBrowser}
					data={entry.name}
				>
					<div 
						key={"fbrowseridx" + index + "_" + entry.path_hash} 
						className={styles.fsElement}>
						{entry.name}
					</div>
				</NavWrapper>
			))}
		</div>
	);
}

export default DirBrowserMain;
