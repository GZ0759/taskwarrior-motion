# 交互优化 + 看板改造计划

> **目标**：在现有 v0.2 前端基础上优化三类交互体验：创建/编辑体系重构、任务列表交互改造、看板卡片与操作优化。
> **当前代码状态**：v0.2 迁移已完成，所有组件基于 Vue 3 + Tailwind v4 + motion-v + radix-vue
> **验证命令**：`npm run typecheck`、`npm run test`

---

## 改造范围

三个独立模块，按依赖顺序执行：

```
Module 1 (创建/编辑重构)  →  前置条件：无，改动文件最多
Module 2 (任务列表改造)  →  前置条件：Module 1（TaskEditModal 已就绪）
Module 3 (看板优化)      →  前置条件：Module 1（ModalShell 已就绪）

Module 2 和 Module 3 可并行
```

---

## Module 1：创建/编辑体系重构

### 概述

统一所有弹窗外壳为 ModalShell（渐变边框 + 可编辑标题），新增 CreateModal 统一任务/项目/标签的创建入口，三个编辑弹窗各自优化。

### 1.1 ModalShell.vue — 升级

**目标**：统一所有弹窗为渐变流动边框风格，新增可编辑标题功能。
**参考**：`design/mockupv0.2/src/app/App.tsx` 中的 `ModalShell`(286-319) + `AddTaskModal`(813-887) 的边框模式
**文件**：`client/src/components/ModalShell.vue`

**具体改动：**

1. **外层包裹渐变边框**（当前没有边框）

```diff
- <Motion class="relative z-10 w-full ..." :style="{ ...cardStyle(), maxHeight: '80vh' }">
+ <Motion class="relative z-10 w-full rounded-3xl grad-flow p-[1px]" ...>
+   <div class="rounded-3xl overflow-hidden" :style="{ ...cardStyle(), maxHeight: '80vh' }">
```

边框渐变：`linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899,#F59E0B,#06B6D4,#6366F1)`
内层 `cardStyle` 中去掉 `border` 属性（由外层边框替代）。

2. **新增 `editableTitle` prop**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `editableTitle` | `boolean` | `false` | 标题是否可点击编辑 |

当 `editableTitle = true` 时，标题区域显示为可点击状态：
- 点击标题 → 隐藏 `<h2>`，显示 `<input>`
- 输入按回车 → emit `update:title(newValue)`
- 输入按 Escape 或失焦 → 恢复原值
- 输入框样式与当前编辑弹窗输入一致

3. **新增 `update:title` emit**

```ts
(e: 'update:title', value: string): void
```

**验收**：
- `npm run typecheck` 通过
- ModalShell 渲染时有渐变流动边框
- `editableTitle=true` 时点击标题可重命名
- `editableTitle=false`（默认）时标题不可编辑

---

### 1.2 CreateModal.vue — 新建

**目标**：创建统一的新建弹窗，替代 AddTaskModal，支持三种 type。
**前置**：1.1（ModalShell 已升级）
**文件**：`client/src/components/CreateModal.vue`（新建）

**Props**：

```ts
type CreateType = 'task' | 'project' | 'tag'

defineProps<{
  type: CreateType
  isDark: boolean
}>()

defineEmits<{
  (e: 'create', value: string): void
  (e: 'close'): void
}>()
```

**实现要点：**

1. 使用 ModalShell，`title` 随 type 变化：

| type | title | placeholder | 创建按钮文字 |
|------|-------|------------|------------|
| `task` | 新建任务 | 今天要完成什么？ | 创建任务 |
| `project` | 新建项目 | 项目名称 | 创建项目 |
| `tag` | 新建标签 | 标签名称 | 创建标签 |

2. 输入框：大号 22px、无背景、`caretColor: #818CF8`、自动聚焦
3. 底部栏：⏎ 创建 / Esc 取消 提示 + 动态创建按钮（spring 动画出现）
4. 创建按钮样式：紫渐变 `#6366F1→#8B5CF6` + 紫色阴影
5. 回车提交 / Escape 关闭
6. 空输入直接回车 → 关闭弹窗，不创建

**验收**：
1. type=task 时输入描述回车 → emit `create(desc)`
2. type=project 时输入项目名回车 → emit `create(name)`
3. type=tag 时输入标签名回车 → emit `create(name)`
4. 输入文字后 "创建按钮" spring 出现
5. `npm run typecheck` 通过

---

### 1.3 删除 AddTaskModal.vue

**文件**：`client/src/components/AddTaskModal.vue`（删除）

被 CreateModal 替代，直接删除。同时确认 `App.vue` 中不再引用此组件。

---

### 1.4 TaskEditModal.vue — 优化

**目标**：描述输入框升级为 22px 大号，底部按钮简化为 [删除] [保存]。
**前置**：1.1（ModalShell 已升级）
**文件**：`client/src/components/TaskEditModal.vue`

**具体改动：**

1. **描述输入框**：字号从 `14px`（`text-sm`）改为 `22px`，背景透明，`caretColor: #818CF8`
2. **底部按钮区**（当前是三个按钮：取消 + 保存 + 删除）：

```diff
- [取消] [保存] [删除]
+ [删除(red)] [保存(indigo)]
```

- 删除按钮红色（`text-red-400 hover:bg-red-500/[0.12]`）
- 保存按钮 indigo（`bg-indigo-500 text-white`）
- 取消功能由 ModalShell 的 X 关闭按钮提供

3. 其他字段（优先级/日期/项目/标签）布局不变

**验收**：
1. 描述输入框 22px 大号样式
2. 底部只有 [删除] [保存] 两个按钮
3. 删除确认由弹窗直接删除（不再需要确认弹窗）
4. `npm run typecheck` 通过

---

### 1.5 ProjectManageModal.vue — 优化

**目标**：标题可编辑、移除顶部操作按钮、移除底部创建输入、底部 [删除] [确定]。
**前置**：1.1（ModalShell 已升级）
**文件**：`client/src/components/ProjectManageModal.vue`

**具体改动：**

1. **ModalShell 使用 `editableTitle`**
   - `editableTitle` 设为 `true`
   - `@update:title` → emit `rename(old, new)`
   - 标题起始值：当前项目名

2. **移除顶部操作按钮区**
   - 删除重命名/删除操作按钮（由可编辑标题 + 底部按钮替代）

3. **移除底部"新建项目名"输入**
   - 这个功能移到 CreateModal(type=project)

4. **底部操作按钮**（当前底部只有新建输入，无操作按钮）

```diff
- <div class="flex gap-2 pt-1">
-   <input placeholder="新建项目名…" ... />
-   <button><Plus/></button>
- </div>
+ <div class="flex gap-2 pt-2" style="borderTop: separator">
+   [删除(red)] [确定(indigo)]
+ </div>
```

5. **删除确认逻辑**
   - 点击删除 → 弹窗直接删除（不再需要内联确认区）
   - 删除逻辑确认后 emit `delete(name)` + `close`

**验收**：
1. 点击标题 → 变为输入框 → 回车重命名
2. 进度条、待办列表、已完成列表保留
3. 底部只有 [删除] [确定] 两个按钮
4. 删除直接操作，不需要二次确认（或保留内联确认？看情况）

---

### 1.6 TagManageModal.vue — 优化

**目标**：标题可编辑、移除顶部操作按钮、底部 [删除] [确定]。
**前置**：1.1（ModalShell 已升级）
**文件**：`client/src/components/TagManageModal.vue`

**改动：** 同 1.5，但不涉及进度条和新建输入（标签原本就没有）。

**验收**：
1. 点击标题 → 变为输入框 → 回车重命名
2. 底部只有 [删除] [确定] 两个按钮
3. 待办列表、已完成列表保留

---

### 1.7 stores/task.ts — 新增本地数据

**目标**：新增 `localProjects` / `localTags` 用于前端暂存尚未关联任务的创建数据。
**文件**：`client/src/stores/task.ts`

**新增状态：**

```ts
const localProjects = ref<string[]>([])
const localTags = ref<string[]>([])
```

**新增方法：**

```ts
function addProject(name: string) {
  if (!localProjects.value.includes(name) && !tasks.value.some(t => t.project === name)) {
    localProjects.value.push(name)
  }
}

function addTag(name: string) {
  if (!localTags.value.includes(name) && !tasks.value.some(t => t.tags?.includes(name))) {
    localTags.value.push(name)
  }
}
```

**computed：**

```ts
const allProjects = computed(() => {
  const fromTasks = new Set<string>()
  tasks.value.forEach(t => { if (t.project) fromTasks.add(t.project) })
  localProjects.value.forEach(p => fromTasks.add(p))
  return Array.from(fromTasks)
})

const allTags = computed(() => {
  const fromTasks = new Set<string>()
  tasks.value.forEach(t => t.tags?.forEach(tag => fromTasks.add(tag)))
  localTags.value.forEach(t => fromTasks.add(t))
  return Array.from(fromTasks)
})
```

**验收**：`npm run typecheck` 通过，新增 `localProjects`/`localTags` 不影响现有代码。

---

### 1.8 App.vue — 集成 CreateModal + 左侧 [+] 按钮

**目标**：集成 CreateModal，左侧 tab 区添加创建按钮。
**前置**：1.2 + 1.7
**文件**：`client/src/App.vue`

**改动：**

1. **删除 `AddTaskModal` 引用**，改为 `CreateModal`
2. **新增 `creatingType` 状态**（`'task' | 'project' | 'tag' | null`）
3. **左侧 tab 区加 [+] 按钮**

当前：
```
[ 项目进度 ] [ 标签 ]
```

改为：
```
[ 项目进度 ] [ 标签 ]   [+]
```

- 项目 tab 激活 → 点击 [+] → `creatingType = 'project'`
- 标签 tab 激活 → 点击 [+] → `creatingType = 'tag'`
- 事项视图的 AddTaskBtn → `creatingType = 'task'`

4. **CreateModal 事件处理**

```ts
function handleCreate(value: string) {
  if (creatingType.value === 'task') {
    store.addTask({ description: value })
  } else if (creatingType.value === 'project') {
    store.addProject(value)
  } else if (creatingType.value === 'tag') {
    store.addTag(value)
  }
}
```

**验收**：
1. 左侧 tab 旁显示 [+] 按钮
2. 点击 [+] → 弹出对应 type 的 CreateModal
3. 创建后数据出现在对应列表
4. `npm run typecheck` 通过

---

## Module 2：任务列表交互改造

### 2.1 TaskCard.vue — 一行布局 + 点击空白编辑

**目标**：TaskCard 从两行改一行，点击卡片空白区域打开编辑弹窗，移除 [▼] 按钮。
**前置**：Module 1（TaskEditModal 已优化）
**文件**：`client/src/components/TaskCard.vue`

**布局变化：**

当前（两行）：
```
第一行：[○] 描述文字                [明天]
第二行：[design][tokens] [紧急]  [00:30] [▶] [▼]
```

改为（一行）：
```
[○] 描述文字  [design]  [紧急]  明天  [00:30] [▶]
```

**具体改动：**

1. **合并两行为一行**：`flex items-center gap-3.5 px-4 py-3`
2. **描述**：`flex-1 truncate text-sm font-semibold text-white`
3. **标签**：最多显示 2 个，`text-[10px] px-2 py-0.5 rounded-lg`
4. **优先级 badge**：`text-[10px] px-2 py-0.5 rounded-lg`
5. **截止日期 badge**：`text-[10px] px-2 py-0.5 rounded-full`
6. **计时**：`text-[10px] font-mono`
7. **计时按钮**：[▶] / [■]
8. ~~删除 [▼] 按钮~~（原编辑按钮）

9. **点击空白区域打开编辑**

```
卡片整体 @click="openEdit"，但：
- 完成按钮 ○ 加 @click.stop
- 计时按钮 ▶ 加 @click.stop
```

10. **选中状态高亮**：保留 `selected` prop 的白色边框效果

**验收**：
1. 一行布局显示所有信息
2. 标签最多显示 2 个，超出显示 "+N"
3. 点击卡片空白区域 → 打开 TaskEditModal
4. 点击完成按钮 → shake → check → complete
5. 点击计时按钮 → 打开 TimerModal
6. `npm run typecheck` 通过

---

### 2.2 TimerModal.vue — 新建

**目标**：点击计时按钮时弹出计时面板，而非直接开始计时。
**前置**：1.1（ModalShell）
**文件**：`client/src/components/TimerModal.vue`（新建）

**Props**：

```ts
defineProps<{
  task: Task
  isDark: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'start', uuid: string): void
  (e: 'stop', uuid: string): void
}>()
```

**布局：**

```
ModalShell(title=任务描述)
├── 大号计时器 00:32:15（fontSize: 48px, font-mono, font-black）
├── 当前状态："计时中" / "未开始"
└── [开始] / [暂停] 按钮（全宽，紫渐变）
```

**实现要点：**

1. 使用 ModalShell，title 为任务描述（截断）
2. 大号计时器居中显示，`tabular-nums`
3. 使用 `useTimeTracking` composable 的 `formattedTime` 显示
4. 根据任务是否正在计时（`activeTask.uuid === task.uuid`）显示不同状态
5. 按钮点击：emit `start` / `stop`，modal 不关闭（用户手动关闭）
6. 点击 X 关闭

**验收**：
1. 点击 TaskCard 的计时按钮 → 弹出 TimerModal
2. 显示大号计时器
3. 点击开始 → 计时开始 → 按钮变为暂停
4. 点击 X 关闭，计时继续（后台运行）
5. `npm run typecheck` 通过

---

### 2.3 App.vue — 集成 TimerModal

**目标**：TimerModal 触发和状态管理。
**前置**：2.1 + 2.2
**文件**：`client/src/App.vue`

**改动：**

1. 新增 `timerTask` 状态（`Task | null`）
2. TaskCard 的计时点击事件改为 `timerTask = task` 而不是直接切换计时
3. 渲染 `<TimerModal v-if="timerTask" ... />`
4. 计时相关事件处理

**验收**：点击计时按钮 → 弹出 TimerModal，功能正常。

---

## Module 3：看板优化

### 3.1 KanbanView.vue — 重写

**目标**：卡片玻璃拟态化、操作收敛到 Popover、列宽自适应。
**前置**：1.1（ModalShell 弹窗体系）+ Popover（radix-vue 已安装）
**文件**：`client/src/views/KanbanView.vue`

**具体改动：**

**1. 列宽自适应**

```diff
- style="width: 200px"
+ class="flex-1 min-w-[180px]"
```

**2. 卡片背景改为项目渐变色**

每个卡片使用 `getCardStyle(task.project, index)` 获取渐变色（同 TaskCard）：
```ts
const style = getCardStyle(t.project ?? '', idx)
```

样式应用：
```diff
- background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)',
+ background: style.gradient,
+ boxShadow: `0 5px 28px ${style.glow}, 0 1px 0 rgba(255,255,255,0.18) inset`,
+ border: '1px solid rgba(255,255,255,0.15)',
```

文字颜色改为白色（在渐变色卡片上可读）。

**3. 卡片操作简化**

卡片上只保留「完成/取消完成」按钮：
```html
<button v-if="!t.completed" @click="emit('complete', t.uuid, t.description)">完成</button>
<button v-else @click="emit('update', t.uuid, { status: 'pending' })">取消</button>
```

其他操作（移动到其他列、开始计时、编辑、删除）收敛到 Popover 中。

**4. 新增 ActionPopover**

使用 radix-vue 的 `PopoverRoot / PopoverTrigger / PopoverPortal / PopoverContent`。

卡片内：
```html
<PopoverRoot>
  <PopoverTrigger asChild>
    <button class="...">···</button>
  </PopoverTrigger>
  <PopoverPortal>
    <PopoverContent align="end">
      <!-- 操作列表，根据当前列和状态显示 -->
      <button v-if="canMoveToInbox">移动到 Inbox</button>
      <button v-if="canMoveToBacklog">移动到 Backlog</button>
      <button v-if="canStart">开始计时</button>
      <button v-if="canStop">停止计时</button>
      <button @click="emit('edit', t)">编辑</button>
      <button @click="handleDelete(t.uuid)">删除</button>
    </PopoverContent>
  </PopoverPortal>
</PopoverRoot>
```

Popover 样式：玻璃拟态（blur 32px, saturate 200%），宽 160px。

**5. 列头样式**

保留当前：列名 + 计数 badge。

**验收**：
1. 5列自适应撑满右侧面板宽度
2. 卡片使用项目渐变色，文字白色
3. 卡片上只有「完成」按钮 + 「···」更多按钮
4. 点击「···」弹出 Popover，显示可用操作
5. 拖动/移动列功能通过 Popover 中的菜单项完成
6. `npm run typecheck` 通过

---

## 依赖图

```
Module 1：
  1.1 ModalShell 升级
    ├── 1.2 CreateModal 新建
    ├── 1.3 删除 AddTaskModal
    ├── 1.4 TaskEditModal 优化
    ├── 1.5 ProjectManageModal 优化
    ├── 1.6 TagManageModal 优化
    ├── 1.7 Store 新增
    └── 1.8 App.vue 集成 ← 依赖 1.2 + 1.7

Module 2：
  2.1 TaskCard 一行布局 ← 依赖 Module 1（TaskEditModal 已就绪）
  2.2 TimerModal 新建
  2.3 App.vue 集成 ← 依赖 2.1 + 2.2

Module 3：
  3.1 KanbanView 重写 ← 依赖 Module 1（ModalShell 已就绪）
```

---

## 验收标准（总）

1. **`npm run typecheck` 通过** — 无类型错误
2. **`npm run test` 通过** — 测试不破坏
3. **创建任务** — AddTaskBtn → CreateModal(type=task) → 创建 → 出现在列表
4. **创建项目** — 左侧 [+] → CreateModal(type=project) → 创建 → 出现在项目列表
5. **创建标签** — 左侧 [+] → CreateModal(type=tag) → 创建 → 出现在标签列表
6. **编辑任务** — 点击卡片空白 → TaskEditModal → 修改保存
7. **编辑项目** — 点击项目 → 标题可编辑 → 重命名
8. **编辑标签** — 点击标签 → 标题可编辑 → 重命名
9. **计时** — 点击计时按钮 → TimerModal → 开始/暂停
10. **看板** — 5列自适应、卡片渐变玻璃、操作 Popover
11. **删除旧文件** — `AddTaskModal.vue` 已删除，`App.vue` 无引用

---

## 更新日志

- 2026-06-28：创建交互优化 + 看板改造计划（3个 Module，13个子任务）
