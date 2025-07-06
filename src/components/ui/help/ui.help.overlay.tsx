import { useAppState } from "@app/app.context.store";

import styles from "./ui.help.module.css";

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
