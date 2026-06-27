# taskwarrior-motion 修复与完善计划

> **目标**：基于现有 UI 功能为主线，修复已知 Bug、清理死代码、补全缺失功能、统一技术方案。
> **用户场景**：纯自用本地工具，记录待办事项。
> **设计参考**：`docs/design-tokens.md`、`design/Design task management app/`

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
| 视觉风格 | 看板/日历/完成视图统一玻璃拟态 |

---

## 任务清单

### 阶段一：Bug 修复 + 死代码清理（前置，无依赖）

#### 任务 1：修复 `uncompleteTask` 未导出 Bug

**问题**：Pinia store 中 `uncompleteTask` 已定义但未在 return 中导出，DoneView 点击"取消完成"会报运行时错误。

**步骤**：
1. 打开 `client/src/stores/task.ts`
2. 在 return 对象中添加 `uncompleteTask`

**验收**：DoneView 中点击"取消完成"能正常调用 API 并刷新列表

---

#### 任务 2：删除死代码

**问题**：UI 重构后遗留了大量未使用的文件。

**删除以下文件**：
- `client/src/components/TaskItem.vue` — 旧组件，被 TaskCard 替代
- `client/src/components/TaskList.vue` — 旧列表，未使用
- `client/src/components/TaskForm.vue` — 旧表单，未使用
- `client/src/composables/useContext.ts` — 用户确认不需要

**清理引用**：
- 检查 `App.vue` 是否 import 了 `TaskList`，有则移除
- 检查是否有其他文件引用了被删除的文件

**验收**：`pnpm dev` 无编译错误，无 unused import 警告

---

#### 任务 3：修复 `useTheme.ts` 监听器泄漏

**问题**：`onMounted` 注册 `matchMedia` 监听但无 `onUnmounted` 清理，多次调用会重复注册。

**步骤**：
1. 在 `onMounted` 中保存 `MediaQueryList` 引用
2. 添加 `onUnmounted` 调用 `removeEventListener`
3. 确保只注册一次（或改为模块级一次性注册）

**验收**：切换主题正常，无重复监听器

---

#### 任务 4：修复 `useSound.ts` AudioContext 泄漏

**问题**：每次播放音效都创建新 `AudioContext`，浏览器限制数量后会静音。

**步骤**：
1. 将 `AudioContext` 提升为模块级单例
2. 首次播放时创建，后续复用
3. 处理 `AudioContext.state === 'suspended'` 的情况（调用 `resume()`）

**验收**：连续播放音效 20 次以上，无静音

---

#### 任务 5：修复 `todayStr` 跨午夜失效

**问题**：`App.vue` 和 `Heatmap.vue` 中 `todayStr` 在模块级别计算一次，跨午夜后过期。

**步骤**：
1. 将 `todayStr` 改为 `computed` 或函数调用
2. 或在 `useTheme` 的系统主题监听中顺便更新日期

**验收**：模拟跨午夜场景（修改系统时间），热力图和今日完成数能更新

---

### 阶段二：后端修复（前置：无）

#### 任务 6：去掉全局 Mutex

**问题**：`TaskwarriorClient` 是零字段结构体，`Arc<Mutex<...>>` 导致所有请求串行。

**步骤**：
1. `server/src/routes.rs` 中 `AppState` 的 `client` 字段从 `Arc<Mutex<TaskwarriorClient>>` 改为 `Arc<TaskwarriorClient>`
2. 所有 handler 中去掉 `.lock().await`
3. `TaskwarriorClient` 的方法签名从 `&self` 保持不变（已经是 `&self`）

**验收**：`cargo build` 通过，API 正常响应

---

#### 任务 7：删除全量导出存在性检查

**问题**：`modify`、`done`、`start`、`stop`、`uncomplete`、`delete` 每次都先 `export(None)` 导出全部任务检查 UUID 存在性，O(n) 性能问题 + TOCTOU 竞态。

**步骤**：
1. 在 `server/src/taskwarrior.rs` 中，从 `modify`、`done`、`start`、`stop`、`uncomplete`、`delete` 方法中移除 `self.export(None)` 存在性检查
2. 直接执行 `task` 命令，依赖 taskwarrior 自身的错误返回
3. 解析 task 命令的 stderr，如果包含 "not found" 或类似关键词，返回 `AppError::NotFound`

**验收**：对不存在的 UUID 调用 API 返回 404，对存在的 UUID 正常操作

---

#### 任务 8：`get_task_by_uuid` 改用单任务查询

**问题**：当前导出全部任务再内存过滤。

**步骤**：
1. 改用 `task uuid:<uuid> export` 命令，只导出指定任务
2. 或用 `task <uuid> information` 获取详情
3. 解析返回的 JSON

**验收**：`GET /api/tasks/:uuid` 只查询单个任务，不导出全部

---

#### 任务 9：后端清理

**步骤**：
1. 修复 `lib.rs`/`main.rs` 模块重复声明 — `main.rs` 改用 `use taskwarrior_motion::module`
2. 移除 `Cargo.toml` 中未使用的 `uuid` 依赖
3. 添加基本的 `tracing` 日志（请求日志 + 错误日志）

**验收**：`cargo clippy -- -D warnings` 无警告

---

### 阶段三：前端功能补全（依赖阶段一完成）

#### 任务 10：接入自动补全

**问题**：`useAutocomplete.ts` 已实现但未被任何组件使用。

**步骤**：
1. 检查 `useAutocomplete.ts` 的实现逻辑，确认它能从 store 中提取已有项目和标签
2. 在 `ProjectPicker.vue` 中接入：输入时过滤已有项目，显示下拉建议
3. 在 `TagPicker.vue` 中接入：输入时过滤已有标签，显示下拉建议
4. 确保键盘可操作（上下选择、Enter 确认、Escape 关闭）

**验收**：编辑任务时，项目和标签输入框能自动补全已有值

---

#### 任务 11：接入时间追踪

**问题**：`useTimeTracking.ts` 已实现但未被任何组件使用。

**步骤**：
1. 检查 `useTimeTracking.ts` 的实现，确认它调用 `store.startTask`/`store.stopTask`
2. 在 `TaskCard.vue` 中添加计时按钮：
   - 未计时状态：显示"开始"按钮（Play 图标）
   - 计时中状态：显示"停止"按钮（Pause 图标）+ 已用时间
3. 计时中的卡片加视觉标识（如脉冲边框或小红点）
4. 确保 `startTask`/`stopTask` 在 store 的 return 中已导出
5. 修复 store 中 `startTask`/`stopTask` 未设置 `loading` 的问题

**验收**：点击开始/停止按钮能正确调用 API，计时中的卡片有视觉反馈

---

#### 任务 12：补全键盘快捷键

**问题**：`useKeyboard.ts` 已实现但大部分 handler 是空函数。

**步骤**：
1. 在 `App.vue` 中补全以下快捷键逻辑：
   - `j` / `k`：上下导航任务列表（维护一个 `selectedIndex` ref）
   - `n`：聚焦到 AddTask 输入框
   - `Enter`：展开当前选中任务的编辑区
   - `x`：完成当前选中任务
   - `Escape`：关闭当前展开的编辑区/关闭 CompletionModal
2. 确保在输入框中不触发快捷键（`useKeyboard.ts` 已有此逻辑）

**验收**：所有快捷键在非输入状态下正常工作

---

#### 任务 13：日历周视图

**步骤**：
1. 在 `CalendarView.vue` 中实现周视图：
   - 顶部显示当前周的日期范围（如 "6月23日 - 6月29日"）
   - 左右箭头切换上/下周
   - 7 列网格，每列显示一天的任务卡片
   - 任务卡片显示：优先级颜色 + 描述前 N 个字
   - 今天的列加高亮背景
2. 复用月视图的任务卡片渲染逻辑
3. 周视图/月视图切换按钮

**验收**：周视图正确显示当前周任务，可切换上下周，点击任务可编辑

---

### 阶段四：动画统一 + 视觉风格统一（依赖阶段一完成）

#### 任务 14：TaskCard 动画统一为 GSAP

**问题**：当前用 setTimeout 链（520ms → 380ms → 330ms）做完成动画，代码脆弱。

**步骤**：
1. 更新 `useAnimation.ts`，提供以下方法：
   - `shakeThenComplete(element, onComplete)`：shake → check-pop → fadeout
   - `slideIn(element)`：新卡片进入
   - `slideOut(element, onComplete)`：卡片退出
2. 在 `TaskCard.vue` 中替换 setTimeout 链为 GSAP 调用
3. 在 `AddTask.vue` 中使用 `slideIn` 动画
4. 删除 `TaskCard.vue` 中的 setTimeout 逻辑

**验收**：完成任务的 shake → 打勾 → 淡出动画流畅，新卡片有进入动画

---

#### 任务 15：看板/日历/完成视图统一玻璃拟态风格

**问题**：这三个视图还是旧的朴素 Tailwind 风格，与主界面不统一。

**步骤**：
1. 更新 `KanbanView.vue`：
   - 看板列使用 `glass-dark`/`glass-light` 背景
   - 任务卡片使用项目渐变色
   - 列标题使用 lucide 图标替代内联 SVG
2. 更新 `CalendarView.vue`：
   - 日历格子使用玻璃背景
   - 任务芯片使用项目颜色
   - 统一使用 lucide 图标
3. 更新 `DoneView.vue`：
   - 已完成卡片使用玻璃背景
   - 完成时间显示使用共享的日期格式化工具
4. 统一日期解析：创建 `utils/date.ts`，提取所有日期格式化逻辑为共享函数

**验收**：三个视图与主界面视觉风格一致，无内联 SVG，日期格式化统一

---

### 阶段五：Store 封装优化（依赖阶段一完成）

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
1. 为 `TaskwarriorClient` 的每个方法编写单元测试
   - mock `task` 命令的输出
   - 测试正常路径和错误路径
2. 为 API 端点编写集成测试
   - 使用 `axum::test` 或 `reqwest` 发送请求
   - 测试 CRUD + 状态转换
3. 测试错误处理：不存在的 UUID、无效输入

**验收**：`cargo test` 全部通过

---

#### 任务 18：前端测试

**步骤**：
1. 配置 Vitest + Vue Test Utils
2. 为核心组件编写测试：
   - `TaskCard`：渲染、完成、编辑、删除
   - `Heatmap`：数据计算、颜色映射
   - `CompletionModal`：弹出、关闭
3. 为 composables 编写测试：
   - `useTheme`：主题切换、localStorage 持久化
   - `useKeyboard`：快捷键触发、输入框中不触发
4. 为 store 编写测试：
   - 各 action 的 API 调用和状态更新

**验收**：`pnpm test` 全部通过

---

## 依赖关系

```
阶段一（Bug 修复 + 清理）  ← 无依赖，立即开始
  任务 1-5
  
阶段二（后端修复）          ← 无依赖，可与阶段一并行
  任务 6-9

阶段三（功能补全）          ← 依赖阶段一
  任务 10（自动补全）
  任务 11（时间追踪）
  任务 12（键盘快捷键）
  任务 13（周视图）
  → 10/11/12/13 可并行

阶段四（动画+视觉统一）     ← 依赖阶段一
  任务 14（GSAP 动画）
  任务 15（视图风格统一）
  → 14/15 可并行

阶段五（Store 优化）        ← 依赖阶段一
  任务 16

阶段六（测试）              ← 依赖所有功能完成
  任务 17（后端测试）
  任务 18（前端测试）
  → 17/18 可并行
```

---

## 验收标准

1. **Bug 修复**：`uncompleteTask` 可正常调用，无运行时错误
2. **死代码清理**：无未使用的文件和 import
3. **后端性能**：无全量导出检查，无全局 Mutex
4. **功能完整**：自动补全、时间追踪、键盘快捷键、周视图均可用
5. **视觉统一**：所有视图使用玻璃拟态风格
6. **动画统一**：所有动画使用 GSAP，无 setTimeout 链
7. **测试覆盖**：核心功能有测试，全部通过
8. **代码质量**：`cargo clippy` 0 warnings，`pnpm lint` 0 warnings
