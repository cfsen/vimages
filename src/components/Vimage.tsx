import { useEffect, useState } from 'react';
import styles from "./Vimage.module.css";

type VimageProps = {
	id: string;
	img?: ImageData;
};

function Vimage(props: VimageProps) {
	const [imageData, setImageData] = useState<ImageData>();

	useEffect(() => {
		setImageData(imageData);
	});

	return(
		<div className={styles.vimage}>
			<img src={`data:image/png;base64,${imageData}`} />
			{props.id}
		</div>
	);
}

export default Vimage;
