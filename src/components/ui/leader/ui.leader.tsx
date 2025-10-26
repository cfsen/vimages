import { useAppState } from "@app/app.context.store";

import { Modal } from "@key/key.types";
import { getCurrentKeybinds } from "@key/key.module";
import { Command } from "@key/key.command";
import { GetLeaderCommands, GetLeaderKeyLabel } from "@components/utility.general";

import styles from "./ui.leader.module.css";

function Leader() {
	const mode = useAppState(s => s.mode);
	const binds = getCurrentKeybinds();
	const leaderCommands = GetLeaderCommands(binds);

	if(mode !== Modal.Leader) return;

	return(
		<div className={styles.uiLeaderOverlay}>
			<div className={styles.uiLeaderGrid}>
				{leaderCommands.map(([command, key]) => (
					<div key={`leaderOverlay_${command}`}>
						[<b>{ GetLeaderKeyLabel(command, binds) }</b>] { Command[key] }
					</div>
				))}
			</div>
		</div>
	);
}

export default Leader;
