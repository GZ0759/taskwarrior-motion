# taskwarrior-motion 质量修复与功能增强计划

> **目标**：修复代码审计问题，重新设计事项卡片布局，合并待办/已完成列表，新增热力图交互和项目管理弹窗。
> **前置**：后端 API 重构 + UI 重构 + 前端功能补全（阶段一~三）已完成。

---

## 需求确认

| 项目 | 决策 |
|------|------|
| 顶部视图切换 | 事项 / 看板 / 日历（3 个 tab，移除"已完成"） |
| 事项列表 | 默认显示未完成任务，底部折叠「已完成 (N)」展开显示已完成 |
| 已完成样式 | 左边实心圆打勾 + 描述中划线 + 下方完成时间 |
| 新任务位置 | 插入列表最顶部 |
| 卡片布局 | 两行：第一行描述+截止日期，第二行标签+优先级+操作 |
| 计时按钮 | 保留在卡片上（第二行） |
| 热力图交互 | 点击日期格子弹窗显示当日完成任务（新增后端 API 按日期查询） |
| 已完成数据加载 | 用户点击展开时才调用 `fetchCompletedTasks()`，不预先加载 |
| 看板暂停行为 | `wait` 设为明天，不需要日期选择器 |
| 项目管理 | 弹窗卡片，从 ProjectProgress 点击项目名进入 |
| 项目管理功能 | 项目列表+进度、项目任务列表、重命名、删除、新建（只创建项目名，不创建任务） |
| 标签管理 | 弹窗卡片，从左侧标签列表区域点击进入 |
| 标签管理功能 | 标签列表+计数、重命名、删除 |
| 左侧标签区域 | ProjectProgress 下方新增「标签」区域，显示前 5-8 个标签 + 使用次数 |
| 左侧布局 | 项目进度和标签共享一个面板，顶部 tab 切换「项目进度 / 标签」 |

---

## Bug 审计结果（已验证）

| # | 问题 | 严重度 | 状态 |
|---|------|--------|------|
| 1 | Stats 字段名 snake_case vs camelCase | Medium | 部分影响（Heatmap 绕过了，App.vue 副标题受影响） |
| 2 | store.tasks 从未填充，标签选择器为空 | Critical | 确认 |
| 3 | useTimeTracking 非单例 + setInterval 泄漏 | Critical | 确认 |
| 4 | DoneView @edit 事件未连接 | — | ❌ 审计有误，已连接 |
| 5 | 看板 On Hold 列无转入操作 | High | 确认 |
| 6 | TaskCard emits 不匹配（App.vue 绑了未声明事件） | High | 确认 |
| 7 | ProjectPicker/TagPicker 暗色硬编码样式 | High | 确认 |

---

## 任务清单

### 阶段一：Critical 修复

#### 任务 1：修复 store.tasks 未填充

**问题**：`fetchTasks()` 从未被调用，`store.tasks` 永远为空数组。编辑弹窗的标签选择器无数据。

**方案**：`App.vue` 的 `onMounted` 中调用 `store.fetchTasks()`

**改动文件**：
- `client/src/App.vue`

**验收**：编辑弹窗标签选择器显示已有标签

---

#### 任务 2：修复 useTimeTracking 为单例 + 内存泄漏

**问题**：
1. 每次调用 `useTimeTracking()` 创建独立的 ref，各组件状态不共享
2. `setInterval` 在组件卸载时不清除

**方案**：
- 将 `activeTask`、`startTime`、`elapsedTime`、`timerInterval` 提升为模块级变量
- 添加 `onUnmounted` 清理逻辑（或提供 `cleanup` 方法供外部调用）

**改动文件**：
- `client/src/composables/useTimeTracking.ts`

**验收**：卡片 A 开始计时 → 卡片 B 和导航栏都能看到；组件卸载后 interval 不继续运行

---

### 阶段二：High 修复

#### 任务 3：看板 On Hold 列增加转入操作

**问题**：`moveToColumn` 只处理 `in-progress`/`done`/`backlog`，无 `on-hold`。

**方案**：在看板卡片操作按钮中，非 on-hold 列的 pending 任务增加"暂停"按钮，调用 `store.updateTask(uuid, { wait: tomorrow })`。

**改动文件**：
- `client/src/views/KanbanView.vue`

**验收**：看板卡片可点击"暂停"移到 On Hold 列

---

#### 任务 4：移除 TaskCard 上无效的事件绑定

**问题**：App.vue 绑了 `@delete-project`/`@add-tag`/`@delete-tag` 但 TaskCard 没声明这些事件。

**方案**：从 App.vue 移除这些无效事件绑定

**改动文件**：
- `client/src/App.vue`

**验收**：无控制台警告

---

#### 任务 5：修复 ProjectPicker/TagPicker 暗色硬编码

**问题**：`bg-white text-gray-800`、`text-white/55` 等在亮色模式下显示异常。

**方案**：使用 `isDark` 条件判断替代硬编码颜色，或使用 CSS 变量

**改动文件**：
- `client/src/components/ProjectPicker.vue`
- `client/src/components/TagPicker.vue`

**验收**：亮色模式下 ProjectPicker/TagPicker 正常显示

---

### 阶段三：Medium 清理

#### 任务 6：修复 Stats 字段名不匹配

**问题**：后端 `Stats` 用 snake_case（`today_count`），前端期望 camelCase（`todayCount`）。Heatmap 绕过了此问题，但 App.vue 副标题受影响。

**方案**：Rust `Stats` 结构体加 `#[serde(rename_all = "camelCase")]`

**改动文件**：
- `server/src/models.rs`

**验收**：App.vue 各视图副标题数字正确

---

#### 任务 7：移除未使用依赖

**移除**：
- `vue-router` — 未使用
- `@vueuse/motion` — 未使用
- `@types/howler` — howler 未使用

**改动文件**：
- `client/package.json`

---

#### 任务 8：清理死代码

**删除文件**：
- `client/src/composables/useAnimation.ts` — 从未引用
- `client/src/composables/useAutocomplete.ts` — 从未引用
- `client/src/components/TaskForm.vue` — 从未引用

**清理**：
- `TaskCard.vue` — 移除未使用的 `ChevronUp` import
- `stores/task.ts` — 移除未使用的 `filteredTasks`、`deleteProject`、`deleteTag` 方法
- `card-styles.css` — 移除未使用的 `.card-*` CSS 类
- `glass.css` — 移除未使用的 `glass-card-*`、`glass-edit-*` 类
- `animations.css` — 移除未使用的 `floatStar` keyframe

---

#### 任务 9：修复 glass.css 暗色硬编码

**问题**：`glass-picker` 和 `glass-tag-input` 用硬编码暗色背景。

**方案**：改为使用 `isDark` 条件或 CSS 变量

**改动文件**：
- `client/src/styles/glass.css`

---

#### 任务 10：后端添加日志

**方案**：添加 `tracing` + `tracing-subscriber` 依赖，记录请求日志和错误日志

**改动文件**：
- `server/Cargo.toml`
- `server/src/main.rs`

---

#### 任务 11：收紧 CORS 配置

**方案**：`allow_origin(Any)` 改为只允许 `http://localhost:3000`

**改动文件**：
- `server/src/main.rs`

---

### 阶段四：Low 修复

#### 任务 12：实现帮助弹窗

**方案**：新建 `HelpModal.vue`，显示键盘快捷键列表，`?` 键触发

**改动文件**：
- `client/src/components/HelpModal.vue`（新建）
- `client/src/App.vue`

---

#### 任务 13：selectedIndex 切换视图时重置

**改动**：`App.vue` watch currentView 时 `selectedIndex = -1`

**改动文件**：
- `client/src/App.vue`

---

#### 任务 14：跟随系统图标改为 SunMoon

**问题**：当前 `Monitor` 图标不直观。

**方案**：`App.vue` 中 `themeIcon` 的 system 分支改为 `SunMoon`（lucide-vue 提供）

**改动文件**：
- `client/src/App.vue` — import `SunMoon`，修改 `themeIcon` computed

---

#### 任务 15：修复完成弹窗统计数据延迟

**方案**：`handleCompleteTask` 改为 async，先 await `store.completeTask(uuid)` 再读 stats 弹窗

**改动文件**：
- `client/src/App.vue`

---

### 阶段五：事项列表重构

#### 任务 16：合并待办/已完成为「事项」列表

**方案**：
- 移除"已完成" tab，"待办"改名"事项"
- `App.vue` 视图切换改为：事项 / 看板 / 日历（3 个）
- 事项视图默认显示 `pendingTasks`
- 列表底部添加折叠区域：「已完成 (N)」，**用户点击展开时才调用 `fetchCompletedTasks()`**（不预先加载）
- 已完成任务样式：左边实心圆打勾 + 描述中划线 + 下方显示完成时间
- 已完成任务支持"取消完成"操作
- 删除 `DoneView.vue`，逻辑合并到事项列表中

**改动文件**：
- `client/src/App.vue` — 视图切换、合并列表逻辑
- `client/src/views/DoneView.vue` — 删除

**验收**：事项列表底部可展开已完成区域，点击时才加载数据，样式正确

---

#### 任务 17：新任务插入列表顶部

**改动**：`stores/task.ts` 的 `addTask` 方法中，新任务插入数组头部

**改动文件**：
- `client/src/stores/task.ts`

**验收**：新建任务出现在列表最顶部

---

#### 任务 18：TaskCard 两行布局重设计

**当前布局**（单行）：
```
[checkbox] [描述] [截止日期] [优先级点] [计时按钮] [计时器] [编辑箭头]
```

**新布局**（两行）：
```
┌─────────────────────────────────────────────────┐
│ [checkbox]  描述文本...              [截止日期]  │  ← 第一行
│             [标签1] [标签2]  [H] [⏵ 05:23] [⌄] │  ← 第二行
└─────────────────────────────────────────────────┘
```

**第一行**：
- 完成按钮（checkbox）
- 任务描述（flex-1）
- 截止日期 badge（右对齐，逾期红色/正常白色）

**第二行**：
- 标签 pills（小圆角，最多显示 2-3 个，超出显示 +N）
- 优先级指示器（H/M/L 小 badge，带文字，不再是 1.5px 圆点）
- 计时按钮 + 计时器（合并为一组）
- 编辑按钮（箭头）

**样式统一**：
- 所有第二行元素统一 `text-[10px]`、`rounded-lg`
- 标签 pill：`bg-white/15 text-white/80`
- 优先级 badge：H 红/M 黄/L 蓝，带文字
- 计时和编辑按钮：统一 `p-1 rounded-lg` 样式

**改动文件**：
- `client/src/components/TaskCard.vue`

**验收**：卡片两行布局，标签可见，样式统一，亮色/暗色都正常。点击卡片任意无 action 区域触发完成，hover 时显示 pointer cursor。

---

### 阶段六：新功能

#### 任务 19：后端 — 新增按日期查询已完成任务 API

**新增接口**：`GET /api/tasks/completed?date=YYYY-MM-DD`

**方案**：
- 在 `taskwarrior.rs` 中添加 `export_completed_on_date(date)` 方法
- 使用 `task status:completed end:YYYY-MM-DD export` 命令
- 在 `routes.rs` 中添加新 handler
- 在 `main.rs` 中注册路由

**改动文件**：
- `server/src/taskwarrior.rs`
- `server/src/routes.rs`
- `server/src/main.rs`

**验收**：`GET /api/tasks/completed?date=2026-06-28` 返回该日期完成的任务列表

---

#### 任务 20：热力图日期点击 — 显示当日已完成任务

**方案**：
- 热力图格子加 `cursor-pointer` 和点击事件
- 点击后调用 `GET /api/tasks/completed?date=YYYY-MM-DD` 获取数据
- 弹出玻璃拟态弹窗，显示该日期标题 + 完成的任务列表（描述 + 项目 + 完成时间）
- 无完成任务的日期点击无响应

**改动文件**：
- `client/src/api/taskwarrior.ts` — 新增 `getCompletedOnDate(date)` 方法
- `client/src/stores/task.ts` — 新增 `fetchCompletedOnDate(date)` 方法
- `client/src/components/Heatmap.vue` — 增加点击事件
- `client/src/components/DayCompletedModal.vue`（新建）

**验收**：点击热力图某天 → 弹窗显示该天完成的任务

---

#### 任务 21：项目管理弹窗

**入口**：左侧 `ProjectProgress.vue` 中，点击项目名打开弹窗

**弹窗内容**：
- 头部：项目名 + 进度条 + 统计（完成/总数）
- 任务列表：该项目下所有任务（pending + completed），分组显示
- 操作按钮：
  - 重命名：弹出输入框，确认后批量修改所有关联任务的 project 字段
  - 删除：确认后清空所有关联任务的 project 字段
  - 新建：弹出输入框，只创建项目名（后续给任务设置时才用，不创建任务）

**改动文件**：
- `client/src/components/ProjectProgress.vue` — 点击事件
- `client/src/components/ProjectManageModal.vue`（新建）
- `client/src/App.vue` — 集成弹窗

**验收**：点击项目名 → 弹窗显示项目详情和任务列表 → 可重命名/删除/新建项目名

---

#### 任务 22：标签管理 + 左侧面板 tab 切换

**入口**：左侧项目/标签面板，点击「标签」tab 切换到标签列表，点击标签名打开管理弹窗

**左侧面板改造**：
- 将 `ProjectProgress` 和新的 `TagList` 合并到一个面板中
- 顶部添加 tab 切换：「项目进度」/「标签」
- 项目进度 tab：显示原有进度条内容
- 标签 tab：显示前 5-8 个使用频率最高的标签 + 关联任务数
- tab 切换不重新加载数据，纯前端切换

**弹窗内容**：
- 头部：标签名 + 关联任务数
- 任务列表：该标签下所有任务（pending + completed）
- 操作按钮：
  - 重命名：弹出输入框，确认后批量修改所有关联任务的标签
  - 删除：确认后从所有关联任务中移除该标签

**改动文件**：
- `client/src/components/ProjectProgress.vue` — 重构为 tab 面板容器
- `client/src/components/TagList.vue`（新建）
- `client/src/components/TagManageModal.vue`（新建）
- `client/src/App.vue` — 左侧面板集成
- `client/src/stores/task.ts` — 添加 renameTag、deleteTag 方法
- `client/src/api/taskwarrior.ts` — 如需新 API

**验收**：左侧面板 tab 可切换项目/标签 → 点击标签打开弹窗 → 可查看关联任务、重命名、删除

---

## 依赖关系

```
阶段一（Critical）← 最先做
  任务 1 (store.tasks)
  任务 2 (useTimeTracking)
       │
       ├── 阶段二（High）← 3-5 可并行
       ├── 阶段三（Medium）← 6-11 可并行，可与阶段二并行
       ├── 阶段四（Low）← 12-15 可并行
       │
       └── 阶段五（事项列表重构）← 依赖阶段一
            任务 16 (合并列表)
            任务 17 (新任务顶部)
            任务 18 (卡片重设计) ← 依赖 16
                 │
                 └── 阶段六（新功能）← 依赖阶段五
                      任务 19 (后端按日期查询 API)
                      任务 20 (热力图点击) ← 依赖 19
                      任务 21 (项目管理弹窗)
                      任务 22 (标签管理)
                      → 19 完成后 20 可做，21/22 可并行
```

---

## 验收标准

1. 热力图数字正确（今日完成、累计完成不为 0）
2. 编辑弹窗标签选择器有数据
3. 看板 On Hold 列可转入
4. 亮色模式下所有组件正常显示
5. 无死代码、无未使用依赖
6. 后端有请求日志
7. 事项列表：未完成在上，底部折叠已完成区域
8. 新任务出现在列表最顶部
9. TaskCard 两行布局，标签可见，样式统一
10. 点击热力图日期可查看当日完成任务（通过新 API 查询）
11. 点击项目名可打开项目管理弹窗
12. 左侧面板 tab 可切换项目进度/标签，点击标签可打开标签管理弹窗
13. `pnpm lint` 无警告，`cargo clippy` 无警告
