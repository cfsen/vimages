use sha2::{Sha256, Digest};
#[allow(unused_imports)]
use std::{ 
    fs,
    path::{Path, PathBuf},
    time::SystemTime
};

// get the cache path, creating the directory if it does not exist
pub fn get_cache_path() -> Option<PathBuf> {
    if let Some(cache_dir) = dirs::cache_dir() {

        let mut cache_path = cache_dir;
        cache_path.push("vimages");

        if !Path::exists(&cache_path) {
            println!("Cache directory does not exist, creating...");

            fs::create_dir(&cache_path)
                .unwrap_or_else(|e| panic!("Error creating cache dir: {}", e));
        }
        else {
            println!("Cache directory: {:?}", cache_path);
        }

        Some(cache_path)
    }
    else {
        panic!("Unable to determine cache path.");
    }
}

/*
* TODO:
* Cache structure:
* ./cache/[path_hash]/tn_[hash].png
*
* hashing images:
* (filename + last modified + file size)
*
* TODO: cleanup routine for cache
*/

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
