import { getCurrentWindow } from '@tauri-apps/api/window';

import styles from "./ui.titlebar.module.css";
import { useAppState } from '@/context/app/app.context.store';

function TitleBar() {
	const currentWindow = getCurrentWindow();
	const version = useAppState(state => state.vimages_version);

	return (
		<div className={styles.titlebar} data-tauri-drag-region>
			<div className={styles.titlebarTitle}>
				vimages {version}
			</div>
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
