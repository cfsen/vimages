import React, { useState, useEffect } from "react";

import { useAppState } from "@app/app.context.store";
import { getImgFromCache } from "@context/api/axum.img.actions";
import { useCommand } from "@nav/nav.provider";

import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@nav/nav.types";
import Vimage from "./img";

import styles from "./img.module.css";
import { Workspace } from "@/context/context.types";

const VimageGrid: React.FC = () => {
	const workspaceActive = useAppState(state => state.workspaceActive);

	const images = useAppState(state => state.images);
	const path_hash = useAppState(state => state.currentDirHash);
	const fullscreen = useAppState(state => state.fullscreenImage);

	const {itemsPerRow, setItemsPerRow} = useCommand();
	const [displayGrid, setDisplayGrid] = useState<boolean>();

	// layout calculation
	const containerWidth = useAppState(s => s.uiWindowInnerWidth);
	const squareBaseSize = useAppState(state => state.imageGridSize);
	const scale = useAppState(state => state.imageGridScale);
	const gap = useAppState(s => s.imageGridGap);
	const border = useAppState(s => s.imageGridBorder);
	const window_padding = useAppState(s => s.imageGridWindowPadding);
	const maxFilenameLength = useAppState(s => s.imageGridMaxFilenameLength);

	// hide grid when entering fullscreen to also hide scrollbar
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		if (fullscreen) {
			timeoutId = setTimeout(() => {
				setDisplayGrid(false);
			}, 2000);
		} else {
			setDisplayGrid(true);
		}

		return () => {
			clearTimeout(timeoutId);
		};
	}, [fullscreen]);

	// hide or show image grid workspace
	useEffect(() => {
		setDisplayGrid(workspaceActive === Workspace.ImageGrid);
	}, [workspaceActive]);

	// elements per row calculation for cursor logic
	useEffect(() => {
		const imgContainerSize = squareBaseSize * scale + 2*gap + 2*border; // account for space between elements
		const perRow = Math.floor((containerWidth) / imgContainerSize);

		setItemsPerRow(perRow);
	}, [containerWidth, scale]);

	return (
		<div style={{
			display: displayGrid ? '' : 'none',
			opacity: fullscreen ? 0 : 1,
			transition: 'opacity 1.0s ease'
		}}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${itemsPerRow}, 0fr)`,
					gap: `${gap}px`,
					padding: `${window_padding}`,
				}}
			>
				{images.map((img, idx) => {return (
					<div
						style={{
							width: `${squareBaseSize * scale}px`,
							height: `${squareBaseSize * scale}px`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '1rem',
							border: `${border}px solid rgba(0,0,0,0.2)`,
						}}
						key={"imgGrid" + idx + "_" + img.img_hash}
					>

						{img.has_thumbnail ? 
							<Vimage 
								id={"vimage" + idx} 
								src={getImgFromCache(img, path_hash) } 
							/>
							: "Processing image."}

						<div className={styles.imgFilename}>
							<NavWrapper
								key={"imgGrid" + idx + "_" + img.img_hash}
								id={"imgGrid" + idx + "_" + img.img_hash}
								itemType={NavWrapperItemType.Image}
								data={img.filename}
							>
								<div
									style={{padding: '0.5em 0 0.3em 0'}}
								>
									{trimFilename(img.filename, maxFilenameLength)}
								</div>
							</NavWrapper>
						</div>
					</div>
				);})}
			</div>
		</div>
	);
};

function trimFilename(filename: string, maxLength: number): string {
	if(filename.length < maxLength)
		return filename;
	return filename.substring(0, maxLength);
}

export default VimageGrid;
