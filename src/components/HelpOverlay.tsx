import styles from "./HelpOverlay.module.css";
import { useAppState } from "@context/AppContextStore";

function HelpOverlay() {
	const componentEnable = useAppState(state => state.showHelp);

	if (!componentEnable) {
		return <span></span>;
	}

	return (
		<div className={styles.fullscreenHelpOverlay}>
			<h2>vimages</h2>
			<div>
				<b>esc</b> to close
			</div>
			<p>
				WIP
			</p>
		</div>
	);
}

export default HelpOverlay;
