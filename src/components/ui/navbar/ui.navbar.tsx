import { useAppState } from "@app/app.context.store";

import { Modal } from "@key/key.types";

import { windowsUncStrip } from "@components/utility.general";

import styles from "./ui.navbar.module.css";

function Navbar() {
	const currentDir = useAppState(state => state.currentDir);
	const mode = useAppState(state => state.mode);
	const inputBufferCommand = useAppState(state => state.inputBufferCommand);

	const outputText = (): string => {
		switch(mode){
			case Modal.Command:
				return inputBufferCommand;
			default:
				return windowsUncStrip(currentDir);
		};
	};

	const outputMode = (): string => {
		switch(mode){
			case Modal.Normal:
				return "Normal";
			case Modal.Leader:
				return "Leader";
			case Modal.Command:
				return "Command";
			case Modal.Insert:
				return "Insert";
			case Modal.Visual:
				return "Visual";
		}
	}

	return(
		<div className={styles.navbar_container}>
			<div className={mode !== Modal.Normal ? styles.navbar_mode_active : styles.navbar_mode}>
				{ outputMode() }
			</div>
			<div className={mode === Modal.Command ? styles.navbar_text_command : styles.navbar_text}>
				{ outputText() }
			</div>
		</div>
	);
}

export default Navbar;

