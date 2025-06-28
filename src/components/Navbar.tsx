import { useAppState } from "@context/AppContextStore";
import { Modal } from "@keyboard/KeyboardTypes";
import styles from "./Navbar.module.css";

function Navbar() {
	const currentDir = useAppState(state => state.currentDir);
	const mode = useAppState(state => state.mode);
	const inputBufferCommand = useAppState(state => state.inputBufferCommand);

	const outputText = (): string => {
		switch(mode){
			case Modal.Command:
				return inputBufferCommand;
			default:
				return currentDir;
		};
	};

	return(
		<div className={styles.navbar_container}>
			<div
				className={styles.navbar_mode}
			>
				{ Modal[mode] }
			</div>
			<div className={styles.navbar_text}>
				{ outputText() }
			</div>
		</div>
	);
}

export default Navbar;
