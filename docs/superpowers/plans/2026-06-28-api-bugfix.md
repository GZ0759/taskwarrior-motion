# API Bug 修复 + 逻辑重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 4 个前端 API bug + 后端错误码智能映射 + App.vue 任务操作逻辑抽离

**Architecture:** 前端新建 `useTaskActions` composable 集中管理任务操作，`useTimeTracking` 只管计时器 UI 状态；后端新增 `AppError::Conflict` 变体和 `classify_task_error` 函数智能解析 taskwarrior stderr；后端 `export_pending` 按 entry 降序排列

**Tech Stack:** Vue 3 + Pinia + TypeScript (前端), Rust + Axum (后端)

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| `server/src/errors.rs` | 修改 | 新增 `AppError::Conflict` 变体 |
| `server/src/taskwarrior.rs` | 修改 | 新增 `classify_task_error`；`export_pending` 加排序；各方法错误分支改用 `classify_task_error` |
| `client/src/composables/useTimeTracking.ts` | 修改 | 删除 `startTracking`/`stopTracking` 中的 store API 调用 |
| `client/src/composables/useTaskActions.ts` | 新建 | 集中管理任务操作逻辑 |
| `client/src/components/Heatmap.vue` | 修改 | Bug 1: `totalDone` 改用 `store.stats` |
| `client/src/stores/task.ts` | 修改 | Bug 4: 删除 `addTask` 的 splice/unshift hack |
| `client/src/views/KanbanView.vue` | 修改 | Bug 3: emit update 时传 currentStatus |
| `client/src/App.vue` | 修改 | 删除 handle* 函数，改用 useTaskActions |

---

### Task 1: 后端 — 新增 AppError::Conflict 变体

**Files:**
- Modify: `server/src/errors.rs`

- [ ] **Step 1: 添加 Conflict 变体和 IntoResponse 映射**

在 `AppError` enum 中 `NotFound` 和 `TaskError` 之间插入 `Conflict`：

```rust
#[derive(Debug)]
pub enum AppError {
    InvalidInput(String),
    NotFound(String),
    Conflict(String),
    TaskError(String),
    InternalError(String),
}
```

在 `IntoResponse` impl 的 match 中添加 Conflict 分支：

```rust
AppError::Conflict(msg) => (StatusCode::CONFLICT, "CONFLICT", msg),
```

- [ ] **Step 2: 验证编译**

Run: `cd server && cargo check`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add server/src/errors.rs
git commit -m "feat(server): add AppError::Conflict variant for 409 status"
```

---

### Task 2: 后端 — 新增 classify_task_error 函数

**Files:**
- Modify: `server/src/taskwarrior.rs`

- [ ] **Step 1: 在 TaskwarriorClient impl 块之前添加 classify_task_error 函数**

```rust
fn classify_task_error(stderr: &str) -> AppError {
    let stderr_lower = stderr.to_lowercase();

    if stderr_lower.contains("could not find")
        || stderr_lower.contains("no match")
        || stderr_lower.contains("not found")
    {
        return AppError::NotFound(stderr.to_string());
    }

    if stderr_lower.contains("already started")
        || stderr_lower.contains("not started")
        || stderr_lower.contains("cannot modify a recurring")
        || stderr_lower.contains("is blocked")
        || stderr_lower.contains("already completed")
        || stderr_lower.contains("cannot start")
    {
        return AppError::Conflict(stderr.to_string());
    }

    AppError::TaskError(stderr.to_string())
}
```

- [ ] **Step 2: 替换 start 方法的错误分支**

将 `start` 方法中的错误处理从：

```rust
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
```

改为：

```rust
if !output.status.success() {
    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let error_msg = if stderr.is_empty() {
        stdout.to_string()
    } else {
        stderr.to_string()
    };
    return Err(classify_task_error(&error_msg));
}
```

- [ ] **Step 3: 替换 stop 方法的错误分支**

同 Step 2 模式，将 `stop` 方法中的 `AppError::TaskError(format!("task stop failed: {}", error_msg))` 替换为 `classify_task_error(&error_msg)`

- [ ] **Step 4: 替换 done 方法的错误分支**

同上模式，将 `done` 方法中的 `AppError::TaskError(format!("task done failed: {}", error_msg))` 替换为 `classify_task_error(&error_msg)`

- [ ] **Step 5: 替换 uncomplete 方法的错误分支**

同上模式，将 `uncomplete` 方法中的 `AppError::TaskError(format!("task uncomplete failed: {}", error_msg))` 替换为 `classify_task_error(&error_msg)`

- [ ] **Step 6: 替换 modify 方法的错误分支**

将 `modify` 方法中的 `AppError::TaskError(format!("task modify failed: {}", stderr))` 替换为 `classify_task_error(&stderr)`

- [ ] **Step 7: 替换 delete 方法的错误分支**

将 `delete` 方法中的 `AppError::TaskError(format!("task delete failed: {}", error_msg))` 替换为 `classify_task_error(&error_msg)`

- [ ] **Step 8: 替换 add 方法的错误分支**

将 `add` 方法中的 `AppError::TaskError(format!("task add failed: {}", stderr))` 替换为 `classify_task_error(&stderr)`

- [ ] **Step 9: 验证编译**

Run: `cd server && cargo check`
Expected: 编译成功

- [ ] **Step 10: Commit**

```bash
git add server/src/taskwarrior.rs
git commit -m "feat(server): add classify_task_error for smart stderr parsing"
```

---

### Task 3: 后端 — export_pending 按 entry 降序排列

**Files:**
- Modify: `server/src/taskwarrior.rs`

- [ ] **Step 1: 修改 export_pending 方法**

将：

```rust
pub async fn export_pending(&self) -> Result<Vec<Task>, AppError> {
    self.export(Some("status:pending")).await
}
```

改为：

```rust
pub async fn export_pending(&self) -> Result<Vec<Task>, AppError> {
    let mut tasks = self.export(Some("status:pending")).await?;
    tasks.sort_by(|a, b| b.entry.cmp(&a.entry));
    Ok(tasks)
}
```

- [ ] **Step 2: 验证编译**

Run: `cd server && cargo check`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add server/src/taskwarrior.rs
git commit -m "fix(server): sort pending tasks by entry desc (newest first)"
```

---

### Task 4: 前端 — useTimeTracking 职责清理

**Files:**
- Modify: `client/src/composables/useTimeTracking.ts`

- [ ] **Step 1: 删除 startTracking 中的 store.startTask 调用**

将 `startTracking` 函数从：

```ts
function startTracking(task: Task) {
    if (activeTask.value) {
      stopTracking()
    }

    activeTask.value = task
    startTime.value = new Date()
    elapsedTime.value = 0

    store.startTask(task.uuid)

    timerInterval = setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)
      }
    }, 1000)
  }
```

改为：

```ts
function startTracking(task: Task) {
    if (activeTask.value) {
      stopTracking()
    }

    activeTask.value = task
    startTime.value = new Date()
    elapsedTime.value = 0

    timerInterval = setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)
      }
    }, 1000)
  }
```

- [ ] **Step 2: 删除 stopTracking 中的 store.stopTask 调用**

将 `stopTracking` 函数从：

```ts
function stopTracking() {
    if (activeTask.value) {
      store.stopTask(activeTask.value.uuid)
    }

    cleanup()
  }
```

改为：

```ts
function stopTracking() {
    cleanup()
  }
```

- [ ] **Step 3: 删除不再需要的 store 引用**

`useTaskStore` import 和 `const store = useTaskStore()` 不再被使用，删除：

```ts
// 删除这行
import { useTaskStore } from '@/stores/task'

// 删除函数内的这行
const store = useTaskStore()
```

- [ ] **Step 4: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add client/src/composables/useTimeTracking.ts
git commit -m "refactor(client): remove store API calls from useTimeTracking"
```

---

### Task 5: 前端 — 新建 useTaskActions composable

**Files:**
- Create: `client/src/composables/useTaskActions.ts`

- [ ] **Step 1: 创建 useTaskActions.ts**

```ts
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

- [ ] **Step 2: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add client/src/composables/useTaskActions.ts
git commit -m "feat(client): add useTaskActions composable"
```

---

### Task 6: 前端 — Bug 1: Heatmap 累计完成数修复

**Files:**
- Modify: `client/src/components/Heatmap.vue:56`

- [ ] **Step 1: 修改 totalDone 计算逻辑**

将：

```ts
const totalDone = computed(() => store.completedTasks.length)
```

改为：

```ts
const totalDone = computed(() => store.stats?.totalDone ?? 0)
```

- [ ] **Step 2: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Heatmap.vue
git commit -m "fix(client): use store.stats.totalDone for heatmap cumulative count"
```

---

### Task 7: 前端 — Bug 4: 删除 addTask 的 splice/unshift hack

**Files:**
- Modify: `client/src/stores/task.ts:123-143`

- [ ] **Step 1: 删除 addTask 中的 splice/unshift 逻辑**

将 `addTask` 函数从：

```ts
async function addTask(task: CreateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      await taskApi.createTask(task)
      // 重新获取任务列表
      await fetchPendingTasks()
      await fetchStats()
      // 将新任务移到顶部（通过 description 匹配）
      const newIndex = pendingTasks.value.findIndex(t => t.description === task.description)
      if (newIndex > 0) {
        const [newTask] = pendingTasks.value.splice(newIndex, 1)
        pendingTasks.value.unshift(newTask)
      }
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }
```

改为：

```ts
async function addTask(task: CreateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      await taskApi.createTask(task)
      await fetchPendingTasks()
      await fetchStats()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }
```

- [ ] **Step 2: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add client/src/stores/task.ts
git commit -m "fix(client): remove splice/unshift hack in addTask, rely on backend sort"
```

---

### Task 8: 前端 — Bug 3: KanbanView emit 传 currentStatus

**Files:**
- Modify: `client/src/views/KanbanView.vue:13-19,105`

- [ ] **Step 1: 更新 emit 签名**

将 emit 定义从：

```ts
const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'complete', id: string, desc: string): void
  (e: 'update', id: string, data: Partial<Task>): void
  (e: 'start', id: string): void
  (e: 'stop', id: string): void
  (e: 'delete', id: string): void
}>()
```

改为：

```ts
const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'complete', id: string, desc: string): void
  (e: 'update', id: string, data: Partial<Task>, currentStatus?: string): void
  (e: 'start', id: string): void
  (e: 'stop', id: string): void
  (e: 'delete', id: string): void
}>()
```

- [ ] **Step 2: 更新"取消"按钮的 emit 调用**

将模板中"取消"按钮从：

```html
@click="emit('update', t.uuid, { status: 'pending' })"
```

改为：

```html
@click="emit('update', t.uuid, { status: 'pending' }, t.status)"
```

- [ ] **Step 3: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add client/src/views/KanbanView.vue
git commit -m "fix(client): pass currentStatus in KanbanView update emit"
```

---

### Task 9: 前端 — App.vue 改用 useTaskActions

**Files:**
- Modify: `client/src/App.vue`

- [ ] **Step 1: 添加 useTaskActions import**

在 import 区域添加：

```ts
import { useTaskActions } from '@/composables/useTaskActions'
```

- [ ] **Step 2: 删除 useTimeTracking import**

删除：

```ts
import { useTimeTracking } from '@/composables/useTimeTracking'
```

- [ ] **Step 3: 初始化 useTaskActions**

在 `const store = useTaskStore()` 之后添加：

```ts
const { startTask, stopTask, updateTask, completeTask, deleteTask, saveEdit, uncompleteTask } = useTaskActions()
```

- [ ] **Step 4: 删除 handleStartTask 函数**

删除整个 `handleStartTask` 函数（约 line 201-208）：

```ts
// 删除
function handleStartTask(uuid: string) {
  const task = store.tasks.find(t => t.uuid === uuid)
  if (task) {
    store.startTask(uuid)
    const { startTracking } = useTimeTracking()
    startTracking(task)
  }
}
```

- [ ] **Step 5: 删除 handleStopTask 函数**

删除整个 `handleStopTask` 函数（约 line 210-216）：

```ts
// 删除
function handleStopTask(uuid: string) {
  const { activeTask, stopTracking } = useTimeTracking()
  if (activeTask.value?.uuid === uuid) {
    stopTracking()
  }
  store.stopTask(uuid)
}
```

- [ ] **Step 6: 删除 handleUpdateTask 函数**

删除整个 `handleUpdateTask` 函数（约 line 191-199）：

```ts
// 删除
function handleUpdateTask(uuid: string, data: Partial<Task>) {
  if (data.status === 'started') {
    store.startTask(uuid)
  } else if (data.status === 'pending') {
    store.stopTask(uuid)
  } else {
    store.updateTask(uuid, data as UpdateTaskRequest)
  }
}
```

- [ ] **Step 7: 删除 handleCompleteTask 函数**

删除整个 `handleCompleteTask` 函数（约 line 183-189）：

```ts
// 删除
async function handleCompleteTask(uuid: string, desc: string) {
  await store.completeTask(uuid)
  await store.fetchStats()
  if (achievementEnabled.value) {
    doneInfo.value = { description: desc }
  }
}
```

- [ ] **Step 8: 删除 handleDeleteTask 函数**

删除整个 `handleDeleteTask` 函数（约 line 218-220）：

```ts
// 删除
function handleDeleteTask(uuid: string) {
  store.deleteTask(uuid)
}
```

- [ ] **Step 9: 删除 handleSaveEdit 函数**

删除整个 `handleSaveEdit` 函数（约 line 222-224）：

```ts
// 删除
function handleSaveEdit(uuid: string, data: UpdateTaskRequest) {
  store.updateTask(uuid, data)
}
```

- [ ] **Step 10: 删除 handleUncompleteTask 函数**

删除整个 `handleUncompleteTask` 函数（约 line 226-228）：

```ts
// 删除
function handleUncompleteTask(uuid: string) {
  store.uncompleteTask(uuid)
}
```

- [ ] **Step 11: 更新模板中的事件绑定**

在模板中替换所有 handle* 引用：

- `@complete="handleCompleteTask"` → `@complete="(uuid, desc) => { const result = completeTask(uuid, desc, achievementEnabled); if (result) doneInfo = result }"`

  注意：`completeTask` 是 async 函数，需要 await。改为：

  `@complete="async (uuid, desc) => { const result = await completeTask(uuid, desc, achievementEnabled); if (result) doneInfo = result }"`

- `@update="handleUpdateTask"` → `@update="updateTask"`
- `@start="handleStartTask"` → `@start="startTask"`
- `@stop="handleStopTask"` → `@stop="stopTask"`
- `@delete="handleDeleteTask"` → `@delete="deleteTask"`
- `@save="handleSaveEdit"` → `@save="saveEdit"`
- `@uncomplete="handleUncompleteTask"` → `@uncomplete="uncompleteTask"`

- [ ] **Step 12: 验证 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 13: Commit**

```bash
git add client/src/App.vue
git commit -m "refactor(client): replace handle* functions with useTaskActions composable"
```

---

### Task 10: 全局验证

- [ ] **Step 1: 前端 typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 前端 build**

Run: `cd client && npx vite build`
Expected: 构建成功

- [ ] **Step 3: 后端编译**

Run: `cd server && cargo check`
Expected: 编译成功

- [ ] **Step 4: 最终 commit（如有 lint 修复）**

```bash
git add -A
git commit -m "chore: final verification cleanup"
```
