#[allow(unused_imports)]
use std::{ 
    fs,
    path::{Path, PathBuf},
    time::SystemTime
};

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

// get the cache path, creating the directory if it does not exist
pub fn get_cache_path() -> Option<PathBuf> {
    if let Some(cache_dir) = dirs::cache_dir() {

        let mut cache_path = cache_dir;
        cache_path.push("vimages");

        if !Path::exists(&cache_path) {
            println!("Cache directory does not exist, creating: {:?}", cache_path);

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
