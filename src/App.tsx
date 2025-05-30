import { useState, useCallback, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import { useModalKey } from './keyboard/KeyboardModule';
import { useCommand } from './context/vimagesCtx';
import VimageGrid from "./components/VimageGrid";
import FileSystemBrowser from "./filesystem/FilesystemBrowser";
import Navbar from "./components/Navbar";

function App() {
	const { handleCmd } = useCommand();
	useModalKey({
		onSequenceComplete: (seq) => {
			handleCmd(seq);
		},
	});

	return (
		<main className="container">
			<div className="row">
				<FileSystemBrowser />
			</div>
			<div className="row">
				<VimageGrid />
			</div>
			<div className="bottom-overlay">
				<Navbar />
			</div>
		</main>
	);
}

export default App;
