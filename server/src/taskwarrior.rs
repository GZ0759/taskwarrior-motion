use crate::errors::AppError;
use crate::models::{Task, Stats, ProjectStats};
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
        let mut args = Vec::new();
        if let Some(f) = filter {
            args.push(f);
        }
        args.push("export");

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

    pub async fn export_one(&self, uuid: &str) -> Result<Task, AppError> {
        let output = Command::new("task")
            .args(["export", &format!("uuid:{}", uuid)])
            .output()
            .await
            .map_err(|e| AppError::TaskError(format!("Failed to execute task export: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.contains("No matches") {
                return Err(AppError::NotFound(format!("Task {} not found", uuid)));
            }
            return Err(AppError::TaskError(format!("task export failed: {}", stderr)));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.trim().is_empty() || stdout.trim() == "[]" {
            return Err(AppError::NotFound(format!("Task {} not found", uuid)));
        }

        let tasks: Vec<Task> = serde_json::from_str(&stdout)
            .map_err(|e| AppError::TaskError(format!("Failed to parse task output: {}", e)))?;

        tasks.into_iter().next()
            .ok_or_else(|| AppError::NotFound(format!("Task {} not found", uuid)))
    }

    pub async fn export_pending(&self) -> Result<Vec<Task>, AppError> {
        self.export(Some("status:pending")).await
    }

    pub async fn export_completed(&self, days: u32) -> Result<Vec<Task>, AppError> {
        let filter = format!("status:completed end.after:today-{}days", days);
        self.export(Some(&filter)).await
    }

    pub async fn export_with_due(&self) -> Result<Vec<Task>, AppError> {
        self.export(Some("due.any:")).await
    }

    pub async fn get_stats(&self) -> Result<Stats, AppError> {
        let all_tasks = self.export(None).await?;

        let mut heatmap: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
        let mut projects: std::collections::HashMap<String, ProjectStats> = std::collections::HashMap::new();
        let mut today_count = 0;
        let mut total_done = 0;
        let mut pending_count = 0;

        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

        for task in &all_tasks {
            if task.status == "completed" {
                total_done += 1;
                if let Some(end) = &task.end {
                    let date_str = if end.len() >= 8 && end.chars().nth(8) == Some('T') {
                        format!("{}-{}-{}", &end[0..4], &end[4..6], &end[6..8])
                    } else {
                        end.split('T').next().unwrap_or(end).to_string()
                    };
                    *heatmap.entry(date_str.clone()).or_insert(0) += 1;
                    if date_str == today {
                        today_count += 1;
                    }
                }
            } else if task.status == "pending" {
                pending_count += 1;
            }

            if let Some(project) = &task.project {
                let entry = projects.entry(project.clone()).or_insert(ProjectStats { total: 0, done: 0 });
                entry.total += 1;
                if task.status == "completed" {
                    entry.done += 1;
                }
            }
        }

        Ok(Stats {
            heatmap,
            projects,
            today_count,
            total_done,
            pending_count,
        })
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
