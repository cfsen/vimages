use sqlite::State;

use crate::journal::types::{FullRecord, HashRecord, JournalInfo};

use super::database::Database;

impl Database {
    /// Update metadata for a specific hash_id
    pub fn update_metadata(&self, hash_id: i64, filetype: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            UPDATE metadata SET filetype = ?1 WHERE hash_id = ?2
            ")?;

        statement.bind((1, filetype))?;
        statement.bind((2, hash_id))?;
        statement.next()?;

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
