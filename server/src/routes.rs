use axum::{
    Json,
    extract::{Path, Query, State},
};
use serde::Deserialize;
use std::sync::Arc;

use crate::errors::AppError;
use crate::models::{CreateTaskRequest, MessageResponse, Stats, Task, TaskQueryParams, UpdateTaskRequest};
use crate::taskwarrior::TaskwarriorClient;

#[derive(Clone)]
pub struct AppState {
    pub client: Arc<TaskwarriorClient>,
}

#[derive(Debug, Deserialize)]
pub struct CompletedQueryParams {
    pub days: Option<u32>,
}

pub async fn get_tasks(
    State(state): State<AppState>,
    Query(params): Query<TaskQueryParams>,
) -> Result<Json<Vec<Task>>, AppError> {
    let client = state.client.as_ref();

    let filter = params.filter.as_deref();
    let mut tasks = client.export(filter).await?;

    // Apply search filter
    if let Some(search) = &params.search {
        let search_lower = search.to_lowercase();
        tasks.retain(|t| {
            t.description.to_lowercase().contains(&search_lower)
                || t.project
                    .as_ref()
                    .map(|p| p.to_lowercase().contains(&search_lower))
                    .unwrap_or(false)
                || t.tags
                    .as_ref()
                    .map(|tags| {
                        tags.iter()
                            .any(|tag| tag.to_lowercase().contains(&search_lower))
                    })
                    .unwrap_or(false)
        });
    }

    // Apply sorting
    if let Some(sort) = &params.sort {
        let parts: Vec<&str> = sort.split(':').collect();
        let field = parts[0];
        let direction = parts.get(1).copied().unwrap_or("asc");

        tasks.sort_by(|a, b| {
            let cmp = match field {
                "urgency" => a
                    .urgency
                    .partial_cmp(&b.urgency)
                    .unwrap_or(std::cmp::Ordering::Equal),
                "due" => a.due.cmp(&b.due),
                "project" => a.project.cmp(&b.project),
                "description" => a.description.cmp(&b.description),
                "entry" => a.entry.cmp(&b.entry),
                _ => std::cmp::Ordering::Equal,
            };

            if direction == "desc" {
                cmp.reverse()
            } else {
                cmp
            }
        });
    }

    Ok(Json(tasks))
}

pub async fn create_task(
    State(state): State<AppState>,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<(axum::http::StatusCode, Json<MessageResponse>), AppError> {
    if payload.description.trim().is_empty() {
        return Err(AppError::InvalidInput(
            "Description is required".to_string(),
        ));
    }

    if payload.description.len() > 4096 {
        return Err(AppError::InvalidInput(
            "Description too long (max 4KB)".to_string(),
        ));
    }

    let client = state.client.as_ref();

    let mut args: Vec<String> = Vec::new();
    args.push(payload.description.clone());

    if let Some(project) = &payload.project {
        args.push(format!("project:{}", project));
    }
    if let Some(tags) = &payload.tags {
        for tag in tags {
            args.push(format!("+{}", tag));
        }
    }
    if let Some(priority) = &payload.priority {
        args.push(format!("priority:{}", priority));
    }
    if let Some(due) = &payload.due {
        args.push(format!("due:{}", due));
    }
    if let Some(wait) = &payload.wait {
        args.push(format!("wait:{}", wait));
    }
    if let Some(scheduled) = &payload.scheduled {
        args.push(format!("scheduled:{}", scheduled));
    }
    if let Some(recur) = &payload.recur {
        args.push(format!("recur:{}", recur));
    }
    if let Some(until) = &payload.until {
        args.push(format!("until:{}", until));
    }
    if let Some(depends) = &payload.depends {
        args.push(format!("depends:{}", depends.join(",")));
    }

    let args_str: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    client.add(args_str).await?;

    Ok((
        axum::http::StatusCode::CREATED,
        Json(MessageResponse {
            message: "Task created successfully".to_string(),
        }),
    ))
}

pub async fn update_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
    Json(payload): Json<UpdateTaskRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();

    let mut args: Vec<String> = Vec::new();

    if let Some(description) = &payload.description {
        args.push(format!("description:{}", description));
    }
    if let Some(project) = &payload.project {
        args.push(format!("project:{}", project));
    }
    if let Some(tags) = &payload.tags {
        args.push(format!("tags:{}", tags.join(",")));
    }
    if let Some(priority) = &payload.priority {
        args.push(format!("priority:{}", priority));
    }
    if let Some(due) = &payload.due {
        args.push(format!("due:{}", due));
    }
    if let Some(wait) = &payload.wait {
        args.push(format!("wait:{}", wait));
    }
    if let Some(scheduled) = &payload.scheduled {
        args.push(format!("scheduled:{}", scheduled));
    }
    if let Some(recur) = &payload.recur {
        args.push(format!("recur:{}", recur));
    }
    if let Some(until) = &payload.until {
        args.push(format!("until:{}", until));
    }
    if let Some(depends) = &payload.depends {
        args.push(format!("depends:{}", depends.join(",")));
    }

    if args.is_empty() {
        return Err(AppError::InvalidInput("No fields to update".to_string()));
    }

    let args_str: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    client.modify(&uuid, args_str).await?;

    Ok(Json(MessageResponse {
        message: "Task updated successfully".to_string(),
    }))
}

pub async fn delete_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.delete(&uuid).await?;

    Ok(Json(MessageResponse {
        message: "Task deleted successfully".to_string(),
    }))
}

pub async fn done_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.done(&uuid).await?;

    Ok(Json(MessageResponse {
        message: "Task completed successfully".to_string(),
    }))
}

pub async fn uncomplete_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.uncomplete(&uuid).await?;

    Ok(Json(MessageResponse {
        message: "Task uncompleted successfully".to_string(),
    }))
}

pub async fn start_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.start(&uuid).await?;

    Ok(Json(MessageResponse {
        message: "Task started successfully".to_string(),
    }))
}

pub async fn stop_task(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.stop(&uuid).await?;

    Ok(Json(MessageResponse {
        message: "Task stopped successfully".to_string(),
    }))
}

pub async fn undo_action(State(state): State<AppState>) -> Result<Json<MessageResponse>, AppError> {
    let client = state.client.as_ref();
    client.undo().await?;

    Ok(Json(MessageResponse {
        message: "Undo successful".to_string(),
    }))
}

pub async fn get_task_by_uuid(
    State(state): State<AppState>,
    Path(uuid): Path<String>,
) -> Result<Json<Task>, AppError> {
    let client = state.client.as_ref();
    let task = client.export_one(&uuid).await?;
    Ok(Json(task))
}

pub async fn get_pending_tasks(
    State(state): State<AppState>,
) -> Result<Json<Vec<Task>>, AppError> {
    let client = state.client.as_ref();
    let tasks = client.export_pending().await?;
    Ok(Json(tasks))
}

pub async fn get_completed_tasks(
    State(state): State<AppState>,
    Query(params): Query<CompletedQueryParams>,
) -> Result<Json<Vec<Task>>, AppError> {
    let client = state.client.as_ref();
    let days = params.days.unwrap_or(14);
    let tasks = client.export_completed(days).await?;
    Ok(Json(tasks))
}

pub async fn get_calendar_tasks(
    State(state): State<AppState>,
) -> Result<Json<Vec<Task>>, AppError> {
    let client = state.client.as_ref();
    let tasks = client.export_with_due().await?;
    Ok(Json(tasks))
}

pub async fn get_stats(
    State(state): State<AppState>,
) -> Result<Json<Stats>, AppError> {
    let client = state.client.as_ref();
    let stats = client.get_stats().await?;
    Ok(Json(stats))
}
