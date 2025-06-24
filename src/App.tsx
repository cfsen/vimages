import "./App.css";

import VimageGrid from "@components/VimageGrid";
import Navbar from "@components/Navbar";
import VimageFullscreen from "@components/VimageFullscreen";

import { useGlobalCtx } from '@context/AppContext';
import { NavigationProvider } from "@context/NavigationContext";

import FileSystemBrowser from "@filesystem/FilesystemBrowser";

import { modalKeyboard } from '@keyboard/KeyboardModule';
import { useAppState } from "./context/AppContextStore";
import HelpOverlay from "./components/HelpOverlay";

function App() {
	const { handleModeVisual, handleModeNormal, handleModeInsert, handleModeCommand } = useGlobalCtx();
	const keyboardMode = useAppState(state => state.mode);
	const setKeyboardMode = useAppState(state => state.setMode);

	modalKeyboard(
		{
			callback: handleModeNormal
		},
		{
			callback: handleModeVisual
		},
		{
			callback: handleModeInsert
		},
		{
			callback: handleModeCommand
		},
		{
			callback: setKeyboardMode,
			Mode: keyboardMode,
		}
	);

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
					<HelpOverlay />
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
