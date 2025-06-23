import { useAppState } from "@context/AppContextStore";
import { Modal } from "@keyboard/KeyboardTypes";
import styles from "./Navbar.module.css";

function Navbar() {
	const currentDir = useAppState(state => state.currentDir);
	const mode = useAppState(state => state.mode);

	return(
		<div className={styles.navbar_container}>
			<div
				className={styles.navbar_mode}
			>
				{ Modal[mode] } 
			</div>
			<div className={styles.navbar_text}>
				{ currentDir }
			</div>
		</div>
	);
}

export default Navbar;
