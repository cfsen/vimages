use image::{self, codecs::webp::WebPEncoder, ImageReader};
use std::{fs::File, path::Path};

pub fn create_thumbnail(org_path: &Path, thumb_path: &Path) -> Result<(), image::ImageError> {
    let img = ImageReader::open(org_path)?.decode()?;

    let thumb = img.resize(400, 400, image::imageops::FilterType::Triangle);
    let output_file = File::create(thumb_path)?;
    let encoder = WebPEncoder::new_lossless(output_file);

    thumb.write_with_encoder(encoder)?;

    Ok(())
}
