use std::fs;
use std::path::Path;

use crate::fs_io::error::{FilesystemIOError, FilesystemIOErrorCode};
use crate::fs_io::ops_types::{
    PathCheckType,
    FilesystemSameMountPoint,
};

// primary call point for rename and move ops on files
#[tauri::command]
pub fn rename_or_move_file(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::File)?;
    check_dest_path(&dest, PathCheckType::File)?;

    match rename_or_copy(&source, &dest) {
        FilesystemSameMountPoint::MustCopy => copy_file_and_delete_source(&source, &dest),
        FilesystemSameMountPoint::CanRename => move_same_mountpoint(&source, &dest),
        FilesystemSameMountPoint::Error => {
            Err(FilesystemIOError::from(FilesystemIOErrorCode::FailedToRenameOrMove))
        }
    }
}

// primary call point for rename and move ops on directories 
#[tauri::command]
pub fn rename_or_move_dir(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    check_path_exists(&source, PathCheckType::Directory)?;
    check_dest_path(&dest, PathCheckType::Directory)?;

    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

//
// rename/move
//

// moves a file within the same mount point
pub fn move_same_mountpoint(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    fs::rename(&source, &dest)
        .map_err(|e| {
            FilesystemIOError::with_details(
                FilesystemIOErrorCode::FailedToRenameOrMove, 
                format!("{} -> {}: {e}", source.display(), dest.display())
            )
        })
}

//
// deletion
//

// delete a directory
#[tauri::command]
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
#[tauri::command]
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

// copy a file
#[tauri::command]
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

// copy a directory recursively and delete original (move between different mount points)
fn copy_dir_and_delete_source(source: &Path, dest: &Path) -> Result<(), FilesystemIOError> {
    Err(FilesystemIOError::from(FilesystemIOErrorCode::NotImplemented))
}

// check mount point for source and dest, determine if copy must be used
fn rename_or_copy(source: &Path, dest: &Path) -> FilesystemSameMountPoint {
    let source_canonical = match source.canonicalize() {
        Ok(p) => p,
        Err(_) => return FilesystemSameMountPoint::Error,
    };

    let dest_parent = match dest.parent() {
        Some(p) => p,
        None => return FilesystemSameMountPoint::Error,
    };

    let dest_canonical = match dest_parent.canonicalize() {
        Ok(p) => p,
        Err(_) => return FilesystemSameMountPoint::Error,
    };

    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;

        let source_dev = match source_canonical.metadata() {
            Ok(m) => m.dev(),
            Err(_) => return FilesystemSameMountPoint::Error,
        };

        let dest_dev = match dest_canonical.metadata() {
            Ok(m) => m.dev(),
            Err(_) => return FilesystemSameMountPoint::Error,
        };

        if source_dev == dest_dev {
            FilesystemSameMountPoint::CanRename
        } else {
            FilesystemSameMountPoint::MustCopy
        }
    }

    #[cfg(windows)]
    {
        // On Windows, compare the volume/drive letter
        let source_root = get_path_root(&source_canonical);
        let dest_root = get_path_root(&dest_canonical);

        if source_root == dest_root {
            FilesystemSameMountPoint::CanRename
        } else {
            FilesystemSameMountPoint::MustCopy
        }
    }
}


//
// helpers
//

#[cfg(windows)]
fn get_path_root(path: &Path) -> Option<String> {
    path.components()
        .next()
        .and_then(|c| {
            if let std::path::Component::Prefix(prefix) = c {
                Some(prefix.as_os_str().to_string_lossy().to_string())
            } else {
                None
            }
        })
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
