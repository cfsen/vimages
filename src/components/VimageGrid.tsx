import React, { useState, useEffect, useRef } from 'react';
import { NavigableItem, NavigableItemType } from "./../context/NavigableItem";
import { useCommand } from "./../context/NavigationContext";
import Vimage from './Vimage';
import { RustApiAction, useRustApi } from "./../filesystem/RustApiBridge";
import { invoke } from "@tauri-apps/api/core";

type ThumbnailEntry = {
	path: string;
	blobUrl: string | null;
	status: 'loading' | 'loaded' | 'failed';
};

const VimageGrid: React.FC = () => {
	const [scale, setScale] = useState(1);
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);
	const [squaresPerRow, setSquaresPerRow] = useState(0);
	const [thumbnails, setThumbnails] = useState<Map<string, ThumbnailEntry>>(new Map());

	const squareBaseSize = 400;
	const isLoadingRef = useRef(false);

	const { imagesPerRow, currentDir } = useCommand();

	const { response: imagePaths, loading, error } = useRustApi({ action: RustApiAction.GetImages, path: currentDir.current });

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
		const fullSize = squareBaseSize * scale + 18;
		const perRow = Math.floor(containerWidth / fullSize);
		imagesPerRow.current = perRow;
		setSquaresPerRow(perRow);
	}, [containerWidth, scale]);

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
