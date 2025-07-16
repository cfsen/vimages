use log::{debug, error, info};
use std::path::{Path, PathBuf};
use std::fs;

use crate::endpoints::types::{EntityDirectory, EntityImage};
use crate::get_queue;
use crate::img_cache;
use crate::{get_server_state, server::set_serve_directory};

#[tauri::command]
pub fn fsx_get_dir(path: &str, rel_path: Option<&str>) -> Result<EntityDirectory, String> {
    info!("fsx_get_dir: {} -> {}", path, rel_path.unwrap_or("None"));

    let path_buf = PathBuf::from(path);

    if !path_buf.exists() || !path_buf.is_dir() {
        error!("Invalid path");
        return Err("Invalid path".into());
    }

    let final_path = fsx_parse_path_traversal(&path_buf, rel_path.unwrap_or("."))?;

    if !final_path.exists() || !final_path.is_dir() {
        error!("Invalid rel_path: {final_path:?}");
        return Err("Invalid rel_path".into());
    }

    // prepare response
    let parent_path = final_path.parent().map(|s| s.to_string_lossy().to_string());
    let sibling_dirs = final_path
        .parent()
        .map(fs_get_directories)
        .unwrap_or(Ok(Vec::new()))
        .unwrap_or(Vec::new());
    let path_hash = img_cache::hash::get_path_hash(&final_path);
    let images = fsx_get_images(&final_path, &path_hash).unwrap_or_default();
    let sub_dirs = fs_get_directories(&final_path).unwrap_or_default();

    // update axum
    let server_state = get_server_state();
    set_serve_directory(server_state, &final_path)?;

    // NOTE: debug
    debug!("Opening: {final_path:?}");
    debug!(" -> Path hash: {path_hash:?}");
    debug!(" -> Parent dir: {parent_path:?}");

    let directory = EntityDirectory {
        name: final_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown")
            .to_string(),
        path: final_path.to_string_lossy().to_string(),
        parent_path,
        path_hash,
        images,
        sub_dirs,
        sibling_dirs,
    };

    Ok(directory)
}

fn fsx_parse_path_traversal(path: &Path, rel_path: &str) -> Result<PathBuf, String> {
    match rel_path {
        ".." => Ok(path
            .parent()
            .ok_or("No parent directory available.")?
            .canonicalize()
            .map_err(|e| e.to_string())?),
        _ => Ok(path
            .join(rel_path)
            .canonicalize()
            .map_err(|e| e.to_string())?),
    }
}

fn fsx_get_images(path: &Path, path_hash: &str) -> Result<Vec<EntityImage>, String> {
    let allowed_exts = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"];

    let mut images: Vec<EntityImage> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_file())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| allowed_exts.contains(&ext.to_lowercase().as_str()))
                .unwrap_or(false)
        })
        .map(|entry| -> Result<EntityImage, String> {
            let full_path = entry.path();
            let filename = entry.file_name().to_string_lossy().to_string();
            let file_hash = img_cache::hash::get_file_hash(&full_path).map_err(|e| {
                error!("Failed to hash: {filename}: {e}");
                format!("Failed to hash: {filename}: {e}")
            })?;

            // TODO:
            // thumbnails should only be generated for larger files
            // consider a separate limit for animated files

            let cache = img_cache::cache::check_cache(path_hash, &file_hash);

            if cache.is_none() {
                let queue_item = img_cache::queue::QueueItem {
                    full_path: full_path.to_path_buf(),
                    path_hash: path_hash.to_string().clone(),
                    file_hash: file_hash.clone(),
                };
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = get_queue().enqueue(queue_item).await {
                        error!("Failed to enqueue thumbnail job: {e}");
                    }
                });
            }

            debug!("EntityImage:");
            debug!("full_path: {full_path:?}");
            debug!("filename: {filename:?}");
            debug!("file_hash: {file_hash:?}\n");

            Ok(EntityImage {
                full_path: full_path.to_string_lossy().to_string(),
                filename,
                has_thumbnail: cache.is_some(),
                img_hash: file_hash,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    images.sort_by(|a, b| a.filename.cmp(&b.filename));

    Ok(images)
}

fn fs_get_directories(path: &Path) -> Result<Vec<EntityDirectory>, String> {
    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".into());
    }

    let mut dirs: Vec<EntityDirectory> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .filter(|dir| dir.path().is_dir())
        .map(|dir| -> Result<EntityDirectory, String> {
            let dir_path = dir.path();

            Ok(EntityDirectory {
                name: dir.file_name().to_string_lossy().to_string(),
                path: dir_path.to_string_lossy().to_string(),
                path_hash: img_cache::hash::get_path_hash(&dir_path),
                parent_path: Some(path.to_string_lossy().to_string()),
                images: Vec::new(),
                sub_dirs: Vec::new(),
                sibling_dirs: Vec::new(),
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    dirs.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(dirs)
}
