use serde::{Deserialize, Serialize};

// see: IPC_FsIoBatchEntity (src/context/app/app.event.types.ts)
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FsIoBatchEntity {
    pub original: String,
    pub target: String,
}
