import React, { useState, useEffect } from "react";

import { useAppState } from "@app/app.context.store";
import { getImgFromCache } from "@context/api/axum.img.actions";
import { useCommand } from "@nav/nav.provider";

import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@nav/nav.types";
import Vimage from "./img";

import styles from "./img.module.css";

const VimageGrid: React.FC = () => {
	const images = useAppState(state => state.images);
	const path_hash = useAppState(state => state.currentDirHash);

	const squareBaseSize = useAppState(state => state.imageGridSize);
	const scale = useAppState(state => state.imageGridScale);

	const { itemsPerRow, setItemsPerRow } = useCommand();
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);

	// TODO: Resize handler TODO_MOVE_RESIZE_EVENT
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
		// TODO: needs to be an option if sidebar+grid will continue being a workspace
		//const perRow = Math.floor((containerWidth-350) / fullSize); // account for filesystem sidebar
		const perRow = Math.floor((containerWidth) / fullSize); // account for filesystem sidebar

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
						<NavWrapper
							key={"imgGrid" + idx + "_" + img.img_hash}
							id={"imgGrid" + idx + "_" + img.img_hash}
							itemType={NavWrapperItemType.Image}
							data={img.filename}
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
									border: '1px solid rgba(0,0,0,0.3)',
								}}
							>
								<Vimage id={"vimage" + idx} src={getImgFromCache(img, path_hash) } />
								<div className={styles.imgFilename}>
									{img.filename}
								</div>
							</div>
						</NavWrapper>
					);
				})}
			</div>
		</div>
	);
};

export default VimageGrid;
