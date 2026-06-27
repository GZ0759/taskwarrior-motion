# taskwarrior-motion 实现计划

> **项目概述**
> - 项目名称：taskwarrior-motion
> - 技术栈：Vue 3 + Vite + TypeScript + Tailwind CSS v4 + GSAP + Howler.js + Pinia + Rust + Axum
> - 功能范围：方案 C（完整版）
> - 目标：创建一个现代化的 taskwarrior Web UI，支持动画和音效

---

## 已确认的关键决策

| 决策项 | 确认结果 | 影响 |
|--------|----------|------|
| taskwarrior 版本 | **已安装 3.x (3.4.2)** | 需验证 taskchampion 后端的 `task export` JSON 格式，实现时做字段适配 |
| 部署方式 | **仅本地使用** | 无需 Nginx/生产部署，Rust 后端仅需处理 CORS 为 localhost |
| 看板拖拽 | **暂不实现** | 看板用按钮切换状态，后续再加拖拽 |
| 音效来源 | **开源免费音效** | 从 Freesound/Pixabay/Mixkit/Kenney 获取 CC0 音效 |

---

## 前置依赖

| 工具 | 状态 | 版本 | 安装方式 |
|------|------|------|----------|
| Node.js | ✅ 已安装 | v25.9.0 | — |
| pnpm | ✅ 已安装 | 10.33.2 | — |
| taskwarrior | ✅ 已安装 | 3.4.2 | /opt/homebrew/bin/task |
| Rust/Cargo | ✅ 已安装 | 1.96.0 | rustup |
| Homebrew | ✅ 已安装 | 6.0.5 | — |

---

## 参考项目

本项目参考以下成熟项目的设计思路：

### 1. taskwarrior-web-portal (Go + HTMX)

- **地址**：https://github.com/furan917/taskwarrior-web-portal
- **参考价值**：
  - Taskwarrior CLI 封装方式
  - REST API 设计
  - 功能模块划分
  - 安全性考虑（CSRF、命令注入防护）

### 2. taskwarrior-webui (Vue.js + Koa.js)

- **地址**：https://github.com/DCsunset/taskwarrior-webui
- **参考价值**：
  - Vue.js 组件设计
  - 状态管理方案
  - 前端架构

---

## 架构设计

### 整体架构

```
Vue 3 SPA (浏览器)
    ↓ HTTP 请求
Rust API 服务 (Axum)
    ↓ 调用
taskwarrior CLI
    ↓ 读写
taskchampion.sqlite3
```

### 技术栈详情

| 层 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Vite + TypeScript | 纯 SPA，静态文件 |
| 样式 | Tailwind CSS v4 | 独立 CLI，无 Node 依赖 |
| 动画 | GSAP | 业界标准，性能最好 |
| 音效 | Howler.js | Web 音效库，支持多格式 |
| 状态 | Pinia | Vue 官方推荐，TypeScript 友好 |
| 后端 | Rust + Axum | 高性能，类型安全 |
| 包管理 | pnpm | 更快更省空间 |

---

## 功能模块

### 模块 1：核心功能

#### 1.1 任务 CRUD
- 添加任务
- 编辑任务
- 删除任务
- 完成任务

#### 1.2 列表视图
- Next 视图（按优先级排序）
- Ready 视图（可执行任务）
- Agenda 视图（按日期分组）
- Forecast 视图（未来任务）

#### 1.3 搜索过滤
- 实时搜索（description/project/tags）
- 过滤器（状态/优先级/项目/标签）
- 排序（urgency/due/project/description）

#### 1.4 暗色模式
- 跟随系统主题
- 手动切换
- 持久化到 localStorage

#### 1.5 键盘快捷键
- j/k：上下导航
- x：完成任务
- n：新建任务
- Enter：编辑任务
- Escape：关闭弹窗
- ?：显示帮助

---

### 模块 2：视图功能

#### 2.1 看板视图
- 五列：Inbox/Backlog/InProgress/OnHold/Done
- 按钮切换状态（拖拽暂不实现，后续迭代）
- 移动端标签切换

#### 2.2 日历视图
- 月视图（默认）
- 周视图
- 日视图
- 任务芯片显示

#### 2.3 完成视图
- 已完成任务列表
- 可配置天数（默认 14 天）
- 按完成时间排序

---

### 模块 3：高级功能

#### 3.1 标签/项目
- 自动补全
- 重命名
- 合并（可选）

#### 3.2 优先级
- H/M/L 四级
- 颜色编码（红/黄/蓝）

#### 3.3 依赖关系
- 任务间依赖
- 阻塞/被阻塞显示

#### 3.4 重复任务
- Recur 支持
- Until 支持

#### 3.5 批量操作
- 多选完成
- 多选删除

#### 3.6 撤销操作
- task undo

#### 3.7 时间追踪
- 开始/停止计时
- 历史编辑
- Timesheet 视图

#### 3.8 上下文管理
- 持久化过滤器
- 快速切换

---

### 模块 4：动画音效

#### 4.1 完成动画
- 打勾 → 粒子爆炸 → 行淡出
- GSAP 实现
- 时长：400ms

#### 4.2 删除动画
- 行滑出 → 淡出
- GSAP 实现
- 时长：300ms

#### 4.3 添加动画
- 行滑入 → 淡入
- GSAP 实现
- 时长：400ms

#### 4.4 音效
- 完成：清脆的 "叮"
- 删除：软性的 "噗"
- 添加：轻柔的 "嗒"
- Howler.js 实现

---

## 执行规则

1. **自主修复**：遇到问题自行修复，无需确认
2. **验收检查**：每个任务完成后运行对应的验收检查点
3. **提交时机**：由用户决定何时 commit 和 push，不需要每次改动都提交

---

## 开发任务

> **任务依赖关系**：任务 1 → 任务 2 → 任务 3 → 任务 4/5/6（可并行） → 任务 7

### 任务 1：项目初始化

**目标**：搭建项目基础结构
**前置**：无
**验收**：`make dev` 可同时启动前后端，浏览器访问 http://localhost:3000 有页面

**步骤**：
1. 运行 `task export` 验证 taskwarrior 3.4.2 的 JSON 输出格式，确认字段与 api-spec.md 一致
2. 初始化 Rust 项目（`cargo init server`）
3. 配置 Cargo.toml 依赖：axum 0.7, tokio 1 (features: full), serde 1 (features: derive), serde_json 1, tower-http 0.5 (features: cors), uuid 1 (features: v4)
4. 初始化 Vue 项目（`pnpm create vite client -- --template vue-ts`）
5. 安装前端依赖：vue, pinia, vue-router, gsap, howler, axios
6. 安装 Tailwind CSS v4（`pnpm add tailwindcss @tailwindcss/vite`），在 vite.config.ts 中添加 `@tailwindcss/vite` 插件，在 `src/style.css` 中添加 `@import "tailwindcss"`
7. 复制 `.eslintrc.cjs` 和 `.prettierrc` 到 `client/` 目录（根目录保留），安装对应 ESLint/Prettier 依赖
8. 配置 Vite 开发代理（`/api` → `http://localhost:3001`）
9. 验证 `make dev` 可同时启动前后端

**产出**：
- server/ 目录结构 + Cargo.toml
- client/ 目录结构 + package.json + vite.config.ts
- 配置文件

---

### 任务 2：Rust 后端实现

**目标**：实现 Taskwarrior CLI 封装和 API 服务
**前置**：任务 1 完成
**验收**：`cargo run` 启动后端，`curl http://localhost:3001/api/tasks` 返回 JSON

**步骤**：
1. 实现 `models.rs` — Task 结构体（字段以任务 1 中 `task export` 实际输出为准）
2. 实现 `errors.rs` — AppError 枚举 + IntoResponse 实现（INVALID_INPUT/NOT_FOUND/INTERNAL_ERROR/TASK_ERROR）
3. 实现 `taskwarrior.rs` — TaskwarriorClient（export, add, modify, delete, done, start, stop, undo），使用 `tokio::process::Command` 异步执行，写操作加 `tokio::sync::Mutex` 防止并发冲突
4. 实现 `routes.rs` — 所有 8 个 API 端点
5. 实现 `main.rs` — Axum 服务启动 + CORS（tower-http，允许 localhost:3000）+ 路由挂载
6. 编写单元测试

**产出**：
- server/src/taskwarrior.rs
- server/src/routes.rs
- server/src/models.rs
- server/src/errors.rs
- server/tests/

**参考**：
- taskwarrior-web-portal 的 internal/tw/client.go
- taskwarrior-web-portal 的 internal/server/routes.go

---

### 任务 3：Vue 前端核心功能

**目标**：实现任务 CRUD、列表视图、搜索过滤
**前置**：任务 2 完成（后端 API 可用）
**验收**：浏览器可添加/编辑/删除/完成任务，搜索过滤可用，暗色模式可切换

**步骤**：
1. 实现 TypeScript 类型定义
2. 实现 API 封装
3. 实现 Pinia Store
4. 实现 TaskItem 组件
5. 实现 TaskList 组件
6. 实现 TaskForm 组件
7. 实现 App.vue 主组件
8. 实现 `composables/useTheme.ts` — 暗色模式（系统主题跟随 + 手动切换 + localStorage 持久化）
9. 实现 `composables/useKeyboard.ts` — 键盘快捷键（需检查 e.target 避免在输入框中触发）

**产出**：
- client/src/types/task.ts
- client/src/api/taskwarrior.ts
- client/src/stores/task.ts
- client/src/components/TaskItem.vue
- client/src/components/TaskList.vue
- client/src/components/TaskForm.vue
- client/src/App.vue
- client/src/composables/useTheme.ts
- client/src/composables/useKeyboard.ts

**参考**：
- taskwarrior-webui 的 client/src/components/
- taskwarrior-web-portal 的 internal/views/row.templ

---

### 任务 4：Vue 前端视图功能

**目标**：实现看板、日历、完成视图
**前置**：任务 3 完成
**验收**：三种视图可正常切换和显示，看板按钮可切换任务状态

**步骤**：
1. 实现看板视图（KanbanView.vue）— 五列看板，按钮切换状态（拖拽暂不实现）
2. 实现日历视图（CalendarView.vue）— 月/周/日三种视图
3. 实现完成视图（DoneView.vue）— 已完成任务列表，可配置天数
4. 实现视图切换

**产出**：
- client/src/views/KanbanView.vue
- client/src/views/CalendarView.vue
- client/src/views/DoneView.vue

**参考**：
- taskwarrior-web-portal 的 internal/views/kanban.templ
- taskwarrior-web-portal 的 internal/views/calendar.templ

---

### 任务 5：Vue 前端高级功能

**目标**：实现标签/项目、优先级、依赖、重复、批量、撤销、时间追踪、上下文
**前置**：任务 3 完成
**验收**：自动补全可用，优先级颜色正确，批量操作和撤销功能正常

**步骤**：
1. 实现标签/项目自动补全
2. 实现优先级颜色编码
3. 实现依赖关系显示
4. 实现重复任务支持
5. 实现批量操作
6. 实现撤销操作
7. 实现时间追踪
8. 实现上下文管理

**产出**：
- client/src/composables/useAutocomplete.ts — 标签/项目自动补全
- client/src/composables/useTimeTracking.ts — 时间追踪（start/stop）
- client/src/composables/useContext.ts — 上下文管理（持久化过滤器）
- 优先级颜色编码（集成到 TaskItem 组件）
- 依赖关系显示（集成到 TaskItem 组件）
- 重复任务支持（集成到 TaskForm 组件）
- 批量操作（集成到 TaskList 组件）
- 撤销操作（集成到 Pinia store）

**参考**：
- taskwarrior-web-portal 的功能实现

---

### 任务 6：动画音效实现

**目标**：实现完成/删除/添加动画和音效
**前置**：任务 3 完成
**验收**：完成/删除/添加任务时有动画和音效，可关闭

**步骤**：
1. 准备音效文件（complete.mp3, delete.mp3, add.mp3）
2. 实现 GSAP 动画
3. 实现 Howler.js 音效
4. 优化动画性能

**产出**：
- client/public/sounds/complete.mp3
- client/public/sounds/delete.mp3
- client/public/sounds/add.mp3
- client/src/composables/useAnimation.ts
- client/src/composables/useSound.ts

**参考**：
- GSAP 官方文档：https://gsap.com/docs/
- Howler.js 官方文档：https://howlerjs.com/

---

### 任务 7：测试和文档

**目标**：编写测试和完善文档
**前置**：任务 4/5/6 全部完成
**验收**：`make test` 全部通过，`make lint` 0 warnings，覆盖率 ≥ 90%

**步骤**：
1. 编写 Rust 单元测试（覆盖率 90%+，使用 `cargo tarpaulin`）
2. 编写 Vue 单元测试（Vitest + Vue Test Utils，覆盖率 90%+）
3. 完善 README（安装/使用/键盘快捷键说明）
4. 最终 `make lint` 0 warnings，`make fmt` 无 diff

**产出**：
- server/tests/
- client/tests/
- 完善的 README.md

---

## 时间规划

| 周 | 任务 | 产出 |
|------|------|------|
| 第 1 周 | 任务 1 + 任务 2 | 项目结构 + Rust 后端 |
| 第 2 周 | 任务 3 | Vue 核心功能 |
| 第 3 周 | 任务 4 + 任务 5 | 视图功能 + 高级功能 |
| 第 4 周 | 任务 6 + 任务 7 | 动画音效 + 测试文档 |

---

## 质量标准

### 代码质量
- ESLint + Prettier：0 warnings
- rustfmt + clippy：0 warnings
- TypeScript：strict mode

### 测试质量
- 覆盖率：90%+
- 所有测试通过
- 无 flaky tests

### 文档质量
- README：完整、清晰，包含安装/使用/键盘快捷键说明
- API 文档：docs/specs/api-spec.md

---

## 项目结构

```
taskwarrior-motion/
├── README.md                              # 项目说明
├── LICENSE                                # MIT 许可证
├── Makefile                               # 构建脚本
├── .gitignore                             # Git 忽略规则
├── .eslintrc.cjs                          # ESLint 配置
├── .prettierrc                            # Prettier 配置
├── docs/
│   ├── plans/
│   │   └── taskwarrior-motion.md          # 主计划文档
│   └── specs/
│       ├── architecture.md                # 架构规范
│       ├── api-spec.md                    # API 规范
│       ├── components-spec.md             # 组件规范
│       └── testing-spec.md                # 测试规范
├── server/                                # Rust 后端
│   ├── Cargo.toml                         # Rust 依赖
│   ├── src/
│   │   ├── main.rs                        # 入口
│   │   ├── routes.rs                      # 路由
│   │   ├── taskwarrior.rs                 # CLI 封装
│   │   ├── models.rs                      # 数据模型
│   │   └── errors.rs                      # 错误处理
│   └── tests/                             # 测试
├── client/                                # Vue 前端
│   ├── package.json                       # 前端依赖
│   ├── vite.config.ts                     # Vite 配置
│   ├── tsconfig.json                      # TypeScript 配置
│   ├── src/
│   │   ├── main.ts                        # 入口
│   │   ├── App.vue                        # 根组件
│   │   ├── api/                           # API 封装
│   │   ├── components/                    # 组件
│   │   ├── views/                         # 视图
│   │   ├── stores/                        # 状态管理
│   │   ├── composables/                   # 组合式函数
│   │   ├── types/                         # TypeScript 类型
│   │   ├── assets/                        # 静态资源
│   │   └── utils/                         # 工具函数
│   ├── public/
│   │   └── sounds/                        # 音效文件
│   └── tests/                             # 测试
└── scripts/
    └── setup.sh                           # 初始化脚本
```

---

## 启动开发

### 开发模式

```bash
# 安装依赖
make install

# 启动开发服务器
make dev
```

### 生产构建

```bash
# 构建项目
make build

# 运行
make run
```

---

## 注意事项

### 安全性
- 所有用户输入需要验证，长度限制 4KB
- 防止命令注入：使用参数数组而非字符串拼接
- CORS 配置：仅允许 localhost:3000

### 性能
- 前端懒加载（路由级别）
- 后端异步处理（tokio::process::Command）
- `task export` 结果做内存缓存，写操作后主动失效
- 大量任务时考虑虚拟滚动

### 可维护性
- 模块化设计
- 清晰的代码结构
- 完善的文档

### 风险点
- taskwarrior 3.x 的 `task export` JSON 格式需在开发前验证
- 并发写操作需加互斥锁（tokio::sync::Mutex）
- 后端测试依赖真实 taskwarrior，测试环境需安装

---

## UI 重写计划

> 📦 此部分已归档，详细计划见 [ui-refactor-plan.md](ui-refactor-plan.md)

---

## 完成条件

1. **后端 API 完整可用** — `make test-server` 全部通过，8 个 API 端点均可通过 curl 正常调用
2. **前端核心功能完整** — 任务 CRUD、列表视图、搜索过滤、暗色模式、键盘快捷键均可用
3. **视图功能完整** — 看板视图（按钮切换状态）、日历视图、完成视图均可正常显示和交互
4. **动画与音效正常** — 完成/删除/添加三种动画流畅运行，音效正常播放
5. **测试覆盖率达标** — 总体覆盖率 ≥ 90%
6. **代码质量达标** — `make lint` 0 warnings
7. **一键启动可用** — `make install && make dev` 可成功启动
8. **taskwarrior 3.x 兼容** — 在 3.4.2 环境下所有功能正常工作

---

## 更新日志

- 2026-06-27：创建初始计划文档
- 2026-06-27：评审补充 — 添加前置依赖、关键决策、细化任务步骤、简化测试策略、添加完成条件
- 2026-06-27：优化 — 添加任务依赖关系、验收检查点、补充任务 5 产出、修正任务 1 步骤歧义
- 2026-06-27：原 7 个任务已完成，UI 重写部分独立为 [ui-refactor-plan.md](ui-refactor-plan.md)
