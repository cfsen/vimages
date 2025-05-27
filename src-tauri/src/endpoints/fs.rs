use std::fs;
use std::path::PathBuf;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use infer;

#[tauri::command]
pub fn fs_list_directory(path: &str) -> Result<Vec<String>, String> {
    let path = PathBuf::from(path);

    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".into());
    }

    let mut entries: Vec<String> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_dir())
        .filter_map(|entry| entry.file_name().to_str().map(|s| s.to_string()))
        .collect();

    entries.sort();

    Ok(entries)
}

#[tauri::command]
pub fn fs_get_images(path: &str) -> Result<Vec<String>, String> {
    let path = PathBuf::from(path);

    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".into());
    }

    let allowed_exts = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

    let mut entries: Vec<String> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_file())
        .filter(|entry| { entry
            .path()
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| allowed_exts.contains(&ext.to_lowercase().as_str()))
            .unwrap_or(false)
        })
        //.filter_map(|entry| entry.file_name().to_str().map(|s| s.to_string()))
        .map(|entry| entry.path().to_string_lossy().into_owned())
        .collect();

    entries.sort();

    Ok(entries)
}

#[tauri::command]
pub fn fs_get_image(path: &str) -> Result<String, String> {
    let path = PathBuf::from(path);

    if !path.exists() || !path.is_file() {
        return Err("Invalid image path".into());
    }

    let bytes = fs::read(path)
        .map_err(|e| e.to_string())?;
    let encoded = STANDARD.encode(&bytes);

    Ok(encoded)
}


#[tauri::command]
pub fn fs_get_image_data_uri(path: &str) -> Result<String, String> {
    let path = PathBuf::from(path);

    if !path.exists() || !path.is_file() {
        return Err("Invalid image path".into());
    }

    let bytes = fs::read(&path).map_err(|e| e.to_string())?;

    let mime = infer::get(&bytes)
        .map(|info| info.mime_type())
        .ok_or("Could not detect file type")?;

    // Only allow certain image MIME types
    let allowed = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "image/svg+xml",
    ];

    if !allowed.contains(&mime) {
        return Err(format!("Unsupported image type: {}", mime));
    }

    let encoded = STANDARD.encode(&bytes);
    let data_uri = format!("data:{};base64,{}", mime, encoded);

    Ok(data_uri)
}
