use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct JournalInfo {
    pub entries_hashes: i64,
    pub entries_metadata: i64,
}

#[derive(Debug)]
pub struct HashRecord {
    pub id: i64,
    pub path_hash: String,
    pub filename_hash: String,
    pub indexed_at: String,
}

#[derive(Debug)]
pub struct FullRecord {
    pub hash_id: i64,
    pub path_hash: String,
    pub filename_hash: String,
    pub path: String,
    pub indexed_at: String,
    pub metadata_id: Option<i64>,
    pub filetype: Option<String>,
}
