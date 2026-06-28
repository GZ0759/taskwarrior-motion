# 颜色 Token 体系设计规范

## 目标

将项目中散落在 ~20 个组件中的硬编码颜色值，统一收敛到 `theme-variables.css` 的 CSS 变量 token 体系中，实现：
- 一处修改，全局生效
- dark/light 主题切换零遗漏
- 消除同一语义多种色值的不一致问题

## 方案

全面 Token 化：所有颜色通过 CSS 变量管理，组件只引用 `var(--xxx)`，不硬编码。

## Token 命名规则

```
--{类别}-{语义}[-{状态}]

类别: btn, txt, bg, border, shadow, heatmap, priority, glass
语义: primary, muted, subtle, danger, success, warning
状态: hover, active, selected
```

## 完整 Token 列表

### 按钮组

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--btn-primary-from` | `#6366F1` | `#6366F1` | 主按钮渐变起点 |
| `--btn-primary-to` | `#8B5CF6` | `#8B5CF6` | 主按钮渐变终点 |
| `--btn-primary-shadow` | `rgba(99,102,241,0.45)` | `rgba(99,102,241,0.30)` | 主按钮阴影 |
| `--btn-danger-text` | `#F87171` | `#EF4444` | 删除按钮文字 |
| `--btn-danger-hover-bg` | `rgba(239,68,68,0.12)` | `rgba(254,242,242,1)` | 删除按钮 hover 背景 |
| `--btn-success-from` | `#4ADE80` | `#4ADE80` | 成功按钮渐变起点 |
| `--btn-success-to` | `#22C55E` | `#22C55E` | 成功按钮渐变终点 |
| `--btn-warning-from` | `#F59E0B` | `#F59E0B` | 警告按钮渐变起点 |
| `--btn-warning-to` | `#D97706` | `#D97706` | 警告按钮渐变终点 |

### 文本组

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--txt-primary` | `rgba(255,255,255,0.90)` | `rgba(15,10,40,0.88)` | 主文本 |
| `--txt-muted` | `rgba(255,255,255,0.42)` | `rgba(15,10,40,0.46)` | 次要文本 |
| `--txt-subtle` | `rgba(255,255,255,0.30)` | `rgba(15,10,40,0.30)` | 辅助文本 |
| `--txt-on-color` | `rgba(255,255,255,0.92)` | `rgba(255,255,255,0.96)` | 彩色背景上的文字 |
| `--txt-accent` | `#818CF8` | `#6366F1` | 强调色文字（today、selected） |
| `--txt-danger` | `#F87171` | `#EF4444` | 危险/错误文字 |
| `--txt-success` | `#4ADE80` | `#22C55E` | 成功文字 |

### Glass 三层级

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--glass-panel-bg` | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.55)` | 面板级背景 |
| `--glass-panel-blur` | `24px` | `24px` | 面板模糊 |
| `--glass-panel-border` | `rgba(255,255,255,0.13)` | `rgba(255,255,255,0.80)` | 面板边框 |
| `--glass-modal-bg` | `rgba(12,6,26,0.72)` | `rgba(252,250,255,0.80)` | 弹窗级背景 |
| `--glass-modal-blur` | `60px` | `60px` | 弹窗模糊 |
| `--glass-modal-saturate` | `240%` | `200%` | 弹窗饱和度 |
| `--glass-modal-border` | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.80)` | 弹窗边框 |
| `--glass-overlay-bg` | `rgba(14,8,32,0.90)` | `rgba(252,250,255,0.90)` | 遮罩级背景 |
| `--glass-overlay-blur` | `40px` | `40px` | 遮罩模糊 |
| `--glass-input-bg` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.04)` | 输入框背景 |
| `--glass-input-border` | `rgba(255,255,255,0.13)` | `rgba(0,0,0,0.08)` | 输入框边框 |

### Priority 配色

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--priority-h-bg` | `rgba(239,68,68,0.25)` | `rgba(239,68,68,0.15)` | 高优先级背景 |
| `--priority-h-text` | `#FCA5A5` | `#EF4444` | 高优先级文字 |
| `--priority-h-solid` | `#EF4444` | `#EF4444` | 高优先级实色（选中态） |
| `--priority-m-bg` | `rgba(251,191,36,0.25)` | `rgba(251,191,36,0.15)` | 中优先级背景 |
| `--priority-m-text` | `#FDE68A` | `#D97706` | 中优先级文字 |
| `--priority-m-solid` | `#FBBF24` | `#FBBF24` | 中优先级实色（选中态） |
| `--priority-l-bg` | `rgba(59,130,246,0.25)` | `rgba(59,130,246,0.15)` | 低优先级背景 |
| `--priority-l-text` | `#93C5FD` | `#3B82F6` | 低优先级文字 |
| `--priority-l-solid` | `#3B82F6` | `#3B82F6` | 低优先级实色（选中态） |

### 热力图

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--heatmap-0` | `rgba(255,255,255,0.09)` | `rgba(0,0,0,0.07)` | 无数据 |
| `--heatmap-1` | `rgba(74,222,128,0.55)` | `rgba(34,197,94,0.55)` | 低频 |
| `--heatmap-2` | `rgba(34,197,94,0.75)` | `rgba(22,163,74,0.72)` | 中频 |
| `--heatmap-3` | `rgba(22,163,74,0.88)` | `rgba(21,128,61,0.85)` | 高频 |
| `--heatmap-4` | `rgba(21,128,61,0.96)` | `rgba(20,83,45,0.92)` | 极高频 |

### 边框组

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--border-subtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` | 微弱边框 |
| `--border-default` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.08)` | 默认边框 |
| `--border-emphasis` | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.60)` | 强调边框 |
| `--divider` | `rgba(255,255,255,0.08)` | `rgba(15,10,40,0.07)` | 分割线 |

### 阴影组

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--shadow-modal` | `0 50px 100px rgba(0,0,0,0.65)` | `0 32px 80px rgba(80,60,180,0.12)` | 弹窗阴影 |
| `--shadow-dropdown` | `0 24px 60px rgba(0,0,0,0.60)` | `0 20px 50px rgba(80,60,180,0.12)` | 下拉菜单阴影 |
| `--shadow-toast` | `0 8px 40px rgba(0,0,0,0.30)` | `0 8px 40px rgba(0,0,0,0.12)` | Toast 阴影 |

### 其他

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--accent-indigo` | `#6366F1` | `#6366F1` | 主强调色 |
| `--accent-indigo-light` | `#A5B4FC` | `#6366F1` | 浅强调色 |
| `--today-highlight` | `rgba(99,102,241,0.12)` | `rgba(99,102,241,0.06)` | 今日高亮背景 |
| `--caret-color` | `#818CF8` | `#818CF8` | 输入框光标色 |
| `--progress-bg` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` | 进度条背景 |

## Glass 三层级收敛规则

当前 4 种透明度收敛为 3 种：

| 当前值 | 当前用途 | 收敛到 | 层级 |
|--------|---------|--------|------|
| `0.62` | ModalShell, SimpleProjectSelect, DatePickerInput | `0.72` | Modal |
| `0.72` | CompletionModal | `0.72` | Modal（不变） |
| `0.82` | KanbanView popover | `0.72` | Modal |
| `0.90` | SettingsPanel | `0.90` | Overlay（不变） |

## 死代码清理

| 文件 | 清理内容 |
|------|---------|
| `card-styles.css` | 删除 `card-palette-0` ~ `card-palette-6` 类（从未使用） |
| `card-styles.css` | 删除 `completion-gradient`、`badge-center`、`logo-gradient` 类 |
| `glass.css` | 删除 `glass-card-dark/light`、`glass-input-dark/light`、`glass-edit-dark/light` 类 |
| `card-styles.ts` | 保留，但改用 token 引用 |

## 组件改造规则

1. 所有硬编码颜色值 → 替换为 `var(--xxx)` token
2. Tailwind 颜色类（如 `bg-indigo-500`、`text-red-400`）→ 改为 inline style + token
3. 渐变 → 用 `var(--btn-primary-from)` + `var(--btn-primary-to)` 组合
4. dark/light 切换 → 通过 `[data-theme="dark"]` / `[data-theme="light"]` 选择器切换 token 值

## 不在范围内

- 后端代码（不涉及颜色）
- CompletionModal 粒子颜色（装饰性，不影响一致性）
- mesh-backgrounds.css（背景氛围，独立于组件 token）
- card-styles.ts 的 7 色调色板渐变值（项目卡片颜色，保留但改用 token 引用）

## 验收标准

1. `theme-variables.css` 包含上述所有 token，dark/light 各一套值
2. 所有组件中无硬编码 hex/rgba 颜色值（装饰性粒子除外）
3. 所有组件中无 Tailwind 颜色类（`bg-indigo-500`、`text-red-400` 等）
4. `card-styles.css` 中无死代码
5. `glass.css` 中无死代码
6. `npm run typecheck` 通过
7. `npm run test` 全部通过
8. dark/light 主题切换后所有颜色正确
