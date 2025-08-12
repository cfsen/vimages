use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcMsgInfoWindow<'a> {
    pub message: &'a str,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcQueueState<'a> {
    pub path: &'a str,
    pub redraw: &'a bool,
    pub queue_empty: &'a bool,
}
