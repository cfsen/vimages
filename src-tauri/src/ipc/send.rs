use log::debug;
use tauri::Emitter;
use crate::{get_app_handle, ipc::types::{IpcMsgInfoWindow, IpcQueueOpCode, IpcQueueState}};

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
pub fn queue_status(opcode: &IpcQueueOpCode, img_hash: Option<&str>, path_hash: Option<&str>) -> bool {
    let res = get_app_handle()
        .emit_to("global-handler", "msg-queue-status", 
            IpcQueueState {
                opcode,
                img_hash,
                path_hash,
            });

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
