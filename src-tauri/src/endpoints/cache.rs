use std::{fs, path::PathBuf};

use log::{info, error};

use crate::{get_db, img_cache::cache::get_cache_path, ipc::send, journal::types::JournalInfo};

#[tauri::command]
pub fn cache_get_info() -> Result<JournalInfo, String> {
    let cache_info = get_db()
        .get_cache_stats()
        .unwrap()
        .ok_or("Cache is empty.")?;
    Ok(cache_info)
}

#[tauri::command]
pub fn cache_cleanup() -> Result<bool, String> {
    info!("Cache cleanup called");
    let mut offset = 0;
    let batch_size = 500;
    let cache_info = get_db()
        .get_cache_stats()
        .unwrap()
        .ok_or("Failed to get cache stats.")?;

    let mut purge_hash_ids: Vec<i64> = Vec::new();
    let mut purge_metadata_ids: Vec<i64> = Vec::new();
    let mut purge_cache_paths: Vec<PathBuf> = Vec::new();

    let mut processed = 0;
    let mut missing_files = 0;
    let mut deleted_files = 0;
    let mut deleted_hashes = 0;

    let cache_dir = get_cache_path().ok_or("failed to get cache path.")?;

    send::info_window_msg("Starting cache cleanup.");

    while offset < cache_info.entries_hashes {
        let records = get_db().get_full_records(offset, batch_size)
            .map_err(|e| format!("Failed fetching records {e}"))?;

        for record in records {
            if !fs::exists(&record.path).unwrap_or(false) {
                info!("File not found: {}", record.path);
                info!("hashes.id: {}", record.hash_id);
                info!("metadata.id: {:?}", record.metadata_id);

                purge_hash_ids
                    .push(record.hash_id);

                if let Some(id) = record.metadata_id { purge_metadata_ids.push(id) }

                let mut thumb_path = cache_dir.clone();
                thumb_path.push(record.path_hash);
                thumb_path.push(format!("{}.webp", record.filename_hash));
                purge_cache_paths
                    .push(thumb_path);

                missing_files += 1;
            }
            processed += 1;
        }
        offset += batch_size;
    };

    send::info_window_msg(&format!("Found {missing_files} orphaned thumbnails."));

    info!("Removing thumbnails...");
    for cache_path in purge_cache_paths {
        info!("Deleting: {}", cache_path.to_string_lossy());
        if let Err(e) = fs::remove_file(&cache_path) {
            error!("Failed to delete {}: {}", cache_path.to_string_lossy(), e);
        }
        deleted_files += 1;
    }

    send::info_window_msg(&format!("Deleted {deleted_files} thumbnails."));

    info!("Deleting entries from journal...");
    for purge_hash in purge_hash_ids {
        info!("Removing records for ID: {purge_hash}");
        match get_db().delete_hash(purge_hash) {
            Ok(true) => {
                info!("Removed record with ID: {purge_hash}");
                deleted_hashes += 1;
            }
            Ok(false) => {
                error!("Failed to remove record with ID: {purge_hash}");
            }
            Err(e) => {
                error!("Database error removing ID {purge_hash}: {e}");
            }
        }
    }

    send::info_window_msg(&format!("Removed {deleted_hashes} from journal."));
    send::info_window_msg(&format!("Processed {processed} journal entries."));

    Ok(true)
}
