# 开发规范（Agent 必读）

> 所有改动必须遵守此规范。

---

## 设计规范

参考 `docs/design-tokens.md` 获取精确数值。

### 核心原则

1. **玻璃拟态**：所有面板、卡片、弹窗必须使用半透明背景 + backdrop-blur
2. **Mesh 渐变背景**：页面背景使用多层 radial-gradient
3. **深色/浅色双主题**：所有颜色必须同时适配 dark/light 模式
4. **大圆角**：面板 24px（rounded-3xl），卡片 16px（rounded-2xl），按钮 12px（rounded-xl）

### 颜色规范

### 面板背景

| 元素 | Dark | Light |
|------|------|-------|
| 主面板 | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.55)` |
| 边框 | `rgba(255,255,255,0.13)` | `rgba(255,255,255,0.80)` |
| 模糊 | `backdrop-filter: blur(24px)` | 同左 |

### 卡片背景

| 元素 | Dark | Light |
|------|------|-------|
| 普通卡片 | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.30)` |
| 选中/高亮 | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.60)` |
| 边框 | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.50)` |

### 文字颜色（使用 CSS 变量）

| 变量 | Dark | Light |
|------|------|-------|
| `--txt-primary` | `rgba(255,255,255,0.90)` | `rgba(15,10,40,0.88)` |
| `--txt-muted` | `rgba(255,255,255,0.42)` | `rgba(15,10,40,0.46)` |
| `--txt-subtle` | `rgba(255,255,255,0.30)` | `rgba(15,10,40,0.30)` |

### 优先级颜色

| 优先级 | 颜色 |
|--------|------|
| H（紧急） | `#FCA5A5` |
| M（普通） | `#FDE68A` |
| L（低优） | `#BAE6FD` |

---

## 禁止事项

1. ❌ 不要使用实心灰色背景（如 `bg-gray-100`、`bg-gray-800`）
2. ❌ 不要使用 `bg-white` 直接作为卡片背景（需要半透明）
3. ❌ 不要使用硬编码颜色值（使用 CSS 变量或 design-tokens.md 的值）
4. ❌ 不要使用 `border-gray-200` 等 Tailwind 默认边框（使用 rgba 值）

---

## 正确示例

### 面板

```vue
<div
  class="rounded-3xl shadow-2xl"
  :class="isDark ? 'glass-dark' : 'glass-light'"
>
```

### 卡片

```vue
<div
  class="rounded-2xl"
  :style="{
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.30)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.50)'}`,
  }"
>
```

### 按钮

```vue
<button
  class="rounded-xl transition-colors"
  :class="isDark
    ? 'text-white/40 hover:text-white hover:bg-white/10'
    : 'text-gray-500 hover:text-gray-800 hover:bg-black/5'"
>
```

---

## 参考文件

- `docs/design-tokens.md` — 所有精确数值
- `client/src/styles/glass.css` — 玻璃拟态工具类
- `client/src/styles/card-styles.css` — 项目配色
- `client/src/styles/theme-variables.css` — 主题 CSS 变量

---

## 后端规范

### taskwarrior 3.x 命令格式

**重要**：filter 必须在 `export` 之前，且按空格分割为多个参数。

```rust
// ✅ 正确
Command::new("task").args(["status:pending", "export"])

// ❌ 错误
Command::new("task").args(["export", "status:pending"])
```

### API 端点

| 端点 | 用途 | taskwarrior 命令 |
|------|------|-----------------|
| `GET /api/tasks/pending` | 待办/看板 | `task status:pending export` |
| `GET /api/tasks/completed?days=N` | 已完成 | `task status:completed end.after:today-Ndays export` |
| `GET /api/tasks/calendar` | 日历 | `task due.any: export` |
| `GET /api/stats` | 统计数据 | `task export`（全量，计算统计） |

---

## 前端规范

### 日期处理

taskwarrior 日期格式：`20260627T141924Z`（YYYYMMDDTHHmmssZ）

**必须使用** `client/src/utils/date.ts` 的工具函数：

```typescript
import { getTodayStr, taskDateToISO, parseTaskDate, formatDue, isOverdue } from '@/utils/date'
```

❌ 不要在组件中写本地日期解析函数。

### 状态管理

视图组件使用专用 store 方法：

```typescript
// ✅ 正确
store.fetchPendingTasks()    // 待办/看板
store.fetchCompletedTasks()  // 已完成
store.fetchCalendarTasks()   // 日历
store.fetchStats()           // 热力图/项目进度

// ❌ 错误
store.fetchTasks()  // 全量获取，已弃用
```

操作后自动刷新：

```typescript
async function addTask(task) {
  await taskApi.createTask(task)
  await fetchPendingTasks()  // 刷新待办列表
  await fetchStats()         // 刷新统计数据
}
```

### 组件模式

**编辑任务**：使用 `TaskEditModal` 弹窗，不要用内联展开。

```vue
<TaskCard @edit="handleEdit" />
<TaskEditModal :task="editingTask" @save="handleSave" @close="editingTask = null" />
```

**视图标题**：右侧面板标题跟随 tab 变化，在 App.vue 中用 computed 控制。

---

## 测试规范

提交前运行测试：

```bash
# 后端
cd server && cargo test

# 前端
cd client && pnpm test
```
