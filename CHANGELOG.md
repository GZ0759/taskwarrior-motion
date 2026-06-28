# Changelog

## v0.1.0 (2026-06-28)

### ✨ 新功能

- **双栏布局**：左侧面板（热力图 + 项目/标签）+ 右侧面板（事项/看板/日历）
- **玻璃拟态 UI**：Mesh 渐变背景、半透明面板、项目配色卡片
- **热力图**：35 天 GitHub 风格热力图，点击查看当日完成任务
- **任务管理**：创建/编辑/删除/完成/取消完成/撤销
- **时间追踪**：卡片上计时按钮，开始/停止计时
- **键盘快捷键**：j/k 导航、n 新建、x 完成、Enter 编辑、Escape 关闭、? 帮助
- **项目管理**：弹窗查看项目详情、重命名、删除、新建项目名
- **标签管理**：弹窗查看标签关联任务、重命名、删除
- **完成弹窗**：粒子爆炸 + 成就徽章 + 统计数字
- **暗色/亮色/系统主题**：三态切换
- **音效**：Web Audio API 合成音效（完成/添加）

### 🎨 视图

- **事项视图**：待办列表 + 底部折叠已完成区域
- **看板视图**：5 列（Inbox/Backlog/InProgress/OnHold/Done）
- **日历视图**：月/周切换

### 🔧 后端

- Rust + Axum API 服务
- 视图专用接口：`/api/tasks/pending`、`/api/tasks/completed`、`/api/tasks/calendar`、`/api/stats`
- 按日期查询已完成任务：`GET /api/tasks/completed?date=YYYY-MM-DD`
- 任务状态操作：完成/取消完成/开始/停止/撤销
- 请求日志（tracing）
- CORS 限制为 localhost

### 📦 技术栈

- 前端：Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Pinia
- 后端：Rust + Axum + Tokio
- 图标：@lucide/vue
- 动画：CSS Keyframes + Vue Transition
- 音效：Web Audio API
