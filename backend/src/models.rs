use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Todo {
    pub id: i64,
    pub title: String,
    pub done: bool,
}

#[derive(Deserialize)]
pub struct CreateTodoParams {
    pub title: String,
}

#[derive(Deserialize)]
pub struct UpdateTodoParams {
    pub title: String,
    pub done: bool,
}
