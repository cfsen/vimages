use super::database::Database;

impl Database {
    /// Insert a new hash record
    pub fn insert_hash(&self, path_hash: &str, filename_hash: &str, path: &str) -> Result<i64, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            INSERT INTO hashes (path_hash, filename_hash, path) 
            VALUES (?1, ?2, ?3)
            ")?;

        statement.bind((1, path_hash))?;
        statement.bind((2, filename_hash))?;
        statement.bind((3, path))?;

        statement.next()?;

        // Get the last inserted row ID
        let row_id = self.connection.prepare("SELECT last_insert_rowid()")?
            .into_iter()
            .next()
            .unwrap()
            .unwrap()
            .read::<i64, _>(0);

        Ok(row_id)
    }

    /// Insert metadata for a hash
    pub fn insert_metadata(&self, hash_id: i64, filetype: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            INSERT INTO metadata (hash_id, filetype) 
            VALUES (?1, ?2)
            ")?;

        statement.bind((1, hash_id))?;
        statement.bind((2, filetype))?;

        statement.next()?;

        Ok(())
    }
}
