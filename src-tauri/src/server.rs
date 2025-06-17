use axum::{
    body::Body,
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use std::{
    collections::HashMap,
    path::{Path, PathBuf },
    sync::{Arc, RwLock},
};
use tokio::fs;

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
    let filename = params.get("file").ok_or(StatusCode::BAD_REQUEST)?;
    let base_dir = server_state.read().unwrap().clone();
    let file_path = base_dir.join(filename);

    // Basic security check
    if !file_path.starts_with(&base_dir) {
        return Err(StatusCode::FORBIDDEN);
    }

    let file_data = fs::read(&file_path).await.map_err(|_| StatusCode::NOT_FOUND)?;

    let response = Response::builder()
        .header("content-type", "image/*")
        .body(Body::from(file_data))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}

async fn start_server(server_state: ServerState) {
    let app = Router::new()
        .route("/image", get(serve_image))
        .with_state(server_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

pub async fn spawn_server(server_state: ServerState) {
    tokio::spawn(async move {
        start_server(server_state).await;
    });
}
