import "./App.css";

import VimageGrid from "@components/VimageGrid";
import Navbar from "@components/Navbar";
import VimageFullscreen from "@components/VimageFullscreen";

import { useGlobalCtx } from '@context/AppContext';
import { NavigationProvider } from "@context/NavigationContext";

import FileSystemBrowser from "@components/FilesystemBrowser";

import { modalKeyboard } from '@keyboard/KeyboardModule';
import { useAppState } from "./context/AppContextStore";
import HelpOverlay from "./components/HelpOverlay";
import TitleBar from "./components/Titlebar";
import { UIComponent } from "./context/ContextTypes";

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
		<main
			className="tauriDragRegion"
			data-tauri-drag-region
		>
			<TitleBar />
			<HelpOverlay />
			<VimageFullscreen />
			<div className="colContainer">
				<NavigationProvider 
					key="np_fsBrowser" 
					component={UIComponent.fsBrowser} 
					initActive={true} 
					tabOrder={0}
				>
					<FileSystemBrowser />
				</NavigationProvider>
				<div className="col">
					<div className="row">
						<NavigationProvider 
							key="np_imgGrid" 
							component={UIComponent.imgGrid} 
							initActive={true} 
							tabOrder={1}
						>
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
