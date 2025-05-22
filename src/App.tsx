import { useState } from "react";
//import { invoke } from "@tauri-apps/api/core";
import "./App.css";

//import { useModalKey, CommandSequence } from "./components/eventhandlers/keyboard.ts";
import { useModalKey } from './keyboard/KeyboardModule';
import { CommandSequence } from './keyboard/Command';

function App() {
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);

	//async function greet() {
	//	// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
	//	//setGreetMsg(await invoke("greet", { name }));
	//}
	const sequence = useModalKey({
		onSequenceComplete: (seq) => {
			setCmdLog(cmdLog => [...cmdLog, seq]);
		},
	}
	);

	return (
	<main className="container">

		<div className="row">
			{cmdLog.map((cmd, index) => <div key={index}>{cmd.cmd.toString()}</div>)}
		</div>

	</main>
	);
}

export default App;
