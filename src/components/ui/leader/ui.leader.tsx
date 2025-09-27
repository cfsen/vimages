import { useState } from "react";
import { useAppState } from "@app/app.context.store";

import { Modal } from "@key/key.types";
import { getCurrentKeybinds } from "@key/key.module";
import { Command } from "@key/key.command";

import styles from "./ui.leader.module.css";

function Leader() {
	const mode = useAppState(s => s.mode);
	const [binds, setBinds] = useState(getCurrentKeybinds());

	if(mode !== Modal.Leader) return;
	return(
		<div className={styles.uiLeaderOverlay}>
			<div className={styles.uiLeaderGrid}>
				{Array.from(binds.keyMap)
					.filter(([command]) => command.startsWith(binds.commandMap.get(Command.Leader)!))
					.filter(([command]) => command !== binds.commandMap.get(Command.Leader))
					.map(([command, key]) => (
						<div key={`leaderOverlay_${command}`}>
							[<b>{
								command
								.slice(binds.commandMap.get(Command.Leader)!.length)
								.replace(binds.commandMap.get(Command.Leader)!, "leader")
							}</b>] {
								Command[key]
							}
						</div>
					))}
			</div>
		</div>
	);
}

export default Leader;
