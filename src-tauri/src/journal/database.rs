use sqlite::{Connection};
use std::path::PathBuf;

use crate::img_cache::cache::get_vimages_path;

pub struct Database {
    pub(crate) connection: Connection,
}

unsafe impl Send for Database {}
unsafe impl Sync for Database {}

impl std::fmt::Debug for Database {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Database")
            .field("connection", &"<SQLite Connection>")
            .finish()
    }
}

impl Database {
    /// Get the database file path 
    fn get_db_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let mut path = get_vimages_path()
            .ok_or("Could not get vimages path")?;
        path.push("journal");
        path.push("database.db");
        Ok(path)
    }

    /// Initialize the database with tables and setup
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let db_path = Self::get_db_path()?;

        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let connection = sqlite::open(&db_path)?;

        // Enable WAL mode for better concurrency
        connection.execute("PRAGMA journal_mode=WAL")?;
        connection.execute("PRAGMA synchronous=NORMAL")?;

        let db = Database { connection };
        db.create_tables()?;

        Ok(db)
    }

    /// Create the required tables if they don't exist
    fn create_tables(&self) -> Result<(), Box<dyn std::error::Error>> {
        // Create hashes table
        let create_hashes_sql = "
            CREATE TABLE IF NOT EXISTS hashes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path_hash TEXT NOT NULL,
            filename_hash TEXT NOT NULL,
            path TEXT NOT NULL,
            indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            ";

        // Create index on path_hash for performance
        let create_path_hash_index = "
            CREATE INDEX IF NOT EXISTS idx_path_hash ON hashes(path_hash);
            ";

        // Create metadata table with foreign key reference
        let create_metadata_sql = "
            CREATE TABLE IF NOT EXISTS metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hash_id INTEGER NOT NULL,
            filetype TEXT,
            FOREIGN KEY (hash_id) REFERENCES hashes(id)
            );
            ";

        // Execute table creation
        self.connection.execute(create_hashes_sql)?;
        self.connection.execute(create_path_hash_index)?;
        self.connection.execute(create_metadata_sql)?;

        println!("Database tables created successfully");

        Ok(())
    }
}
