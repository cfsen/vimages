import "./App.css";

import { useGlobalCtx } from "@app/app.context";
import { useAppState } from "@app/app.context.store";
import { modalKeyboard } from '@key/key.module';
import { NavigationProvider } from "@nav/nav.provider";

import { UIComponent } from "@context/context.types";

import VimageFullscreen from "@img/img.fullscreen";
import VimageGrid from "@img/img.grid";
import Navbar from "@ui/navbar/ui.navbar";
import HelpOverlay from "@ui/help/ui.help.overlay";
import TitleBar from "@ui/titlebar/ui.titlebar";
import DirBrowser from "@fs/dir.browser";
import Leader from "./components/ui/leader/ui.leader";
import ErrorPopup from "./components/ui/error/ui.error";

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
			<Leader />
			<HelpOverlay />
			<ErrorPopup />
			<VimageFullscreen />
			<DirBrowser />
			<div className="colContainer">
				<div className="col">
					<div className="row">
						<NavigationProvider 
							key="np_imgGrid" 
							component={UIComponent.imgGrid} 
							initActive={false} 
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
