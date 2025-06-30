import { getCurrentWindow } from '@tauri-apps/api/window';
import styles from "./Titlebar.module.css";

function TitleBar() {
	const currentWindow = getCurrentWindow();

	return (
		<div className={styles.titlebar} data-tauri-drag-region>
			<div className={styles.titlebarTitle}>vimages 0.1.0</div>
			<div className={styles.titlebarButtons}>
				<div className={styles.titlebarButton} onClick={() => currentWindow.minimize()}>
					−
				</div>
				<div className={styles.titlebarButton} onClick={() => currentWindow.toggleMaximize()}>
					□
				</div>
				<div className={styles.titlebarButton} onClick={() => currentWindow.close()}>
					×
				</div>
			</div>
		</div>
	);
}
export default TitleBar;
