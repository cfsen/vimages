import { StoreApi } from "zustand";
import { Event as TauriEvent} from "@tauri-apps/api/event";

import { IAppState } from "@app/app.context.store";
import { addInfoMessage, getDirectorySkipLock, IPC_PendingRemoves } from "@app/app.context.actions";

import { IPC_MsgInfoWindow, IPC_QueueStatus } from "./app.event.types";

export const eventHandleMsgInfoWindow = (event: TauriEvent<IPC_MsgInfoWindow>, useAppState: StoreApi<IAppState>) => {
	addInfoMessage(useAppState, event.payload.message);
};

export const eventHandleQueueState = (event: TauriEvent<IPC_QueueStatus>, store: StoreApi<IAppState>) => {
	// TODO: REFACTOR: REFACTOR_IMAGE_PIPELINE 
	// currently only receives redraw messages when lock should be released.
	//  - implement proper opcodes later.
	//  - backend queue pipeline needs to be improved to discern individual directories.

	if(event.payload.queueEmpty) {
		console.log("Queue is empty, clear all locks.");
		IPC_PendingRemoves.clear();

		// Redraw
		if(event.payload.path === store.getState().currentDir)
			getDirectorySkipLock(store, ".");
		return;
	}

	if(!IPC_PendingRemoves.has(event.payload.path)){
		console.warn("eventHandleQueueState was called, but no lock exists for path: " + event.payload.path);
		return;
	}

	IPC_PendingRemoves.delete(event.payload.path);

	if(event.payload.path !== store.getState().currentDir){
		console.log("Queue message redraw call ignored, path not currentDir.");
		console.log("path=" + event.payload.path + " || currentDir=" + store.getState().currentDir);
		return;
	}

	if(event.payload.redraw) {
		getDirectorySkipLock(store, ".");
		return;
	}
}
