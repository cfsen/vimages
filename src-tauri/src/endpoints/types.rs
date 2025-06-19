use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct EntityDirectory {
    pub path: String,
    pub parent_path: Option<String>,
    pub path_hash: String,
    pub images: Vec<EntityImage>,
}

#[derive(Serialize, Deserialize)]
pub struct EntityImage {
    pub full_path: String,
    pub filename: String,
    pub has_thumbnail: bool,
    pub thumbnail_hash: String,
}
