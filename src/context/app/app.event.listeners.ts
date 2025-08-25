import { StoreApi } from "zustand";
import { Event as TauriEvent} from "@tauri-apps/api/event";

import { IAppState } from "@app/app.context.store";
import { addInfoMessage, updateImageThumbnailState } from "@app/app.context.actions";

import { IPC_MsgInfoWindow, IPC_QueueOpCode, IPC_QueueStatus } from "./app.event.types";

export const eventHandleMsgInfoWindow = (event: TauriEvent<IPC_MsgInfoWindow>, useAppState: StoreApi<IAppState>) => {
	addInfoMessage(useAppState, event.payload.message);
};

export const eventHandleQueueState = (event: TauriEvent<IPC_QueueStatus>, store: StoreApi<IAppState>) => {
	// TODO: handle other messages

	let msg = event.payload as IPC_QueueStatus;

	if(msg.opcode === IPC_QueueOpCode.ImageComplete) {
		if(msg.imgHash === null) {
			console.error("Incomplete message from backend. OpCode=ImageComplete, but imgHash was null.");
			return;
		}
		updateImageThumbnailState(store, msg.imgHash, true);
	}

	return;
}
