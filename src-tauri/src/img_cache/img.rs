// TODO: rework thumbnail generation

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

pub fn fs_get_image(path: &str) -> Result<Vec<u8>, String> {
    println!("fs_get_image()");
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

