use axum::{Router, routing::get, routing::post};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use taskwarrior_motion::routes;
use taskwarrior_motion::routes::AppState;
use taskwarrior_motion::taskwarrior::TaskwarriorClient;

#[tokio::main]
async fn main() {
    // 初始化日志
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "taskwarrior_motion=info,tower_http=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState {
        client: Arc::new(TaskwarriorClient::new()),
    };

    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse().unwrap(),
            "http://localhost:3000".parse().unwrap(),
        ])
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/tasks", get(routes::get_tasks))
        .route("/api/tasks", post(routes::create_task))
        .route(
            "/api/tasks/:uuid",
            get(routes::get_task_by_uuid)
                .put(routes::update_task)
                .delete(routes::delete_task),
        )
        .route("/api/tasks/pending", get(routes::get_pending_tasks))
        .route("/api/tasks/completed", get(routes::get_completed_tasks))
        .route("/api/tasks/calendar", get(routes::get_calendar_tasks))
        .route("/api/stats", get(routes::get_stats))
        .route("/api/tasks/:uuid/done", post(routes::done_task))
        .route("/api/tasks/:uuid/uncomplete", post(routes::uncomplete_task))
        .route("/api/tasks/:uuid/start", post(routes::start_task))
        .route("/api/tasks/:uuid/stop", post(routes::stop_task))
        .route("/api/undo", post(routes::undo_action))
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("Server running on http://localhost:3001");
    axum::serve(listener, app).await.unwrap();
}
