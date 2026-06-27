mod errors;
mod models;
mod routes;
mod taskwarrior;

use axum::{Router, routing::get, routing::post};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use routes::AppState;
use taskwarrior::TaskwarriorClient;

#[tokio::main]
async fn main() {
    let state = AppState {
        client: Arc::new(Mutex::new(TaskwarriorClient::new())),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/tasks", get(routes::get_tasks))
        .route("/api/tasks", post(routes::create_task))
        .route(
            "/api/tasks/{uuid}",
            get(routes::get_task_by_uuid)
                .put(routes::update_task)
                .delete(routes::delete_task),
        )
        .route("/api/tasks/{uuid}/done", post(routes::done_task))
        .route("/api/tasks/{uuid}/start", post(routes::start_task))
        .route("/api/tasks/{uuid}/stop", post(routes::stop_task))
        .route("/api/undo", post(routes::undo_action))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Server running on http://localhost:3001");
    axum::serve(listener, app).await.unwrap();
}
