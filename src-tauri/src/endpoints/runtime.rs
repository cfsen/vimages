use crate::get_server_port;

#[tauri::command]
pub fn rt_get_axum_port() -> Result<u16, String> {
    Ok(get_server_port())
}
