import { useEffect, useState } from "react";
import styles from "./Vimage.module.css";
import { useAppState } from "@context/AppContextStore";

const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// uses a micro state machine and double buffer to avoid flickering or visible loading when opening images
function VimageFullscreen() {
	const componentEnable = useAppState(state => state.fullscreenImage);
	const imagePath = useAppState(state => state.fullscreenImagePath);
	const setImagePath = useAppState(state => state.setFullscreenImagePath);
	const axum_port = useAppState(state => state.axum_port);

	const [activeBuf, setActiveBuf] = useState<0 | 1>(0);
	const [imgBuf0, setImgBuf0] = useState<string>();
	const [imgBuf1, setImgBuf1] = useState<string>();

	// update on imagePath change when fullscreen is enabled
	useEffect(() => {
		if(!componentEnable)
			return;

		switch(activeBuf){
			case 0:
				// update the buffer if path changed
				if(imgBuf1 !== imagePath)
					setImgBuf1(imagePath);
				// image is already loaded, swap immediately
				else
					setActiveBuf(1);
				break;
			case 1:
				if(imgBuf0 !== imagePath)
					setImgBuf0(imagePath);
				else
					setActiveBuf(0);
				break;
		}
	}, [imagePath]);

	useEffect(() => {
		// exiting fullscreen, clean up
		if(!componentEnable) {
			setTimeout(() => {}, 200);
			setImgBuf0(undefined);
			setImgBuf1(undefined);
			setImagePath("");
			setActiveBuf(0);
		}
	}, [componentEnable]);

	const swap = () => {
		switch(activeBuf){
			case 0:
				setActiveBuf(1);
				break;
			case 1:
				setActiveBuf(0);
				break;
		};
	};

	return (
		<div 
			style={{ 
				visibility: componentEnable ? 'visible' : 'hidden',
				opacity: componentEnable ? 1 : 0
			}}
			className={styles.fullscreenOverlay}
		>
			<img 
				onLoad={ () => { swap(); }}
				style={{ display: activeBuf === 0 ? 'block' : 'none' }}
				src={imgBuf0 !== undefined ? `http://127.0.0.1:${axum_port}/image?file=${imgBuf0}` : TRANSPARENT_PIXEL }
				alt="Fullscreen view"
				className={styles.fullscreenImage}
			/>
			<img 
				onLoad={ () => { swap(); }}
				style={{ display: activeBuf === 1 ? 'block' : 'none' }}
				src={imgBuf1 !== undefined ? `http://127.0.0.1:${axum_port}/image?file=${imgBuf1}` : TRANSPARENT_PIXEL }
				alt="Fullscreen view"
				className={styles.fullscreenImage}
			/>
		</div>
	);
}

export default VimageFullscreen;
