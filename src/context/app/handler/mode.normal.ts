import { useAppState } from "@app/app.context.store";
import { getDirectory, nextNavProvider, nextWorkspace, raiseError } from "@app/app.context.actions";

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeNormal } from "@/context/key/key.module.handler.normal";

export function NormalModeHandler(resultNormal: resultModeNormal){
	const { 
		setMode, 
		showHelp, 
		setShowHelp, 
		showError,
		setShowError,
		showInfo,
		setShowInfo,
		activeNavigationContext, 
	} = useAppState.getState();

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

		case Command.Refresh:
			getDirectory(useAppState, ".");
			break;

		case Command.WorkspaceNext:
			// TODO: TODO_WORKSPACE_SELECTION
			nextWorkspace(useAppState);
			break;

		case Command.WorkspacePrev:
			// TODO: TODO_WORKSPACE_SELECTION
			nextWorkspace(useAppState);
			break;

		case Command.Debug:
			console.log("[DEBUG] AppContext:");
			console.log("Zustand store:", useAppState.getState());
			break;

		case Command.Escape:
			if(showHelp) setShowHelp(false);
			console.log("ctx:handleCmd:escape");
			break;

		case Command.Error:
			console.log("ctx:handleCmd:error");
			raiseError(useAppState, "Unrecognized input. TODO: Make a toggle for this specific error.");
			break;

		case Command.Tab:
			console.log("ctx:handleCmd:tab"); 
			if(!nextNavProvider(useAppState)) console.error("ctx: no active navigation context available!");
			break;
	}

	// Hide any errors
	if(showError) {
		setShowError(false);
	}

	// Hide info overlay
	// TODO: config toggle for behavior, allow keep-open
	if(showInfo) {
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

