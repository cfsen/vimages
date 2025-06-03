import "./App.css";

import { useModalKey } from './keyboard/KeyboardModule';
import { useGlobalCtx } from './context/vimagesCtx';
import FileSystemBrowser from "./filesystem/FilesystemBrowser";
import Navbar from "./components/Navbar";
import VimageGrid from "./components/VimageGrid";
import { NavigationProvider } from "./context/NavigationContext";

function App() {
	const { handleCmd } = useGlobalCtx();

	useModalKey({
		onSequenceComplete: (seq) => {
			handleCmd(seq);
		},
	});


	return (
		<main className="container">
			<div className="row">
				<NavigationProvider>
					<FileSystemBrowser />
				</NavigationProvider>
			</div>
			<div className="row">
				<NavigationProvider>
					<VimageGrid />
				</NavigationProvider>
			</div>
			<div className="bottom-overlay">
				<Navbar />
			</div>
		</main>
	);
}

export default App;
