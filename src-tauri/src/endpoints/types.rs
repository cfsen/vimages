use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct EntityDirectory {
    pub name: String,
    pub path: String,
    pub parent_path: Option<String>,
    pub path_hash: String,
    pub images: Option<Vec<EntityImage>>,
    pub sub_dirs: Option<Vec<EntityDirectory>>,
}

#[derive(Serialize, Deserialize)]
pub struct EntityImage {
    pub full_path: String,
    pub filename: String,
    pub has_thumbnail: bool,
    pub img_hash: String,
}
