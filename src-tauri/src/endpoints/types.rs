use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct EntityImage {
    pub full_path: String,
    pub filename: String,
    pub has_thumbnail: bool,
    pub thumbnail_hash: String,
}
