import { useEffect, useState } from "react";
import styles from "./Vimage.module.css";
import { useAppState } from "@context/AppContextStore";

function VimageFullscreen() {
	const componentEnable = useAppState(state => state.fullscreenImage);
	const imagePath = useAppState(state => state.fullscreenImagePath);
	const axum_port = useAppState(state => state.axum_port);

	const [displayImg, setDisplayImg] = useState<boolean>();
	const [loadedPath, setLoadedPath] = useState<string>();

	useEffect(() => {
		// display already loaded image (opening, closing then opening the same image)
		if(loadedPath === imagePath && componentEnable) {
			setDisplayImg(true);
		}
		else {
			setDisplayImg(false);
		}
	}, [imagePath, componentEnable]);

	return (
		<div 
			style={{ visibility: componentEnable && displayImg ? 'visible' : 'hidden' }}
			className={styles.fullscreenOverlay}>
			<img 
				src={`http://127.0.0.1:${axum_port}/image?file=${imagePath}`} 
				alt="Fullscreen view"
				onLoad={ () => { 
					setLoadedPath(imagePath);
					setDisplayImg(true) 
				} }
				className={styles.fullscreenImage}
			/>
		</div>
	);
}

export default VimageFullscreen;
