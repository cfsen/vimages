import { useEffect, useState } from "react";

import { useAppState } from "@app/app.context.store";
import { NavigationProvider } from "@nav/nav.provider";
import { UIComponent, Workspace } from "@context/context.types";

import DirBrowserMain from "./dir.browser.main";
import DirBrowserCurrentPreview from "./dir.browser.preview";

import { windowsUncStrip } from "@components/utility.general";

import styles from "./fs.module.css";

function DirBrowser(){
	const workspaceActive = useAppState(s => s.workspaceActive);
	const path = useAppState(s => s.currentDir);

	const [render, setRender] = useState<boolean>(false);

	useEffect(() => {
		setRender(workspaceActive === Workspace.DirectoryBrowser);
		console.log("Render dir browser:" + (workspaceActive === Workspace.DirectoryBrowser));
	}, [workspaceActive]);

	return(
		<div 
			style={{
				display: render ? 'flex' : 'none',
			}}
			className={`${styles.fsFlexColumn} ${styles.fsBrowserContainer}`}
		>
			<div 
				className={`${styles.fsFlexColumn} ${styles.fsBgBorder} ${styles.fsBrowser}`}
				style={{
					display: 'block'
				}}
			>
				<div
					className={styles.fsHeaderPath}
				>
					<h3>{ windowsUncStrip(path) }</h3>
				</div>
				<div className={styles.fsFlexRow}>
					<NavigationProvider
						tabOrder={11}
						component={UIComponent.dirBrowserMain}
						workspace={Workspace.DirectoryBrowser}
						initActive={true}
					>
						<DirBrowserMain />
					</NavigationProvider>
					<DirBrowserCurrentPreview />
				</div>
			</div>
		</div>
	);
}

export default DirBrowser;
