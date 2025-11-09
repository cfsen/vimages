// TODO: implementation of file operations
use std::fs::{self, copy, remove_dir, remove_file, rename};
use std::path::Path;

#[derive(PartialEq)]
enum PathCheckType {
    File,
    Directory,
}

enum VerifyResult {
    Success,
    Failure,
}

#[derive(Debug, Clone)]
pub struct FilesystemIOError {
    error_message: String,
    error_details: String,
    error_code: FilesystemIOErrorCode,
}
impl From<String> for FilesystemIOError {
    fn from(value: String) -> Self {
        FilesystemIOError {
            error_message: value,
            error_details: "".to_string(),
            error_code: FilesystemIOErrorCode::NoErrorCode,
        }
    }
}
impl From<&str> for FilesystemIOError {
    fn from(value: &str) -> Self {
        FilesystemIOError {
            error_message: value.to_string(),
            error_details: "".to_string(),
            error_code: FilesystemIOErrorCode::NoErrorCode,
        }
    }
}
impl From<FilesystemIOErrorCode> for FilesystemIOError {
    fn from(code: FilesystemIOErrorCode) -> Self {
        let error_message = get_io_error_description(&code);
        FilesystemIOError::from(error_message)
    }
}
impl FilesystemIOError {
    pub fn with_details(error_code: FilesystemIOErrorCode, error_details: impl Into<String>) -> Self {
        FilesystemIOError {
            error_message: get_io_error_description(&error_code).into(),
            error_details: error_details.into(),
            error_code,
        }
    }
}
pub fn get_io_error_description(code: &FilesystemIOErrorCode) -> &str {
    match code {
        FilesystemIOErrorCode::NotImplemented => "Not implemented",
        FilesystemIOErrorCode::NoErrorCode => "No error code provided",

        FilesystemIOErrorCode::FailedToRemoveFile => "Failed to remove file",
        FilesystemIOErrorCode::FailedToRemoveDirectory => "Failed to remove directory",

        FilesystemIOErrorCode::FailedToCopyFile => "Failed to copy file",

        FilesystemIOErrorCode::TargetDoesNotExist => "Target does not exist",
        FilesystemIOErrorCode::TargetIsNotFile => "Target is not a file",
        FilesystemIOErrorCode::TargetIsNotDirectory => "Target is not a directory",
    }
}
#[derive(Debug, Clone)]
pub enum FilesystemIOErrorCode {
    NotImplemented,
    NoErrorCode,

    FailedToRemoveFile,
    FailedToRemoveDirectory,

    FailedToCopyFile,

    TargetDoesNotExist,
    TargetIsNotFile,
    TargetIsNotDirectory,
}

// TODO: for mount point check results
pub enum FilesystemSameMountPoint {
    NotImplemented,
    Error,
    CanRename,
    MustCopy,
}

// primary call point for rename and move ops on files
pub fn rename_or_move_file(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::File)?;
    check_dest_path(&dest, PathCheckType::File)?;

    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

// primary call point for rename and move ops on directories 
pub fn rename_or_move_dir(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::Directory)?;
    check_dest_path(&dest, PathCheckType::Directory)?;

    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

//
// deletion
//

// delete a directory
pub fn delete_dir(target: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&target, PathCheckType::Directory)?;

    fs::remove_dir(&target)
        .map_err(|e| {
            FilesystemIOError::with_details(
                FilesystemIOErrorCode::FailedToRemoveDirectory,
                format!("{}: {e}", target.display())
            )
        })
}

// delete a file
pub fn delete_file(target: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&target, PathCheckType::File)?;

    fs::remove_file(&target)
        .map_err(|e| {
            FilesystemIOError::with_details(
                FilesystemIOErrorCode::FailedToRemoveFile,
                format!("{}: {e}", target.display())
            )
        })
}

//
// copying
//

// copy a file and verify copy
pub fn copy_file_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::File)?;
    check_dest_path(&dest, PathCheckType::File)?;

    copy_file(&source, &dest)?;

    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

// copy a file
pub fn copy_file(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::File)?;
    check_dest_path(&dest, PathCheckType::File)?;

    fs::copy(&source, &dest)
        .map_err(|e| {
            FilesystemIOError::from(format!(
                "Failed to copy file: '{}': {e}",
                source.display()
            ))
        })?;

    Ok(())
}

// copy a file and delete original (move between different mount points)
fn copy_file_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::File)?;
    check_dest_path(&dest, PathCheckType::File)?;

    copy_file(&source, &dest)?;
    delete_file(&source)?;

    Ok(())
}

// copy a directory recursively and verify copy
pub fn copy_dir_and_verify(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::Directory)?;
    check_dest_path(&dest, PathCheckType::Directory)?;

    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

// copy a directory recursively and delete original (move between different mount points)
fn copy_dir_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

// check mount point for source and dest, determine if copy must be used
fn rename_or_copy(source: &Path, dest: &Path) -> FilesystemSameMountPoint {
    FilesystemSameMountPoint::NotImplemented
}

//
// helpers
//

// verifies a file
fn verify_file_integrity(source: &Path, dest: &Path) -> VerifyResult {
    // TODO: implement verification
    VerifyResult::Failure
}

// check destination path for copy/rename operations
fn check_dest_path(target: &Path, check_type: PathCheckType) -> Result<(), String> {
    // TODO: use enum for more specific errors (file/directory exists)
    if check_path_exists(&target, check_type).is_ok() {
        return Err("Destination path exists.".to_string());
    }
    Ok(())
}

// check if destination path (directory or file) exists
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
