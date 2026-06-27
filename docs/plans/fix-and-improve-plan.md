# taskwarrior-motion 修复与完善计划

> **目标**：修复已知问题、清理死代码、补全缺失功能、统一技术方案。
> **用户场景**：纯自用本地工具，记录待办事项。

---

## 需求确认

| 项目 | 决策 |
|------|------|
| 使用场景 | 纯自用，本地运行 |
| 后端修复 | 全部修掉（Mutex、全量导出、单任务查询） |
| 自动补全 | ✅ 接入 |
| 时间追踪 | ✅ 接入 |
| 上下文管理 | ❌ 删除 |
| 动画方案 | 统一用 GSAP |
| 搜索功能 | ❌ 不要 |
| 键盘快捷键 | ✅ 补全 |
| 日历视图 | 补周视图，不要日视图 |
| 看板交互 | 按钮切换，不要拖拽 |
| 测试 | ✅ 写 |
| 视觉风格 | 看板/日历/完成视图统一玻璃拟态（已完成） |
| 编辑方式 | 统一用弹窗编辑（待办视图的展开编辑改为弹窗） |
| 看板完成 | 完成后任务移到 Done 列（不消失） |
| 空状态 | 优化文案，更自然 |

---

## 任务清单

### 阶段一：Bug 修复 + 死代码清理（无依赖）

#### 任务 1：删除死代码

**删除以下文件**：
- `client/src/components/TaskItem.vue` — 旧组件，被 TaskCard 替代
- `client/src/components/TaskList.vue` — 旧列表，未使用
- `client/src/composables/useContext.ts` — 用户确认不需要

**保留但重构**：
- `client/src/components/TaskForm.vue` — 改为弹窗编辑组件（见任务 10）

**清理引用**：检查 App.vue 和其他文件是否 import 了被删除的文件，有则移除。

**验收**：`pnpm dev` 无编译错误，无 unused import 警告

---

#### 任务 2：修复 `useTheme.ts` 监听器泄漏

**问题**：`onMounted` 注册 `matchMedia` 监听但无 `onUnmounted` 清理，多次调用会重复注册。

**步骤**：
1. 改为模块级一次性初始化（`useTheme` 是单例模式，初始化和监听只执行一次）
2. 移除 `onMounted`，改为首次调用时初始化
3. localStorage key 改为 `twm-theme`（与设计稿一致）

**验收**：切换主题正常，无重复监听器

---

#### 任务 3：修复 `useSound.ts` AudioContext 泄漏

**问题**：每次播放音效都创建新 `AudioContext`，浏览器限制数量后会静音。

**步骤**：
1. 将 `AudioContext` 提升为模块级单例
2. 首次播放时创建，后续复用
3. 处理 `AudioContext.state === 'suspended'` 的情况（调用 `resume()`）

**验收**：连续播放音效 20 次以上，无静音

---

#### 任务 4：修复 `todayStr` 跨午夜失效

**问题**：`App.vue` 和 `Heatmap.vue` 中 `todayStr` 在模块级别计算一次，跨午夜后过期。

**步骤**：将 `todayStr` 改为函数调用（每次获取当前日期），或提取为共享的 `getTodayStr()` 工具函数。

**验收**：热力图和今日完成数始终基于当前日期

---

#### 任务 4.1：优化空状态文案

**步骤**：
1. 待办视图空状态：「今日任务全部完成」→「暂无待办任务，添加一个吧」
2. 已完成视图空状态：保持现有文案
3. 看板/日历空状态：保持「无任务」

**验收**：空状态文案更自然友好

---

### 阶段二：后端修复（无依赖，可与阶段一并行）

#### 任务 5：去掉全局 Mutex

**问题**：`TaskwarriorClient` 是零字段结构体，`Arc<Mutex<...>>` 导致所有请求串行。

**步骤**：
1. `AppState` 的 `client` 字段从 `Arc<Mutex<TaskwarriorClient>>` 改为 `Arc<TaskwarriorClient>`
2. 所有 handler 中去掉 `.lock().await`
3. `main.rs` 同步修改

**验收**：`cargo build` 通过，API 正常响应

---

#### 任务 6：删除全量导出存在性检查

**问题**：`modify`、`done`、`start`、`stop`、`uncomplete`、`delete` 每次都先 `export(None)` 导出全部任务检查 UUID 存在性，O(n) 性能问题 + TOCTOU 竞态。

**步骤**：
1. 从上述方法中移除 `self.export(None)` 存在性检查
2. 直接执行 `task` 命令，依赖 taskwarrior 自身的错误返回
3. 解析 stderr，如果包含 "not found" 类关键词，返回 `AppError::NotFound`

**验收**：对不存在的 UUID 调用 API 返回 404，对存在的 UUID 正常操作

---

#### 任务 7：`get_task_by_uuid` 改用单任务查询

**问题**：当前导出全部任务再内存过滤。

**步骤**：改用 `task uuid:<uuid> export` 命令，只导出指定任务，解析返回的 JSON。

**验收**：`GET /api/tasks/:uuid` 只查询单个任务，不导出全部

---

#### 任务 8：后端清理

**步骤**：
1. 修复 `lib.rs`/`main.rs` 模块重复声明 — `main.rs` 改用 `use taskwarrior_motion::module`
2. 移除 `Cargo.toml` 中未使用的 `uuid` 依赖
3. 添加基本的 `tracing` 日志（请求日志 + 错误日志）

**验收**：`cargo clippy -- -D warnings` 无警告

---

### 阶段三：前端功能补全（依赖阶段一）

#### 任务 9：接入自动补全

**问题**：`useAutocomplete.ts` 已实现但未被任何组件使用。

**步骤**：
1. 检查 `useAutocomplete.ts` 的实现，确认它能从 store 中提取已有项目和标签
2. 在 `ProjectPicker.vue` 中接入：输入时过滤已有项目，显示下拉建议
3. 在 `TagPicker.vue` 中接入：输入时过滤已有标签，显示下拉建议
4. 确保键盘可操作（上下选择、Enter 确认、Escape 关闭）

**验收**：编辑任务时，项目和标签输入框能自动补全已有值

---

#### 任务 10：统一弹窗编辑

**目标**：所有视图（待办/看板/日历/已完成）统一使用弹窗编辑任务。

**步骤**：
1. 重构 `TaskForm.vue` 为弹窗组件：
   - 玻璃拟态遮罩 + 居中卡片
   - 字段：描述、项目、标签、优先级、截止日期、等待日期
   - 底部：取消/保存/删除按钮
2. App.vue 添加 `editingTask` ref 控制弹窗显示
3. 待办视图：移除 TaskCard 的展开编辑，编辑按钮打开弹窗
4. 看板/日历/已完成：编辑按钮直接打开弹窗（不再跳转待办视图）
5. 弹窗适配暗色/亮色主题

**验收**：所有视图点编辑都弹出统一弹窗，可修改所有字段并保存

---

#### 任务 11：看板完成任务后移到 Done 列

**问题**：当前看板点"完成"按钮后，任务直接消失（status 变成 completed，不在 pending 过滤里）。

**步骤**：
1. 修改 `KanbanView.vue` 的 `moveToColumn` 函数：
   - 完成任务后，不立即调用 `store.completeTask`
   - 先将任务移到 Done 列（本地状态更新）
   - 延迟调用 API（如 300ms 后），让动画播放完
2. Done 列显示已完成任务（从 `store.completedTasks` 获取）
3. Done 列的任务可以"取消完成"（调用 `store.uncompleteTask`）

**验收**：看板点完成 → 任务滑到 Done 列 → 动画播放完后调用 API

---

#### 任务 12：接入时间追踪

**步骤**：
1. 检查 `useTimeTracking.ts` 的实现，确认它调用 `store.startTask`/`store.stopTask`
2. 在 `TaskCard.vue` 中添加计时按钮：
   - 未计时状态：显示"开始"按钮（Play 图标）
   - 计时中状态：显示"停止"按钮（Pause 图标）+ 已用时间
3. 计时中的卡片加视觉标识（如脉冲边框或小红点）
4. 修复 store 中 `startTask`/`stopTask` 未设置 `loading` 的问题

**验收**：点击开始/停止按钮能正确调用 API，计时中的卡片有视觉反馈

---

#### 任务 13：补全键盘快捷键

**问题**：`useKeyboard.ts` 已实现但大部分 handler 是空函数。

**步骤**：
1. 在 `App.vue` 中补全以下快捷键逻辑：
   - `j` / `k`：上下导航任务列表（维护一个 `selectedIndex` ref）
   - `n`：聚焦到 AddTask 输入框
   - `Enter`：展开当前选中任务的编辑区
   - `x`：完成当前选中任务
   - `Escape`：关闭当前展开的编辑区 / 关闭 CompletionModal
2. 确保在输入框中不触发快捷键（`useKeyboard.ts` 已有此逻辑）

**验收**：所有快捷键在非输入状态下正常工作

---

#### 任务 14：日历周视图

**步骤**：
1. 在 `CalendarView.vue` 中实现周视图：
   - 顶部显示当前周的日期范围（如 "6月23日 - 6月29日"）
   - 左右箭头切换上/下周
   - 7 列网格，每列显示一天的任务卡片
   - 任务卡片显示：优先级颜色 + 描述
   - 今天的列加高亮背景
2. 复用月视图的任务卡片渲染逻辑
3. 周视图/月视图切换按钮

**验收**：周视图正确显示当前周任务，可切换上下周，点击任务可编辑

---

### 阶段四：动画统一（依赖阶段一）

#### 任务 15：TaskCard 动画统一为 GSAP + 日期工具统一

**问题**：
1. 当前用 setTimeout 链（520ms → 380ms → 330ms）做完成动画，代码脆弱
2. 日期解析逻辑分散在 App.vue、Heatmap.vue、DoneView.vue、TaskCard.vue 中

**步骤**：
1. 创建 `utils/date.ts`，提取 taskwarrior 日期格式解析为共享函数
2. 替换所有文件中的日期解析为统一工具函数
3. 更新 `useAnimation.ts`，提供以下方法：
   - `shakeThenComplete(element, onComplete)`：shake → check-pop → fadeout
   - `slideIn(element)`：新卡片进入
   - `slideOut(element, onComplete)`：卡片退出
4. 在 `TaskCard.vue` 中替换 setTimeout 链为 GSAP 调用
5. 在 `AddTask.vue` 中使用 `slideIn` 动画

**验收**：完成动画流畅，日期解析统一，无 setTimeout 链

---

### 阶段五：Store 封装优化（依赖阶段一）

#### 任务 16：Pinia Store 封装改进

**步骤**：
1. 添加 `clearError()` 方法，替代外部直接 `store.error = null`
2. 添加 `deleteProject(name)` 和 `deleteTag(name)` 方法，替代外部直接操作 `store.tasks`
3. `startTask`/`stopTask` 补上 `loading` 状态管理
4. 考虑添加乐观更新（先更新本地状态，API 失败则回滚）

**验收**：App.vue 中不再有直接操作 store 内部状态的代码

---

### 阶段六：测试（依赖所有功能完成）

#### 任务 17：后端测试

**步骤**：
1. 为 `TaskwarriorClient` 的每个方法编写单元测试（mock task 命令输出）
2. 为 API 端点编写集成测试（CRUD + 状态转换）
3. 测试错误处理：不存在的 UUID、无效输入

**验收**：`cargo test` 全部通过

---

#### 任务 18：前端测试

**步骤**：
1. 配置 Vitest + Vue Test Utils
2. 核心组件测试：TaskCard（渲染/完成/编辑/删除）、Heatmap、CompletionModal
3. Composable 测试：useTheme、useKeyboard
4. Store 测试：各 action 的 API 调用和状态更新

**验收**：`pnpm test` 全部通过

---

## 依赖关系

```
阶段一（Bug 修复 + 清理）  ← 无依赖，立即开始
  任务 1-4

阶段二（后端修复）          ← 无依赖，可与阶段一并行
  任务 5-8

阶段三（功能补全）          ← 依赖阶段一
  任务 9（自动补全）
  任务 10（弹窗编辑）
  任务 11（看板完成移到 Done 列）
  任务 12（时间追踪）
  任务 13（键盘快捷键）
  任务 14（周视图）
  → 9/10/11/12/13/14 可并行

阶段四（动画统一）          ← 依赖阶段一
  任务 15

阶段五（Store 优化）        ← 依赖阶段一
  任务 16

阶段六（测试）              ← 依赖所有功能完成
  任务 17（后端测试）
  任务 18（前端测试）
  → 17/18 可并行
```

---

## 验收标准

1. **死代码清理**：无未使用的文件和 import
2. **后端性能**：无全量导出检查，无全局 Mutex
3. **功能完整**：自动补全、时间追踪、键盘快捷键、周视图均可用
4. **动画统一**：所有动画使用 GSAP，无 setTimeout 链
5. **日期统一**：所有日期解析使用 `utils/date.ts`
6. **测试覆盖**：核心功能有测试，全部通过
7. **代码质量**：`cargo clippy` 0 warnings，`pnpm lint` 0 warnings
