# UI 优化设计规范：主题简化 + 设置面板重构 + 看板中文化

> 日期：2026-06-28
> 状态：已确认

## 概述

本次迭代包含 5 项 UI 优化，聚焦于简化主题系统、整合设置入口、看板中文化及修复刷新 bug。

---

## 1. 主题系统简化

### 改动

- `useTheme.ts`：`Theme` 类型从 `'light' | 'dark' | 'system'` 改为 `'light' | 'dark'`
- 删除 `getSystemTheme()` 函数
- 删除 `matchMedia` 系统主题监听
- `toggleTheme()` 改为简单切换：`light ↔ dark`
- `applyTheme()` 简化：不再判断 `system`，直接根据 `theme.value` 应用

### localStorage 兼容

- key `twm-theme` 只存 `'light' | 'dark'`
- 读取时若遇到旧值 `'system'`，fallback 到 `window.matchMedia('(prefers-color-scheme: dark)')` 判断

### App.vue

- 删除 `themeIcon` 计算属性中的 `Monitor` 图标分支（system 模式图标）
- 主题切换按钮从 header 移除（移入设置面板）

---

## 2. 设置面板重构

### Header 按钮变更

- **删除**三个独立按钮：快捷键（Keyboard 图标）、设置（Settings 图标）、主题循环（Sun/Moon/Monitor 图标）
- **替换为**一个齿轮图标按钮，点击打开设置面板

### SettingsPanel.vue 新结构

分组下拉面板，宽度 220px：

```
⚙ 设置
─────────────
外观
  ☀️ 浅色 | 🌙 深色    ← 分段选择器（当前选中高亮）
功能
  🔊 音效              ← Toggle 开关
  🏆 完成成就           ← Toggle 开关
其他
  ⌨️ 快捷键  查看 →     ← 点击打开 HelpModal
```

### 交互细节

- **分段选择器**：两个按钮横排，选中项用 `var(--accent-indigo)` 背景 + `var(--txt-on-color)` 文字，未选中用 `var(--glass-input-bg)` 背景 + `var(--txt-muted)` 文字
- **Toggle 开关**：复用现有 ToggleSwitch 组件
- **快捷键链接**：点击后关闭 SettingsPanel，打开 HelpModal
- **主题切换**：直接调用 `setTheme('light')` / `setTheme('dark')`，不再通过 `toggleTheme` 循环

### Props 调整

SettingsPanel 新增 props：
- `theme: 'light' | 'dark'` — 当前主题
- `soundEnabled: boolean` — 保留
- `achievementEnabled: boolean` — 保留

SettingsPanel 新增 emits：
- `update:theme` — 主题变更
- `update:soundEnabled` — 保留
- `update:achievementEnabled` — 保留
- `showHelp` — 打开快捷键弹窗
- `close` — 保留

---

## 3. Tab 持久化

### 改动

- App.vue `currentView` 初始化时从 `localStorage.getItem('twm-view')` 读取，默认 `'tasks'`
- `watch(currentView)` 时写入 `localStorage.setItem('twm-view', value)`

---

## 4. 看板列中文化 + Tooltip

### 列定义更新

| key | label（原） | label（新） | Tooltip |
|-----|------------|------------|---------|
| inbox | Inbox | 还在看 | 新建的任务默认在这里，还没分配项目 |
| backlog | Backlog | 排队中 | 编辑任务归属项目后自动移入 |
| ip | In Progress | 做着呢 | 点击"开始计时"后移入，表示正在做 |
| hold | On Hold | 等一下 | 手动设置为搁置状态的任务 |
| done | Done | 搞定了 | 已完成的任务 |

### Tooltip 实现

- 使用 radix-vue 的 `TooltipRoot / TooltipTrigger / TooltipPortal / TooltipContent`
- 列标题 hover 时显示 Tooltip
- Tooltip 样式：`var(--glass-modal-bg)` 背景 + `var(--glass-modal-blur)` 模糊 + `var(--glass-modal-border)` 边框

### Popover 菜单文案中文化

- "移动到 Inbox" → "移动到还在看"
- "移动到 Backlog" → "移动到排队中"
- "开始计时" / "停止计时" / "编辑" / "删除" — 保持不变（已是中文）

---

## 5. 看板刷新 Bug 修复

### 根因

KanbanView 绑定 `:tasks="store.tasks"`（通用列表），但 `store.updateTask` / `store.startTask` / `store.stopTask` 等操作后只刷新 `store.pendingTasks`，`store.tasks` 未被更新。

### 修复

- KanbanView 的 `:tasks` 从 `store.tasks` 改为 `store.pendingTasks`
- 与事项列表视图保持一致（事项列表也用 `store.pendingTasks`）

---

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `client/src/composables/useTheme.ts` | 修改：删除 system 模式 |
| `client/src/components/SettingsPanel.vue` | 重写：分组面板 + 主题分段选择器 + 快捷键链接 |
| `client/src/views/KanbanView.vue` | 修改：列中文化 + Tooltip + Popover 文案 |
| `client/src/App.vue` | 修改：header 按钮合并 + Tab 持久化 + KanbanView props 修复 + SettingsPanel props 调整 |

## 不涉及的文件

- `client/src/styles/theme-variables.css` — 无改动
- `client/src/components/HelpModal.vue` — 无改动（仅触发方式变更）
- `client/src/components/ToggleSwitch.vue` — 无改动（复用现有）
- 后端代码 — 无改动
