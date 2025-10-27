import { useEffect, useState } from "react";

import { useAppState} from "@app/app.context.store";
import { TrimPathStrLength } from "@components/utility.general";

import styles from "./ui.selection.module.css"

function SelectionOverview() {
	const activeSelection = useAppState(s => s.activeSelection);
	const currentDir = useAppState(s => s.currentDir);
	const [selection, setSelection] = useState<string[]>([]);

	useEffect(() => {
		if(activeSelection === null) {
			setSelection([]);
			return;
		}

		const newSelection: string[] = [];
		activeSelection.forEach((v) => {
			newSelection.push(v);
		});
		setSelection(newSelection);
	}, [activeSelection]);

	if (activeSelection === null)
		return;

	return(
		<div className={styles.selectionOverlay}>
			<div className={styles.selectionHeadline}>Selecting {selection.length} items</div>
			<div className={styles.selectionDirectory}>{currentDir}</div>
			{selection.map((k, i) => (
				<div key={`selectionOverviewIndex_${i}`}>
					{TrimPathStrLength(k)}
				</div>
			))}
		</div>
	);
}

export default SelectionOverview;
