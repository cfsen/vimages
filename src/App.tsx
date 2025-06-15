import "./App.css";

import VimageGrid from "@components/VimageGrid";
import Navbar from "@components/Navbar";
import VimageFullscreen from "@components/VimageFullscreen";

import { useGlobalCtx } from '@context/AppContext';
import { NavigationProvider } from "@context/NavigationContext";

import FileSystemBrowser from "@filesystem/FilesystemBrowser";

import { useModalKey } from '@keyboard/KeyboardModule';

function App() {
	const { handleCmd } = useGlobalCtx();

	useModalKey({
		onSequenceComplete: (seq) => {
			handleCmd(seq);
		},
	});

	return (
		<main>
			<div className="colContainer">
				<div className="fsCol">
					<div className="navigation-overlay">
						<NavigationProvider>
							<FileSystemBrowser />
						</NavigationProvider>
					</div>
				</div>
				<div className="col">
					<VimageFullscreen />
					<div className="row">
						<NavigationProvider>
							<VimageGrid />
						</NavigationProvider>
					</div>
				</div>
			</div>
			<div className="bottom-overlay">
				<Navbar />
			</div>
		</main>
	);
}

export default App;
