use std::{env, fs};
use std::path::{ Path, PathBuf };

use crate::img_cache;
use crate::{get_server_state, server::set_serve_directory};
use crate::endpoints::types::{ EntityDirectory, EntityImage };

#[tauri::command]
pub fn fsx_get_dir(path: &str, rel_path: Option<&str>) -> Result<EntityDirectory, String> {
    let path_buf = PathBuf::from(path);

    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Invalid path".into());
    }

    let final_path = if let Some(rel) = rel_path {
        match rel {
            ".." => {
                if let Some(parent) = path_buf.parent() {
                    parent.to_path_buf()
                }
                else {
                    return Err("No parent directory".into());
                }
            },
            "." => path_buf,
            _ => path_buf.join(rel)
        }
    }
    else {
        path_buf
    };

    if !final_path.exists() || !final_path.is_dir() {
        println!("Invalid rel_path: {:?}", final_path);
        return Err("Invalid rel_path".into());
    }

    let parent_dir = match final_path.parent() {
        Some(parent) => Some(parent.to_string_lossy().to_string()),
        None => Some("Drives".to_string()),
    };

    let path_hash = img_cache::hash::get_path_hash(&final_path);
    let images = fsx_get_images(&final_path);
    let sub_dirs = fs_get_directories(&final_path);

    // update axum
    let server_state = get_server_state();
    set_serve_directory(server_state, &final_path)?;

    // NOTE: debug
    println!("Opening: {:?}", final_path);
    println!(" -> Path hash: {:?}", path_hash);
    println!(" -> Parent dir: {:?}", parent_dir);

    let directory = EntityDirectory { 
        name: final_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown")
            .to_string(),
        path: final_path.to_string_lossy().to_string(),
        parent_path: parent_dir,
        path_hash,
        images: Some(images?),
        sub_dirs: Some(sub_dirs?),
    };

    Ok(directory)
}

fn fsx_get_images(path: &Path) -> Result<Vec<EntityImage>, String> {
    let allowed_exts = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"];

    // NOTE: debug
    println!("--- EntityImage:");

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
            let file_hash = img_cache::hash::get_file_hash(&full_path)
                .map_err(|e| format!("Failed to hash: {}: {}", filename, e))?;

            // NOTE: debug
            println!("EntityImage:");
            println!("full_path: {:?}", full_path);
            println!("filename: {:?}", filename);
            println!("file_hash: {:?}\n", file_hash);

            Ok(EntityImage {
                full_path: full_path.to_string_lossy().to_string(),
                filename,
                has_thumbnail: false, // TODO: implement thumbnail logic
                img_hash: file_hash,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    // NOTE: debug
    println!("\n");

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
                images: None,
                sub_dirs: None,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    dirs.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(dirs)
}

// TODO: still used on launch
#[tauri::command]
pub fn fs_get_current_path() -> Result<String, String> {
    env::current_dir()
        .map(|path: PathBuf| path.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}
