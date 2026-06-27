use crate::errors::AppError;
use crate::models::Task;
use tokio::process::Command;

pub struct TaskwarriorClient;

impl Default for TaskwarriorClient {
    fn default() -> Self {
        Self::new()
    }
}

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
        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

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
        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let output = Command::new("task")
            .args([uuid, "done"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task done: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task done failed: {}",
                error_msg
            )));
        }

        Ok(())
    }

    pub async fn uncomplete(&self, uuid: &str) -> Result<(), AppError> {
        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let output = Command::new("task")
            .args([uuid, "modify", "status:pending"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task uncomplete: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task uncomplete failed: {}",
                error_msg
            )));
        }

        Ok(())
    }

    pub async fn delete(&self, uuid: &str) -> Result<(), AppError> {
        use tokio::io::AsyncWriteExt;

        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let mut child = Command::new("task")
            .args([uuid, "delete"])
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| AppError::TaskError(format!("Failed to spawn task delete: {}", e)))?;

        // Send "yes" to confirm the delete
        if let Some(mut stdin) = child.stdin.take() {
            stdin.write_all(b"yes\n").await.map_err(|e| {
                AppError::TaskError(format!("Failed to write to stdin: {}", e))
            })?;
        }

        let output = child
            .wait_with_output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to wait for task delete: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task delete failed: {}",
                error_msg
            )));
        }

        Ok(())
    }

    pub async fn start(&self, uuid: &str) -> Result<(), AppError> {
        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let output = Command::new("task")
            .args([uuid, "start"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task start: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task start failed: {}",
                error_msg
            )));
        }

        Ok(())
    }

    pub async fn stop(&self, uuid: &str) -> Result<(), AppError> {
        // First check if task exists
        let tasks = self.export(None).await?;
        if !tasks.iter().any(|t| t.uuid == uuid) {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let output = Command::new("task")
            .args([uuid, "stop"])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task stop: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task stop failed: {}",
                error_msg
            )));
        }

        Ok(())
    }

    pub async fn undo(&self) -> Result<(), AppError> {
        use tokio::io::AsyncWriteExt;

        let mut child = Command::new("task")
            .args(["undo"])
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| AppError::TaskError(format!("Failed to spawn task undo: {}", e)))?;

        // Send "yes" to confirm the undo
        if let Some(mut stdin) = child.stdin.take() {
            stdin.write_all(b"yes\n").await.map_err(|e| {
                AppError::TaskError(format!("Failed to write to stdin: {}", e))
            })?;
        }

        let output = child
            .wait_with_output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to wait for task undo: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let error_msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            return Err(AppError::TaskError(format!(
                "task undo failed: {}",
                error_msg
            )));
        }

        Ok(())
    }
}
