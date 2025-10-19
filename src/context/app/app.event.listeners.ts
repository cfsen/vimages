import { StoreApi } from "zustand";
import { Event as TauriEvent} from "@tauri-apps/api/event";

import { IAppState } from "@app/app.context.store";
import { addInfoMessage, addInfoMessageArray, updateImageThumbnailStateBatch } from "@app/app.context.actions";

import { IPC_DataStringArray, IPC_MsgInfoWindow, IPC_QueueOpCode, IPC_QueueStatus } from "./app.event.types";

//
// double buffer thumbnail updates
//

// NOTE: image pipeline can output images faster than react can complete state updates, causing UI lag.
// batching updates to images to partially mitigate this.
// TODO: review DS and explore other options for potential improvements

// buffer tuning
const flushTimeout = 200; // [ms] to wait without pushes to buffer before clearing
const thumbBufFlushThreshold = 100; // capacity of each buffer

// buffer globals
let thumbTimerFlush: number | null = null; // timer for flush

let thumbBuf: Set<string>[] = []; // buffers 0 and 1
thumbBuf.push(new Set<string>());
thumbBuf.push(new Set<string>());
let thumbBufLength: number[] = [0,0]; // buffer length

let thumbActiveBuf: number = 0; // buffer which should receive items [0/1]
let thumbInactiveBuf: number = 1; // inactive buffer [0/1]

// push a completed thumbnail identified by hash `imgHash` to buffer
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

// flush active buffer, returning any remaining items and resetting both buffers
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

// handle messages with queue updates
export const eventHandleQueueState = (event: TauriEvent<IPC_QueueStatus>, store: StoreApi<IAppState>) => {
	let msg = event.payload as IPC_QueueStatus;

	switch(msg.opcode) {
		case IPC_QueueOpCode.ImageComplete:
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

			break;
		case IPC_QueueOpCode.ImageFailed:
				addInfoMessage(store, "Failed to generate thumbnail.");
			break;
		case IPC_QueueOpCode.InternalError:
				addInfoMessage(store, "An internal error occurred in thumbnail worker.");
			break;
	};

	return;
}

//
// info widget ipc handlers
//

// handle messages with string payloads
export const eventHandleMsgInfoWindow = (event: TauriEvent<IPC_MsgInfoWindow>, useAppState: StoreApi<IAppState>) => {
	addInfoMessage(useAppState, event.payload.message);
};

// handle messages with string array payloads
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
};
