mod server;
mod endpoints;
mod img_cache;

use std::{path::PathBuf, sync::{Arc, RwLock, OnceLock}};
use server::{ServerState, spawn_server};
use queue::Queue;

use crate::endpoints::fs::{fsx_get_dir, fs_get_current_path};
use crate::img_cache::queue;

static GLOBAL_SERVER_STATE: OnceLock<ServerState> = OnceLock::new();
static GLOBAL_QUEUE: OnceLock<Queue> = OnceLock::new();

pub fn get_server_state() -> &'static ServerState {
    GLOBAL_SERVER_STATE.get().expect("Server not initialized")
}

pub fn get_queue() -> &'static Queue {
    GLOBAL_QUEUE.get().expect("Queue not initialized")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |_app| {
            // Init axum
            tauri::async_runtime::spawn(async move {
                let server_state: ServerState = Arc::new(RwLock::new(PathBuf::from(".")));
                GLOBAL_SERVER_STATE.set(server_state.clone()).expect("Failed to set server state");
                spawn_server(server_state).await;
            });

            // Init queue  
            tauri::async_runtime::spawn(async move {
                let queue = queue::setup_queue().await;
                GLOBAL_QUEUE.set(queue).expect("Failed to set global queue");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fs_get_current_path,
            fsx_get_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
