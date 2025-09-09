import { StoreApi } from "zustand";
import { Event as TauriEvent} from "@tauri-apps/api/event";

import { IAppState } from "@app/app.context.store";
import { addInfoMessage, addInfoMessageArray, updateImageThumbnailState, updateImageThumbnailStateBatch } from "@app/app.context.actions";

import { IPC_DataStringArray, IPC_MsgInfoWindow, IPC_QueueOpCode, IPC_QueueStatus } from "./app.event.types";

export const eventHandleMsgInfoWindow = (event: TauriEvent<IPC_MsgInfoWindow>, useAppState: StoreApi<IAppState>) => {
	addInfoMessage(useAppState, event.payload.message);
};

// NOTE: image pipeline can output images faster than react can complete state updates, causing UI lag.
// batching updates to images to partially mitigate this.
// TODO: review DS and explore other options for potential improvements

// double buffer thumbnail updates
const flushTimeout = 200; // [ms] to wait without pushes to buffer before clearing
const thumbBufFlushThreshold = 100; // capacity of each buffer

let thumbTimerFlush: number | null = null;

let thumbBuf: Set<string>[] = [];
thumbBuf.push(new Set<string>());
thumbBuf.push(new Set<string>());
let thumbBufLength: number[] = [0,0];

let thumbActiveBuf: number = 0;
let thumbInactiveBuf: number = 1;

function bufferThumbnailUpdate(imgHash: string): Set<string> | null {
	thumbBuf[thumbActiveBuf].add(imgHash);
	thumbBufLength[thumbActiveBuf] += 1;

	if(thumbBufLength[thumbActiveBuf] >= thumbBufFlushThreshold) {
		[thumbActiveBuf, thumbInactiveBuf] = [thumbInactiveBuf, thumbActiveBuf];
		let flush = new Set<string>(thumbBuf[thumbInactiveBuf]);	
		
		thumbBuf[thumbInactiveBuf].clear();
		thumbBufLength[thumbInactiveBuf] = 0;

		return flush;
	}
	return null;
}

function bufferFlush(): Set<string> | null {
	let flush;
	if(thumbBufLength[thumbActiveBuf] > 0) {
		flush = new Set<string>(thumbBuf[thumbActiveBuf]);	
	}
	else {
		flush = null;
	}
	thumbTimerFlush = null;
	thumbBuf[0].clear();
	thumbBuf[1].clear();
	thumbBufLength[0] = 0;
	thumbBufLength[1] = 0;
	return flush;	
}

export const eventHandleQueueState = (event: TauriEvent<IPC_QueueStatus>, store: StoreApi<IAppState>) => {
	// TODO: handle other messages

	let msg = event.payload as IPC_QueueStatus;

	if(msg.opcode === IPC_QueueOpCode.ImageComplete) {
		if(msg.imgHash === null) {
			console.error("Incomplete message from backend. OpCode=ImageComplete, but imgHash was null.");
			return;
		}

		let buffer = bufferThumbnailUpdate(msg.imgHash);

		if(buffer !== null) {
			updateImageThumbnailStateBatch(store, buffer);
		}

		if (thumbTimerFlush !== null) {
			clearTimeout(thumbTimerFlush);
		}

		if(thumbBufLength[0] > 0 || thumbBufLength[1] > 0) {
			thumbTimerFlush = setTimeout(() => {
				const buffer = bufferFlush();
				updateImageThumbnailStateBatch(store, buffer);
			}, flushTimeout);
		}
	}

	return;
}
export const eventHandleQueueStringArray = (event: TauriEvent<IPC_DataStringArray>, store: StoreApi<IAppState>) => {
	switch(event.payload.opcode){
		case IPC_QueueOpCode.StatusQueue:
			addInfoMessage(store, "Enqueued:");
			break;
		case IPC_QueueOpCode.StatusBlacklist:
			addInfoMessage(store, "Blacklist:");
			break;
	}
	addInfoMessageArray(store, event.payload.data);
}
