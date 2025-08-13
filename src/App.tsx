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
import InfoPopup from "@ui/info/ui.info";

import { Modal } from "@key/key.types";

function App() {
	const { handleModeVisual, handleModeNormal, handleModeInsert, handleModeCommand } = useGlobalCtx();
	const keyboardMode = useAppState(state => state.mode);
	const setKeyboardMode = useAppState(state => state.setMode);
	const setWindowWidth = useAppState(state => state.setUiWindowInnerWidth);

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

	// track window size
	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<main
			className="tauriDragRegion"
			data-tauri-drag-region
		>
			<TitleBar />
			<Leader />
			<HelpOverlay />
			<ErrorPopup />
			<InfoPopup />
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
			<div 
				className="bottom-overlay"
				style={{
					zIndex: keyboardMode === Modal.Command ? 1005 : 'auto',
				}}
			>
				<Navbar />
			</div>
		</main>
	);
}

export default App;
