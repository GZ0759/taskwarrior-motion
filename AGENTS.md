# 开发规范（Agent 必读）

> 当前工作在 `design/mockupv0.2/` 原型阶段，UI 以视觉效果优先，不受历史设计规范约束。

## 原则

1. 保持跨文件风格一致性
2. 使用 Tailwind CSS 和 inline style 混合实现
3. 兼容 dark/light 双主题
4. 动画使用 `motion/react` 库
5. 不引入新的 UI 库依赖

## 视觉规范

### 玻璃拟态卡片
- 半透明背景 + `backdrop-filter: blur(60px) saturate(200-240%)`
- 暗色背景：`rgba(12,6,26,0.62-0.72)`
- 亮色背景：`rgba(250-252,248-255,0.72-0.80)`

### 四边渐变流动边框
- 外层 `p-[1px]` + `grad-flow` 动画（12s 循环）
- 内层 `rounded-3xl overflow-hidden` 承载内容
- 渐变方向：`linear-gradient(135deg, ...)`

### 弹窗入场动画
- `spring` 动画，`stiffness: 265-380, damping: 22-28`

### 下拉菜单
- 使用 `@radix-ui/react-popover`（`Popover.Root / Trigger / Portal / Content`）
- 宽度匹配触发器：`var(--radix-popover-trigger-width)`
- 禁止手动 `position: fixed` + `getBoundingClientRect()`

### 配色模板
- 主要操作按钮：`#6366F1 → #8B5CF6` 紫渐变
- 高饱和强调：`#7C3AED → #6D28D9` 深紫渐变
- 完成/成功态：`#4ADE80 → #22C55E` 绿渐变

## 交互要求

1. 所有可点击元素必须添加 `cursor-pointer` 类，确保鼠标悬停时显示手型光标

## 开发工具

1. 语法检查使用 `npm run typecheck`（`tsc --noEmit`），无需 `npm run build`
