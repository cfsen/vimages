use std::{env, fs};
use std::path::{ Path, PathBuf };
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use infer;

use crate::img_cache;
use crate::{get_server_state, server::set_serve_directory};

#[tauri::command]
pub fn fs_get_current_path() -> Result<String, String> {
    img_cache::get_cache_path();
    env::current_dir()
        .map(|path: PathBuf| path.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_get_parent_path(path: String) -> Result<String, String> {
    let child_path = Path::new(&path);
    match child_path.parent() {
        Some(parent) => Ok(parent.to_string_lossy().to_string()),
        None => Ok(child_path.to_string_lossy().to_string()),
    }
}


#[tauri::command]
pub fn fs_list_directory(path: &str) -> Result<Vec<String>, String> {
    let path = PathBuf::from(path);

    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".into());
    }

    // update http server dir
    let server_state = get_server_state();
    set_serve_directory(server_state, &path)?;

    let mut entries: Vec<String> = vec![];
    entries.insert(0, "..".to_string());
    entries.extend( 
        fs::read_dir(path)
            .map_err(|e| e.to_string())?
            .filter_map(Result::ok)
            .filter(|entry| entry.path().is_dir())
            .filter_map(|entry| entry.file_name().to_str().map(|s| s.to_string()))
    );

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
        .map(|entry| entry.path().to_string_lossy().into_owned())
        .collect();

    entries.sort();

    Ok(entries)
}

#[tauri::command]
pub async fn fs_get_image_async(path: String) -> Result<Vec<u8>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        use std::{fs::File, io::BufReader};
        use image::{ImageFormat, imageops::FilterType};
        use image::codecs::jpeg::JpegEncoder;

        let file = File::open(&path).map_err(|e| format!("File open error: {}", e))?;
        let reader = image::ImageReader::with_format(BufReader::new(file), ImageFormat::Png);
        let img = reader.decode().map_err(|e| format!("Decode error: {}", e))?;

        let thumbnail = img.resize(400, 400, FilterType::Triangle);

        let mut buffer = Vec::new();
        let mut encoder = JpegEncoder::new_with_quality(&mut buffer, 60);
        encoder.encode_image(&thumbnail).map_err(|e| format!("Encode error: {}", e))?;

        Ok(buffer)
    })
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

// TODO: unused, remove
#[tauri::command]
pub fn fs_get_image(path: &str) -> Result<Vec<u8>, String> {
    use std::{fs::File, io::BufReader};
    use image::{ImageFormat, imageops::FilterType};
    use image::codecs::jpeg::JpegEncoder;

    let file = File::open(path).map_err(|e| format!("File open error: {e}"))?;
    let reader = image::ImageReader::with_format(BufReader::new(file), ImageFormat::Png);
    let img = reader.decode().map_err(|e| format!("Decode error: {e}"))?;

    let thumb = img.resize(400, 400, FilterType::Triangle); // much faster than thumbnail()

    let mut buf = Vec::new();
    let mut encoder = JpegEncoder::new_with_quality(&mut buf, 60); // drop quality for speed
    encoder.encode_image(&thumb).map_err(|e| format!("Encode error: {e}"))?;

    Ok(buf)
}


#[tauri::command]
pub fn fs_get_image_data_uri(path: &str) -> Result<String, String> {
    let start = std::time::Instant::now();

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

    println!("init: fetched image in: {:?}", start.elapsed());
    Ok(data_uri)
}
