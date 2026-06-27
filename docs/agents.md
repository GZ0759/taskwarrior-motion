# 设计规范（Agent 必读）

> 所有 UI 改动必须遵守此规范。参考 `docs/design-tokens.md` 获取精确数值。

---

## 核心原则

1. **玻璃拟态**：所有面板、卡片、弹窗必须使用半透明背景 + backdrop-blur
2. **Mesh 渐变背景**：页面背景使用多层 radial-gradient
3. **深色/浅色双主题**：所有颜色必须同时适配 dark/light 模式
4. **大圆角**：面板 24px（rounded-3xl），卡片 16px（rounded-2xl），按钮 12px（rounded-xl）

---

## 颜色规范

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
