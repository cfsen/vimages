import { useEffect, useState } from "react";

import { useAppState } from "@app/app.context.store";
import { NavigationProvider } from "@nav/nav.provider";
import { UIComponent } from "@/context/context.types";

import DirBrowserParent from "./dir.browser.parent";
import DirBrowserMain from "./dir.browser.main";
import DirBrowserCurrentPreview from "./dir.browser.preview";

import { windowsUncStrip } from "@components/utility.general";

import styles from "./fs.module.css";

// TODO: clean up CSS for fs/dir.browser
function DirBrowser(){
	const active = useAppState(s => s.workspace);
	const path = useAppState(s => s.currentDir);
	// TODO: command for toggling, store in settings
	const parentDirectoryRender = useAppState(s => s.dirBrowserRenderParentDir); 

	const [render, setRender] = useState<boolean>(false);

	useEffect(() => {
		setRender(active.DirBrowser);
	}, [active]);

	if(parentDirectoryRender) {
		return (
			<div 
				style={{
					display: render ? 'flex' : 'none',
				}}
				className={`${styles.fsFlexColumn} ${styles.fsBrowserContainer}`}
			>
				<div 
					className={`${styles.fsFlexColumn} ${styles.fsBgBorder} ${styles.fsBrowser}`}
				>
					<div
						className={styles.fsHeaderPath}
					>
						<h3>{ windowsUncStrip(path) }</h3>
					</div>
					<div className={styles.fsFlexRow}>
						<NavigationProvider
							tabOrder={10}
							component={UIComponent.dirBrowserParent}
							initActive={true}
						>
							<DirBrowserParent />
						</NavigationProvider>
						<NavigationProvider
							tabOrder={11}
							component={UIComponent.dirBrowserMain}
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
