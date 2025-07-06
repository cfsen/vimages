import { useEffect, useState } from "react";

import { useAppState } from "@/context/AppContextStore";
import { NavigationProvider } from "@context/NavigationContext";
import { UIComponent } from "@/context/ContextTypes";

import DirBrowserParent from "./dir.browser.parent";
import DirBrowserMain from "./dir.browser.main";
import DirBrowserCurrentPreview from "./dir.browser.preview";

import styles from "./fs.module.css";
import { windowsUncStrip } from "@components/utility.general";

function DirBrowser(){
	const active = useAppState(s => s.workspace);
	const path = useAppState(s => s.currentDir);

	const [render, setRender] = useState<boolean>(false);

	useEffect(() => {
		setRender(active.DirBrowser);
	}, [active]);
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

export default DirBrowser;
