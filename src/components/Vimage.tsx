import { useEffect, useState } from 'react';
import { useCommand } from "./../context/vimagesCtx";
import { NavigableItem } from "./../context/NavigableItem";
import styles from "./Vimage.module.css";

type VimageProps = {
	id: string;
};

function Vimage(props: VimageProps) {
	const { cmdLog, handleCmd, updatePwd } = useCommand();
	const [imageData, setImageData] = useState<ImageData>();

	return(
		<div className={styles.vimage}>
			<img src={`data:image/png;base64,${imageData}`} />
			{props.id}
		</div>
	);
}

export default Vimage;
