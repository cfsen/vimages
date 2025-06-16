import { invoke } from "@tauri-apps/api/core";
import React, { useState, useEffect, useRef } from "react";

import { useAppState } from "@context/AppContextStore";
import { NavigableItem, NavigableItemType } from "@context/NavigableItem";
import { useCommand } from "@context/NavigationContext";
import { RustApiAction } from "@filesystem/RustApiBridge";

import Vimage from "./Vimage";

type ThumbnailEntry = {
	path: string;
	blobUrl: string | null;
	status: 'loading' | 'loaded' | 'failed';
};

const VimageGrid: React.FC = () => {
	const currentDir = useAppState(state => state.currentDir);
	const { imagesPerRow, setItemsPerRow, navCtxId } = useCommand();

	const [thumbnails, setThumbnails] = useState<Map<string, ThumbnailEntry>>(new Map());

	const [scale, setScale] = useState(1);		// TODO: move to global state
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);

	// TODO: refactor01 move to zustand
	const [squaresPerRow, setSquaresPerRow] = useState(0);

	const squareBaseSize = 400;
	const isLoadingRef = useRef(false);

	const [imagePaths, setImagePaths] = useState<string[]>();
	const [, setLoading] = useState<boolean>(true);

	// TODO: #refactor00 redundant
	useEffect(() => {
		setLoading(true);
		invoke(RustApiAction.GetImages, { path: currentDir })
			.then(res => {
				setImagePaths(res as string[])
				setLoading(false);
			});
	}, [currentDir]);

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

		// TODO: refactor01 move to zustand
		imagesPerRow.current = perRow;
		setItemsPerRow(perRow);

		setSquaresPerRow(perRow);
	}, [containerWidth, scale]);

	// TODO: #refactor00 redundant
	// Initialize thumbnails map and start queue when imagePaths change
	useEffect(() => {
		if (!imagePaths || imagePaths.length === 0) return;

		// Initialize all thumbnails as loading
		const newThumbnails = new Map<string, ThumbnailEntry>();
		imagePaths.forEach(path => {
			newThumbnails.set(path, {
				path,
				blobUrl: null,
				status: 'loading'
			});
		});
		setThumbnails(newThumbnails);

		// Start loading queue
		if (!isLoadingRef.current) {
			loadThumbnailsQueue(imagePaths);
		}
	}, [imagePaths]);

	const loadThumbnailsQueue = async (paths: string[]) => {
		if (isLoadingRef.current) return;
		isLoadingRef.current = true;

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];

			try {
				const buffer: number[] = await invoke('fs_get_image_async', { path });
				const uint8Array = new Uint8Array(buffer);
				const blob = new Blob([uint8Array], { type: 'image/jpeg' });
				const url = URL.createObjectURL(blob);

				setThumbnails(prev => {
					const newMap = new Map(prev);
					newMap.set(path, { path, blobUrl: url, status: 'loaded' });
					return newMap;
				});
			} catch (e) {
				setThumbnails(prev => {
					const newMap = new Map(prev);
					newMap.set(path, { path, blobUrl: null, status: 'failed' });
					return newMap;
				});
			}
		}

		isLoadingRef.current = false;
	};

	// Cleanup blob URLs on unmount
	useEffect(() => {
		return () => {
			thumbnails.forEach(thumbnail => {
				if (thumbnail.blobUrl) {
					URL.revokeObjectURL(thumbnail.blobUrl);
				}
			});
		};
	}, []);

	// Don't render anything until we have the image paths
	if (!imagePaths || imagePaths.length === 0) {
		return <div>Loading images...</div>;
	}

	return (
		<div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${squaresPerRow}, 0fr)`,
					gap: '9px',
				}}
			>
				{imagePaths.map((path, idx) => {
					const thumbnail = thumbnails.get(path);
					const status = thumbnail?.status || 'loading';
					const blobUrl = thumbnail?.blobUrl;

					return (
						<NavigableItem
							key={"imgGrid" + idx}
							id={"imgGrid" + idx}
							itemType={NavigableItemType.Image}
							data={path}
							parentNavCtxId={navCtxId}
						>
							<div
								style={{
									width: `${squareBaseSize * scale}px`,
									height: `${squareBaseSize * scale}px`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '1rem',
									border: '1px solid #111',
								}}
							>
								{status === 'loading' && <span>Loading...</span>}
								{status === 'failed' && <span style={{ color: 'red' }}>Failed</span>}
								{status === 'loaded' && blobUrl && (
									<Vimage id={"vimage" + idx} src={blobUrl} />
								)}
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
			<p>Squares per row: {squaresPerRow}</p>
		</div>
	);
};

export default VimageGrid;
