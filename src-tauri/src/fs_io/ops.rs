// TODO: implementation of file operations
use std::fs::{rename, copy, remove_dir, remove_file};
use std::path::Path;


#[derive(Debug, Clone)]
pub struct FilesystemIOError {
    error_message: String,
}

impl From<String> for FilesystemIOError {
    fn from(value: String) -> Self {
        FilesystemIOError { error_message: value }
    }
}
impl From<&str> for FilesystemIOError {
    fn from(value: &str) -> Self {
        FilesystemIOError { error_message: value.to_string() }
    }
}

pub enum FilesystemSameMountPoint {
    NotImplemented,
    Error,
    CanRename,
    MustCopy,
}

// primary call point for rename and move ops on files
pub fn rename_or_move_file(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// primary call point for rename and move ops on directories 
pub fn rename_or_move_dir(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// delete a directory
pub fn delete_dir(target: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// delete a file
pub fn delete_file(target: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// copy a file and verify copy
pub fn copy_file_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// copy a file and delete original (move between different mount points)
fn copy_file_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// copy a directory recursively and verify copy
pub fn copy_dir_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// copy a directory recursively and delete original (move between different mount points)
fn copy_dir_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from("Not implemented"))
}

// check mount point for source and dest, determine if copy must be used
fn rename_or_copy(source: &Path, dest: &Path) -> FilesystemSameMountPoint {
    FilesystemSameMountPoint::NotImplemented
}

#[derive(PartialEq)]
enum PathCheckType {
    File,
    Directory,
}

fn check_dest_path(target: &Path, check_type: PathCheckType) -> Result<(), String> {
    // TODO: use enum for more specific errors (file/directory exists)
    if check_path_exists(&target, check_type).is_ok() {
        return Err("Destination path exists.".to_string());
    }
    Ok(())
}

fn check_path_exists(target: &Path, check_type: PathCheckType) -> Result<(), String> {
    // TODO: use enum for more specific errors (file/directory exists)
    if !target.exists() {
        return Err("Target path does not exist".to_string())
    }
    match check_type {
        PathCheckType::File => {
            if !target.is_file() {
                return Err("Target path is not a file".to_string())
            }
        }
        PathCheckType::Directory => {
            if !target.is_dir() {
                return Err("Target path is not a directory".to_string())
            }
        }
    }

    Ok(())
}
