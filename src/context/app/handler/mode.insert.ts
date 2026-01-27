import { Command } from "@key/key.command";
import { useAppState } from "../app.context.store";
import { resultModeCommand } from "@/context/key/key.module.handler.cmd";
import { InsertModeCompAction } from "@/context/context.types";
import { raiseError } from "../app.context.actions";
import { invoke } from "@tauri-apps/api/core";

export function InsertModeHandler(resultInsert: resultModeCommand){
	const {
		insertBuffer,
		setInsertBuffer,
		insertCompAction,
		setInsertCompAction,
	} = useAppState.getState();

	// NOTE: clearing the buffer on escape is handled by key module,
	// which will send an empty string when escape is pressed.
	setInsertBuffer(resultInsert.sequence);

	// Reset any flags raised when entering insert mode
	if(resultInsert.cmd === Command.Escape) {
		setInsertCompAction(null);
	}

	// Send buffer on return
	if(resultInsert.cmd === Command.Return) {
		callHandler(insertCompAction);
	}

}

const handlers = {
	[InsertModeCompAction.EntityBatchRename]: handleBatchRename,
};

function callHandler(action: InsertModeCompAction | null) {
	if(action === null) {
		console.error("Insert mode attempted to execute an undefined action.");
		raiseError(useAppState, "Insert mode attempted to execute an undefined action.");
		return;
	}

	handlers[action]();
}

function handleBatchRename(){
	console.debug("handleBatchRename execution called.");
	let selection = useAppState.getState().entitySelectionBuffer;

	if(selection === null) {
		console.error("Batch rename was called, but selection was null");
		raiseError(useAppState, "Batch rename was called, but selection was null.");
		return;
	}

	invoke("exec_batch_rename", {
		items: Array.from(selection),
		pattern: useAppState.getState().insertBuffer,
		path: useAppState.getState().currentDir
	});

	// TODO: refresh directory
}
