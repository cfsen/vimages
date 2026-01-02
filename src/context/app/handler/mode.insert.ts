import { Command } from "@key/key.command";
import { useAppState } from "../app.context.store";
import { resultModeCommand } from "@/context/key/key.module.handler.cmd";
import { InsertModeCompAction } from "@/context/context.types";

export function InsertModeHandler(resultInsert: resultModeCommand){
	const {
		insertBuffer,
		setInsertBuffer,
		insertCompAction,
	} = useAppState.getState();

	// NOTE: clearing the buffer on escape is handled by key module,
	// which will send an empty string when escape is pressed.
	setInsertBuffer(resultInsert.sequence);

	// Send buffer on return
	if(resultInsert.cmd !== Command.Return) {
		return;
	}

	if(insertCompAction == InsertModeCompAction.EntityBatchRename) {
		// TODO: impl call to backend for renaming
		console.debug("Call backend to execute rename.");
		console.debug("Files: " + insertBuffer);
	}
}

