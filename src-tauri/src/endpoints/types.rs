use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct EntityDirectory {
    pub name: String,
    pub path: String,
    pub parent_path: Option<String>,
    pub path_hash: String,
    pub images: Vec<EntityImage>,
    pub sub_dirs: Vec<EntityDirectory>,
    pub sibling_dirs: Vec<EntityDirectory>,
}

#[derive(Serialize, Deserialize)]
pub struct EntityImage {
    pub full_path: String,
    pub filename: String,
    pub has_thumbnail: bool,
    pub img_hash: String,
}
