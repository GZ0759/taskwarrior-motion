# 开发规范（Agent 必读）

> 当前工作在 `design/mockupv0.2/` 原型阶段，UI 以视觉效果优先，不受历史设计规范约束。

## 开发工作流

1. 新需求必须先 **brainstorming** 澄清，再 **writing-plans** 出唯一 plan
2. 同一功能只维护一个 plan，需求变更时更新它，不新建
3. 执行用 **executing-plans** 或 **subagent-driven-development**
4. 完成后必须 **verification-before-completion**

## 原则

1. 保持跨文件风格一致性
2. 使用 Tailwind CSS 和 inline style 混合实现
3. 兼容 dark/light 双主题
4. 动画使用 `motion/react` 库
5. 不引入新的 UI 库依赖
6. 所有颜色必须使用 CSS 变量 token（`var(--xxx)`），禁止硬编码色值

## 视觉规范

### 颜色 Token 体系
- 所有颜色定义在 `client/src/styles/theme-variables.css`
- 组件只引用 `var(--xxx)` token，不硬编码 hex/rgba
- dark/light 通过 `[data-theme]` 选择器切换 token 值
- Token 命名：`--{类别}-{语义}[-{状态}]`（如 `--btn-primary-from`、`--txt-muted`、`--glass-modal-bg`）
- 修改颜色只需改 token 文件，全局生效

### Glass 三层级
- Panel 级（`--glass-panel-*`）：左右面板、看板列，dark 0.07 / light 0.55
- Modal 级（`--glass-modal-*`）：弹窗、下拉菜单，dark 0.72 / light 0.80
- Overlay 级（`--glass-overlay-*`）：设置面板、全屏遮罩，dark 0.90 / light 0.90

### Priority 配色
- H 高：红色系（`--priority-h-*`）
- M 中：琥珀色系（`--priority-m-*`）
- L 低：蓝色系（`--priority-l-*`）

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

## 交互要求

1. 所有可点击元素必须添加 `cursor-pointer` 类，确保鼠标悬停时显示手型光标

## 开发工具

1. 语法检查使用 `npm run typecheck`（`tsc --noEmit`），无需 `npm run build`
