import { useAppState } from "@context/AppContextStore";
import { getImgFromCache } from "@context/api/axum.img.actions";

import styles from "./fs.module.css";

function DirBrowserCurrentPreview(){
	const imgs = useAppState(s => s.images);
	const path_hash = useAppState(state => state.currentDirHash);

	if(imgs.length > 0) {
		return (
			<div className={styles.fsPreview}>
				{imgs.slice(0,6).map((img, index) => (
					<div className={styles.fsImgBox}>
						<img 
							key={"fs.dir.browser.preview.i." + index + ".h." + img.img_hash} 
							src={getImgFromCache(img, path_hash)} 
							className={styles.fsImgPreview}
						/>
					</div>
				))}
			</div>
		);
	}
	else {
		return (
			<div className={styles.fsPreview}>
				no images in directory
			</div>
		)
	}
}

export default DirBrowserCurrentPreview;
