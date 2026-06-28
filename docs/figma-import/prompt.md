# taskwarrior-motion 设计稿

## 项目概述

taskwarrior-motion 是一个本地任务管理工具，技术栈：Vue 3 + Rust + Tailwind CSS。当前代码已实现完毕，需要基于实际实现更新 Figma 设计稿。

附件：
- `screens.md` — 所有页面的视觉描述（布局图 + 元素尺寸 + 颜色值）
- `design-tokens.md` — 精确视觉数值

## 整体布局

双栏布局，无 Header，全屏 Mesh 渐变背景。

```
┌────────────────────────────────────────────────────────────────────┐
│  Mesh 渐变背景（5层 radial-gradient）                               │
│                                                                    │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐   │
│  │ 左侧面板      │  │ 右侧面板                                  │   │
│  │ 310px 固定    │  │ flex-1 自适应                             │   │
│  │               │  │                                          │   │
│  │ ┌──────────┐ │  │ ┌──────────────────────────────────────┐│   │
│  │ │ Logo     │ │  │ │ 标题 + 副标题 + 事项/看板/日历 tab    ││   │
│  │ │ 音效/主题 │ │  │ └──────────────────────────────────────┘│   │
│  │ └──────────┘ │  │ ┌──────────────────────────────────────┐│   │
│  │ ┌──────────┐ │  │ │ 添加任务输入框                        ││   │
│  │ │ 热力图   │ │  │ ├──────────────────────────────────────┤│   │
│  │ │ 35天格子 │ │  │ │ 任务卡片 1                           ││   │
│  │ └──────────┘ │  │ │ 任务卡片 2                           ││   │
│  │ ──────────── │  │ │ ...                                  ││   │
│  │ ┌──────────┐ │  │ ├──────────────────────────────────────┤│   │
│  │ │项目进度  │ │  │ │ ▼ 已完成 (N)  ← 折叠区域             ││   │
│  │ │ /标签 tab│ │  │ │   已完成任务 1                       ││   │
│  │ └──────────┘ │  │ │   已完成任务 2                       ││   │
│  └──────────────┘  │ └──────────────────────────────────────┘│   │
│                    └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 左侧面板详细设计

### 1. Logo 区域（固定顶部）

- Logo 图标：`32×32px`，`rounded-xl`，渐变 `#7C3AED → #6366F1`，内含 Sparkles 图标
- 标题 "taskwarrior"：`13px`，`font-weight: 700`
- 副标题 "motion"：`10px`，`font-weight: 400`
- 右侧两个按钮：音效开关（Volume2/VolumeX）、主题切换（Sun/Moon/SunMoon 三态循环）
- 分隔线：`1px solid rgba(255,255,255,0.10)`（Dark）/ `rgba(0,0,0,0.07)`（Light）

### 2. 热力图（Heatmap）

**布局**：
- 顶部统计区：左侧大数字（今日完成数，`48px font-black`）+ 右侧累计完成数（`24px`）
- 鼓励文案：根据完成数动态变化（"今天还没开始，加油！" / "完成 3 项，状态很棒！" / ...）
- 星期标签：日一二三四五六，`10px font-bold`
- 7×5 网格：`gap: 6px`，格子 `aspect-square`，`rounded-xl`
- 底部图例：少 → 颜色条 → 多

**交互**：
- 有完成数的格子：`cursor-pointer`，hover 放大 `scale(1.1)`
- 点击弹出 DayCompletedModal（显示当日完成任务）
- 今日格子：外圈高亮圆环 `outline: 2.5px solid`
- 无完成数的格子：无交互

**热力图颜色**：

| 完成数 | Dark | Light |
|--------|------|-------|
| 0 | `rgba(255,255,255,0.09)` | `rgba(0,0,0,0.07)` |
| 1 | `rgba(74,222,128,0.55)` | `rgba(34,197,94,0.55)` |
| 2 | `rgba(34,197,94,0.75)` | `rgba(22,163,74,0.72)` |
| 3 | `rgba(22,163,74,0.88)` | `rgba(21,128,61,0.85)` |
| 4+ | `rgba(21,128,61,0.96)` | `rgba(20,83,45,0.92)` |

### 3. 项目进度 / 标签 tab 切换

**tab 按钮**：
- 选中态：Dark `bg-white/15 text-white`，Light `bg-indigo-500 text-white`
- 未选中态：Dark `text-white/40 hover:bg-white/10`，Light `text-gray-500 hover:bg-gray-100`
- 尺寸：`px-3 py-1.5 rounded-xl text-[11px] font-semibold`

**项目进度 tab 内容**：
- 标题 "项目进度"：`10px font-black uppercase tracking-widest`
- 每个项目一行：
  - 项目名（可点击，hover 有下划线）+ 完成/总数
  - 进度条：`h-1.5 rounded-full`，渐变色（使用项目配色）
  - 整行可点击，hover 背景高亮
- 点击项目名 → 打开 ProjectManageModal

**标签 tab 内容**：
- 标题 "标签"：`10px font-black uppercase tracking-widest`
- 前 8 个高频标签，每行：
  - 标签名 + 使用次数 badge
  - 整行可点击，hover 背景高亮
- 点击标签 → 打开 TagManageModal

---

## 右侧面板详细设计

### 1. 标题区域

- 标题：跟随 tab 变化（事项/看板/日历），`20px font-black`
- 副标题：动态统计
  - 事项：`X 项待完成`
  - 看板：`X 个待办 · Y 个进行中`
  - 日历：`今天 Z 个任务`
- 右侧：3 个 tab 按钮（事项/看板/日历），样式同左侧 tab

### 2. 添加任务输入框（AddTask）

**未激活状态**：
- 玻璃按钮：`backdrop-blur-xl`，`rounded-2xl`，`padding: 14px 16px`
- Dark：`bg-white/[0.07] border-white/[0.13]`
- Light：`bg-white/60 border-white/75`
- 左侧圆形图标（`24px`，`border: 2px`）+ "添加任务" 文字
- hover 时图标和文字变亮

**激活状态**：
- 变为输入框 + 取消/确认按钮
- Dark 额外：`ring-1 ring-white/18`
- Light 额外：`ring-1 ring-indigo-300/50`
- 回车提交，Escape 取消

### 3. 任务卡片（TaskCard）— 两行布局

```
┌─────────────────────────────────────────────────────────┐
│ [checkbox]  描述文本...                      [截止日期]  │  ← 第一行
│             [标签1] [标签2]  [紧急] [⏵ 05:23] [编辑]   │  ← 第二行
└─────────────────────────────────────────────────────────┘
```

**外层容器**：
- `rounded-2xl`，`backdrop-blur-xl`
- 背景：项目渐变色（见设计令牌第 3 节）
- 边框：`1px solid rgba(255,255,255,0.15)`
- 阴影：`0 5px 28px {project.glow}, 0 1px 0 rgba(255,255,255,0.18) inset`

**第一行**（`padding: 14px 16px 8px`）：
- checkbox：`24×24px` 圆形，`border: 2px solid rgba(255,255,255,0.45)`
  - hover：`border-color: white, background: rgba(255,255,255,0.20)`
  - 选中：`background: rgba(255,255,255,0.92)` + check 图标（项目强调色）
- 描述：`14px font-semibold text-white`，`flex-1`
- 截止日期 badge：`10px px-2 py-0.5 rounded-full font-semibold`
  - 正常：`bg rgba(255,255,255,0.17)`
  - 逾期：`bg rgba(239,68,68,0.45)`

**第二行**（`padding: 4px 16px 14px`）：
- 标签 pills：`10px px-2 py-0.5 rounded-lg bg-white/15 text-white/80`，最多显示 3 个，超出 `+N`
- 优先级 badge：`10px px-2 py-0.5 rounded-lg font-semibold`
  - H 紧急：红色系
  - M 普通：黄色系
  - L 低优：蓝色系
- 计时按钮：`p-1 rounded-lg`，Play/Pause 图标
- 计时器：`10px font-mono text-white/80`
- 编辑按钮：`p-1 rounded-lg`，ChevronDown 图标

**完成动画**：
1. shake（0.50s，左右晃动）
2. check-pop（0.28s，勾号弹出）
3. 卡片淡出（0.33s）
4. CompletionModal 弹出

### 4. 已完成折叠区域

**折叠头**：
- `rounded-2xl`，Dark `bg-white/[0.03]`，Light `bg-black/[0.02]`
- 左侧 "已完成 (N)"，右侧 ChevronDown 箭头
- 点击展开/折叠

**展开内容**：
- 每个已完成任务一行：
  - 左侧实心圆打勾（绿色）
  - 描述（中划线 + 半透明）
  - 完成日期
  - 右侧"取消完成"按钮
- 数据懒加载：点击展开时才请求 API

### 5. 看板视图

**5 列**：Inbox / Backlog / In Progress / On Hold / Done

**列样式**：
- `rounded-2xl`，Dark `bg-white/[0.05]`，Light `bg-white/[0.30]`
- 列头：标题 + 任务数 badge
- 列内容：`overflow-y-auto`，固定高度独立滚动

**卡片样式**：
- `rounded-xl`，Dark `bg-white/[0.07]`，Light `bg-white/[0.60]`
- 描述 + 优先级 badge + 项目名
- 操作按钮：开始（蓝）/ 完成（绿）/ 暂停（黄）/ 编辑（灰）
- 按钮 `cursor-pointer`，`rounded-lg`

**列逻辑**：
| 列 | 条件 |
|----|------|
| Inbox | 没有项目的待办任务 |
| Backlog | 有项目、未开始的待办任务 |
| In Progress | 已开始（`start` 字段）的待办任务 |
| On Hold | 有 `wait` 日期的待办任务 |
| Done | 已完成任务 |

### 6. 日历视图

**视图切换**：月 / 周 两个选项

**月视图**：
- 7×6 网格，星期头部 sticky 固定
- 格子 `min-h-[90px]`，今日高亮 `bg-indigo-500/10`
- 任务 chips 按优先级着色，最多显示 3 个，超出 `+N 更多`
- 点击任务 → 编辑弹窗

**周视图**：
- 7 列，每列 `min-h-[200px]`
- 今日高亮
- 导航：上/下周箭头 + "今天" 按钮

---

## 弹窗组件详细设计

### 1. CompletionModal（完成弹窗）

**触发**：完成任务后自动弹出

**布局**：
- 遮罩：`rgba(0,0,0,0.70)` + `blur(14px)`
- 卡片：`320px`，`rounded-3xl`
- 背景：`linear-gradient(158deg, #FFBA42 0%, #FF6B35 48%, #FF3D6B 100%)`
- 阴影：`0 32px 90px rgba(255,100,53,0.52)`

**内容**：
1. 粒子爆炸：24 个彩色圆点从中心扩散
2. 浮动星星：14 个 ✦ 随机闪烁
3. 成就徽章：SVG sunburst（16 条线）+ 中心圆形 + 脉冲光环
4. "太棒了！" 标题 + "任务已完成" 副标题
5. 完成的任务卡片（玻璃风格）
6. 统计：今日完成 + 累计完成（大数字）
7. "继续加油" 按钮（白色，橙色文字）

### 2. TaskEditModal（编辑弹窗）

**触发**：点击任务卡片的编辑按钮

**布局**：
- 遮罩：玻璃拟态
- 卡片：`max-w-md`，`rounded-3xl`，`max-h-[60vh]`
- Dark：`rgba(20,8,50,0.95)`
- Light：`rgba(255,255,255,0.95)`

**字段**：
1. 任务描述（只读展示）
2. 优先级：H/M/L 按钮组
3. 截止日期：date input
4. 暂停到：date input + 说明文字
5. 项目：ProjectPicker（下拉选择 + 输入添加）
6. 标签：TagPicker（多选 + 输入添加）

**底部按钮**：取消 / 保存 / 删除

### 3. DayCompletedModal（热力图点击弹窗）

**触发**：点击热力图有数据的格子

**布局**：
- `max-w-md`，`rounded-3xl`，`max-h-[70vh]`
- 头部：日期标题 + 完成数
- 列表：实心圆打勾 + 描述 + 项目 + 完成时间

### 4. ProjectManageModal（项目管理弹窗）

**触发**：点击左侧面板的项目名

**布局**：
- `max-w-lg`，`rounded-3xl`，`max-h-[80vh]`
- 头部：项目名（可编辑）+ 进度条 + 统计
- 操作：重命名 / 删除
- 任务列表：待办 + 已完成分组
- 底部：新建项目名

**删除确认**：覆盖层显示确认文字 + 取消/删除按钮

### 5. TagManageModal（标签管理弹窗）

**触发**：点击左侧面板的标签名

**布局**：
- 与 ProjectManageModal 类似
- 头部：标签名（可编辑）+ 任务数
- 操作：重命名 / 删除
- 任务列表：待办 + 已完成分组

### 6. HelpModal（帮助弹窗）

**触发**：按 `?` 键

**布局**：
- `max-w-sm`，`rounded-3xl`
- 标题 "键盘快捷键"
- 列表：功能描述 + kbd 快捷键

**快捷键列表**：
| 键 | 功能 |
|----|------|
| n | 新建任务 |
| j | 选择下一个 |
| k | 选择上一个 |
| Enter | 编辑选中任务 |
| x | 完成选中任务 |
| Escape | 关闭弹窗 |
| ? | 帮助 |
| Ctrl+Z | 撤销 |

---

## 后端 API（供设计师理解数据流）

### 任务 CRUD

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/tasks` | 获取所有任务 |
| POST | `/api/tasks` | 创建任务 |
| PUT | `/api/tasks/:uuid` | 更新任务 |
| DELETE | `/api/tasks/:uuid` | 删除任务 |

### 视图专用接口

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/tasks/pending` | 待办任务（事项/看板视图） |
| GET | `/api/tasks/completed?days=N` | 最近 N 天完成的任务 |
| GET | `/api/tasks/completed?date=YYYY-MM-DD` | 指定日期完成的任务（热力图点击） |
| GET | `/api/tasks/calendar` | 有截止日期的任务（日历视图） |
| GET | `/api/stats` | 统计数据（热力图 + 项目进度） |

### 状态操作

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/tasks/:uuid/done` | 完成任务 |
| POST | `/api/tasks/:uuid/uncomplete` | 取消完成 |
| POST | `/api/tasks/:uuid/start` | 开始计时 |
| POST | `/api/tasks/:uuid/stop` | 停止计时 |
| POST | `/api/undo` | 撤销 |

### 任务字段

```typescript
interface Task {
  uuid: string
  description: string
  status: 'pending' | 'completed' | 'deleted'
  project?: string        // 项目名
  tags?: string[]         // 标签列表
  priority?: 'H' | 'M' | 'L'  // 优先级
  due?: string            // 截止日期（YYYYMMDDTHHmmssZ）
  wait?: string           // 等待日期（暂停功能）
  start?: string          // 开始计时时间
  end?: string            // 完成时间
  entry: string           // 创建时间
  urgency: number         // 紧急度
}
```

### 统计数据结构

```typescript
interface Stats {
  heatmap: Record<string, number>      // { "2026-06-27": 5 }
  projects: Record<string, {           // { "Design System": { total: 10, done: 6 } }
    total: number
    done: number
  }>
  todayCount: number    // 今日完成数
  totalDone: number     // 累计完成数
  pendingCount: number  // 待办数
}
```

---

## 视觉规范速查

### 玻璃拟态

| 元素 | Dark | Light |
|------|------|-------|
| 面板背景 | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.55)` |
| 面板边框 | `rgba(255,255,255,0.13)` | `rgba(255,255,255,0.80)` |
| 卡片背景 | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.30)` |
| 卡片边框 | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.50)` |
| 模糊 | `backdrop-filter: blur(24px)` | 同左 |

### 文字颜色（CSS 变量）

| 变量 | Dark | Light |
|------|------|-------|
| `--txt-primary` | `rgba(255,255,255,0.90)` | `rgba(15,10,40,0.88)` |
| `--txt-muted` | `rgba(255,255,255,0.42)` | `rgba(15,10,40,0.46)` |
| `--txt-subtle` | `rgba(255,255,255,0.30)` | `rgba(15,10,40,0.30)` |

### 圆角

| 元素 | 值 |
|------|-----|
| 面板 | 24px |
| 卡片/弹窗 | 16px |
| 按钮 | 12px |
| 标签 pill | 9999px |
| checkbox | 50% |

### Mesh 渐变

- Dark 底色：`#060010`
- Light 底色：`#EBE8FF`
- 5 层 radial-gradient（紫/蓝/粉/青/橙）

### 项目配色

| 项目 | 渐变色 | 强调色 |
|------|--------|--------|
| Design System | 紫色 | `#C4B5FD` |
| API Migration | 蓝色 | `#7DD3FC` |
| Marketing | 粉色 | `#F9A8D4` |
| Q3 Planning | 橙色 | `#FCD34D` |

### 优先级颜色

| 优先级 | 颜色 | 文字 |
|--------|------|------|
| H 紧急 | 红色系 | "紧急" |
| M 普通 | 黄色系 | "普通" |
| L 低优 | 蓝色系 | "低优" |

---

## 输出要求

请生成以下 Figma frame（暗色 + 亮色各一套）：

1. **事项视图** — 待办列表 + 已完成折叠
2. **看板视图** — 5 列看板
3. **日历视图（月）** — 7×6 网格
4. **日历视图（周）** — 7 列
5. **编辑弹窗** — 所有字段
6. **热力图点击弹窗** — 当日完成任务
7. **项目管理弹窗** — 详情 + 操作
8. **标签管理弹窗** — 详情 + 操作
9. **完成弹窗** — 粒子 + 徽章 + 统计
10. **帮助弹窗** — 快捷键列表

要求：
- 使用 Auto Layout
- 颜色用 Figma Variables 管理（Dark/Light 切换）
- 组件可复用（按钮、卡片、弹窗、badge 等）
- 尺寸与 design-tokens.md 一致
