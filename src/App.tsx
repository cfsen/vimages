import "./App.css";
import { useEffect } from "react";

import { useGlobalCtx } from "@app/app.context";
import { useAppState } from "@app/app.context.store";

import { modalKeyboard } from '@key/key.module';

import VimageFullscreen from "@img/img.fullscreen";
import VimageBrowser from "@img/img.browser";

import Navbar from "@ui/navbar/ui.navbar";
import HelpOverlay from "@ui/help/ui.help.overlay";
import TitleBar from "@ui/titlebar/ui.titlebar";
import Leader from "@ui/leader/ui.leader";
import ErrorPopup from "@ui/error/ui.error";
import InfoPopup from "@ui/info/ui.info";

import DirBrowser from "@fs/dir.browser";
import SelectionOverview from "./components/ui/selection/ui.selection.overview";
import { resizeScrollToActive } from "@app/app.context.actions";

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
			resizeScrollToActive(useAppState);
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
			<VimageBrowser />
			<SelectionOverview />
			<Navbar />
		</main>
	);
}

export default App;
