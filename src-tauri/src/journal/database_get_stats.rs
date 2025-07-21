use sqlite::State;

use crate::journal::types::{JournalInfo};

use super::database::Database;

impl Database {
    pub fn get_cache_stats(&self) -> Result<Option<JournalInfo>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT 'hashes', COUNT(*) FROM hashes;
            SELECT 'metadata', COUNT(*) FROM metadata;
            ")?;

        if let Ok(State::Row) = statement.next() {
            let info = JournalInfo {
                entries_metadata: statement.read::<i64, _>(0)?,
                entries_hashes: statement.read::<i64, _>(1)?,
            };
            Ok(Some(info))
        }
        else {
            Ok(None)
        }
    }
}
