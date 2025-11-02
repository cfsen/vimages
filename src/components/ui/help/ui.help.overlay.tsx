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
			<p>
				<b>esc</b> to close this overlay.
			</p>
			{HelpCommandMode()}
		</div>
	);
}

function HelpCommandMode(){
	return(
		<div className={styles.uiHelpNodeContainer}>
			<h3>Commands </h3>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:</div>
				<div className={styles.uiHelpCommandDescription}>Command mode.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:q</div>
				<div className={styles.uiHelpCommandDescription}>Exit vimages.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:wq</div>
				<div className={styles.uiHelpCommandDescription}>Save config and exit.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:sc</div>
				<div className={styles.uiHelpCommandDescription}>Save config.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:help</div>
				<div className={styles.uiHelpCommandDescription}>Show this overlay.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:set</div>
				<div className={styles.uiHelpCommandSub}>imgscale, errorlv, titlebar, infowindow, scrollDelay, genericError</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Set application preferences.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:get</div>
				<div className={styles.uiHelpCommandSub}>version, queue</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Print variables.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:fullscreen</div>
				<div className={styles.uiHelpCommandSub}>invertCursor, moveStep, rotateStep, zoomStep, remapCursor</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Set fullscreen image viewing preferences.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:cache</div>
				<div className={styles.uiHelpCommandSub}>info, clean, path</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Cache info and cleaning.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:config</div>
				<div className={styles.uiHelpCommandDescription}>Open config viewer widget.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:cd</div>
				<div className={styles.uiHelpCommandSub}>[path]</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Open directory at [path].</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:queue</div>
				<div className={styles.uiHelpCommandSub}>blacklist, bl, status</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Print information about queued jobs.</div>
			</div>
		</div>
	);
}

export default HelpOverlay;
