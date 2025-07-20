
import { useAppState } from "@/context/app/app.context.store";
import styles from "./ui.info.module.css";

function InfoPopup() {
	const showInfo = useAppState(s => s.showInfo);
	const infoMessages = useAppState(s => s.infoMessages);

	if(!showInfo) return;
	return(
		<div className={styles.uiInfoPopup}>
			<div className={styles.uiInfoDescription} key="uiInfoPopupTitle" style={{marginBottom: '0.5em'}}>
				<b>System messages:</b>
			</div>
			{ infoMessages.map((msg, idx) => (
				<div key={`infoMessage${idx}`} style={{paddingLeft: '0.25em'}}>
					<div className={styles.uiInfoDescription}>
						{msg}
					</div>
				</div>
			))}
		</div>
	);
}

export default InfoPopup;
