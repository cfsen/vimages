import React, { useState, useEffect } from "react";

import { useAppState } from "@context/AppContextStore";
import { NavigableItem, NavigableItemType } from "@context/NavigableItem";
import { useCommand } from "@context/NavigationContext";
import Vimage from "./Vimage";

import styles from "./Vimage.module.css";
import { EntityImage } from "@/context/ContextTypes";

function fromCache(img: EntityImage, path_hash: string | null, axum_port: string | null) {
	if(axum_port === null) {
		// TODO: error handling, show to user
		console.log("axum unavailable!");
	}

	if(!img.has_thumbnail || path_hash === null) {
		return `http://127.0.0.1:${axum_port}/image?file=${img.filename}`;
	}
	return `http://127.0.0.1:${axum_port}/cache/${path_hash}/${img.img_hash}`;
}

const VimageGrid: React.FC = () => {
	const images = useAppState(state => state.images);
	const path_hash = useAppState(state => state.currentDirHash);
	const axum_port = useAppState(state => state.axum_port);

	const squareBaseSize = useAppState(state => state.imageGridSize);
	const scale = useAppState(state => state.imageGridScale);

	const { itemsPerRow, setItemsPerRow, navCtxId } = useCommand();
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);

	// Resize handler
	useEffect(() => {
		const handleResize = () => {
			setContainerWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const fullSize = squareBaseSize * scale + 18; // account for padding between elements
		const perRow = Math.floor((containerWidth-350) / fullSize); // account for filesystem sidebar

		setItemsPerRow(perRow);
	}, [containerWidth, scale]);


	return (
		<div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${itemsPerRow}, 0fr)`,
					gap: '9px',
				}}
			>
				{images.map((img, idx) => {

					return (
						<NavigableItem
							key={"imgGrid" + idx + "_" + img.img_hash}
							id={"imgGrid" + idx + "_" + img.img_hash}
							itemType={NavigableItemType.Image}
							data={img.filename}
							parentNavCtxId={navCtxId}
						>
							<div
								style={{
									width: `${squareBaseSize * scale}px`,
									height: `${squareBaseSize * scale}px`,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '1rem',
									border: '1px solid #111',
								}}
							>
								<Vimage id={"vimage" + idx} src={fromCache(img, path_hash, axum_port)} />
								<div className={styles.imgFilename}>
									{img.filename}
								</div>
							</div>
						</NavigableItem>
					);
				})}
			</div>
			{
				// TODO: should be settable via :set imgscale 
				//<label>
				//	Scale:
				//	<input
				//		type="range"
				//		min="0.5"
				//		max="3"
				//		step="0.1"
				//		value={scale}
				//		onChange={(e) => setScale(Number(e.target.value))}
				//	/>
				//</label>
				//<p>Squares per row: {itemsPerRow}</p>
			}
		</div>
	);
};

export default VimageGrid;
