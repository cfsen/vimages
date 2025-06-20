import React, { useState, useEffect } from "react";

import { useAppState } from "@context/AppContextStore";
import { NavigableItem, NavigableItemType } from "@context/NavigableItem";
import { useCommand } from "@context/NavigationContext";
import Vimage from "./Vimage";

import styles from "./Vimage.module.css";

const VimageGrid: React.FC = () => {
	const images = useAppState(state => state.images);

	const { itemsPerRow, setItemsPerRow, navCtxId } = useCommand();
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);

	// TODO: move to state
	const squareBaseSize = 400;

	// TODO: move to state
	const [scale, setScale] = useState(1);

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
								<Vimage id={"vimage" + idx} src={img.filename} />
								<div className={styles.imgFilename}>
									{img.filename}
								</div>
							</div>
						</NavigableItem>
					);
				})}
			</div>
			<label>
				Scale:
				<input
					type="range"
					min="0.5"
					max="3"
					step="0.1"
					value={scale}
					onChange={(e) => setScale(Number(e.target.value))}
				/>
			</label>
			<p>Squares per row: {itemsPerRow}</p>
		</div>
	);
};

export default VimageGrid;
