use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    errors::AppError,
    models::{self, Todo},
    state,
};

pub async fn home() -> String {
    format!("Welcome to todo backend")
}
// GET all todos
pub async fn list_todos(State(state): State<state::AppState>) -> Result<Json<Vec<Todo>>, AppError> {
    let todos = sqlx::query_as!(Todo, "SELECT id, title, done FROM todos")
        .fetch_all(&state.db)
        .await
        .map_err(|e| AppError::InternalError(e.to_string()))?;

    Ok(Json(todos))
}

//CREATE todo (POST method)
pub async fn create_todo(
    State(state): State<state::AppState>,
    Json(payload): Json<models::CreateTodoParams>,
) -> Result<Json<Todo>, AppError> {
    let todo = sqlx::query_as!(
        Todo,
        "INSERT INTO todos (title, done) VALUES (?, ?) RETURNING id, title, done",
        payload.title,
        false
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| AppError::InternalError(e.to_string()))?;

    Ok(Json(todo))
}

//Update todo (PUT)
pub async fn update_todo(
    Path(id): Path<i64>,
    State(state): State<state::AppState>,
    Json(payload): Json<models::UpdateTodoParams>,
) -> Result<Json<Todo>, AppError> {
    let updated_todo = sqlx::query!(
        "UPDATE todos SET title = ?, done = ? WHERE id = ? RETURNING id, title, done",
        payload.title,
        payload.done,
        id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::NotFound("Todo not found".into()))?;

    let todo = models::Todo {
        id: updated_todo.id.unwrap(),
        title: updated_todo.title,
        done: updated_todo.done,
    };

    Ok(Json(todo))
}

//Delete todo (DELETE)
pub async fn delete_todo(
    Path(id): Path<i64>,
    State(state): State<state::AppState>,
) -> Result<(StatusCode, String), AppError> {
    let result = sqlx::query!("DELETE FROM todos WHERE id = ?", id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::InternalError(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Todo Not Found".into()));
    }

    Ok((StatusCode::OK, "Todo has been deleted".to_string()))
}
