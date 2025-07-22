use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpcMsgInfoWindow<'a> {
    pub message: &'a str,
}
