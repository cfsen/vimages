import { IAppState, useAppState } from "@app/app.context.store";
import { addInfoMessage, ClearSearch, getActiveNavigationProvider, getDirectory, nextNavProvider, nextWorkspace, raiseError, resetFullscreen } from "@app/app.context.actions";

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeNormal } from "@/context/key/key.module.handler.normal";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { overwriteBufferCommandMode } from "@/context/key/key.module";
import { UIComponent } from "@/context/context.types";
import { StoreApi } from "zustand";

export function NormalModeHandler(resultNormal: resultModeNormal){
	const {
		setMode,
		showHelp,
		setShowHelp,
		showError,
		setShowError,
		showInfo,
		setShowInfo,
		fullscreenImage,
		setFullscreenImage,
		activeNavigationContext,
		keepOpenInfo,
		fullscreenZoom,
		setFullscreenZoom,
		fullscreenOffsetX,
		setFullscreenOffsetX,
		fullscreenOffsetY,
		setFullscreenOffsetY,
		fullscreenRotate,
		setFullscreenRotate,
		fullscreenInvertCursor, fullscreenMoveStep, fullscreenRotateStep, fullscreenZoomStep,
		setInputBufferCommand,
		setSearchHitLastJump,
		searchHitIndexes,
	} = useAppState.getState();

	if(fullscreenImage) {
		let invertCursor = fullscreenInvertCursor; // set to 1 for non-inverted. does not feel right when panning.
		let moveDistance = fullscreenMoveStep;
		let rotateTurns = fullscreenRotateStep;
		let zoomBy = fullscreenZoomStep; // works, but could feel better.

		switch(resultNormal.cmd){
			case Command.Escape:
				if(showHelp) {
					setShowHelp(false);
					return;
				}
				setFullscreenImage(false);
				resetFullscreen(useAppState);
				break;
			case Command.ImageRotate:
				setFullscreenRotate(fullscreenRotate+rotateTurns);
				break;
			case Command.ImageZoomOut:
				setFullscreenZoom(fullscreenZoom != null ? fullscreenZoom - zoomBy : 1.0);
				break;
			case Command.ImageZoomIn:
				setFullscreenZoom(fullscreenZoom != null ? fullscreenZoom + zoomBy : 1.0);
				break;
			case Command.ImageZoomDefault:
				setFullscreenZoom(null);
				break;
			case Command.CenterView:
				resetFullscreen(useAppState);
				break;
		};

		// hijack cursor target if in fullscreen, to navigate around the image
		if(fullscreenZoom != null) {
			let mod = resultNormal.cmdSequence.modInt ?? 1;
			let repeatMod = mod > 1 ? mod : 1;
			let moveBy = invertCursor*moveDistance*repeatMod;
			switch(resultNormal.cmd){
				case Command.CursorUp:
					setFullscreenOffsetY(fullscreenOffsetY != null ? fullscreenOffsetY-moveBy : -moveBy);
					break;
				case Command.CursorDown:
					setFullscreenOffsetY(fullscreenOffsetY != null ? fullscreenOffsetY+moveBy : moveBy);
					break;
				case Command.CursorLeft:
					setFullscreenOffsetX(fullscreenOffsetX != null ? fullscreenOffsetX-moveBy : -moveBy);
					break;
				case Command.CursorRight:
					setFullscreenOffsetX(fullscreenOffsetX != null ? fullscreenOffsetX+moveBy : moveBy);
					break;
			}
			return;
		}
	}

	switch(resultNormal.cmd){
		case Command.ModeVisual:
			console.log("MODE SWAP -> Visual");
			setMode(Modal.Visual);
			break;

		case Command.ModeInsert:
			console.log("MODE SWAP -> Insert");
			setMode(Modal.Insert);
			break;

		case Command.Console:
			console.log("MODE SWAP -> Commmand");
			setMode(Modal.Command);
			break;

		case Command.Search:
			setMode(Modal.Command);
			setInputBufferCommand("/");
			overwriteBufferCommandMode({
				sequence: "/",
				cursor: 1,
				cmd: Command.Ignore,
			});
			break;

		case Command.SearchJumpPrev:
			let overrideJumpNext = traverseSearchHitsCursor(useAppState, Direction.Prev);
			if(overrideJumpNext !== null){
				setSearchHitLastJump(overrideJumpNext.hitsIdx);
				resultNormal = overrideJumpNext.res;
			}
			break;

		case Command.SearchJumpNext:
			let overrideJumpPrev = traverseSearchHitsCursor(useAppState, Direction.Next);
			if(overrideJumpPrev !== null){
				setSearchHitLastJump(overrideJumpPrev.hitsIdx);
				resultNormal = overrideJumpPrev.res;
			}
			break;

		case Command.Refresh:
			getDirectory(useAppState, ".");
			if(fullscreenImage) setFullscreenImage(false);
			addInfoMessage(useAppState, "Refreshing directory.");
			break;

		case Command.WorkspaceNext:
			if(fullscreenImage) setFullscreenImage(false);
			nextWorkspace(useAppState);
			break;

		case Command.WorkspacePrev:
			if(fullscreenImage) setFullscreenImage(false);
			nextWorkspace(useAppState);
			break;

		case Command.Debug:
			console.log("[DEBUG] AppContext:");
			console.log("Zustand store:", useAppState.getState());
			break;

		case Command.Escape:
			if(searchHitIndexes.length > 0){
				ClearSearch(useAppState);
			}
			if(showHelp) {
				setShowHelp(false);
				return;
			}
			if(fullscreenImage) {
				setFullscreenImage(false);
				return;
			}
			break;

		case Command.Error:
			console.log("ctx:handleCmd:error");
			raiseError(useAppState, "Unrecognized input. TODO: Make a toggle for this specific error.");
			break;

		case Command.Tab:
			console.log("ctx:handleCmd:tab"); 
			if(!nextNavProvider(useAppState)) console.error("ctx: no active navigation context available!");
			break;

		case Command.TauriFullscreen:
			getCurrentWindow().isFullscreen().then((fs) => {
				getCurrentWindow().setFullscreen(!fs);
			});
			break;
	}

	// Hide any errors
	if(showError) {
		setShowError(false);
	}

	// Hide info overlay
	if(showInfo && !keepOpenInfo) {
		setShowInfo(false);
	}

	// Navigation commands - delegate to active container
	if (activeNavigationContext) {
		const handler = useAppState.getState().navigationHandlers.get(activeNavigationContext);
		if (handler) {
			const wasHandled = handler.handleNavCmd(resultNormal);
			if (wasHandled) return;
		}
	}		
	console.log("Unhandled command:", resultNormal);
}

function simulateCommandJumpLast(idx: number, providerType: UIComponent): resultModeNormal | null {
	let indexOffset;
	switch(providerType){
		case UIComponent.imgGrid:
			indexOffset = 1;
			break;
		case UIComponent.dirBrowserMain:
			indexOffset = 2;
			break;
		default:
			return null;
	};
	return {
		sequence: idx + indexOffset + "G",
		cmd: Command.JumpLast,
		cmdSequence: {
			cmd: Command.JumpLast,
			modInt: idx + indexOffset,
		},
		mode: Modal.Normal,
	};
}

enum Direction {
	Next,
	Prev,
};
function traverseSearchHitsCursor(store: StoreApi<IAppState>, dir: Direction): { hitsIdx: number, res: resultModeNormal } | null {
	let hits = store.getState().searchHitIndexes;
	if(hits.length === 0)
		return null;

	let provider = getActiveNavigationProvider(store);
	if(provider === null)
		return null;

	let currentIndex = store.getState().searchHitLastJump ?? 0;
	if(dir === Direction.Prev) {
		if(currentIndex > 0) {
			currentIndex -= 1;
		}
		else {
			currentIndex = hits.length - 1;
		}
	}
	else if(dir === Direction.Next) {
		if(currentIndex >= hits.length-1){
			currentIndex = 0;
		}
		else {
			currentIndex += 1;
		}
	}

	let override = simulateCommandJumpLast(hits[currentIndex], provider.component);
	if(override === null)
		return null

	return { hitsIdx: currentIndex, res: override };
}
