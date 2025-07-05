use axum::{
    body::Body,
    extract::{Path as AxumPath, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use mime_guess::from_path;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::{Arc, RwLock},
};
use tokio::fs;

use crate::img_cache;

pub type ServerState = Arc<RwLock<PathBuf>>;

pub fn set_serve_directory(server_state: &ServerState, path: &Path) -> Result<(), String> {
    let mut current_dir = server_state.write().map_err(|e| e.to_string())?;
    *current_dir = path.to_path_buf();
    Ok(())
}
async fn serve_image(
    State(server_state): State<ServerState>,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    // Get ?file=... parameter
    let filename = params.get("file").ok_or(StatusCode::BAD_REQUEST)?;
    let base_dir = server_state.read().unwrap().clone();
    let file_path = base_dir.join(filename);

    // Prevent directory traversal
    if !file_path.starts_with(&base_dir) {
        return Err(StatusCode::FORBIDDEN);
    }

    // Try to read the file
    let file_data = fs::read(&file_path)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    // Guess the MIME type
    let mime_guess = from_path(&file_path).first_or_octet_stream();
    let mime = mime_guess.essence_str();

    // Build response
    let response = Response::builder()
        .header("content-type", mime)
        .body(Body::from(file_data))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}

async fn serve_cache(
    State(_server_state): State<ServerState>,
    AxumPath((dir, filename)): AxumPath<(String, String)>,
) -> impl IntoResponse {
    let base_dir = img_cache::cache::get_cache_path()
        .ok_or(StatusCode::BAD_REQUEST)
        .expect("axum: invalid cache request");
    let file_path = base_dir.join(&dir).join(format!("{}.webp", &filename));

    // Prevent directory traversal
    if !file_path.starts_with(&base_dir) {
        return Err(StatusCode::FORBIDDEN);
    }

    // Try to read the file
    let file_data = fs::read(&file_path)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    // Guess the MIME type
    let mime_guess = from_path(&file_path).first_or_octet_stream();
    let mime = mime_guess.essence_str();

    // Build response
    let response = Response::builder()
        .header("content-type", mime)
        .body(Body::from(file_data))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}

pub async fn start_server(server_state: ServerState) -> u16 {
    let app = Router::new()
        .route("/image", get(serve_image))
        .route("/cache/{dir}/{file}", get(serve_cache))
        .with_state(server_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("Failed to bind axum to localhost.");

    let port = listener
        .local_addr()
        .expect("Failed to get local address for axum.")
        .port();

    println!("axum listening on port: {}", port);

    tokio::spawn(async move {
        axum::serve(listener, app)
            .await
            .unwrap_or_else(|e| panic!("axum crashed: {}", e));
    });

    port
}
