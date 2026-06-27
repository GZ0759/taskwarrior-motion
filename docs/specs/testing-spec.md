# 测试规范

## 概述

本文档定义了 taskwarrior-motion 项目的测试规范，目标是达到 90%+ 的测试覆盖率。

---

## 测试策略

### 测试金字塔

```
        /\
       /  \  E2E 测试 (10%)
      /----\
     /      \  集成测试 (20%)
    /--------\
   /          \  单元测试 (70%)
  /------------\
```

### 测试类型

| 类型 | 占比 | 工具 | 说明 |
|------|------|------|------|
| 单元测试 | 70% | Vitest / cargo test | 测试独立函数/组件 |
| 集成测试 | 20% | Vitest / cargo test | 测试模块交互 |
| E2E 测试 | 10% | Playwright | 测试完整流程 |

---

## Rust 后端测试

### 测试框架

- **工具**：`cargo test`
- **覆盖率**：`cargo-tarpaulin`

### 测试结构

```rust
// src/taskwarrior.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_tasks() {
        let client = TaskwarriorClient::new();
        let tasks = client.export("status:pending");
        assert!(tasks.is_ok());
    }

    #[test]
    fn test_add_task() {
        let client = TaskwarriorClient::new();
        let result = client.add("Test task", vec![]);
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_api_get_tasks() {
        // 测试 API 端点
    }
}
```

### 测试覆盖范围

| 模块 | 测试内容 | 覆盖率目标 |
|------|----------|------------|
| taskwarrior.rs | CLI 封装 | 95%+ |
| routes.rs | API 路由 | 90%+ |
| models.rs | 数据模型 | 100% |
| errors.rs | 错误处理 | 100% |

### 测试示例

```rust
// tests/taskwarrior_test.rs
use taskwarrior_motion::taskwarrior::TaskwarriorClient;

#[test]
fn test_export_pending_tasks() {
    let client = TaskwarriorClient::new();
    let tasks = client.export("status:pending").unwrap();
    
    // 验证返回类型
    assert!(tasks.iter().all(|t| t.status == "pending"));
}

#[test]
fn test_add_task_with_project() {
    let client = TaskwarriorClient::new();
    let result = client.add("Test task", vec!["project:test"]);
    
    assert!(result.is_ok());
    
    // 清理测试数据
    let tasks = client.export("description:test").unwrap();
    for task in tasks {
        let _ = client.delete(&task.uuid);
    }
}

#[test]
fn test_modify_task() {
    let client = TaskwarriorClient::new();
    
    // 添加任务
    client.add("Original task", vec![]).unwrap();
    let tasks = client.export("description:Original").unwrap();
    let uuid = &tasks[0].uuid;
    
    // 修改任务
    let result = client.modify(uuid, vec!["description:Modified task"]);
    assert!(result.is_ok());
    
    // 验证修改
    let tasks = client.export("description:Modified").unwrap();
    assert_eq!(tasks.len(), 1);
    
    // 清理
    let _ = client.delete(uuid);
}
```

---

## Vue 前端测试

### 测试框架

- **工具**：Vitest + Vue Test Utils
- **覆盖率**：`vitest --coverage`

### 测试结构

```typescript
// tests/components/TaskItem.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskItem from '@/components/TaskItem.vue'

describe('TaskItem', () => {
  const mockTask = {
    uuid: '123',
    description: 'Test task',
    status: 'pending',
    entry: '2026-06-27',
    modified: '2026-06-27',
  }

  it('renders task description', () => {
    const wrapper = mount(TaskItem, {
      props: { task: mockTask },
    })
    
    expect(wrapper.text()).toContain('Test task')
  })

  it('emits edit event when edit button clicked', async () => {
    const wrapper = mount(TaskItem, {
      props: { task: mockTask },
    })
    
    await wrapper.find('.edit-btn').trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([mockTask])
  })
})
```

### 测试覆盖范围

| 模块 | 测试内容 | 覆盖率目标 |
|------|----------|------------|
| components/ | 组件渲染、事件 | 95%+ |
| stores/ | 状态管理 | 90%+ |
| api/ | API 封装 | 90%+ |
| composables/ | 组合式函数 | 95%+ |
| utils/ | 工具函数 | 100% |

### 组件测试示例

```typescript
// tests/components/TaskList.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '@/components/TaskList.vue'

describe('TaskList', () => {
  const mockTasks = [
    { uuid: '1', description: 'Task 1', status: 'pending', entry: '2026-06-27', modified: '2026-06-27' },
    { uuid: '2', description: 'Task 2', status: 'pending', entry: '2026-06-27', modified: '2026-06-27' },
  ]

  it('renders all tasks', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks },
    })
    
    expect(wrapper.findAll('.task-item')).toHaveLength(2)
  })

  it('shows empty state when no tasks', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: [] },
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('emits edit event from child TaskItem', async () => {
    const wrapper = mount(TaskList, {
      props: { tasks: mockTasks },
    })
    
    await wrapper.find('.edit-btn').trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
  })
})
```

### Store 测试示例

```typescript
// tests/stores/task.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '@/stores/task'

describe('TaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty tasks', () => {
    const store = useTaskStore()
    expect(store.tasks).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches tasks successfully', async () => {
    const store = useTaskStore()
    
    // Mock API
    vi.mock('@/api/taskwarrior', () => ({
      taskApi: {
        getTasks: vi.fn().mockResolvedValue([
          { uuid: '1', description: 'Task 1', status: 'pending' },
        ]),
      },
    }))
    
    await store.fetchTasks()
    
    expect(store.tasks).toHaveLength(1)
    expect(store.loading).toBe(false)
  })

  it('handles fetch error', async () => {
    const store = useTaskStore()
    
    // Mock API error
    vi.mock('@/api/taskwarrior', () => ({
      taskApi: {
        getTasks: vi.fn().mockRejectedValue(new Error('Network error')),
      },
    }))
    
    await store.fetchTasks()
    
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })
})
```

---

## 测试工具配置

### Vitest 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
})
```

### Cargo 测试配置

```toml
# Cargo.toml
[dev-dependencies]
tokio = { version = "1", features = ["full", "test-util"] }
assert_cmd = "2"
predicates = "3"
```

---

## 测试运行

### Rust 测试

```bash
# 运行所有测试
cargo test

# 运行特定测试
cargo test test_export_tasks

# 运行测试并显示输出
cargo test -- --nocapture

# 生成覆盖率报告
cargo tarpaulin --out Html
```

### Vue 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test tests/components/TaskItem.test.ts
```

---

## 测试命名规范

### Rust 测试

```rust
#[test]
fn test_<模块>_<功能>_<场景>() {
    // 测试代码
}

// 示例
fn test_taskwarrior_export_pending_tasks()
fn test_taskwarrior_add_task_with_project()
fn test_routes_get_tasks_success()
```

### Vue 测试

```typescript
describe('<组件名>', () => {
  it('<功能描述>', () => {
    // 测试代码
  })
})

// 示例
describe('TaskItem', () => {
  it('renders task description')
  it('emits edit event when edit button clicked')
  it('shows completed state correctly')
})
```

---

## Mock 策略

### API Mock

```typescript
// tests/mocks/api.ts
import { vi } from 'vitest'

export const mockTaskApi = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
  modifyTask: vi.fn(),
  doneTask: vi.fn(),
  deleteTask: vi.fn(),
  startTask: vi.fn(),
  stopTask: vi.fn(),
  undo: vi.fn(),
}
```

### 组件 Mock

```typescript
// tests/mocks/components.ts
import { vi } from 'vitest'

export const mockTaskStore = {
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: vi.fn(),
  addTask: vi.fn(),
  completeTask: vi.fn(),
  deleteTask: vi.fn(),
}
```

---

## 持续集成

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test-rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cargo test
      - run: cargo tarpaulin --out xml

  test-vue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:coverage
```

---

## 测试覆盖率

### 覆盖率目标

| 模块 | 目标 | 说明 |
|------|------|------|
| 整体 | 90%+ | 项目整体覆盖率 |
| 单元测试 | 95%+ | 函数/组件测试 |
| 集成测试 | 85%+ | 模块交互测试 |
| E2E 测试 | 80%+ | 关键流程测试 |

### 覆盖率报告

```bash
# Rust 覆盖率
cargo tarpaulin --out Html
# 生成 HTML 报告：target/tarpaulin/report.html

# Vue 覆盖率
pnpm test:coverage
# 生成 HTML 报告：coverage/index.html
```

---

## 参考项目

### taskwarrior-web-portal

- **测试策略**：Go 测试
- **参考**：
  - 单元测试结构
  - 集成测试方法
  - 测试覆盖率要求

### taskwarrior-webui

- **测试策略**：JavaScript 测试
- **参考**：
  - Vue 组件测试
  - API 测试方法
