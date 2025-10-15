import { useAppState } from "@app/app.context.store";

import { getCurrentKeybinds } from "@key/key.module";
import { Command } from "@key/key.command";

import { VimagesConfigFromZustandState } from "@app/app.config.actions";

import styles from "./ui.config.viewer.module.css";

function ConfigViewerPopup() {
	let keybinds = getCurrentKeybinds();
	let config = OutputVimagesConfig();

	let renderConfigViewerPopup = useAppState.getState().showConfig;

	if(!renderConfigViewerPopup)
		return;

	return(
		<div className={styles.uiConfigViewerPopup}>
			<div
				className={styles.uiConfigViewerText} 
				key="uiConfigViewerPopup" 
				style={{marginBottom: '0.5em'}}
			>
				<b>Current config:</b>
			</div>
			<div className={styles.uiConfigViewerColumns}>
				<div className={styles.uiConfigViewerText}>
					{config}
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

function OutputVimagesConfig(){
	const config = VimagesConfigFromZustandState(useAppState);
	const {
		imageGridScale,
	} = useAppState.getState();
	return(
		<>
			{OutputColumns("Version", config.vimages_version)}
			{OutputColumns("Render titlebar", BooleanToString(config.titlebar))}
			{OutputColumns("Generic errors:", BooleanToString(config.generic_errors))}
			<div>---</div>
			{OutputColumns("Image grid scale", imageGridScale.toString())}
		</>
	);
}

function OutputColumns(left: string, right: string){
	return(
		<div className={styles.uiConfigViewerColumns}>
			<div>{left}</div>
			<div>{right}</div>
		</div>
	);
}

function BooleanToString(bool: boolean): string {
	return bool ? "True" : "False";
}

export default ConfigViewerPopup;
