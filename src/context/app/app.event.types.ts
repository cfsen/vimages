export type IPC_MsgInfoWindow = {
	message: string,
};
export type IPC_QueueStatus = {
	opcode: IPC_QueueOpCode,
	imgHash: string | null,
	pathHash: string | null,
};
export type IPC_DataStringArray = {
	opcode: IPC_QueueOpCode,
	data: string[],
};
export enum IPC_QueueOpCode {
	ImageComplete = "ImageComplete",
	ImageFailed = "ImageFailed",
	InternalError = "InternalError",
	ImageQueueEmpty = "ImageQueueEmpty",
	StatusBlacklist = "StatusBlacklist",
	StatusQueue = "StatusQueue",
};
