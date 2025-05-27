import React, { useState, useEffect } from 'react';
import { NavigableItem } from "./../context/NavigableItem";
import { useCommand } from "../context/vimagesCtx";
import Vimage from './Vimage';


const VimageGrid: React.FC = () => {
	const [scale, setScale] = useState(1); // manual scaling factor
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);
	const [squaresPerRow, setSquaresPerRow] = useState(0);

	const squareBaseSize = 200; // base square size in px

	const { setImagesPerRow } = useCommand();

	useEffect(() => {
		const handleResize = () => {
			setContainerWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		const fullSize = squareBaseSize * scale + 18; // account for css gap
		const perRow = Math.floor(containerWidth / fullSize);
		setImagesPerRow(perRow);	// ctx update
		setSquaresPerRow(perRow);
	}, [containerWidth, scale]);

	// TODO: mock source
	//const squares = Array.from({ length: squaresPerRow * 5 }); // 5 rows worth
	const squares = Array.from({ length: 50 }); 

	return (
		<div>
			<div 
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${squaresPerRow}, 0fr)`,
					gap: '9px',
				}}
			>
			{squares.map((_, idx) => (
				<NavigableItem id={"imgGrid" + idx}>
					<div 
						key={idx} 
						style={{
						  width: `${squareBaseSize * scale}px`,
						  height: `${squareBaseSize * scale}px`,
						  display: 'flex',
						  alignItems: 'center',
						  justifyContent: 'center',
						  fontSize: '1rem',
						  border: '1px solid #999',
						}}
					>
						<Vimage id={"vimage" + idx} />
					</div>
				</NavigableItem>
			))}
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
