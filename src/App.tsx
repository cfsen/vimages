import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { useModalKey } from './keyboard/KeyboardModule';
import { CommandSequence } from './keyboard/Command';

import { useCommand } from './context/vimagesCtx';
import Vimage from "./components/Vimage";
import VimageGrid from "./components/VimageGrid";

function App() {
	const { handleCmd } = useCommand();
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
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
			setCmdLog(cmdLog => [...cmdLog, seq]);
		},
	}
	);

//{cmdLog.map((cmd, index) => <div key={index}>{cmd.cmd.toString()}</div>)}
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
