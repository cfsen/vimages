mod endpoints {
    pub mod fs;
}
pub mod img_cache;

use endpoints::fs::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fs_get_image_async,
            fs_get_parent_path,
            fs_get_current_path,
            fs_list_directory,
            fs_get_image_data_uri,
            fs_get_image,
            fs_get_images
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
