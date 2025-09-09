use crate::get_queue;
use crate::get_server_port;
use crate::img_cache::queue::QueueMsg;
use log::debug;
use log::error;

#[tauri::command]
pub fn rt_get_axum_port() -> Result<u16, String> {
    Ok(get_server_port())
}

#[tauri::command]
pub async fn rt_get_queue_size() -> Result<u32, String> {
    let size = get_queue().size().await;
    size.try_into().map_err(|e| {
        error!("Failed to get queue size: {e}");
        format!("Failed to get queue size: {e}")
    })
}

#[tauri::command]
pub fn rt_get_queue_processing() {
    debug!("rt_get_queue_processing");
    tauri::async_runtime::spawn(async move {
        if let Err(e) = get_queue().status(QueueMsg::StatusQueue).await {
            error!("Failed to query for processing items: {e}");
        }
    });
}
#[tauri::command]
pub fn rt_get_queue_blacklist() {
    debug!("rt_get_queue_blacklist");
    tauri::async_runtime::spawn(async move {
        if let Err(e) = get_queue().status(QueueMsg::StatusBlacklist).await {
            error!("Failed to query for processing items: {e}");
        }
    });
}
