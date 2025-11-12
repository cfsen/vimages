#[derive(PartialEq)]
pub enum PathCheckType {
    File,
    Directory,
}

pub enum VerifyResult {
    Success,
    Failure,
}

pub enum FilesystemSameMountPoint {
    Error,
    CanRename,
    MustCopy,
}
