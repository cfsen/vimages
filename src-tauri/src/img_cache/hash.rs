use sha2::{Digest, Sha256};
use std::{fs, path::Path};

pub fn get_path_hash(path: &Path) -> String {
    let mut hasher = Sha256::new();
    hasher.update(path.to_string_lossy().as_bytes());
    format!("{:x}", hasher.finalize())
}

pub fn get_file_hash(path: &Path) -> Result<String, std::io::Error> {
    let meta = fs::metadata(path)?;
    let mut hasher = Sha256::new();
    let mut file_hash = path.to_string_lossy().to_string();

    if let Ok(modified) = meta.modified() {
        file_hash.push_str(&format!("{:?}", modified));
    }

    file_hash.push_str(&meta.len().to_string());
    hasher.update(file_hash.as_bytes());

    Ok(format!("{:x}", hasher.finalize()))
}
