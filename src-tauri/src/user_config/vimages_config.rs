use std::fs;
use std::path::PathBuf;

use crate::user_config::types::{ConfigFile, Keybind};

const CONFIG_DIR: &str = ".vimages";
const CONFIG_FILE: &str = "vimages_config.json";

fn get_config_path() -> Result<PathBuf, String> {
    let cache_dir = dirs::cache_dir()
        .ok_or("Failed to get cache directory")?;

    let config_dir = cache_dir.join(CONFIG_DIR);

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {e}"))?;
    }

    Ok(config_dir.join(CONFIG_FILE))
}

#[tauri::command]
pub fn get_or_create_config() -> Result<ConfigFile, String> {
    match read_config() {
        Ok(config) => Ok(config),
        Err(_) => {
            let default_config = create_default_config();
            write_config(&default_config)?;
            Ok(default_config)
        }
    }
}

#[tauri::command]
pub fn save_config(mut config: ConfigFile) -> Result<(), String> {
    verify_config(&mut config)?;
    write_config(&config)
}

pub fn read_config() -> Result<ConfigFile, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        return Err("Config file does not exist".to_string());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {e}"))?;

    let config: ConfigFile = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {e}"))?;

    Ok(config)
}

pub fn verify_config(config: &mut ConfigFile) -> Result<(), String> {
    // TODO: version checking
    if config.vimages_version.is_empty() {
        return Err("Version string cannot be empty".to_string());
    }

    // Fix extreme resolutions by reverting to default
    if config.window_width < 400 || config.window_width > 3840 {
        config.window_width = 1280;
    }

    if config.window_height < 300 || config.window_height > 2160 {
        config.window_height = 720;
    }

    // Check if last_path is a valid directory (or at least not empty)
    if config.last_path.is_empty() {
        return Err("Last path cannot be empty".to_string());
    }

    Ok(())
}

pub fn write_config(config: &ConfigFile) -> Result<(), String> {
    let config_path = get_config_path()?;

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {e}"))?;

    fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {e}"))?;

    Ok(())
}

pub fn create_default_config() -> ConfigFile {
    ConfigFile {
        vimages_version: env!("CARGO_PKG_VERSION").to_string(),
        last_path: dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .to_string_lossy().to_string(),
        window_width: 1280,
        window_height: 720,
        titlebar: true,
        scroll_delay: 100,
        generic_errors: true,
        // NOTE: source of truth for keybindings is in `key.command.ts`
        keybinds: vec![
            create_keybind("Return", "  "),
        ],
    }
}

fn create_keybind(command: &str, keybind: &str) -> Keybind {
   Keybind { command: command.into(), keybind: keybind.into() } 
}
