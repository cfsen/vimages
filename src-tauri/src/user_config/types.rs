use serde::{Deserialize, Serialize};

// see: VimagesConfig (src/context/context.types.ts)
#[derive(Serialize, Deserialize)]
pub struct ConfigFile {
    pub vimages_version: String,
    pub last_path: String,
    pub window_width: i32,
    pub window_height: i32,
    pub titlebar: bool,
    pub scroll_delay: i32,
    pub keybinds: Vec<Keybind>,
}

// see: Keybind (src/context/context.types.ts)
#[derive(Serialize, Deserialize)]
pub struct Keybind {
    pub command: String,
    pub keybind: String,
}
