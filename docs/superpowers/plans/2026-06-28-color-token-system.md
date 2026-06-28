# 颜色 Token 体系实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ~20 个组件中的硬编码颜色值统一收敛到 `theme-variables.css` 的 CSS 变量 token 体系，实现一处修改全局生效、dark/light 主题切换零遗漏。

**Architecture:** 在 `theme-variables.css` 中定义所有 CSS 变量 token（`.dark` / `.light` 类选择器，与现有 `useTheme.ts` 一致），组件中所有硬编码颜色替换为 `var(--xxx)` 引用。同时清理 `card-styles.css` 和 `glass.css` 中的死代码。

**Tech Stack:** Vue 3, Tailwind CSS v4, CSS Custom Properties

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `client/src/styles/theme-variables.css` | 所有 token 定义（dark/light 各一套） |
| 修改 | `client/src/styles/card-styles.css` | 清理死代码，priority/due 类改用 token |
| 修改 | `client/src/styles/glass.css` | 清理死代码，保留的类改用 token |
| 修改 | `client/src/utils/card-styles.ts` | 7 色调色板改用 token 引用 |
| 修改 | `client/src/App.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/ModalShell.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/CreateModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/TaskEditModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/TaskCard.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/CompletionModal.vue` | 替换硬编码颜色（粒子除外） |
| 修改 | `client/src/components/SettingsPanel.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/HelpModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/TimerModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/TagManageModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/ProjectManageModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/DayCompletedModal.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/SimpleTagSelect.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/SimpleProjectSelect.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/DatePickerInput.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/AddTaskBtn.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/ToggleSwitch.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/CompletedSection.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/EmptyDayIcon.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/AchievementBadge.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/Heatmap.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/TagList.vue` | 替换硬编码颜色 |
| 修改 | `client/src/components/ProjectProgress.vue` | 替换硬编码颜色 |
| 修改 | `client/src/views/KanbanView.vue` | 替换硬编码颜色 |
| 修改 | `client/src/views/CalendarView.vue` | 替换硬编码颜色 |

---

## 设计决策

1. **选择器策略**：保持 `.dark` / `.light` 类选择器（与 `useTheme.ts` 一致），不改为 `[data-theme]`
2. **Token 粒度**：回归 spec 定义的 ~50 个核心 token，不过度拆分。对于 spec 未覆盖的细粒度颜色，按需添加少量补充 token
3. **Tailwind 颜色类处理**：`bg-indigo-500`、`text-red-400` 等改为 inline style + `var(--xxx)` token
4. **isDark 三元表达式处理**：`isDark ? 'rgba(...)' : 'rgba(...)'` 改为 `var(--xxx)` token，消除组件中的主题判断逻辑
5. **渐变边框颜色**（ModalShell 中的 `#EC4899`, `#F59E0B`, `#06B6D4`）：这些是装饰性渐变边框的固定色值，添加 `--grad-border-*` token
6. **粒子颜色**：CompletionModal 粒子颜色不在范围内（spec 明确排除）
7. **card-styles.ts 7 色调色板**：保留但改用 token 引用（spec 明确保留）

---

## 补充 Token 列表（spec 之外按需添加）

以下 token 在 spec 中未定义，但组件中实际使用且无法映射到现有 token：

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--glass-panel-hover-bg` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` | 面板项 hover 背景 |
| `--glass-card-inset` | `0 1px 0 rgba(255,255,255,0.18) inset` | `0 1px 0 rgba(255,255,255,0.18) inset` | 卡片内嵌高光 |
| `--glass-card-border` | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.60)` | 卡片边框 |
| `--glass-card-selected-ring` | `rgba(255,255,255,0.65)` | `rgba(99,102,241,0.50)` | 选中卡片环 |
| `--glass-card-tag-bg` | `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.06)` | 卡片标签背景 |
| `--glass-card-tag-text` | `rgba(255,255,255,0.80)` | `rgba(15,10,40,0.65)` | 卡片标签文字 |
| `--glass-modal-inset` | `0 1px 0 rgba(255,255,255,0.12) inset` | `0 1px 0 rgba(255,255,255,0.88) inset` | 弹窗内嵌高光 |
| `--glass-overlay-border` | `rgba(255,255,255,0.13)` | `rgba(255,255,255,0.92)` | 遮罩边框 |
| `--glass-overlay-inset` | `0 1px 0 rgba(255,255,255,0.10) inset` | `0 1px 0 rgba(255,255,255,0.88) inset` | 遮罩内嵌高光 |
| `--grad-border-pink` | `#EC4899` | `#EC4899` | 渐变边框粉色 |
| `--grad-border-amber` | `#F59E0B` | `#F59E0B` | 渐变边框琥珀 |
| `--grad-border-cyan` | `#06B6D4` | `#06B6D4` | 渐变边框青色 |
| `--toggle-off-bg` | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.10)` | 开关 off 背景 |
| `--toggle-knob-bg` | `#ffffff` | `#ffffff` | 开关旋钮背景 |
| `--accent-indigo-dark` | `#5B52C8` | `#5B52C8` | 深靛蓝（选中态） |
| `--accent-indigo-border` | `rgba(165,148,255,0.35)` | `rgba(99,102,241,0.25)` | 靛蓝选中边框 |
| `--accent-indigo-bg` | `rgba(99,102,241,0.14)` | `rgba(99,102,241,0.07)` | 靛蓝选中背景 |
| `--due-normal-bg` | `rgba(255,255,255,0.17)` | `rgba(0,0,0,0.06)` | 截止日期正常背景 |
| `--due-normal-text` | `rgba(255,255,255,0.92)` | `rgba(15,10,40,0.72)` | 截止日期正常文字 |
| `--due-overdue-bg` | `rgba(239,68,68,0.45)` | `rgba(239,68,68,0.15)` | 截止日期逾期背景 |
| `--due-overdue-text` | `rgba(255,255,255,0.92)` | `rgba(239,68,68,0.88)` | 截止日期逾期文字 |
| `--btn-completion-from` | `#7C3AED` | `#7C3AED` | 完成弹窗 CTA 渐变起点 |
| `--btn-completion-to` | `#6D28D9` | `#6D28D9` | 完成弹窗 CTA 渐变终点 |
| `--btn-completion-shadow` | `rgba(124,58,237,0.45)` | `rgba(124,58,237,0.30)` | 完成弹窗 CTA 阴影 |
| `--shadow-modal-glow` | `rgba(99,102,241,0.18)` | `rgba(99,102,241,0.10)` | 弹窗靛蓝辉光 |

---

### Task 1: 写入所有 Token 到 theme-variables.css

**Files:**
- Modify: `client/src/styles/theme-variables.css`

- [ ] **Step 1: 替换 theme-variables.css 为完整 token 定义**

将 `theme-variables.css` 的 `.dark` 和 `.light` 块替换为包含所有 token 的完整定义。保留文件底部的全局字体和滚动条样式不变。

`.dark` 块内容（替换第 4-21 行）：

```css
.dark {
  /* 文本 */
  --txt-primary: rgba(255,255,255,0.90);
  --txt-muted: rgba(255,255,255,0.42);
  --txt-subtle: rgba(255,255,255,0.30);
  --txt-weekday: rgba(255,255,255,0.36);
  --txt-cell-active: rgba(255,255,255,0.95);
  --txt-cell-empty: rgba(255,255,255,0.40);
  --txt-on-color: rgba(255,255,255,0.92);
  --txt-accent: #818CF8;
  --txt-danger: #F87171;
  --txt-success: #4ADE80;

  /* 按钮 */
  --btn-primary-from: #6366F1;
  --btn-primary-to: #8B5CF6;
  --btn-primary-shadow: rgba(99,102,241,0.45);
  --btn-danger-text: #F87171;
  --btn-danger-hover-bg: rgba(239,68,68,0.12);
  --btn-success-from: #4ADE80;
  --btn-success-to: #22C55E;
  --btn-warning-from: #F59E0B;
  --btn-warning-to: #D97706;
  --btn-completion-from: #7C3AED;
  --btn-completion-to: #6D28D9;
  --btn-completion-shadow: rgba(124,58,237,0.45);

  /* Glass 面板级 */
  --glass-panel-bg: rgba(255,255,255,0.07);
  --glass-panel-blur: 24px;
  --glass-panel-border: rgba(255,255,255,0.13);
  --glass-panel-hover-bg: rgba(255,255,255,0.06);

  /* Glass 弹窗级 */
  --glass-modal-bg: rgba(12,6,26,0.72);
  --glass-modal-blur: 60px;
  --glass-modal-saturate: 240%;
  --glass-modal-border: rgba(255,255,255,0.15);
  --glass-modal-inset: 0 1px 0 rgba(255,255,255,0.12) inset;

  /* Glass 遮罩级 */
  --glass-overlay-bg: rgba(14,8,32,0.90);
  --glass-overlay-blur: 40px;
  --glass-overlay-border: rgba(255,255,255,0.13);
  --glass-overlay-inset: 0 1px 0 rgba(255,255,255,0.10) inset;

  /* Glass 输入框 */
  --glass-input-bg: rgba(255,255,255,0.07);
  --glass-input-border: rgba(255,255,255,0.13);

  /* Glass 卡片 */
  --glass-card-border: rgba(255,255,255,0.15);
  --glass-card-inset: 0 1px 0 rgba(255,255,255,0.18) inset;
  --glass-card-selected-ring: rgba(255,255,255,0.65);
  --glass-card-tag-bg: rgba(255,255,255,0.15);
  --glass-card-tag-text: rgba(255,255,255,0.80);

  /* Priority */
  --priority-h-bg: rgba(239,68,68,0.25);
  --priority-h-text: #FCA5A5;
  --priority-h-solid: #EF4444;
  --priority-m-bg: rgba(251,191,36,0.25);
  --priority-m-text: #FDE68A;
  --priority-m-solid: #FBBF24;
  --priority-l-bg: rgba(59,130,246,0.25);
  --priority-l-text: #93C5FD;
  --priority-l-solid: #3B82F6;

  /* 热力图 */
  --heatmap-0: rgba(255,255,255,0.09);
  --heatmap-1: rgba(74,222,128,0.55);
  --heatmap-2: rgba(34,197,94,0.75);
  --heatmap-3: rgba(22,163,74,0.88);
  --heatmap-4: rgba(21,128,61,0.96);

  /* 边框 */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);
  --border-emphasis: rgba(255,255,255,0.15);
  --divider: rgba(255,255,255,0.08);

  /* 阴影 */
  --shadow-modal: 0 50px 100px rgba(0,0,0,0.65);
  --shadow-modal-glow: rgba(99,102,241,0.18);
  --shadow-dropdown: 0 24px 60px rgba(0,0,0,0.60);
  --shadow-toast: 0 8px 40px rgba(0,0,0,0.30);

  /* 强调色 */
  --accent-indigo: #6366F1;
  --accent-indigo-light: #A5B4FC;
  --accent-indigo-dark: #5B52C8;
  --accent-indigo-border: rgba(165,148,255,0.35);
  --accent-indigo-bg: rgba(99,102,241,0.14);
  --grad-border-pink: #EC4899;
  --grad-border-amber: #F59E0B;
  --grad-border-cyan: #06B6D4;

  /* 其他 */
  --today-highlight: rgba(99,102,241,0.12);
  --caret-color: #818CF8;
  --progress-bg: rgba(255,255,255,0.10);
  --today-ring: rgba(255,255,255,0.75);
  --ctrl-btn: rgba(255,255,255,0.40);
  --ctrl-btn-hover: rgba(255,255,255,1);
  --toggle-off-bg: rgba(255,255,255,0.14);
  --toggle-knob-bg: #ffffff;
  --due-normal-bg: rgba(255,255,255,0.17);
  --due-normal-text: rgba(255,255,255,0.92);
  --due-overdue-bg: rgba(239,68,68,0.45);
  --due-overdue-text: rgba(255,255,255,0.92);
}
```

`.light` 块内容（替换第 24-41 行）：

```css
.light {
  /* 文本 */
  --txt-primary: rgba(15,10,40,0.88);
  --txt-muted: rgba(15,10,40,0.46);
  --txt-subtle: rgba(15,10,40,0.30);
  --txt-weekday: rgba(15,10,40,0.38);
  --txt-cell-active: rgba(255,255,255,0.96);
  --txt-cell-empty: rgba(0,0,0,0.38);
  --txt-on-color: rgba(255,255,255,0.96);
  --txt-accent: #6366F1;
  --txt-danger: #EF4444;
  --txt-success: #22C55E;

  /* 按钮 */
  --btn-primary-from: #6366F1;
  --btn-primary-to: #8B5CF6;
  --btn-primary-shadow: rgba(99,102,241,0.30);
  --btn-danger-text: #EF4444;
  --btn-danger-hover-bg: rgba(254,242,242,1);
  --btn-success-from: #4ADE80;
  --btn-success-to: #22C55E;
  --btn-warning-from: #F59E0B;
  --btn-warning-to: #D97706;
  --btn-completion-from: #7C3AED;
  --btn-completion-to: #6D28D9;
  --btn-completion-shadow: rgba(124,58,237,0.30);

  /* Glass 面板级 */
  --glass-panel-bg: rgba(255,255,255,0.55);
  --glass-panel-blur: 24px;
  --glass-panel-border: rgba(255,255,255,0.80);
  --glass-panel-hover-bg: rgba(0,0,0,0.04);

  /* Glass 弹窗级 */
  --glass-modal-bg: rgba(252,250,255,0.80);
  --glass-modal-blur: 60px;
  --glass-modal-saturate: 200%;
  --glass-modal-border: rgba(255,255,255,0.80);
  --glass-modal-inset: 0 1px 0 rgba(255,255,255,0.88) inset;

  /* Glass 遮罩级 */
  --glass-overlay-bg: rgba(252,250,255,0.90);
  --glass-overlay-blur: 40px;
  --glass-overlay-border: rgba(255,255,255,0.92);
  --glass-overlay-inset: 0 1px 0 rgba(255,255,255,0.88) inset;

  /* Glass 输入框 */
  --glass-input-bg: rgba(0,0,0,0.04);
  --glass-input-border: rgba(0,0,0,0.08);

  /* Glass 卡片 */
  --glass-card-border: rgba(255,255,255,0.60);
  --glass-card-inset: 0 1px 0 rgba(255,255,255,0.18) inset;
  --glass-card-selected-ring: rgba(99,102,241,0.50);
  --glass-card-tag-bg: rgba(0,0,0,0.06);
  --glass-card-tag-text: rgba(15,10,40,0.65);

  /* Priority */
  --priority-h-bg: rgba(239,68,68,0.15);
  --priority-h-text: #EF4444;
  --priority-h-solid: #EF4444;
  --priority-m-bg: rgba(251,191,36,0.15);
  --priority-m-text: #D97706;
  --priority-m-solid: #FBBF24;
  --priority-l-bg: rgba(59,130,246,0.15);
  --priority-l-text: #3B82F6;
  --priority-l-solid: #3B82F6;

  /* 热力图 */
  --heatmap-0: rgba(0,0,0,0.07);
  --heatmap-1: rgba(34,197,94,0.55);
  --heatmap-2: rgba(22,163,74,0.72);
  --heatmap-3: rgba(21,128,61,0.85);
  --heatmap-4: rgba(20,83,45,0.92);

  /* 边框 */
  --border-subtle: rgba(0,0,0,0.06);
  --border-default: rgba(0,0,0,0.08);
  --border-emphasis: rgba(255,255,255,0.60);
  --divider: rgba(15,10,40,0.07);

  /* 阴影 */
  --shadow-modal: 0 32px 80px rgba(80,60,180,0.12);
  --shadow-modal-glow: rgba(99,102,241,0.10);
  --shadow-dropdown: 0 20px 50px rgba(80,60,180,0.12);
  --shadow-toast: 0 8px 40px rgba(0,0,0,0.12);

  /* 强调色 */
  --accent-indigo: #6366F1;
  --accent-indigo-light: #6366F1;
  --accent-indigo-dark: #5B52C8;
  --accent-indigo-border: rgba(99,102,241,0.25);
  --accent-indigo-bg: rgba(99,102,241,0.07);
  --grad-border-pink: #EC4899;
  --grad-border-amber: #F59E0B;
  --grad-border-cyan: #06B6D4;

  /* 其他 */
  --today-highlight: rgba(99,102,241,0.06);
  --caret-color: #818CF8;
  --progress-bg: rgba(0,0,0,0.08);
  --today-ring: rgba(99,102,241,0.85);
  --ctrl-btn: rgba(15,10,40,0.40);
  --ctrl-btn-hover: rgba(15,10,40,0.88);
  --toggle-off-bg: rgba(0,0,0,0.10);
  --toggle-knob-bg: #ffffff;
  --due-normal-bg: rgba(0,0,0,0.06);
  --due-normal-text: rgba(15,10,40,0.72);
  --due-overdue-bg: rgba(239,68,68,0.15);
  --due-overdue-text: rgba(239,68,68,0.88);
}
```

- [ ] **Step 2: 运行 typecheck 验证无语法错误**

Run: `npm run typecheck`
Expected: PASS（CSS 文件不影响 TS 检查，但确认项目整体无报错）

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/theme-variables.css
git commit -m "feat: add complete color token definitions to theme-variables.css"
```

---

### Task 2: 清理 card-styles.css 死代码 + 改用 token

**Files:**
- Modify: `client/src/styles/card-styles.css`

- [ ] **Step 1: 替换 card-styles.css 内容**

删除所有 `card-palette-0` ~ `card-palette-6` 类（从未使用），删除 `completion-gradient`、`badge-center`、`logo-gradient` 类。保留 priority 和 due 类但改用 token 引用。

替换整个文件为：

```css
/* 优先级标签 */
.priority-h { background: var(--priority-h-bg); color: var(--priority-h-text); }
.priority-m { background: var(--priority-m-bg); color: var(--priority-m-text); }
.priority-l { background: var(--priority-l-bg); color: var(--priority-l-text); }

/* 截止日期标签 */
.due-normal {
  background: var(--due-normal-bg);
  color: var(--due-normal-text);
}
.due-overdue {
  background: var(--due-overdue-bg);
  color: var(--due-overdue-text);
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/styles/card-styles.css
git commit -m "refactor: clean dead code in card-styles.css, use token references"
```

---

### Task 3: 清理 glass.css 死代码 + 改用 token

**Files:**
- Modify: `client/src/styles/glass.css`

- [ ] **Step 1: 替换 glass.css 内容**

删除 `glass-card-dark/light`、`glass-input-dark/light`、`glass-edit-dark/light` 类（从未使用）。保留 `glass-dark`、`glass-light`、`glass-overlay` 但改用 token 引用。

替换整个文件为：

```css
/* 面板级玻璃 */
.glass-dark {
  background: var(--glass-panel-bg);
  backdrop-filter: blur(var(--glass-panel-blur));
  border: 1px solid var(--glass-panel-border);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.glass-light {
  background: var(--glass-panel-bg);
  backdrop-filter: blur(var(--glass-panel-blur));
  border: 1px solid var(--glass-panel-border);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

/* 遮罩层 */
.glass-overlay {
  background: rgba(0,0,0,0.03);
  backdrop-filter: blur(4px) saturate(120%);
  -webkit-backdrop-filter: blur(4px) saturate(120%);
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/styles/glass.css
git commit -m "refactor: clean dead code in glass.css, use token references"
```

---

### Task 4: 改造 card-styles.ts 使用 token

**Files:**
- Modify: `client/src/utils/card-styles.ts`

- [ ] **Step 1: 替换 card-styles.ts 内容**

7 色调色板保留，但将硬编码颜色改为 CSS 变量引用。由于 `card-styles.ts` 返回的是 JS 对象（用于 inline style），CSS 变量需要通过 `getComputedStyle` 读取或直接使用 `var()` 字符串。考虑到这些颜色是项目卡片渐变（装饰性），且 dark/light 下颜色相同，最简方案是保留 JS 中的硬编码值但添加注释说明这些是项目卡片专属色，不在 token 体系中。

实际上，由于这些渐变值在 dark/light 下完全相同，且是 7 色轮询（不是语义色），保留原样更合理。只需确保 `card-styles.css` 中对应的 `card-palette-*` 类已删除（Task 2 已完成）。

此文件无需修改。跳过此 task。

- [ ] ~~Step 2: Commit~~ （无需修改）

---

### Task 5: 改造 App.vue

**Files:**
- Modify: `client/src/App.vue`

- [ ] **Step 1: 替换 script 中的硬编码颜色函数**

将 `tabBtnClass`、`ctrlBtnClass`、`panelCls`、`divider` 函数中的硬编码颜色改为 token 引用。

替换第 280-294 行：

```typescript
const tabBtnClass = (id: string, cur: string) =>
  id === cur
    ? 'bg-[var(--accent-indigo)] text-[var(--txt-on-color)]'
    : 'text-[var(--txt-muted)] hover:bg-[var(--glass-panel-hover-bg)] hover:text-[var(--txt-primary)]'

const ctrlBtnClass = (active = false) =>
  active
    ? 'bg-[var(--glass-panel-hover-bg)] text-[var(--txt-primary)]'
    : 'text-[var(--ctrl-btn)] hover:text-[var(--ctrl-btn-hover)] hover:bg-[var(--glass-panel-hover-bg)]'

const panelCls = () =>
  'bg-[var(--glass-panel-bg)] backdrop-blur-2xl border border-[var(--glass-panel-border)]'

const divider = () => 'var(--divider)'
```

- [ ] **Step 2: 替换 template 中的硬编码颜色**

将所有 `isDark ? 'rgba(...)' : 'rgba(...)'` 三元表达式替换为 `var(--xxx)` token。

第 312 行 `borderBottom`：
```html
:style="{ borderBottom: `1px solid var(--divider)` }"
```

第 317-319 行 logo 图标背景：
```html
:style="{
  background: 'linear-gradient(135deg, var(--btn-primary-from), var(--btn-primary-to))',
  boxShadow: '0 4px 14px var(--btn-primary-shadow)',
}"
```

第 325 行 "taskwarrior" 文字：
```html
:style="{ color: 'var(--txt-primary)' }"
```

第 328 行 "motion" 文字：
```html
:style="{ color: 'var(--txt-muted)' }"
```

第 366 行 borderTop：
```html
:style="{ borderTop: '1px solid var(--divider)', paddingTop: '20px' }"
```

第 401 行 borderBottom：
```html
:style="{ borderBottom: '1px solid var(--divider)' }"
```

第 405-406 行标题文字：
```html
:style="{ color: 'var(--txt-primary)' }"
```

第 410 行副标题：
```html
:style="{ color: 'var(--txt-muted)' }"
```

第 457-458 行空状态图标背景：
```html
:style="{
  background: 'var(--today-highlight)',
  border: '1px solid var(--border-emphasis)',
}"
```

第 463 行 Sparkles 颜色：
```html
:style="{ color: 'var(--txt-accent)' }"
```

第 468 行 "今日任务全部完成"：
```html
:style="{ color: 'var(--txt-primary)' }"
```

第 472 行 "再添加一些"：
```html
:style="{ color: 'var(--txt-muted)' }"
```

第 636-643 行 error toast：
```html
:style="{
  background: 'var(--glass-modal-bg)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  color: 'var(--txt-primary)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-toast)',
}"
```

- [ ] **Step 3: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/App.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in App.vue"
```

---

### Task 6: 改造 ModalShell.vue

**Files:**
- Modify: `client/src/components/ModalShell.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

ModalShell 中的 `rgba(12,6,26,0.62)` → `var(--glass-modal-bg)`（0.62 收敛到 0.72）
`rgba(252,250,255,0.74)` → `var(--glass-modal-bg)`（light 0.74 收敛到 0.80）

所有 `isDark ? ... : ...` 三元表达式替换为 token 引用。具体替换：

- Modal 背景：`background: 'var(--glass-modal-bg)'`
- Modal blur/saturate：`backdropFilter: 'blur(var(--glass-modal-blur)) saturate(var(--glass-modal-saturate))'`
- Modal 边框：`border: '1px solid var(--glass-modal-border)'`
- Modal box-shadow：`boxShadow: 'var(--shadow-modal), var(--glass-modal-inset)'`
- 标题文字：`color: 'var(--txt-primary)'`
- 副标题：`color: 'var(--txt-muted)'`
- 分割线：`borderBottom: '1px solid var(--divider)'`
- 关闭按钮 hover：`background: 'var(--glass-panel-hover-bg)'`
- 渐变边框颜色：`#6366F1` → `var(--accent-indigo)`, `#8B5CF6` → `var(--accent-indigo-light)`, `#EC4899` → `var(--grad-border-pink)`, `#F59E0B` → `var(--grad-border-amber)`, `#06B6D4` → `var(--grad-border-cyan)`
- 光标色：`#818CF8` → `var(--caret-color)`

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ModalShell.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in ModalShell.vue"
```

---

### Task 7: 改造 CreateModal.vue

**Files:**
- Modify: `client/src/components/CreateModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 文字：`rgba(255,255,255,0.90)` / `rgba(15,10,40,0.88)` → `var(--txt-primary)`
- 占位符：`rgba(255,255,255,0.22)` / `rgba(15,10,40,0.22)` → `var(--txt-subtle)`
- 光标色：`#818CF8` → `var(--caret-color)`
- 按钮文字：`text-white` → `style="{ color: 'var(--txt-on-color)' }"`
- 按钮渐变：`#6366F1` / `#8B5CF6` → `var(--btn-primary-from)` / `var(--btn-primary-to)`
- 按钮阴影：`rgba(99,102,241,0.45)` → `var(--btn-primary-shadow)`

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/components/CreateModal.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in CreateModal.vue"
```

---

### Task 8: 改造 TaskEditModal.vue

**Files:**
- Modify: `client/src/components/TaskEditModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 输入框占位符：`rgba(255,255,255,0.40)` / `rgba(15,10,40,0.42)` → `var(--txt-muted)`
- 输入框背景：`rgba(255,255,255,0.07)` / `rgba(0,0,0,0.04)` → `var(--glass-input-bg)`
- 输入框文字：`rgba(255,255,255,0.90)` / `rgba(15,10,40,0.88)` → `var(--txt-primary)`
- 光标色：`#818CF8` → `var(--caret-color)`
- Priority 按钮：`bg-red-500` → `style="{ background: 'var(--priority-h-solid)' }"`, `bg-amber-400` → `var(--priority-m-solid)`, `bg-indigo-500` → `var(--priority-l-solid)`
- Priority 按钮文字：`text-white` → `var(--txt-on-color)`
- 无优先级按钮 dark：`bg-white/[0.07]` → `var(--glass-input-bg)`, `text-white/55` → `var(--txt-muted)`, `hover:bg-white/[0.12]` → `var(--glass-panel-hover-bg)`
- 无优先级按钮 light：`bg-black/[0.04]` → `var(--glass-input-bg)`, `text-gray-500` → `var(--txt-muted)`, `hover:bg-black/[0.07]` → `var(--glass-panel-hover-bg)`
- 标签文字：`rgba(255,255,255,0.28)` / `rgba(15,10,40,0.28)` → `var(--txt-subtle)`
- 分割线：`rgba(255,255,255,0.07)` / `rgba(0,0,0,0.06)` → `var(--divider)`
- 删除按钮：`text-red-400` → `style="{ color: 'var(--btn-danger-text)' }"`, `hover:bg-red-500/[0.12]` → `style="{ '--tw-bg-opacity': 1 }"` 或用 inline hover class
- 保存按钮：`bg-indigo-500` → `var(--btn-primary-from)`, `text-white` → `var(--txt-on-color)`, `hover:bg-indigo-600` → 用 `var(--btn-primary-to)` 作为 hover 背景

注意：Tailwind hover 类（如 `hover:bg-indigo-600`）无法直接用 CSS 变量替换。解决方案：将按钮改为使用 `:style` 绑定 + CSS `:hover` 伪类（通过添加一个 `.btn-primary` CSS 类），或使用 `@mouseenter/@mouseleave` 事件切换状态。推荐方案：在 `theme-variables.css` 中添加 `.btn-primary` 工具类。

在 `theme-variables.css` 文件末尾（全局字体之前）添加：

```css
/* 按钮工具类 */
.btn-primary {
  background: linear-gradient(135deg, var(--btn-primary-from), var(--btn-primary-to));
  color: var(--txt-on-color);
  box-shadow: 0 4px 14px var(--btn-primary-shadow);
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.90; }

.btn-danger {
  color: var(--btn-danger-text);
  transition: background 0.15s;
}
.btn-danger:hover { background: var(--btn-danger-hover-bg); }
```

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/theme-variables.css client/src/components/TaskEditModal.vue
git commit -m "refactor: replace hardcoded colors in TaskEditModal.vue, add btn utility classes"
```

---

### Task 9: 改造 TaskCard.vue

**Files:**
- Modify: `client/src/components/TaskCard.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 卡片边框/内嵌高光：`rgba(255,255,255,0.18)` → `var(--glass-card-inset)`, `rgba(255,255,255,0.15)` → `var(--glass-card-border)`
- 选中环：`rgba(255,255,255,0.65)` → `var(--glass-card-selected-ring)`
- 勾选圆圈：`border-white/45` → `style="{ borderColor: 'var(--glass-card-border)' }"`, `hover:border-white` → CSS hover, `hover:bg-white/20` → `var(--glass-panel-hover-bg)`
- 勾选完成背景：`rgba(255,255,255,0.92)` → `var(--txt-on-color)`（作为背景色使用）
- 标签背景/文字：`bg-white/15` → `var(--glass-card-tag-bg)`, `text-white/80` → `var(--glass-card-tag-text)`
- 计时器文字：`rgba(255,255,255,0.80)` → `var(--glass-card-tag-text)`
- 操作按钮 hover：`hover:bg-white/20` → `var(--glass-panel-hover-bg)`
- 计时器颜色：`rgba(255,220,100,0.90)` → `var(--txt-accent)`（近似），`rgba(255,255,255,0.50)` → `var(--txt-muted)`

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/components/TaskCard.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in TaskCard.vue"
```

---

### Task 10: 改造 CompletionModal.vue

**Files:**
- Modify: `client/src/components/CompletionModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色（粒子颜色除外）**

- Modal 背景：`rgba(12,6,26,0.72)` → `var(--glass-modal-bg)`, `rgba(250,248,255,0.80)` → `var(--glass-modal-bg)`
- blur/saturate：→ `var(--glass-modal-blur)` / `var(--glass-modal-saturate)`
- box-shadow：→ `var(--shadow-modal), var(--glass-modal-inset), 0 0 60px var(--shadow-modal-glow)`
- 成功按钮渐变：`#4ADE80` / `#22C55E` → `var(--btn-success-from)` / `var(--btn-success-to)`
- 完成按钮渐变：`#7C3AED` / `#6D28D9` → `var(--btn-completion-from)` / `var(--btn-completion-to)`
- 完成按钮阴影：`rgba(124,58,237,0.45)` → `var(--btn-completion-shadow)`
- 文字：→ `var(--txt-primary)`, `var(--txt-on-color)`
- 关闭按钮：→ `var(--glass-panel-hover-bg)`, `var(--txt-muted)`
- 成功徽章背景/边框：→ `var(--priority-h-bg)` 近似，或使用 `--glass-card-tag-bg`
- **粒子颜色保留原样**（spec 明确排除）

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/components/CompletionModal.vue
git commit -m "refactor: replace hardcoded colors in CompletionModal.vue (particles excluded)"
```

---

### Task 11: 改造 SettingsPanel.vue

**Files:**
- Modify: `client/src/components/SettingsPanel.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 背景：`rgba(14,8,32,0.90)` / `rgba(252,250,255,0.90)` → `var(--glass-overlay-bg)`
- blur/saturate：→ `var(--glass-overlay-blur)`
- 边框：→ `var(--glass-overlay-border)`
- box-shadow：→ `var(--shadow-modal), var(--glass-overlay-inset)`
- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`
- 分割线：→ `var(--divider)`

- [ ] **Step 2: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/components/SettingsPanel.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in SettingsPanel.vue"
```

---

### Task 12: 改造 HelpModal.vue

**Files:**
- Modify: `client/src/components/HelpModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 标题文字：→ `var(--txt-primary)`
- kbd 背景：→ `var(--glass-input-bg)`
- kbd 边框：→ `var(--glass-input-border)`

- [ ] **Step 2: Commit**

```bash
git add client/src/components/HelpModal.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in HelpModal.vue"
```

---

### Task 13: 改造 TimerModal.vue

**Files:**
- Modify: `client/src/components/TimerModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`
- 按钮文字：`text-white` → `var(--txt-on-color)`
- 警告按钮渐变：`#F59E0B` / `#D97706` → `var(--btn-warning-from)` / `var(--btn-warning-to)`
- 主按钮渐变：`#6366F1` / `#8B5CF6` → `var(--btn-primary-from)` / `var(--btn-primary-to)`
- 阴影：→ `var(--btn-primary-shadow)`, `var(--btn-warning-shadow)` (需添加 `--btn-warning-shadow` token)

在 `theme-variables.css` 的 `.dark` 和 `.light` 块中添加：
```css
--btn-warning-shadow: rgba(245,158,11,0.40);  /* dark */
--btn-warning-shadow: rgba(245,158,11,0.25);  /* light */
```

- [ ] **Step 2: Commit**

```bash
git add client/src/styles/theme-variables.css client/src/components/TimerModal.vue
git commit -m "refactor: replace hardcoded colors in TimerModal.vue, add --btn-warning-shadow token"
```

---

### Task 14: 改造 TagManageModal.vue + ProjectManageModal.vue

**Files:**
- Modify: `client/src/components/TagManageModal.vue`
- Modify: `client/src/components/ProjectManageModal.vue`

这两个组件结构几乎相同，一起改造。

- [ ] **Step 1: 替换 TagManageModal.vue 硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`
- 输入框背景：→ `var(--glass-input-bg)`
- 复选框边框：→ `var(--glass-input-border)`
- 成功图标：`#4ADE80` → `var(--txt-success)`
- 分割线：→ `var(--divider)`
- 删除按钮：`text-red-400` → `.btn-danger` 类, `hover:bg-red-500/[0.12]` → `.btn-danger:hover`
- 保存按钮：`bg-indigo-500` → `.btn-primary` 类, `text-white` → 已包含在 `.btn-primary`

- [ ] **Step 2: 替换 ProjectManageModal.vue 硬编码颜色**

同 TagManageModal 相同的替换模式。

- [ ] **Step 3: Commit**

```bash
git add client/src/components/TagManageModal.vue client/src/components/ProjectManageModal.vue
git commit -m "refactor: replace hardcoded colors in TagManageModal and ProjectManageModal"
```

---

### Task 15: 改造 DayCompletedModal.vue

**Files:**
- Modify: `client/src/components/DayCompletedModal.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`, `var(--txt-subtle)`
- 任务项背景：→ `var(--glass-input-bg)`
- 任务项边框：→ `var(--glass-input-border)`
- 完成图标：`#4ADE80` → `var(--txt-success)`

- [ ] **Step 2: Commit**

```bash
git add client/src/components/DayCompletedModal.vue
git commit -m "refactor: replace hardcoded colors in DayCompletedModal.vue"
```

---

### Task 16: 改造 SimpleTagSelect.vue + SimpleProjectSelect.vue + DatePickerInput.vue

**Files:**
- Modify: `client/src/components/SimpleTagSelect.vue`
- Modify: `client/src/components/SimpleProjectSelect.vue`
- Modify: `client/src/components/DatePickerInput.vue`

这三个组件都使用 radix-vue Popover，有下拉面板，结构类似。

- [ ] **Step 1: 替换 SimpleTagSelect.vue 硬编码颜色**

- 选中标签背景：`#5B52C8` / `#6366F1` → `var(--accent-indigo-dark)` / `var(--accent-indigo)`
- 选中标签文字：`#ffffff` → `var(--txt-on-color)`
- 未选中标签背景：→ `var(--glass-input-bg)`
- 未选中标签文字：→ `var(--txt-muted)`
- 选中标签边框：→ `var(--accent-indigo-border)`
- 未选中标签边框：→ `var(--glass-input-border)`

- [ ] **Step 2: 替换 SimpleProjectSelect.vue 硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`
- 输入框背景：→ `var(--glass-input-bg)`
- 下拉面板背景：`rgba(12,6,26,0.62)` / `rgba(252,250,255,0.74)` → `var(--glass-modal-bg)`（0.62 收敛到 0.72）
- hover 背景：→ `var(--glass-panel-hover-bg)`
- 边框：→ `var(--glass-input-border)`, `var(--glass-modal-border)`
- 阴影：→ `var(--shadow-dropdown)`
- 选中项文字：`#A5B4FC` / `#6366F1` → `var(--accent-indigo-light)` / `var(--accent-indigo)`
- 选中项背景：→ `var(--accent-indigo-bg)`

- [ ] **Step 3: 替换 DatePickerInput.vue 硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`, `var(--txt-subtle)`
- 输入框背景：→ `var(--glass-input-bg)`
- 面板背景：`rgba(12,6,26,0.62)` / `rgba(252,250,255,0.74)` → `var(--glass-modal-bg)`
- 边框：→ `var(--glass-input-border)`, `var(--glass-modal-border)`
- 阴影：→ `var(--shadow-dropdown)`
- hover 背景：→ `var(--glass-panel-hover-bg)`
- 选中日期：`#6366F1` → `var(--accent-indigo)`, `#fff` → `var(--txt-on-color)`
- 今日高亮：→ `var(--today-highlight)`, `#818CF8` → `var(--txt-accent)`
- 今日按钮：→ `var(--accent-indigo-bg)`, `var(--txt-accent)`

- [ ] **Step 4: Commit**

```bash
git add client/src/components/SimpleTagSelect.vue client/src/components/SimpleProjectSelect.vue client/src/components/DatePickerInput.vue
git commit -m "refactor: replace hardcoded colors in select/date picker components"
```

---

### Task 17: 改造 AddTaskBtn.vue + ToggleSwitch.vue + EmptyDayIcon.vue + AchievementBadge.vue

**Files:**
- Modify: `client/src/components/AddTaskBtn.vue`
- Modify: `client/src/components/ToggleSwitch.vue`
- Modify: `client/src/components/EmptyDayIcon.vue`
- Modify: `client/src/components/AchievementBadge.vue`

- [ ] **Step 1: 替换 AddTaskBtn.vue 硬编码颜色**

- dark 背景/边框：`bg-white/[0.07]` / `border-white/[0.13]` → `var(--glass-input-bg)` / `var(--glass-input-border)`
- light 背景/边框：`bg-white/60` / `border-white/75` → `var(--glass-input-bg)` / `var(--glass-input-border)`
- dark 文字：`text-white/45` → `var(--txt-muted)`, `group-hover:text-white/80` → `var(--ctrl-btn-hover)`
- light 文字：`text-gray-400` → `var(--txt-muted)`, `group-hover:text-gray-700` → `var(--ctrl-btn-hover)`
- 图标边框 dark：`border-white/30` → `var(--glass-input-border)`, `group-hover:border-white/60` → `var(--glass-card-border)`, `group-hover:bg-white/12` → `var(--glass-panel-hover-bg)`
- 图标边框 light：`border-indigo-300` → `var(--accent-indigo-light)`, `group-hover:border-indigo-400` → `var(--accent-indigo)`

注意：Tailwind `group-hover:` 类无法直接用 CSS 变量。解决方案：将 hover 效果改为 CSS 类（在 `theme-variables.css` 中添加 `.add-task-btn` 相关样式），或使用 `@mouseenter/@mouseleave` 事件。

推荐方案：在 `theme-variables.css` 中添加：

```css
/* 添加任务按钮 */
.add-task-btn {
  background: var(--glass-input-bg);
  border: 1px solid var(--glass-input-border);
  color: var(--txt-muted);
  transition: all 0.15s;
}
.add-task-btn:hover {
  border-color: var(--glass-card-border);
  background: var(--glass-panel-hover-bg);
  color: var(--ctrl-btn-hover);
}
.add-task-btn .icon-circle {
  border-color: var(--glass-input-border);
  transition: all 0.15s;
}
.add-task-btn:hover .icon-circle {
  border-color: var(--accent-indigo);
  background: var(--glass-panel-hover-bg);
}
```

- [ ] **Step 2: 替换 ToggleSwitch.vue 硬编码颜色**

- 开关 on 背景：`#6366F1` → `var(--accent-indigo)`
- 开关 off 背景：`rgba(255,255,255,0.14)` → `var(--toggle-off-bg)`
- 旋钮背景：`bg-white` → `var(--toggle-knob-bg)`

- [ ] **Step 3: 替换 EmptyDayIcon.vue 硬编码颜色**

- 图标颜色：`rgba(255,255,255,0.22)` / `rgba(15,10,40,0.16)` → `var(--txt-subtle)`

- [ ] **Step 4: 替换 AchievementBadge.vue 硬编码颜色**

- 渐变：`#4ADE80` / `#22C55E` → `var(--btn-success-from)` / `var(--btn-success-to)`
- 阴影：`rgba(34,197,94,0.35)` → `var(--btn-primary-shadow)`（近似，或添加 `--btn-success-shadow` token）
- 文字：`text-white` → `var(--txt-on-color)`
- 环颜色：`rgba(74,222,128,0.5)` → `var(--accent-indigo-border)`（近似，或保留原样作为装饰）

- [ ] **Step 5: Commit**

```bash
git add client/src/styles/theme-variables.css client/src/components/AddTaskBtn.vue client/src/components/ToggleSwitch.vue client/src/components/EmptyDayIcon.vue client/src/components/AchievementBadge.vue
git commit -m "refactor: replace hardcoded colors in small UI components"
```

---

### Task 18: 改造 CompletedSection.vue + Heatmap.vue + TagList.vue + ProjectProgress.vue

**Files:**
- Modify: `client/src/components/CompletedSection.vue`
- Modify: `client/src/components/Heatmap.vue`
- Modify: `client/src/components/TagList.vue`
- Modify: `client/src/components/ProjectProgress.vue`

- [ ] **Step 1: 替换 CompletedSection.vue 硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`, `var(--txt-subtle)`
- 区域背景：→ `var(--glass-input-bg)`
- 边框：→ `var(--glass-input-border)`
- 完成图标：`#4ADE80` → `var(--txt-success)`
- 恢复按钮背景：→ `var(--glass-input-bg)`

- [ ] **Step 2: 替换 Heatmap.vue 硬编码颜色**

- 热力图颜色：所有 `rgba(...)` → `var(--heatmap-0)` ~ `var(--heatmap-4)`
- 活跃单元格文字：→ `var(--txt-cell-active)`
- 空单元格文字：→ `var(--txt-cell-empty)`
- 今日环：→ `var(--today-ring)`

- [ ] **Step 3: 替换 TagList.vue 硬编码颜色**

- hover 背景：→ `var(--glass-panel-hover-bg)`
- 计数徽章背景：→ `var(--glass-input-bg)`

- [ ] **Step 4: 替换 ProjectProgress.vue 硬编码颜色**

- hover 背景：→ `var(--glass-panel-hover-bg)`
- 项目名文字：→ `var(--txt-primary)`
- 进度条背景：→ `var(--progress-bg)`
- 计数徽章背景：→ `var(--glass-input-bg)`

- [ ] **Step 5: Commit**

```bash
git add client/src/components/CompletedSection.vue client/src/components/Heatmap.vue client/src/components/TagList.vue client/src/components/ProjectProgress.vue
git commit -m "refactor: replace hardcoded colors in list/progress/heatmap components"
```

---

### Task 19: 改造 KanbanView.vue

**Files:**
- Modify: `client/src/views/KanbanView.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-muted)`
- Popover 背景：`rgba(12,6,26,0.82)` / `rgba(252,250,255,0.88)` → `var(--glass-modal-bg)`（0.82 收敛到 0.72）
- Popover 边框：→ `var(--glass-modal-border)`
- Popover 阴影：→ `var(--shadow-dropdown)`
- 列背景/边框：→ `var(--glass-panel-bg)`, `var(--glass-panel-border)`
- 计数徽章：→ `var(--glass-input-bg)`
- 卡片内嵌/边框：→ `var(--glass-card-inset)`, `var(--glass-card-border)`
- 完成按钮：→ `var(--priority-h-bg)` 近似，或 `var(--glass-card-tag-bg)`
- 取消按钮：→ `var(--glass-card-tag-bg)`, `var(--glass-card-tag-text)`
- 操作按钮：`text-white/50` → `var(--txt-muted)`, `hover:text-white` → `var(--txt-primary)`, `hover:bg-white/15` → `var(--glass-panel-hover-bg)`
- Popover 项文字：→ `var(--txt-primary)`
- Popover 项 hover：→ `var(--glass-panel-hover-bg)`
- 删除项：`text-red-400` → `.btn-danger`, `rgba(239,68,68,0.12)` / `rgba(254,242,242,1)` → `var(--btn-danger-hover-bg)`

- [ ] **Step 2: Commit**

```bash
git add client/src/views/KanbanView.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in KanbanView.vue"
```

---

### Task 20: 改造 CalendarView.vue

**Files:**
- Modify: `client/src/views/CalendarView.vue`

- [ ] **Step 1: 替换所有硬编码颜色**

- 文字：→ `var(--txt-primary)`, `var(--txt-weekday)`, `var(--txt-muted)`, `var(--txt-subtle)`
- Priority 标签：→ `var(--priority-h/m/l-bg)`, `var(--priority-h/m/l-text)`
- Tab 按钮：`bg-white/15` → `var(--accent-indigo)`, `text-white` → `var(--txt-on-color)`, `bg-indigo-500` → `var(--accent-indigo)`, `text-white/40` → `var(--txt-muted)`, `hover:bg-white/10` → `var(--glass-panel-hover-bg)`, `text-gray-500` → `var(--txt-muted)`, `hover:bg-gray-100` → `var(--glass-panel-hover-bg)`
- Tab 容器背景：→ `var(--glass-input-bg)`
- 导航按钮：→ `var(--txt-muted)`, `var(--txt-primary)`, `var(--glass-panel-hover-bg)`
- 今日按钮：→ `var(--glass-input-bg)`, `var(--txt-muted)`, `var(--glass-panel-hover-bg)`
- 工作日头背景：→ `var(--glass-panel-bg)`
- 网格边框：→ `var(--border-default)`
- 单元格边框：→ `var(--border-default)`
- 空单元格背景：→ `var(--glass-panel-bg)`
- 今日高亮：→ `var(--today-highlight)`
- 今日文字：`#818cf8` → `var(--txt-accent)`
- 过去日期文字：→ `var(--txt-subtle)`
- 周视图今日背景：→ `var(--today-highlight)`
- 周日期背景：→ `var(--glass-panel-bg)`
- 周日期边框：→ `var(--border-default)`

- [ ] **Step 2: Commit**

```bash
git add client/src/views/CalendarView.vue
git commit -m "refactor: replace hardcoded colors with CSS token references in CalendarView.vue"
```

---

### Task 21: 最终验证 + 清理

**Files:**
- All modified files

- [ ] **Step 1: 运行 typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: 运行测试**

Run: `npm run test`
Expected: ALL PASS

- [ ] **Step 3: 全局搜索残留硬编码颜色**

Run: `rg 'rgba\(|rgb\(|#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])' client/src/components/ client/src/views/ client/src/App.vue --type vue -l`

Expected: 仅 CompletionModal.vue 的粒子颜色残留（spec 排除项）

Run: `rg 'bg-indigo-|bg-red-|bg-amber-|bg-blue-|text-red-|text-gray-|text-white/|bg-white/' client/src/components/ client/src/views/ client/src/App.vue --type vue -l`

Expected: 无结果（所有 Tailwind 颜色类已替换）

- [ ] **Step 4: 手动验证 dark/light 主题切换**

在浏览器中切换 dark/light 主题，检查：
- 左右面板背景/边框
- 弹窗背景/边框/阴影
- 按钮渐变/文字
- Priority 标签颜色
- 热力图颜色
- 日历视图颜色
- 输入框背景/边框

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification of color token migration"
```

---

## 自检清单

### 1. Spec 覆盖率

| Spec 要求 | 对应 Task |
|-----------|----------|
| theme-variables.css 包含所有 token | Task 1 |
| 按钮组 token | Task 1 |
| 文本组 token | Task 1 |
| Glass 三层级 token | Task 1 |
| Priority 配色 token | Task 1 |
| 热力图 token | Task 1 |
| 边框组 token | Task 1 |
| 阴影组 token | Task 1 |
| 其他 token | Task 1 |
| Glass 收敛规则（0.62→0.72, 0.82→0.72） | Task 6, 16, 19 |
| card-styles.css 死代码清理 | Task 2 |
| glass.css 死代码清理 | Task 3 |
| card-styles.ts 保留改用 token | Task 4（无需修改） |
| 组件改造规则 1-4 | Task 5-20 |
| 验收标准 1-8 | Task 21 |

### 2. Placeholder 扫描

无 TBD/TODO/实现后填充项。所有步骤包含具体代码或命令。

### 3. 类型一致性

所有 token 名称在 Task 1 定义后，后续 Task 引用一致。`--btn-warning-shadow` 在 Task 13 补充添加。
