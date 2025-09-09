use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ConfigFile {
    pub vimages_version: String,
    pub last_path: String,
    pub window_width: i32,
    pub window_height: i32,
    pub titlebar: bool,
    pub keybinds: Vec<Keybind>,
}

#[derive(Serialize, Deserialize)]
pub struct Keybind {
    pub command: String,
    pub keybind: String,
}
