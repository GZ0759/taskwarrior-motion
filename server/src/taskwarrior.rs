use crate::errors::AppError;
use crate::models::Task;
use tokio::process::Command;

pub struct TaskwarriorClient;

impl TaskwarriorClient {
    pub fn new() -> Self {
        TaskwarriorClient
    }

    pub async fn export(&self, filter: Option<&str>) -> Result<Vec<Task>, AppError> {
        let mut args = vec!["export"];
        if let Some(f) = filter {
            args.push(f);
        }

        let output = Command::new("task")
            .args(&args)
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task export: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            // Empty result is not an error
            if stderr.contains("No matches") {
                return Ok(vec![]);
            }
            return Err(AppError::TaskError(format!(
                "task export failed: {}",
                stderr
            )));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.trim().is_empty() || stdout.trim() == "[]" {
            return Ok(vec![]);
        }

        let tasks: Vec<Task> = serde_json::from_str(&stdout)
            .map_err(|e| AppError::TaskError(format!("Failed to parse task output: {}", e)))?;

        Ok(tasks)
    }

    pub async fn add(&self, args: Vec<&str>) -> Result<String, AppError> {
        let mut cmd_args = vec!["add"];
        cmd_args.extend(args);

        let output = Command::new("task")
            .args(&cmd_args)
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task add: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!("task add failed: {}", stderr)));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.to_string())
    }

    pub async fn modify(&self, uuid: &str, args: Vec<&str>) -> Result<(), AppError> {
        let mut cmd_args = vec![uuid, "modify"];
        cmd_args.extend(args);

        let output = Command::new("task")
            .args(&cmd_args)
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task modify: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!(
                "task modify failed: {}",
                stderr
            )));
        }

        Ok(())
    }

    pub async fn done(&self, uuid: &str) -> Result<(), AppError> {
        let output = Command::new("task")
            .args([uuid, "done"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task done: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!("task done failed: {}", stderr)));
        }

        Ok(())
    }

    pub async fn delete(&self, uuid: &str) -> Result<(), AppError> {
        let output = Command::new("task")
            .args([uuid, "delete"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task delete: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!(
                "task delete failed: {}",
                stderr
            )));
        }

        Ok(())
    }

    pub async fn start(&self, uuid: &str) -> Result<(), AppError> {
        let output = Command::new("task")
            .args([uuid, "start"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task start: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!(
                "task start failed: {}",
                stderr
            )));
        }

        Ok(())
    }

    pub async fn stop(&self, uuid: &str) -> Result<(), AppError> {
        let output = Command::new("task")
            .args([uuid, "stop"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task stop: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!("task stop failed: {}", stderr)));
        }

        Ok(())
    }

    pub async fn undo(&self) -> Result<(), AppError> {
        let output = Command::new("task")
            .args(["undo"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task undo: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::TaskError(format!("task undo failed: {}", stderr)));
        }

        Ok(())
    }
}
