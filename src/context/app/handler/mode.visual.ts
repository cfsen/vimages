import { useAppState } from "@app/app.context.store";
import { raiseError } from "@app/app.context.actions";

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeNormal } from "@key/key.module.handler.normal";

export function VisualModeHandler(resultNormal: resultModeNormal){
	const {
		setMode,
		showHelp, setShowHelp,
		showError, setShowError,
		showInfo, setShowInfo,
		activeNavigationContext,
		keepOpenInfo,
	} = useAppState.getState();


	switch(resultNormal.cmd){
		case Command.Console:
			setMode(Modal.Command);
			break;

		case Command.ModeVisualExit:
			if(showHelp) {
				setShowHelp(false);
				return;
			}
			break;

		case Command.Error:
			console.log("ctx:handleCmd:error");
			raiseError(useAppState, "Unrecognized input.");
			return;
	}

	// NOTE: filter out commands that trigger behavior 
	// in normal mode, that visual mode should not have
	// e.g. opening fullscreen images
	resultNormal.cmd = filterNonVisualCommands(resultNormal.cmd);

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
			const wasHandled = handler.handleSelectionCmd(resultNormal);
			if (wasHandled) return;
		}
	}		
	console.log("[Visual] Unhandled command:", resultNormal);
}

const filterCommands = new Set<Command>();
filterCommands.add(Command.TauriFullscreen);
filterCommands.add(Command.WorkspaceNext);
filterCommands.add(Command.WorkspacePrev);

function filterNonVisualCommands(cmd: Command): Command {
	if(filterCommands.has(cmd)) {
		console.log("Filtered command: " + Command[cmd]);
		return Command.Ignore;
	}
	return cmd;
}
