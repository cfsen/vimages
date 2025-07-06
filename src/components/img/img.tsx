import styles from "./img.module.css";

export type VimageProps = {
	id: string;
	src: string | null;
};

function Vimage({ id, src }: VimageProps) {
	return (
		<div className={styles.vimageContainer}>
			{src ? (
				<img
					src={src}
					alt={`Image ${id}`}
					className={styles.vimageImg} 
					onError={() => {
						console.error(`Failed to load image: ${id}`);
					}}
				/>
			) : (
					<div 
						className={styles.vimageImg} 
					>
						No image data
					</div>
				)}
		</div>
	);
}

export default Vimage;
