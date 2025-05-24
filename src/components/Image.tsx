import { useEffect, useState } from 'react';
import { useCommand } from "./../context/vimagesCtx";
import { NavigableItem } from "./../context/NavigableItem";
import styles from "./Vimage.module.css";

type VimageProps = {
	id: string;
};

function Vimage(props: VimageProps) {
	const { cmdLog, handleCmd, updatePwd } = useCommand();

	return(
		<NavigableItem id={props.id}>
			<div className={styles.vimage}>{props.id}</div>
		</NavigableItem>
	);
}

export default Vimage;
