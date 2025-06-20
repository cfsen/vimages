import styles from "./Vimage.module.css";

export type VimageProps = {
	id: string;
	src: string | null;
};

// TODO: move styles out
function Vimage({ id, src }: VimageProps) {
	return (
		<div className={styles.vimageContainer}>
			{src ? (
				<img
					src={"http://127.0.0.1:8080/image?file=" + src}
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
