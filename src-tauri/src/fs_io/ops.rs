// TODO: implementation of file operations
use std::fs::{rename, copy, remove_dir, remove_file};
use std::path::Path;


#[derive(Debug, Clone)]
pub struct FilesystemIOError {
    error_message: String,
}

pub enum FilesystemSameMountPoint {
    NotImplemented,
    Error,
    CanRename,
    MustCopy,
}

// primary call point for rename and move ops on files
pub fn rename_or_move_file(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// primary call point for rename and move ops on directories 
pub fn rename_or_move_dir(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// delete a directory
pub fn delete_dir(target: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// delete a file
pub fn delete_file(target: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// copy a file and verify copy
pub fn copy_file_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// copy a file and delete original (move between different mount points)
fn copy_file_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// copy a directory recursively and verify copy
pub fn copy_dir_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// copy a directory recursively and delete original (move between different mount points)
fn copy_dir_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError { error_message: "Not implemented".to_string() })
}

// check mount point for source and dest, determine if copy must be used
fn rename_or_copy(source: &Path, dest: &Path) -> FilesystemSameMountPoint {
    FilesystemSameMountPoint::NotImplemented
}
