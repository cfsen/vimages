#[derive(PartialEq)]
pub enum PathCheckType {
    File,
    Directory,
}

pub enum FilesystemSameMountPoint {
    Error,
    CanRename,
    MustCopy,
}
