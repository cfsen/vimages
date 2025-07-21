use sqlite::{State};

use crate::journal::types::{FullRecord};

use super::database::Database;

impl Database {
    /// Get full record by matching both path and filename hash
    pub fn get_full_record(&self, path_hash: &str, filename_hash: &str) -> Result<Option<FullRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT h.id, h.path_hash, h.filename_hash, h.path, h.indexed_at,
            m.id as metadata_id, m.filetype
            FROM hashes h
            LEFT JOIN metadata m ON h.id = m.hash_id
            WHERE h.path_hash = ?1 AND h.filename_hash = ?2
            ")?;

        statement.bind((1, path_hash))?;
        statement.bind((2, filename_hash))?;

        if let Ok(State::Row) = statement.next() {
            let record = FullRecord {
                hash_id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                path: statement.read::<String, _>(3)?,
                indexed_at: statement.read::<String, _>(4)?,
                metadata_id: statement.read::<Option<i64>, _>(5)?,
                filetype: statement.read::<Option<String>, _>(6)?,
            };
            Ok(Some(record))
        }
        else {
            Ok(None)
        }
    }

    /// Get all records matching a path hash
    pub fn get_full_records_by_path(&self, path_hash: &str, offset: i64, rows: i64) -> Result<Vec<FullRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT h.id, h.path_hash, h.filename_hash, h.path, h.indexed_at,
            m.id as metadata_id, m.filetype
            FROM hashes h
            LEFT JOIN metadata m ON h.id = m.hash_id
            WHERE h.path_hash = ?1
            LIMIT ?2, ?3
            ")?;

        statement.bind((1, path_hash))?;
        statement.bind((2, offset))?;
        statement.bind((3, rows))?;

        let mut records = Vec::new();

        while let Ok(State::Row) = statement.next() {
            let record = FullRecord {
                hash_id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                path: statement.read::<String, _>(3)?,
                indexed_at: statement.read::<String, _>(4)?,
                metadata_id: statement.read::<Option<i64>, _>(5)?,
                filetype: statement.read::<Option<String>, _>(6)?,
            };
            records.push(record);
        }

        Ok(records)
    }

    /// Get all records
    pub fn get_full_records(&self, offset: i64, rows: i64) -> Result<Vec<FullRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT h.id, h.path_hash, h.filename_hash, h.path, h.indexed_at,
            m.id as metadata_id, m.filetype
            FROM hashes h
            LEFT JOIN metadata m ON h.id = m.hash_id
            LIMIT ?1, ?2
            ")?;

        statement.bind((1, offset))?;
        statement.bind((2, rows))?;

        let mut records = Vec::new();

        while let Ok(State::Row) = statement.next() {
            let record = FullRecord {
                hash_id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                path: statement.read::<String, _>(3)?,
                indexed_at: statement.read::<String, _>(4)?,
                metadata_id: statement.read::<Option<i64>, _>(5)?,
                filetype: statement.read::<Option<String>, _>(6)?,
            };
            records.push(record);
        }

        Ok(records)
    }
}
