
import { useAppState } from "@/context/app/app.context.store";
import styles from "./ui.error.module.css";

function ErrorPopup() {
	const showError = useAppState(s => s.showError);
	const errorMsg = useAppState(s => s.errorMsg);

	if(!showError) return;
	return(
		<div className={styles.uiErrorPopup}>
			<div className={styles.uiErrorAttentionGrab}>
			</div>
			<div className={styles.uiErrorDescription}>
				{ errorMsg } 
			</div>
		</div>
	);
}

export default ErrorPopup;
