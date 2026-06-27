# 设计稿功能与实现分析

> 基于 `design/mockup/src/app/App.tsx` 完整梳理，评估 Vue 3 实现可行性。

---

## 一、视觉设计

### 1.1 全局背景 — Mesh 渐变 ✅ 无难度

| 模式 | 实现 |
|------|------|
| Dark | 5 层 radial-gradient 叠加底色 `#060010` |
| Light | 5 层 radial-gradient 叠加底色 `#EBE8FF` |

**Vue 实现**：CSS `background` 属性，通过 class 切换。纯 CSS，无框架依赖。

---

### 1.2 玻璃拟态面板 ✅ 无难度

- `backdrop-filter: blur(24px)` + 半透明背景 + 细边框
- Dark: `rgba(255,255,255,0.07)` + `border rgba(255,255,255,0.13)`
- Light: `rgba(255,255,255,0.55)` + `border rgba(255,255,255,0.80)`

**Vue 实现**：Tailwind `backdrop-blur-2xl` + 自定义 CSS 变量。

---

### 1.3 项目色彩卡片 ✅ 无难度

每个项目有独立的渐变色、辉光色、强调色，未匹配项目走 fallback 轮询。

**Vue 实现**：`getCardStyle(project, index)` 函数返回样式对象，绑定到 `:style`。

---

### 1.4 热力图 ✅ 无难度

35 天 GitHub 风格热力图，7 列网格，今日圆环高亮。

**Vue 实现**：`v-for` 渲染 35 个格子，计算属性统计每日完成数。

---

### 1.5 完成弹窗 ⚠️ 中等难度

- 粒子爆炸（24 个圆点从中心扩散）
- 浮动星星（14 个 ✦ 随机闪烁）
- SVG 成就徽章（16 条 sunburst 射线 + 脉冲光环）
- spring 物理动画

**Vue 实现**：
- 粒子和星星：`v-for` + CSS `@keyframes` 或 `@vueuse/motion`
- SVG 徽章：直接移植 SVG 代码
- Spring 动画：`@vueuse/motion` 支持 spring，或用 CSS `cubic-bezier` 近似
- **唯一挑战**：spring 物理动画的精确参数匹配，可能需要微调

---

## 二、功能模块

### 2.1 任务卡片（TaskCard）✅ 完全可实现

| 功能 | 描述 | Vue 实现 |
|------|------|----------|
| 完成动画 | shake(0.5s) → check-pop(0.28s) → 淡出(0.33s) | CSS class 切换 + `setTimeout` 串联 |
| 项目着色 | 根据 project 名匹配渐变 | `computed` 返回样式对象 |
| 截止日期 | 显示"今天"/"明天"/"逾期X天"/"X天后" | `computed` 日期计算 |
| 逾期标红 | 逾期日期用红色背景 | 条件 `:style` |
| 优先级圆点 | H 红 / M 黄 / L 蓝 | 条件样式 |
| 展开/折叠 | 编辑区收起/展开动画 | `v-show` 或 `v-if` + Vue `<Transition>` |
| 保存/取消/取消 | 编辑后保存或回滚 | 本地 `ref` 暂存编辑状态 |

---

### 2.2 项目选择器（ProjectPicker）✅ 完全可实现

**功能清单**：

| 功能 | 描述 |
|------|------|
| 项目列表 | 显示所有可选项目，当前选中项高亮（白色背景） |
| 选择项目 | 点击切换选中项目（单选） |
| 无项目选项 | 第一项 "无项目"，清空项目 |
| 删除项目 | 每个项目右侧有 × 按钮，删除该项目（全局生效） |
| 添加项目 | 底部输入框，回车或点击 + 添加新项目 |

**Vue 实现**：

```vue
<!-- ProjectPicker.vue -->
<script setup lang="ts">
const props = defineProps<{
  value: string
  options: string[]
}>()
const emit = defineEmits<{
  (e: 'update:value', v: string): void
  (e: 'add', v: string): void
  (e: 'delete', v: string): void
}>()
const newVal = ref('')
function submit() {
  const v = newVal.value.trim()
  if (v && !props.options.includes(v)) emit('add', v)
  newVal.value = ''
}
</script>
```

- 列表渲染：`v-for` + 条件 class
- 选中状态：`props.value === opt` 判断
- 删除确认：不需要（设计稿直接删除，无确认弹窗）

---

### 2.3 标签选择器（TagPicker）✅ 完全可实现

**功能清单**：

| 功能 | 描述 |
|------|------|
| 标签列表 | 所有标签以按钮形式平铺，支持多选 |
| 切换选中 | 点击标签 toggle 选中/取消 |
| 选中样式 | 选中：白色背景 + 深色文字；未选中：半透明白色 |
| 删除标签 | 每个标签右侧有 × 按钮（选中时深色，未选中时浅色） |
| 添加标签 | 底部输入框，回车添加新标签并自动选中 |
| 滚动 | 标签列表 `max-h-24` 超出滚动 |

**Vue 实现**：

```vue
<!-- TagPicker.vue -->
<script setup lang="ts">
const props = defineProps<{
  selected: string[]
  options: string[]
}>()
const emit = defineEmits<{
  (e: 'update:selected', v: string[]): void
  (e: 'add', v: string): void
  (e: 'delete', v: string): void
}>()

function toggle(tag: string) {
  const next = props.selected.includes(tag)
    ? props.selected.filter(t => t !== tag)
    : [...props.selected, tag]
  emit('update:selected', next)
}
</script>
```

- 选中判断：`selected.includes(tag)`
- 标签按钮：两段式（文字 + 删除），`rounded-l-full` + `rounded-r-full`

---

### 2.4 添加任务（AddTask）✅ 完全可实现

| 状态 | 描述 |
|------|------|
| 未激活 | 玻璃按钮，+ 图标 + "添加任务" 文字 |
| 激活 | 玻璃输入框 + 取消/确认按钮，自动聚焦 |
| 提交 | 回车或点击确认，触发 `onAdd` + 播放音效 |
| 取消 | Escape 或点击取消，清空并收起 |

**Vue 实现**：`ref(false)` 控制激活状态，`v-if` 切换两个模板，`nextTick` 自动聚焦。

---

### 2.5 主题系统 ✅ 完全可实现

| 模式 | 行为 |
|------|------|
| light | 固定亮色 |
| dark | 固定暗色 |
| system | 跟随系统 `prefers-color-scheme`，监听 `change` 事件 |

循环切换：light → dark → system → light

**Vue 实现**：`useTheme` composable，`localStorage` 持久化，`matchMedia` 监听。

---

### 2.6 音效系统 ✅ 完全可实现

| 音效 | 触发 | 实现 |
|------|------|------|
| complete | 完成任务 | Web Audio API，523→1047Hz，0.32s |
| add | 添加任务 | Web Audio API，660Hz，0.10s |

**Vue 实现**：`useSound` composable，`AudioContext` + `OscillatorNode` 合成。无需音频文件。

---

### 2.7 完成弹窗（CompletionModal）✅ 可实现

| 元素 | 描述 |
|------|------|
| 遮罩 | 半透明黑 + blur，点击关闭 |
| 卡片 | 橙→粉渐变，spring 入场 |
| 粒子 | 24 个彩色圆点扩散消失 |
| 星星 | 14 个 ✦ 随机闪烁循环 |
| 徽章 | SVG sunburst + 中心圆形 + 脉冲 |
| 统计 | 今日完成数 + 累计完成数 |
| 按钮 | "继续加油" 关闭弹窗 |

**Vue 实现**：`v-if` 控制显示，`<Transition>` 做入场动画，`v-for` 渲染粒子和星星。

---

## 三、与现有 Vue 代码的差异

### 3.1 需要替换的组件

| 现有组件 | 替换为 | 原因 |
|----------|--------|------|
| `TaskItem.vue` | `TaskCard.vue` | 从行样式改为渐变卡片 |
| `TaskList.vue` | 直接在 `App.vue` 中 `v-for` | 新布局不再需要独立列表组件 |
| `TaskForm.vue` | `AddTask.vue` + 展开编辑 | 添加改为内联输入框，编辑改为卡片展开 |

### 3.2 需要保留的功能

| 功能 | 当前实现 | 保留方式 |
|------|----------|----------|
| API 调用 | `api/taskwarrior.ts` | 不变 |
| Pinia Store | `stores/task.ts` | 不变，增加 project/tag CRUD |
| 搜索过滤 | `App.vue` 搜索栏 | 适配到新布局 |
| 键盘快捷键 | `useKeyboard.ts` | 不变 |
| 时间追踪 | `useTimeTracking.ts` | 不变 |
| 看板/日历视图 | `KanbanView.vue` 等 | 暂保留，后续迭代 |

### 3.3 需要新增的功能

| 功能 | 说明 |
|------|------|
| ProjectPicker 组件 | 项目选择/添加/删除 |
| TagPicker 组件 | 标签多选/添加/删除 |
| Heatmap 组件 | 35 天热力图 |
| ProjectProgress 组件 | 项目进度条 |
| CompletionModal 组件 | 粒子完成弹窗 |
| AchievementBadge 组件 | SVG 成就徽章 |
| 项目/标签全局管理 | Pinia store 增加 project/tag 状态 |

---

## 四、技术风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| Spring 动画精度 | 🟡 低 | `@vueuse/motion` 的 spring 参数可能与 framer-motion 有微差 | 用 CSS `cubic-bezier` 近似，或微调参数 |
| 粒子性能 | 🟡 低 | 24 个 DOM 元素同时动画 | 用 CSS `transform` + `opacity`，避免 layout thrashing |
| backdrop-blur 兼容性 | 🟢 无 | 现代浏览器全部支持 | 无需处理 |
| 项目/标签 CRUD | 🟡 低 | 设计稿是本地 state，需要对接 taskwarrior 后端 | taskwarrior 支持 project/标签，API 层封装即可 |
| 看板/日历视图保留 | 🟡 低 | 新布局没有传统导航栏 | 需要设计视图切换入口（底部 tabs 或左侧面板按钮） |

---

## 五、结论

**所有功能均可在 Vue 3 中实现，无技术障碍。**

- 视觉层：纯 CSS/Tailwind，无框架限制
- 动画层：`@vueuse/motion` + CSS keyframes 覆盖所有场景
- 音效层：Web Audio API，与框架无关
- 组件层：React 的 `useState` → Vue 的 `ref/reactive`，一对一映射
- 状态层：Pinia store 扩展 project/tag 管理即可

**唯一需要额外设计的是**：看板/日历等视图在新布局下的入口位置（设计稿只有任务列表，没有多视图切换）。
