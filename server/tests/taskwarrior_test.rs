use taskwarrior_motion::models::*;
use std::collections::HashMap;

#[test]
fn test_task_serialization() {
    let task = Task {
        uuid: "test-uuid".to_string(),
        description: "Test task".to_string(),
        status: "pending".to_string(),
        project: Some("test".to_string()),
        tags: Some(vec!["tag1".to_string()]),
        priority: Some("H".to_string()),
        due: Some("2026-06-28".to_string()),
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27T10:00:00Z".to_string(),
        modified: "2026-06-27T10:00:00Z".to_string(),
        end: None,
        start: None,
        urgency: 5.0,
        id: 1,
    };

    let json = serde_json::to_string(&task).unwrap();
    assert!(json.contains("test-uuid"));
    assert!(json.contains("Test task"));

    let deserialized: Task = serde_json::from_str(&json).unwrap();
    assert_eq!(deserialized.uuid, "test-uuid");
    assert_eq!(deserialized.description, "Test task");
}

#[test]
fn test_task_optional_fields() {
    let task = Task {
        uuid: "test-uuid".to_string(),
        description: "Test task".to_string(),
        status: "pending".to_string(),
        project: None,
        tags: None,
        priority: None,
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27T10:00:00Z".to_string(),
        modified: "2026-06-27T10:00:00Z".to_string(),
        end: None,
        start: None,
        urgency: 0.0,
        id: 0,
    };

    let json = serde_json::to_string(&task).unwrap();
    let deserialized: Task = serde_json::from_str(&json).unwrap();

    assert_eq!(deserialized.project, None);
    assert_eq!(deserialized.tags, None);
    assert_eq!(deserialized.priority, None);
}

#[test]
fn test_create_task_request() {
    let request = CreateTaskRequest {
        description: "New task".to_string(),
        project: Some("project".to_string()),
        tags: Some(vec!["tag1".to_string()]),
        priority: Some("H".to_string()),
        due: Some("2026-06-28".to_string()),
        wait: None,
        scheduled: None,
        recur: None,
        until: None,
        depends: None,
    };

    assert_eq!(request.description, "New task");
    assert_eq!(request.project, Some("project".to_string()));
    assert_eq!(request.tags, Some(vec!["tag1".to_string()]));
    assert_eq!(request.priority, Some("H".to_string()));
}

#[test]
fn test_update_task_request() {
    let request = UpdateTaskRequest {
        description: Some("Updated task".to_string()),
        project: None,
        tags: None,
        priority: Some("M".to_string()),
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        until: None,
        depends: None,
    };

    assert_eq!(request.description, Some("Updated task".to_string()));
    assert_eq!(request.priority, Some("M".to_string()));
}

#[test]
fn test_message_response() {
    let response = MessageResponse {
        message: "Success".to_string(),
    };

    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("Success"));
    assert!(json.contains("\"message\":\"Success\""));
}

#[test]
fn test_task_query_params() {
    let params = TaskQueryParams {
        filter: Some("status:pending".to_string()),
        sort: Some("urgency:desc".to_string()),
        search: Some("test".to_string()),
    };

    assert_eq!(params.filter, Some("status:pending".to_string()));
    assert_eq!(params.sort, Some("urgency:desc".to_string()));
    assert_eq!(params.search, Some("test".to_string()));
}

#[test]
fn test_task_status_values() {
    let pending = Task {
        uuid: "1".to_string(),
        description: "Pending".to_string(),
        status: "pending".to_string(),
        project: None,
        tags: None,
        priority: None,
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27".to_string(),
        modified: "2026-06-27".to_string(),
        end: None,
        start: None,
        urgency: 0.0,
        id: 0,
    };

    let completed = Task {
        uuid: "2".to_string(),
        description: "Completed".to_string(),
        status: "completed".to_string(),
        project: None,
        tags: None,
        priority: None,
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27".to_string(),
        modified: "2026-06-27".to_string(),
        end: Some("2026-06-27".to_string()),
        start: None,
        urgency: 0.0,
        id: 0,
    };

    assert_eq!(pending.status, "pending");
    assert_eq!(completed.status, "completed");
    assert!(completed.end.is_some());
}

#[test]
fn test_task_priority_values() {
    let high = Task {
        uuid: "1".to_string(),
        description: "High".to_string(),
        status: "pending".to_string(),
        project: None,
        tags: None,
        priority: Some("H".to_string()),
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27".to_string(),
        modified: "2026-06-27".to_string(),
        end: None,
        start: None,
        urgency: 10.0,
        id: 0,
    };

    let medium = Task {
        uuid: "2".to_string(),
        description: "Medium".to_string(),
        status: "pending".to_string(),
        project: None,
        tags: None,
        priority: Some("M".to_string()),
        due: None,
        wait: None,
        scheduled: None,
        recur: None,
        depends: None,
        entry: "2026-06-27".to_string(),
        modified: "2026-06-27".to_string(),
        end: None,
        start: None,
        urgency: 5.0,
        id: 0,
    };

    assert_eq!(high.priority, Some("H".to_string()));
    assert_eq!(medium.priority, Some("M".to_string()));
    assert!(high.urgency > medium.urgency);
}

#[test]
fn test_stats_serialization() {
    let mut heatmap = HashMap::new();
    heatmap.insert("2026-06-27".to_string(), 5);
    heatmap.insert("2026-06-26".to_string(), 3);

    let mut projects = HashMap::new();
    projects.insert(
        "Design System".to_string(),
        ProjectStats {
            total: 10,
            done: 6,
        },
    );
    projects.insert(
        "API Migration".to_string(),
        ProjectStats {
            total: 8,
            done: 4,
        },
    );

    let stats = Stats {
        heatmap,
        projects,
        today_count: 5,
        total_done: 30,
        pending_count: 8,
    };

    let json = serde_json::to_string(&stats).unwrap();
    assert!(json.contains("2026-06-27"));
    assert!(json.contains("Design System"));
    assert!(json.contains("\"today_count\":5"));
    assert!(json.contains("\"total_done\":30"));
    assert!(json.contains("\"pending_count\":8"));

    let deserialized: Stats = serde_json::from_str(&json).unwrap();
    assert_eq!(deserialized.today_count, 5);
    assert_eq!(deserialized.total_done, 30);
    assert_eq!(deserialized.pending_count, 8);
    assert_eq!(deserialized.heatmap.get("2026-06-27"), Some(&5));
    assert_eq!(
        deserialized.projects.get("Design System").unwrap().total,
        10
    );
}

#[test]
fn test_project_stats() {
    let stats = ProjectStats {
        total: 10,
        done: 6,
    };

    let json = serde_json::to_string(&stats).unwrap();
    assert!(json.contains("\"total\":10"));
    assert!(json.contains("\"done\":6"));

    let deserialized: ProjectStats = serde_json::from_str(&json).unwrap();
    assert_eq!(deserialized.total, 10);
    assert_eq!(deserialized.done, 6);
}

#[test]
fn test_completed_query_params() {
    // Test that days parameter can be deserialized
    let json = r#"{"days": 14}"#;
    let params: serde_json::Value = serde_json::from_str(json).unwrap();
    assert_eq!(params["days"], 14);

    // Test default value
    let json = r#"{}"#;
    let params: serde_json::Value = serde_json::from_str(json).unwrap();
    assert!(params.get("days").is_none());
}
