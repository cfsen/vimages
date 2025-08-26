// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Debug)
        .filter_module("tao", log::LevelFilter::Error)
        .filter_module("vimages_lib::endpoints::fs", log::LevelFilter::Info)
        .filter_module("vimages_lib::img_cache::cache", log::LevelFilter::Info)
        .filter_module("vimages_lib::img_cache::queue", log::LevelFilter::Info)
        .filter_module("vimages_lib::ipc::send", log::LevelFilter::Info)
        .init();
    vimages_lib::run()
}
