use crate::{get_db, journal::types::JournalInfo};

#[tauri::command]
pub fn cache_get_info() -> Result<JournalInfo, String> {
    Ok(get_db().get_cache_stats().unwrap().unwrap())
}
