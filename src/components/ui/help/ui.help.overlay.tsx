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
				<i>Assumes standard keybinds.</i>
			</p>
			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>esc</div>
				<div className={styles.uiHelpCommandDescription}>Exit modes, clear selection, close overlays.</div>
			</div>
			<div className={styles.flexRow}>
				{HelpQuickstart()}
				{HelpCommandMode()}
			</div>
		</div>
	);
}

function HelpQuickstart(){
	return(
		<div className={styles.uiHelpNodeContainer}>
			<h3>Quickstart</h3>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>h, j, k, l</div>
				<div className={styles.uiHelpCommandSub}>cursor left, down, up, right</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Move the cursor. Lead with a number (4j, 3l) to move n elements down or any other direction.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>w, b</div>
				<div className={styles.uiHelpCommandSub}>cursor next, previous</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Move the cursor to the next or previous element. Lead with a number (3w, 5b) to move n elements forward or backwards.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>gg, G</div>
				<div className={styles.uiHelpCommandSub}>first element, last element</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Move the cursor to the first (gg) or last (G) element.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>[n]G</div>
				<div className={styles.uiHelpCommandSub}>n'th element</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Move the cursor to the n'th element (7G).</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>c^d, c^u</div>
				<div className={styles.uiHelpCommandSub}>cursor half page down, up</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Move the cursor a half page down or up. <i>Note: not true half page movement.</i></div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>return</div>
				<div className={styles.uiHelpCommandSub}>open directory, view image in fullscreen</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Open directory or view image under cursor.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>s</div>
				<div className={styles.uiHelpCommandSub}>switch workspace</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Switch between the directory browser anbd image grid.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>R</div>
				<div className={styles.uiHelpCommandSub}>reload</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Reload current directory.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>v</div>
				<div className={styles.uiHelpCommandSub}>visual selection mode</div>
				<div className={styles.uiHelpCommandDescriptionBelow}>Switch to visual selection mode.</div>
			</div>

			<div className={styles.uiHelpNode}>
				<div className={styles.uiHelpKeyBox}>:config</div>
				<div className={styles.uiHelpCommandDescription}>Show current keybinds.</div>
			</div>
		</div>
	);
}

function HelpCommandMode(){
	return(
		<div className={styles.uiHelpNodeContainer}>
			<h3>Commands</h3>

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
