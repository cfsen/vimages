import "./App.css";

import { useModalKey } from './keyboard/KeyboardModule';
import { useCommand } from './context/vimagesCtx';
import FileSystemBrowser from "./filesystem/FilesystemBrowser";
import Navbar from "./components/Navbar";
import VimageGrid from "./components/VimageGrid";

function App() {
	const { handleCmd, pwd } = useCommand();

	useModalKey({
		onSequenceComplete: (seq) => {
			handleCmd(seq);
		},
	});


	return (
		<main className="container">
			<div className="row">
				<VimageGrid />
			</div>
			<div className="row">
				<FileSystemBrowser pwd={pwd} />
			</div>
			<div className="bottom-overlay">
				<Navbar pwd={pwd} />
			</div>
		</main>
	);
}

export default App;
