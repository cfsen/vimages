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
		<div className={styles.vimage}>{props.id}</div>
	);
}

export default Vimage;
