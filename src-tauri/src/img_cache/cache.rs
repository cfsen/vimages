use std::{
    fs,
    path::{Path, PathBuf},
};
use log::{ info, error, debug };

/*
* Cache structure:
* ./cache/[path_hash]/[hash].png
*
* hashing images:
* (filename + last modified + file size)
*
* TODO: cleanup routine for cache
*/

// get the cache path, creating the directory if it does not exist
pub fn get_vimages_path() -> Option<PathBuf> {
    let mut vimages_path = dirs::cache_dir()?;
    vimages_path.push(".vimages");

    if !Path::exists(&vimages_path) {
        info!(".vimages does not exist, creating: {:?}", vimages_path);

        fs::create_dir(&vimages_path)
            .unwrap_or_else(|e| {
                error!("Error creating .vimages dir: {}", e);
                panic!("Error creating .vimages dir: {}", e)
            });
    }

    Some(vimages_path)
}

pub fn get_cache_path() -> Option<PathBuf> {
    let mut cache_path = get_vimages_path()?;
    cache_path.push("cache");

    if !Path::exists(&cache_path) {
        info!("cache directory does not exist, creating: {:?}", cache_path);

        fs::create_dir(&cache_path)
            .unwrap_or_else(|e| panic!("Error creating cache directory: {}", e));
    }

    Some(cache_path)
}

pub fn check_cache(path_hash: &str, file_hash: &str) -> Option<bool> {
    let mut cache_path = get_cache_path()?;

    debug!("Checking cache for: path_hash={} | file_has={}", path_hash, file_hash);

    cache_path.push(path_hash);
    if !Path::exists(&cache_path) {
        debug!("No matching path in cache.");
        return None;
    }

    cache_path.push(format!("{}.webp", file_hash));
    if !Path::exists(&cache_path) {
        debug!("No matching file in cache.");
        return None;
    }

    debug!("Cache hit for: {:?}", cache_path);
    Some(true)
}
