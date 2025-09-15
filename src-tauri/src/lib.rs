mod endpoints;
mod img_cache;
mod server;
mod user_config;
mod journal;
mod ipc;

use queue::Queue;
use server::{start_server, ServerState};
use std::{
    path::PathBuf,
    sync::{Arc, OnceLock, RwLock},
};

use crate::{
    img_cache::queue, 
    journal::database::Database,
    user_config::vimages_config,
};

static GLOBAL_SERVER_STATE: OnceLock<ServerState> = OnceLock::new();
static GLOBAL_SERVER_PORT: OnceLock<u16> = OnceLock::new();
static GLOBAL_QUEUE: OnceLock<Queue> = OnceLock::new();
static GLOBAL_JOURNAL: OnceLock<Database> = OnceLock::new();
static GLOBAL_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

pub fn get_server_state() -> &'static ServerState {
    GLOBAL_SERVER_STATE.get().expect("axum not initialized")
}
pub fn get_server_port() -> u16 {
    *GLOBAL_SERVER_PORT.get().expect("Failed to get axum port")
}

pub fn get_queue() -> &'static Queue {
    GLOBAL_QUEUE.get().expect("Queue not initialized")
}

pub fn get_db() -> &'static Database {
    GLOBAL_JOURNAL.get().expect("Database not initialized")
}

pub fn get_app_handle() -> &'static tauri::AppHandle {
    GLOBAL_APP_HANDLE.get().expect("App handle not initialized")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {

            GLOBAL_APP_HANDLE
                .set(app.handle().clone())
                .expect("Failed to set global app handle");

            // Init axum
            tauri::async_runtime::spawn(async move {
                let server_state: ServerState = Arc::new(RwLock::new(PathBuf::from(".")));
                GLOBAL_SERVER_STATE
                    .set(server_state.clone())
                    .expect("Failed to register axum state");

                let port = start_server(server_state).await;
                GLOBAL_SERVER_PORT
                    .set(port)
                    .expect("Failed to register axum port");
            });

            // Init queue
            tauri::async_runtime::spawn(async move {
                let queue = queue::setup_queue().await;
                GLOBAL_QUEUE.set(queue).expect("Failed to set global queue");
            });

            // Init db
            tauri::async_runtime::spawn(async move {
                let db = Database::new().expect("Failed to initialize database");
                GLOBAL_JOURNAL.set(db).expect("Failed to set global database");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            endpoints::fs::fsx_get_dir,
            endpoints::fs::fsx_resolve_rel_path,
            endpoints::runtime::rt_get_axum_port,
            endpoints::runtime::rt_get_queue_size,
            endpoints::runtime::rt_get_queue_processing,
            endpoints::runtime::rt_get_queue_blacklist,
            endpoints::cache::cache_get_info,
            endpoints::cache::cache_get_path,
            endpoints::cache::cache_cleanup,
            vimages_config::save_config,
            vimages_config::get_or_create_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
