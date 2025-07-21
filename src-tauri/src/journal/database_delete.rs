use sqlite::State;

use crate::journal::types::{FullRecord, HashRecord, JournalInfo};

use super::database::Database;

impl Database {
    /// Delete hash record by ID (cascades to metadata table)
    pub fn delete_hash(&self, hash_id: i64) -> Result<bool, Box<dyn std::error::Error>> {
        // First delete associated metadata
        let mut delete_metadata = self.connection.prepare("
            DELETE FROM metadata WHERE hash_id = ?1
            ")?;
        delete_metadata.bind((1, hash_id))?;
        delete_metadata.next()?;

        // Then delete the hash record
        let mut delete_hash = self.connection.prepare("
            DELETE FROM hashes WHERE id = ?1
            ")?;
        delete_hash.bind((1, hash_id))?;
        delete_hash.next()?;

        // Check if any rows were affected
        let changes = self.connection.prepare("SELECT changes()")?
            .into_iter()
            .next()
            .unwrap()
            .unwrap()
            .read::<i64, _>(0);

        Ok(changes > 0)
    }
}
