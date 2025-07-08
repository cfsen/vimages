import { useAppState } from "@/context/app/app.context.store";
import styles from "./ui.leader.module.css";
import { Modal } from "@/context/key/key.types";

function Leader() {
	const mode = useAppState(s => s.mode);

	// TODO: dynamic populate

	if(mode !== Modal.Leader) return;
	return(
		<div className={styles.uiLeaderOverlay}>
			<div className={styles.uiLeaderGrid}>
				<div>[<b>w</b>] Next workspace</div>
				<div>[<b>W</b>] Prev workspace</div>
			</div>
		</div>
	);
}

export default Leader;
