import styles from "./Vimage.module.css";
type VimageProps = {
	id: string;
	src: string | null;
};

// TODO: move styles out
function Vimage({ id, src }: VimageProps) {
	return (
		<div className={styles.vimage}>
			{src ? (
				<img
					src={src}
					alt={`Image ${id}`}
					style={{
						width: '100%', 
						height: '100%', 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						backgroundColor: '#f0f0f0',
						fontSize: '24px'
					}}
					onError={() => {
						console.error(`Failed to load image: ${id}`);
					}}
				/>
			) : (
					<div 
						style={{
							width: '100%', 
							height: '100%', 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center',
							backgroundColor: '#f0f0f0',
							fontSize: '24px'
						}}>
						No image data
					</div>
				)}
		</div>
	);
}

export default Vimage;
