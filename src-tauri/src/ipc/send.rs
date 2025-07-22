use log::debug;
use tauri::Emitter;
use crate::{get_app_handle, ipc::types::IpcMsgInfoWindow};

pub fn info_window_msg(message: &str) -> bool {
    debug!("IPC: emit: info_window_msg");

    let res = get_app_handle().emit_to("global-handler", "msg-info-window", IpcMsgInfoWindow { message });

    match res {
        Ok(_) => {
            debug!("IPC: info_window_msg emitted successfully");
            true
        }
        Err(e) => {
            debug!("IPC: info_window_msg failed: {e}");
            false
        }
    }
}
