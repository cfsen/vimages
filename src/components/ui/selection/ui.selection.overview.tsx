import { useAppState} from "@app/app.context.store";

import { getActiveNavigationProvider } from "@/context/app/app.context.actions";
import { useEffect, useState } from "react";

import styles from "./ui.selection.module.css"
import { NavigationHandle, UIComponent } from "@/context/context.types";

function SelectionOverview() {
	const activeSelection = useAppState(s => s.activeSelection);
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
			Selection overview
			{selection.map((k, i) => (
				<div key={`selectionOverviewIndex_${i}`}>
					{k}
				</div>
			))}
		</div>
	);
}

export default SelectionOverview;
