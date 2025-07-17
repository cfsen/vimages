import "./App.css";
import { useEffect } from "react";

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
import Leader from "@ui/leader/ui.leader";
import ErrorPopup from "@ui/error/ui.error";

function App() {
	const { handleModeVisual, handleModeNormal, handleModeInsert, handleModeCommand } = useGlobalCtx();
	const keyboardMode = useAppState(state => state.mode);
	const setKeyboardMode = useAppState(state => state.setMode);

	// set up keyboard listener
	useEffect(() => {
		const handleKeyDown = (key: KeyboardEvent) => {
			key.preventDefault();
			modalKeyboard(
				key,
				{ callback: handleModeNormal },
				{ callback: handleModeVisual },
				{ callback: handleModeInsert },
				{ callback: handleModeCommand },
				{
					callback: setKeyboardMode,
					Mode: keyboardMode,
				}
			);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [keyboardMode]);

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
