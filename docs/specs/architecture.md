# 架构规范

## 概述

taskwarrior-motion 采用前后端分离架构，前端使用 Vue 3 SPA，后端使用 Rust API 服务。

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.4+ | UI 框架 |
| Vite | 5.x | 构建工具 |
| TypeScript | 5.x | 类型系统 |
| Tailwind CSS | v4 | 样式框架 |
| GSAP | 3.12+ | 动画库 |
| Howler.js | 2.2+ | 音效库 |
| Pinia | 2.x+ | 状态管理 |
| pnpm | 8.x+ | 包管理 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Rust | 1.75+ | 编程语言 |
| Axum | 0.7+ | Web 框架 |
| Tokio | 1.x | 异步运行时 |
| serde | 1.x | 序列化 |
| serde_json | 1.x | JSON 处理 |

---

## 整体架构

```
┌─────────────────────────────────────────────────────────┐
│  浏览器                                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Vue 3 SPA (Vite 构建)                              ││
│  │  - 任务列表/看板/日历                                ││
│  │  - 动画、音效                                        ││
│  │  - 发 HTTP 请求到 localhost:3001                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                         ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│  本地服务                                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Rust API 服务 (Axum)                               ││
│  │  - GET /api/tasks → 执行 `task export`              ││
│  │  - POST /api/tasks → 执行 `task add`                ││
│  │  - PUT /api/tasks/:id → 执行 `task modify`          ││
│  │  - 处理 CORS、错误、日志                             ││
│  └─────────────────────────────────────────────────────┘│
│                         ↓                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  taskwarrior CLI                                     ││
│  │  - task export / task add / task done / ...          ││
│  └─────────────────────────────────────────────────────┘│
│                         ↓                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ~/.task/taskchampion.sqlite3                        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
taskwarrior-motion/
├── README.md
├── LICENSE
├── Makefile
├── docs/
│   ├── plans/
│   │   └── taskwarrior-motion.md
│   └── specs/
│       ├── architecture.md
│       ├── api-spec.md
│       ├── components-spec.md
│       └── testing-spec.md
├── server/                         # Rust 后端
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── routes.rs
│   │   ├── taskwarrior.rs
│   │   ├── models.rs
│   │   └── errors.rs
│   └── tests/
├── client/                         # Vue 前端
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── .storybook/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── api/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── composables/
│   │   ├── types/
│   │   ├── assets/
│   │   └── utils/
│   ├── public/
│   │   └── sounds/
│   └── tests/
└── scripts/
    └── setup.sh
```

---

## 通信协议

### REST API

- **协议**：HTTP/HTTPS
- **格式**：JSON
- **编码**：UTF-8

### 端口配置

| 环境 | 前端 | 后端 |
|------|------|------|
| 开发 | 3000 | 3001 |
| 生产 | - | 5050 |

### CORS 配置

```rust
// 开发环境
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 错误处理

### 错误格式

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description is required",
    "details": {}
  }
}
```

### 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| INVALID_INPUT | 400 | 输入无效 |
| NOT_FOUND | 404 | 资源不存在 |
| INTERNAL_ERROR | 500 | 内部错误 |
| TASK_ERROR | 500 | taskwarrior 命令执行失败 |

---

## 安全规范

### 输入验证

- 所有用户输入需要验证
- 防止命令注入
- 长度限制（4KB）

### 命令注入防护

```rust
// 错误：直接拼接用户输入
let cmd = format!("task add {}", user_input);

// 正确：使用参数数组
let args = vec!["add", &user_input];
Command::new("task").args(&args).output();
```

### CORS 配置

- 开发环境：允许 localhost:3000
- 生产环境：同源策略

---

## 性能优化

### 前端

- **懒加载**：路由懒加载
- **代码分割**：Vite 自动代码分割
- **缓存**：localStorage 缓存配置
- **图片优化**：WebP 格式

### 后端

- **异步处理**：Tokio 异步运行时
- **连接池**：复用 taskwarrior 进程
- **缓存**：内存缓存任务列表
- **超时控制**：命令执行超时 10s

---

## 日志规范

### 日志级别

| 级别 | 用途 |
|------|------|
| ERROR | 错误信息 |
| WARN | 警告信息 |
| INFO | 一般信息 |
| DEBUG | 调试信息 |

### 日志格式

```
2026-06-27 10:00:00 [INFO] GET /api/tasks 200 15ms
2026-06-27 10:00:01 [ERROR] Failed to execute task: Permission denied
```

---

## 部署规范

### 开发环境

```bash
# 启动后端
cd server && cargo run

# 启动前端
cd client && pnpm dev
```

### 生产环境

```bash
# 构建
make build

# 运行
make run
```

---

## 参考项目

### taskwarrior-web-portal

- **架构**：Go + HTMX
- **参考**：
  - Taskwarrior CLI 封装
  - REST API 设计
  - 安全性考虑

### taskwarrior-webui

- **架构**：Vue.js + Koa.js
- **参考**：
  - Vue.js 组件设计
  - 状态管理方案
