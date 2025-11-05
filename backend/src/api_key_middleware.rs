use axum::{
    http::{Method, Request},
    middleware::Next,
    response::IntoResponse,
};

use crate::errors::AppError;

pub async fn api_key_middleware(req: Request<axum::body::Body>, next: Next) -> impl IntoResponse {
    // Allow CORS preflight requests through so the CorsLayer can respond
    if req.method() == Method::OPTIONS {
        return Ok(next.run(req).await);
    }

    //Prečti header
    let key = req.headers().get("x-api-key").and_then(|v| v.to_str().ok());

    //Kontrola
    if key == Some("supersecret123") {
        Ok(next.run(req).await)
    } else {
        Err(AppError::Unauthorized("Invalid API key".into()))
    }
}
