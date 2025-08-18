use std::path::Path;

use log::debug;
use tauri::Emitter;
use crate::{get_app_handle, ipc::types::{IpcMsgInfoWindow, IpcQueueState}};

pub fn info_window_msg(message: &str) -> bool {
    let res = get_app_handle().emit_to("global-handler", "msg-info-window", IpcMsgInfoWindow { message });

    match res {
        Ok(_) => {
            debug!("IPC: info_window_msg emitted");
            true
        }
        Err(e) => {
            debug!("IPC: info_window_msg failed: {e}");
            false
        }
    }
}
pub fn queue_status(path: &Path, redraw: &bool, queue_empty: &bool) -> bool {
    let path = path.to_str().unwrap();

    let res = get_app_handle().emit_to("global-handler", "msg-queue-status", IpcQueueState { path, redraw, queue_empty });

    match res {
        Ok(_) => {
            debug!("IPC: queue_status emitted");
            true
        }
        Err(e) => {
            debug!("IPC: queue_status failed: {e}");
            false
        }
    }
}
