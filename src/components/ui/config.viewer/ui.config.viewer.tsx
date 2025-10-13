import { getCurrentKeybinds } from "@/context/key/key.module";
import { Command } from "@key/key.command";

import styles from "./ui.config.viewer.module.css";

function ConfigViewerPopup() {
	let keybinds = getCurrentKeybinds();

	// TODO: zustand
	let renderConfigViewerPopup = false;

	if(!renderConfigViewerPopup)
		return;

	return(
		<div className={styles.uiConfigViewerPopup}>
			<div className={styles.uiConfigViewerText} key="uiConfigViewerPopup" style={{marginBottom: '0.5em'}}>
				<b>Current config:</b>
			</div>
			<div className={styles.uiConfigViewerColumns}>
				<div className={styles.uiConfigViewerText}>
					Placeholder for settings
				</div>
				<div className={styles.uiConfigViewerText}>
					{Array.from(keybinds.keyMap.entries()).map(([key, command]) => (
						<div key={`configViewerKeybind${key}`}>
							{key} → {Command[command]}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}


export default ConfigViewerPopup;
