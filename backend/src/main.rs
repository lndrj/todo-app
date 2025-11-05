use axum::{
    Router, middleware,
    routing::{get, put},
};
use sqlx::SqlitePool;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod api_key_middleware;
mod errors;
mod models;
mod routes;
mod state;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    //logovani

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = SqlitePool::connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    let app_state = state::AppState { db: pool };

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(routes::home))
        .route("/todos", get(routes::list_todos).post(routes::create_todo))
        .route(
            "/todos/{id}",
            put(routes::update_todo).delete(routes::delete_todo),
        )
        .with_state(app_state)
        .layer(cors)
        .layer(middleware::from_fn(api_key_middleware::api_key_middleware))
        .layer(TraceLayer::new_for_http()); //middleware

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3333")
        .await
        .expect("Failed to bind address to localhost:3333");

    println!("Server is running on https://localhost:3333");
    axum::serve(listener, app)
        .await
        .expect("Failed to start server")
}
