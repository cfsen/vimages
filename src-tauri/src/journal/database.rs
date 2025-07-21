use sqlite::{Connection, State};
use std::path::PathBuf;

use crate::img_cache::cache::get_vimages_path;
use crate::journal::types::{ JournalInfo, FullRecord, HashRecord };

pub struct Database {
    connection: Connection,
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

    /// Get the database file path using your existing function
    fn get_db_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let mut path = get_vimages_path()
            .ok_or("Could not get vimages path")?;
        path.push("journal");
        path.push("database.db");
        Ok(path)
    }

    /// Create the required tables if they don't exist
    fn create_tables(&self) -> Result<(), Box<dyn std::error::Error>> {
        // Create hashes table
        let create_hashes_sql = "
            CREATE TABLE IF NOT EXISTS hashes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path_hash TEXT NOT NULL,
            filename_hash TEXT NOT NULL,
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

    /// Insert a new hash record
    pub fn insert_hash(&self, path_hash: &str, filename_hash: &str) -> Result<i64, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            INSERT INTO hashes (path_hash, filename_hash) 
            VALUES (?, ?)
            ")?;

        statement.bind((1, path_hash))?;
        statement.bind((2, filename_hash))?;

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
            VALUES (?, ?)
            ")?;

        statement.bind((1, hash_id))?;
        statement.bind((2, filetype))?;

        statement.next()?;

        Ok(())
    }

    /// Delete hash record by ID (cascades to metadata table)
    pub fn delete_hash(&self, hash_id: i64) -> Result<bool, Box<dyn std::error::Error>> {
        // First delete associated metadata
        let mut delete_metadata = self.connection.prepare("
            DELETE FROM metadata WHERE hash_id = ?
            ")?;
        delete_metadata.bind((1, hash_id))?;
        delete_metadata.next()?;

        // Then delete the hash record
        let mut delete_hash = self.connection.prepare("
            DELETE FROM hashes WHERE id = ?
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

    /// Update metadata for a specific hash_id
    pub fn update_metadata(&self, hash_id: i64, filetype: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            UPDATE metadata SET filetype = ? WHERE hash_id = ?
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

    /// Get full record by matching both path and filename hash
    pub fn get_full_record(&self, path_hash: &str, filename_hash: &str) -> Result<Option<FullRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT h.id, h.path_hash, h.filename_hash, h.indexed_at,
            m.id as metadata_id, m.filetype
            FROM hashes h
            LEFT JOIN metadata m ON h.id = m.hash_id
            WHERE h.path_hash = ? AND h.filename_hash = ?
            ")?;

        statement.bind((1, path_hash))?;
        statement.bind((2, filename_hash))?;

        if let Ok(State::Row) = statement.next() {
            let record = FullRecord {
                hash_id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                indexed_at: statement.read::<String, _>(3)?,
                metadata_id: statement.read::<Option<i64>, _>(4)?,
                filetype: statement.read::<Option<String>, _>(5)?,
            };
            Ok(Some(record))
        } else {
            Ok(None)
        }
    }

    /// Get all records matching a path hash
    pub fn get_records_by_path(&self, path_hash: &str) -> Result<Vec<FullRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT h.id, h.path_hash, h.filename_hash, h.indexed_at,
            m.id as metadata_id, m.filetype
            FROM hashes h
            LEFT JOIN metadata m ON h.id = m.hash_id
            WHERE h.path_hash = ?
            ")?;

        statement.bind((1, path_hash))?;

        let mut records = Vec::new();

        while let Ok(State::Row) = statement.next() {
            let record = FullRecord {
                hash_id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                indexed_at: statement.read::<String, _>(3)?,
                metadata_id: statement.read::<Option<i64>, _>(4)?,
                filetype: statement.read::<Option<String>, _>(5)?,
            };
            records.push(record);
        }

        Ok(records)
    }

    /// Example query: Get hash by path_hash (kept for backwards compatibility)
    pub fn get_hash_by_path(&self, path_hash: &str) -> Result<Option<HashRecord>, Box<dyn std::error::Error>> {
        let mut statement = self.connection.prepare("
            SELECT id, path_hash, filename_hash, indexed_at 
            FROM hashes 
            WHERE path_hash = ?
            ")?;

        statement.bind((1, path_hash))?;

        if let Ok(State::Row) = statement.next() {
            let record = HashRecord {
                id: statement.read::<i64, _>(0)?,
                path_hash: statement.read::<String, _>(1)?,
                filename_hash: statement.read::<String, _>(2)?,
                indexed_at: statement.read::<String, _>(3)?,
            };
            Ok(Some(record))
        } else {
            Ok(None)
        }
    }

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
