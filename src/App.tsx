import { useState, useCallback, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import { useModalKey } from './keyboard/KeyboardModule';
import { useCommand } from './context/vimagesCtx';
import VimageGrid from "./components/VimageGrid";

function App() {
	const { handleCmd } = useCommand();
	const [fsPwdEntities, setFsPwdEntities] = useState<string>();

	const fs_list = useCallback( async (path: string) => {
		const res = await invoke("fs_list_directory", { path });
		setFsPwdEntities(res as string);
		console.log("fslist");
	}, []);
	
	useEffect(() => {
		fs_list(".");
	}, [fs_list]);


	useModalKey({
		onSequenceComplete: (seq) => {
			handleCmd(seq);
		},
	}
	);

	return (
		<main className="container">
			<div className="row">
				<VimageGrid />
			</div>
			<div className="row">
				{fsPwdEntities}
			</div>
		</main>
	);
}

export default App;
