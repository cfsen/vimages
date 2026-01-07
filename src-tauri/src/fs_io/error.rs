use tauri::ipc::InvokeError;

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
impl From<FilesystemIOError> for tauri::ipc::InvokeError {
    fn from(err: FilesystemIOError) -> Self {
        tauri::ipc::InvokeError::from(err.error_message)
    }
}
pub fn get_io_error_description(code: &FilesystemIOErrorCode) -> &str {
    match code {
        FilesystemIOErrorCode::NotImplemented => "Not implemented",
        FilesystemIOErrorCode::NoErrorCode => "No error code provided",

        FilesystemIOErrorCode::FailedToRemoveFile => "Failed to remove file",
        FilesystemIOErrorCode::FailedToRemoveDirectory => "Failed to remove directory",

        FilesystemIOErrorCode::FailedToCopyFile => "Failed to copy file",

        FilesystemIOErrorCode::FailedToRenameOrMove => "Failed to perform rename or move operation",

        FilesystemIOErrorCode::TargetDoesNotExist => "Target does not exist",
        FilesystemIOErrorCode::TargetIsNotFile => "Target is not a file",
        FilesystemIOErrorCode::TargetIsNotDirectory => "Target is not a directory",

        FilesystemIOErrorCode::RegexSubstitutionMissingPrefix => "Substitution must start with: s/",
        FilesystemIOErrorCode::RegexSubstitutionMinimumLength => "Substitution must be at least 4 characters",
        FilesystemIOErrorCode::RegexSubstitutionMissingSeparators => "Missing separators",
        FilesystemIOErrorCode::RegexSubstitutionTooManySeparators => "Too many separators",

        FilesystemIOErrorCode::RegexInvalidExpr => "Invalid regex",
    }
}
#[derive(Debug, Clone)]
pub enum FilesystemIOErrorCode {
    NotImplemented,
    NoErrorCode,

    FailedToRemoveFile,
    FailedToRemoveDirectory,

    FailedToCopyFile,

    FailedToRenameOrMove,

    TargetDoesNotExist,
    TargetIsNotFile,
    TargetIsNotDirectory,

    RegexSubstitutionMissingPrefix,
    RegexSubstitutionMinimumLength,
    RegexSubstitutionMissingSeparators,
    RegexSubstitutionTooManySeparators,

    RegexInvalidExpr,
}
