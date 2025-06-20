import styles from "./Vimage.module.css";
import { useAppState } from "@context/AppContextStore";

function VimageFullscreen() {
	const componentEnable = useAppState(state => state.fullscreenImage);
	const imagePath = useAppState(state => state.fullscreenImagePath);

	if (!componentEnable) {
		return <span></span>;
	}

	return (
		<div className={styles.fullscreenOverlay}>
			<img 
				src={"http://127.0.0.1:8080/image?file=" + imagePath} 
				alt="Fullscreen view"
				className={styles.fullscreenImage}
			/>
		</div>
	);
}

export default VimageFullscreen;
