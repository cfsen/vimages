//
// Types used in IPC calls
//

// Messages passed to log widget
// Event handler: eventHandleMsgInfoWindow (src/context/app/app.event.listeners.ts)
// See: IpcMsgInfoWindow (src-tauri/src/ipc/types.rs)
export type IPC_MsgInfoWindow = {
	message: string,
};

// Queue status updates to event listener
// Event handler: eventHandleQueueState (src/context/app/app.event.listeners.ts)
// Rust type: IpcQueueState (src-tauri/src/ipc/types.rs)
export type IPC_QueueStatus = {
	opcode: IPC_QueueOpCode,
	imgHash: string | null,
	pathHash: string | null,
};

// Encapsulates multiple messages passed to log widget
// Event handler: eventHandleQueueStringArray (src/context/app/app.event.listeners.ts)
// Rust type: IpcDataStringArray (src-tauri/src/ipc/types.rs)
export type IPC_DataStringArray = {
	opcode: IPC_QueueOpCode,
	data: string[],
};

// Opcodes for IPC calls
// Rust enum: IpcQueueOpCode (src-tauri/src/ipc/types.rs)
export enum IPC_QueueOpCode {
	ImageComplete = "ImageComplete",
	ImageFailed = "ImageFailed",
	InternalError = "InternalError",
	ImageQueueEmpty = "ImageQueueEmpty",
	StatusBlacklist = "StatusBlacklist",
	StatusQueue = "StatusQueue",
};

// Encapsulates previews of substitution operations performed on filesystem entities
// Rust type: FsIoBatchEntity (src-tauri/src/fs_io/types.rs)
export type IPC_FsIoBatchEntity = {
	Original: string,
	Target: string;
}
