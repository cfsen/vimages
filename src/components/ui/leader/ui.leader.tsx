import { useAppState } from "@/context/app/app.context.store";
import styles from "./ui.leader.module.css";
import { Modal } from "@/context/key/key.types";
import { useState } from "react";
import { getCurrentKeybinds } from "@/context/key/key.module";
import { Command } from "@/context/key/key.command";

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
