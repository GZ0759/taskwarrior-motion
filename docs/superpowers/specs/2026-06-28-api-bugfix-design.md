# API Bug 修复 + 逻辑重构设计

> 日期：2026-06-28
> 范围：前端 4 个 bug + 后端错误码优化 + App.vue 逻辑抽离

## 问题清单

### Bug 1: 累计完成数为零

**现象**：Heatmap 组件"累计完成"始终显示 0
**根因**：`Heatmap.vue:56` 用 `store.completedTasks.length`，但 `completedTasks` 从未在 mount 时加载（一直是空数组）。`App.vue:44` 正确地用了 `store.stats?.totalDone`
**修复**：`Heatmap.vue` 的 `totalDone` 改为 `store.stats?.totalDone ?? 0`

### Bug 2: 开始计时返回 500

**现象**：看板点击"开始计时"后端返回 500
**根因**：`App.vue:handleStartTask` 先调 `store.startTask(uuid)`，然后调 `startTracking(task)`，而 `useTimeTracking.ts:39` 的 `startTracking` 内部又调了一次 `store.startTask(uuid)`。第二次 `task start` 在已启动的任务上执行，taskwarrior 报错 → 500
**修复**：`useTimeTracking.startTracking` 不再调 `store.startTask`，只管计时器 UI 状态。调用方负责先 `store.startTask` 再 `startTracking`。同理 `stopTracking` 不再调 `store.stopTask`

### Bug 3: 看板取消完成返回 500

**现象**：看板 Done 列点击"取消"按钮返回 500
**根因**：`App.vue:handleUpdateTask` 收到 `{ status: 'pending' }` 时一律调 `store.stopTask()`。但已完成任务的"取消"应该是 `uncompleteTask()`（`task modify status:pending`），不是 `stopTask()`（`task stop`）
**修复**：`handleUpdateTask` 需要知道当前任务状态。当 `data.status === 'pending'` 且当前状态为 `completed` 时调 `uncompleteTask`，否则调 `stopTask`

### Bug 4: 新建任务排序问题

**现象**：创建任务后新任务在列表最上面，但刷新页面后跑到最下面
**根因**：`addTask()` 通过 `splice + unshift` 按 description 匹配手动移到顶部（有误匹配风险），而 `fetchPendingTasks()` 从后端获取的数据是 taskwarrior 默认排序（按 urgency 降序），新任务不一定在顶部
**修复**：
- 后端 `export_pending` 改为按 entry 时间降序排列（新任务在上）
- 前端 `addTask` 删除 `splice/unshift` hack

## 设计

### 1. 前端 Bug 修复

#### 1.1 Heatmap.vue 累计完成数

```ts
// 修改前
const totalDone = computed(() => store.completedTasks.length)

// 修改后
const totalDone = computed(() => store.stats?.totalDone ?? 0)
```

#### 1.2 useTimeTracking 职责清理

`useTimeTracking` 只管计时器 UI 状态，不再调 store 的 API：

```ts
// 修改前：startTracking 内部调 store.startTask
function startTracking(task: Task) {
  if (activeTask.value) stopTracking()
  activeTask.value = task
  startTime.value = new Date()
  elapsedTime.value = 0
  store.startTask(task.uuid)  // ← 删除
  timerInterval = setInterval(...)
}

// 修改后：只管计时器
function startTracking(task: Task) {
  if (activeTask.value) stopTracking()
  activeTask.value = task
  startTime.value = new Date()
  elapsedTime.value = 0
  timerInterval = setInterval(...)
}

// 修改前：stopTracking 内部调 store.stopTask
function stopTracking() {
  if (activeTask.value) {
    store.stopTask(activeTask.value.uuid)  // ← 删除
  }
  cleanup()
}

// 修改后：只管计时器
function stopTracking() {
  cleanup()
}
```

#### 1.3 handleUpdateTask 状态转换

`handleUpdateTask` 需要当前任务状态来决定调用哪个 API：

```ts
function updateTask(uuid: string, data: Partial<Task>, currentStatus?: string) {
  if (data.status === 'started') {
    store.startTask(uuid)
  } else if (data.status === 'pending') {
    if (currentStatus === 'completed') {
      store.uncompleteTask(uuid)
    } else {
      store.stopTask(uuid)
    }
  } else {
    store.updateTask(uuid, data as UpdateTaskRequest)
  }
}
```

KanbanView 的"取消"按钮 emit 需要传当前状态：
```ts
// 修改前
@click="emit('update', t.uuid, { status: 'pending' })"

// 修改后
@click="emit('update', t.uuid, { status: 'pending' }, t.status)"
```

KanbanView emit 签名更新：
```ts
// 修改前
(e: 'update', id: string, data: Partial<Task>): void

// 修改后
(e: 'update', id: string, data: Partial<Task>, currentStatus?: string): void
```

#### 1.4 addTask 排序 hack 删除

```ts
// 修改前
async function addTask(task: CreateTaskRequest) {
  await taskApi.createTask(task)
  await fetchPendingTasks()
  await fetchStats()
  // 将新任务移到顶部（通过 description 匹配）← 删除这段
  const newIndex = pendingTasks.value.findIndex(t => t.description === task.description)
  if (newIndex > 0) {
    const [newTask] = pendingTasks.value.splice(newIndex, 1)
    pendingTasks.value.unshift(newTask)
  }
}

// 修改后
async function addTask(task: CreateTaskRequest) {
  await taskApi.createTask(task)
  await fetchPendingTasks()
  await fetchStats()
}
```

### 2. App.vue 逻辑抽离

新建 `composables/useTaskActions.ts`，将所有任务操作函数集中管理：

```ts
// composables/useTaskActions.ts
import { useTaskStore } from '@/stores/task'
import { useTimeTracking } from '@/composables/useTimeTracking'
import type { Task, UpdateTaskRequest } from '@/types/task'

export function useTaskActions() {
  const store = useTaskStore()
  const { startTracking, stopTracking, activeTask } = useTimeTracking()

  function startTask(uuid: string) {
    const task = store.tasks.find(t => t.uuid === uuid)
    if (!task) return
    store.startTask(uuid)
    startTracking(task)
  }

  function stopTask(uuid: string) {
    if (activeTask.value?.uuid === uuid) {
      stopTracking()
    }
    store.stopTask(uuid)
  }

  function updateTask(uuid: string, data: Partial<Task>, currentStatus?: string) {
    if (data.status === 'started') {
      store.startTask(uuid)
    } else if (data.status === 'pending') {
      if (currentStatus === 'completed') {
        store.uncompleteTask(uuid)
      } else {
        store.stopTask(uuid)
      }
    } else {
      store.updateTask(uuid, data as UpdateTaskRequest)
    }
  }

  async function completeTask(uuid: string, desc: string, achievementEnabled: boolean) {
    await store.completeTask(uuid)
    await store.fetchStats()
    if (achievementEnabled) {
      return { description: desc }
    }
    return null
  }

  function deleteTask(uuid: string) {
    store.deleteTask(uuid)
  }

  function saveEdit(uuid: string, data: UpdateTaskRequest) {
    store.updateTask(uuid, data)
  }

  function uncompleteTask(uuid: string) {
    store.uncompleteTask(uuid)
  }

  return {
    startTask,
    stopTask,
    updateTask,
    completeTask,
    deleteTask,
    saveEdit,
    uncompleteTask,
  }
}
```

App.vue 简化为：
```ts
const { startTask, stopTask, updateTask, completeTask, deleteTask, saveEdit, uncompleteTask } = useTaskActions()
```

删除 App.vue 中的 `handleStartTask`、`handleStopTask`、`handleUpdateTask`、`handleCompleteTask`、`handleDeleteTask`、`handleSaveEdit`、`handleUncompleteTask` 函数定义，模板中直接使用 composable 返回的函数或简单包装。

### 3. 后端错误码智能映射

#### 3.1 新增 AppError::Conflict 变体

```rust
// errors.rs
pub enum AppError {
    InvalidInput(String),
    NotFound(String),
    Conflict(String),    // 新增
    TaskError(String),
    InternalError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, "INVALID_INPUT", msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, "CONFLICT", msg),  // 409
            AppError::TaskError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, "TASK_ERROR", msg),
            AppError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", msg),
        };
        // ...
    }
}
```

#### 3.2 taskwarrior.rs 错误分类函数

```rust
fn classify_task_error(stderr: &str) -> AppError {
    let stderr_lower = stderr.to_lowercase();

    // 404: 任务不存在
    if stderr_lower.contains("could not find")
        || stderr_lower.contains("no match")
        || stderr_lower.contains("not found")
    {
        return AppError::NotFound(stderr.to_string());
    }

    // 409: 状态冲突
    if stderr_lower.contains("already started")
        || stderr_lower.contains("not started")
        || stderr_lower.contains("cannot modify a recurring")
        || stderr_lower.contains("is blocked")
        || stderr_lower.contains("already completed")
        || stderr_lower.contains("cannot start")
    {
        return AppError::Conflict(stderr.to_string());
    }

    // 500: 未知错误
    AppError::TaskError(stderr.to_string())
}
```

各方法（`start`/`stop`/`done`/`modify`/`delete`/`uncomplete`/`add`）的错误分支改调 `classify_task_error`。

#### 3.3 后端排序

`export_pending` 改为按 entry 降序排列：

```rust
pub async fn export_pending(&self) -> Result<Vec<Task>, AppError> {
    let tasks = self.export(Some("status:pending")).await?;
    // 后端排序：按 entry 降序（新任务在上）
    let mut sorted = tasks;
    sorted.sort_by(|a, b| b.entry.cmp(&a.entry));
    Ok(sorted)
}
```

注意：taskwarrior 的 `sort:` 过滤器语法可能不被所有版本支持，因此在 Rust 侧排序更可靠。

## 修改文件清单

### 前端
| 文件 | 修改内容 |
|------|---------|
| `client/src/components/Heatmap.vue` | Bug 1: totalDone 改用 store.stats |
| `client/src/composables/useTimeTracking.ts` | Bug 2: 删除 startTracking/stopTracking 中的 store 调用 |
| `client/src/composables/useTaskActions.ts` | **新建**：集中管理任务操作逻辑 |
| `client/src/App.vue` | 删除 handle* 函数，改用 useTaskActions |
| `client/src/stores/task.ts` | Bug 4: 删除 addTask 的 splice/unshift hack |
| `client/src/views/KanbanView.vue` | Bug 3: emit update 时传 currentStatus |

### 后端
| 文件 | 修改内容 |
|------|---------|
| `server/src/errors.rs` | 新增 AppError::Conflict 变体 |
| `server/src/taskwarrior.rs` | 新增 classify_task_error；export_pending 加排序；各方法错误分支改用 classify_task_error |

## 不在范围内

- 前端错误 toast 展示优化（如区分 4xx/5xx 样式）
- taskwarrior CLI 版本兼容性测试
- 其他 UI/UX 改进
