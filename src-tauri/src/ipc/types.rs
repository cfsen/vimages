use serde::Serialize;

// see: IPC_MsgInfoWindow (src/context/app/app.event.types.ts)
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcMsgInfoWindow<'a> {
    pub message: &'a str,
}

// see: IPC_QueueStatus (src/context/app/app.event.types.ts)
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcQueueState<'a> {
    pub opcode: &'a IpcQueueOpCode,
    pub img_hash: Option<&'a str>,
    pub path_hash: Option<&'a str>,
}

// see: IPC_DataStringArray (src/context/app/app.event.types.ts)
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcDataStringArray<'a> {
    pub opcode: &'a IpcQueueOpCode,
    pub data: Vec<String>
}

// see: IPC_QueueOpCode (src/context/app/app.event.types.ts)
#[derive(Clone, Serialize)]
pub enum IpcQueueOpCode {
    ImageComplete,
    ImageFailed,
    InternalError,
    StatusBlacklist,
    StatusQueue,
    ImageQueueEmpty
}
