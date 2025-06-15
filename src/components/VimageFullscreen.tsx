import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import styles from "./Vimage.module.css";
import { useAppState } from "@context/AppContextStore";

function VimageFullscreen() {
	const componentEnable = useAppState(state => state.fullscreenImage);
	const imagePath = useAppState(state => state.fullscreenImagePath);
	const [imageDataUri, setImageDataUri] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (componentEnable && imagePath) {
			setLoading(true);
			setError(null);
			
			invoke<string>("fs_get_image_data_uri", { path: imagePath })
				.then((dataUri: string) => {
					setImageDataUri(dataUri);
					setLoading(false);
				})
				.catch((err: string) => {
					console.error("Failed to load image:", err);
					setError(err);
					setLoading(false);
				});
		} else {
			// Reset state when component is disabled or no path
			setImageDataUri(null);
			setError(null);
			setLoading(false);
		}
	}, [componentEnable, imagePath]);

	if (!componentEnable) {
		return <span></span>;
	}

	return (
		<div className={styles.fullscreenOverlay}>
			{loading && <div>Loading image...</div>}
			{error && <div>Error loading image: {error}</div>}
			{imageDataUri && !loading && !error && (
				<img 
					src={imageDataUri} 
					alt="Fullscreen view"
					className={styles.fullscreenImage}
				/>
			)}
		</div>
	);
}

export default VimageFullscreen;
