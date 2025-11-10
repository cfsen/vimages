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
