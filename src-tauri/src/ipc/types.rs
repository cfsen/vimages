use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcMsgInfoWindow<'a> {
    pub message: &'a str,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcQueueState<'a> {
    pub opcode: &'a IpcQueueOpCode,
    pub img_hash: Option<&'a str>,
    pub path_hash: Option<&'a str>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcDataStringArray<'a> {
    pub opcode: &'a IpcQueueOpCode,
    pub data: Vec<String>
}

#[derive(Clone, Serialize)]
pub enum IpcQueueOpCode {
    ImageComplete,
    ImageFailed,
    InternalError,
    StatusBlacklist,
    StatusQueue,
    ImageQueueEmpty
}
