mod server;
mod endpoints {
    pub mod fs;
}
pub mod img_cache;
use endpoints::fs::*;
use std::{path::PathBuf, sync::{Arc, RwLock, OnceLock}};
use server::{ServerState, spawn_server};

static GLOBAL_SERVER_STATE: OnceLock<ServerState> = OnceLock::new();

pub fn get_server_state() -> &'static ServerState {
    GLOBAL_SERVER_STATE.get().expect("Server state not initialized")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let server_state: ServerState = Arc::new(RwLock::new(PathBuf::from(".")));

    // Set the global state
    GLOBAL_SERVER_STATE.set(server_state.clone()).unwrap();

    let server_state_clone = server_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |_app| {
            // Start the axum server in a background task using Tauri's async runtime
            tauri::async_runtime::spawn(async move {
                spawn_server(server_state_clone).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fs_get_image_async,
            fs_get_parent_path,
            fs_get_current_path,
            fs_list_directory,
            fs_get_image_data_uri,
            fs_get_image,
            fs_get_images,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
