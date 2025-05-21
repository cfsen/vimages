import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { useModalKey, CommandSequence } from "./components/eventhandlers/keyboard.ts";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }));
	}
	const sequence = useModalKey({
		onSequenceComplete: (seq) => {
			setCmdLog(cmdLog => [...cmdLog, seq]);
		},
	}
	);

	return (
	<main className="container">
		<h1>Welcome to Tauri + React</h1>

		<div className="row">
			<p>{sequence}</p>
		</div>
		<div className="row">
			<p>{cmdLog.map((cmd, index) => <span key={index}>{cmd.cmd.toString()}</span>)}</p>
		</div>

		<form
			className="row"
			onSubmit={(e) => { e.preventDefault(); greet(); }}
		>
			<input
				id="greet-input"
				onChange={(e) => setName(e.currentTarget.value)}
				placeholder="Enter a name..."
			/>

			<button type="submit">Greet</button>
		</form>

		<p>{greetMsg}</p>

	</main>
	);
}

export default App;
