# UI 重构计划

> **目标**：将当前 Vue 前端的 UI 从朴素 Tailwind 风格重构为设计稿的玻璃拟态 + Mesh 渐变风格。
> **设计参考**：`design/Design task management app/src/app/App.tsx`
> **视觉参数**：`docs/design-tokens.md`（从设计稿精确提取的所有数值）
> **方案**：方案 A — 保留 Vue 代码和功能逻辑，只重写视觉层

---

## 布局变更

```
当前：  Header + 左侧导航栏 + 主内容区
目标：  双栏布局（无 Header）

┌─────────────────────────────────────────────────────────┐
│  Mesh 渐变背景（全屏）                                    │
│  ┌──────────────┐  ┌──────────────────────────────────┐│
│  │ 左侧面板      │  │ 右侧面板                          ││
│  │ (310px)       │  │ (flex-1)                         ││
│  │               │  │                                  ││
│  │ - Logo/标题   │  │ - 标题 + 任务数                   ││
│  │ - 音效/主题   │  │ - 添加任务输入框                  ││
│  │ - 热力图      │  │ - 任务卡片列表                    ││
│  │ - 项目进度条  │  │ - 空状态                          ││
│  │               │  │                                  ││
│  └──────────────┘  └──────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Completion Modal（完成任务时弹出）                    ││
│  │ - 成就徽章 + 粒子爆炸 + 统计数据                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 任务清单

### 任务 R1：项目准备

**目标**：安装依赖、配置全局样式
**前置**：无
**验收**：`pnpm dev` 能启动，页面有 mesh 背景

**步骤**：

1. 安装新依赖
   ```bash
   cd client
   pnpm add lucide-vue-next @vueuse/motion
   ```
   - `lucide-vue-next`：图标库（替代手动 SVG）
   - `@vueuse/motion`：Vue 版动画库（替代 framer-motion）

2. 创建 `client/src/styles/mesh-backgrounds.css`
   - 从 `design-tokens.md` 第 1 节复制 Dark/Light mesh 渐变值
   - 定义 CSS 变量 `--mesh-dark` 和 `--mesh-light`

3. 创建 `client/src/styles/animations.css`
   - 从 `design-tokens.md` 第 8 节复制 `taskShake`、`checkPop` keyframes
   - 添加卡片进入/退出过渡动画

4. 创建 `client/src/styles/glass.css`
   - 玻璃拟态工具类：`.glass-dark`、`.glass-light`
   - 从 `design-tokens.md` 第 2 节提取值

5. 更新 `client/src/style.css` 引入新样式文件

6. 更新 `client/src/composables/useTheme.ts`
   - 从 2 模式（light/dark）升级为 3 模式（light/dark/system）
   - 存储 key 改为 `twm-theme`（与设计稿一致）

---

### 任务 R2：核心组件 — Heatmap

**目标**：实现热力图组件
**前置**：R1
**验收**：左侧面板显示 35 天热力图，今日有圆环高亮

**步骤**：

1. 创建 `client/src/components/Heatmap.vue`
   - 从设计稿 `Heatmap` 函数移植逻辑
   - 35 天格子，7 列网格
   - 根据 `completedAt` 统计每日完成数
   - 颜色映射：从 `design-tokens.md` 第 4 节精确取值
   - 今日圆环：`outline: 2.5px solid`

2. 热力图顶部统计区
   - 今日完成数（48px 大字）
   - 累计完成数
   - 鼓励文案（根据完成数动态切换）

3. 底部图例：少 → 多 颜色条

**产出**：
- `client/src/components/Heatmap.vue`

---

### 任务 R3：核心组件 — ProjectProgress

**目标**：实现项目进度条组件
**前置**：R1
**验收**：左侧面板显示各项目进度条，颜色与设计稿一致

**步骤**：

1. 创建 `client/src/components/ProjectProgress.vue`
   - 遍历所有项目，计算 done/total
   - 进度条颜色使用 `CARD_STYLES` 配色
   - 从 `design-tokens.md` 第 3 节取项目配色值

2. 进度条动画：`width: 0 → 实际百分比`，duration 0.9s

**产出**：
- `client/src/components/ProjectProgress.vue`

---

### 任务 R4：核心组件 — TaskCard

**目标**：重写任务卡片为渐变玻璃风格
**前置**：R1
**验收**：任务卡片按项目显示不同渐变色，展开/折叠编辑正常

**步骤**：

1. 创建 `client/src/components/TaskCard.vue`（替代现有 `TaskItem.vue`）
   - 外层：`rounded-2xl`，布局动画
   - 内层：项目渐变背景 + `backdrop-blur-xl` + glow shadow
   - 从 `design-tokens.md` 第 3 节取卡片样式值

2. 卡片主行
   - 完成按钮：24px 圆形，白色边框
   - 任务描述：14px，白色，font-semibold
   - 截止日期标签：10px，rounded-full（逾期用红色背景）
   - 优先级圆点：H 红 / M 黄 / L 蓝
   - 展开/折叠箭头

3. 展开编辑区
   - 背景：`rgba(0,0,0,0.22)`，`backdrop-blur(8px)`
   - 优先级选择器（H/M/L 按钮组）
   - 截止日期选择器
   - 项目选择器（`ProjectPicker` 子组件）
   - 标签选择器（`TagPicker` 子组件）
   - 保存/取消/删除按钮

4. 创建 `client/src/components/ProjectPicker.vue`
   - 从设计稿 `ProjectPicker` 移植
   - 背景 `rgba(0,0,0,0.22)`，选项列表 + 添加输入框

5. 创建 `client/src/components/TagPicker.vue`
   - 从设计稿 `TagPicker` 移植
   - 标签按钮组 + 添加输入框

**产出**：
- `client/src/components/TaskCard.vue`
- `client/src/components/ProjectPicker.vue`
- `client/src/components/TagPicker.vue`

---

### 任务 R5：核心组件 — AddTask & CompletionModal

**目标**：实现添加任务输入框和完成弹窗
**前置**：R1
**验收**：添加任务有玻璃输入框动画，完成任务有粒子弹窗

**步骤**：

1. 创建 `client/src/components/AddTask.vue`
   - 未激活：玻璃按钮，"添加任务" 文字
   - 激活：玻璃输入框 + 取消/确认按钮
   - 从 `design-tokens.md` 第 6 节取样式值

2. 创建 `client/src/components/CompletionModal.vue`
   - 遮罩：`rgba(0,0,0,0.70)` + `blur(14px)`
   - 卡片：橙→粉渐变，spring 入场动画
   - 粒子爆炸：24 个彩色圆点从中心向外扩散
   - 浮动星星：14 个 ✦ 符号随机闪烁
   - 成就徽章：SVG sunburst + 中心圆形 + 脉冲光环
   - 统计数字：今日完成 + 累计完成
   - "继续加油" 按钮
   - 从 `design-tokens.md` 第 5 节取所有数值

3. 创建 `client/src/components/AchievementBadge.vue`
   - SVG 16 条 sunburst 射线
   - 中心玻璃圆形 + Trophy 图标
   - 脉冲光环动画

**产出**：
- `client/src/components/AddTask.vue`
- `client/src/components/CompletionModal.vue`
- `client/src/components/AchievementBadge.vue`

---

### 任务 R6：布局重写

**目标**：将 App.vue 重构为双栏布局
**前置**：R2, R3, R4, R5 全部完成
**验收**：页面为双栏布局，mesh 背景，所有组件正确集成

**步骤**：

1. 重写 `client/src/App.vue`
   - 移除当前的 Header + 侧边栏导航
   - 全屏 mesh 渐变背景（从 `design-tokens.md` 第 1 节取值）
   - 左侧面板（310px）：Logo + 音效/主题按钮 + Heatmap + ProjectProgress
   - 右侧面板（flex-1）：标题 + 任务数 + AddTask + TaskCard 列表 + 空状态

2. 左侧面板
   - Logo：32px 圆角图标（渐变 `#7C3AED → #6366F1`）+ "taskwarrior" / "motion"
   - 控制按钮：音效开关 + 主题切换（light/dark/system 三态循环）
   - 分隔线后：Heatmap + ProjectProgress

3. 右侧面板
   - 标题 "待办事项" + 任务数
   - AddTask 输入框
   - TaskCard 列表（AnimatePresence 包裹）
   - 空状态：Sparkles 图标 + "今日任务全部完成"

4. 集成 CompletionModal（AnalyzePresence 包裹）

**产出**：
- `client/src/App.vue`（重写）

---

### 任务 R7：音效和动画调优

**目标**：完善音效和动画细节
**前置**：R6
**验收**：完成任务有 shake + 粒子 + 音效全流程，60fps

**步骤**：

1. 更新 `client/src/composables/useSound.ts`
   - 完成音效：523→1047Hz，0.32s（从 `design-tokens.md` 第 9 节取值）
   - 添加音效：660Hz，0.10s
   - 使用 Web Audio API 合成（不依赖 mp3 文件）

2. 完成任务动画流程
   - shake 动画（0.50s）→ check-pop（0.28s）→ 卡片淡出（0.33s）→ CompletionModal 弹出
   - 在 TaskCard 中串联各阶段

3. 卡片进入/退出动画
   - 进入：`opacity: 0→1, y: 14→0, scale: 0.97→1`
   - 退出：`opacity: 1→0, scale: 1→0.93`
   - duration: 0.30s, ease: `[0.16, 1, 0.3, 1]`

4. 性能优化
   - 确保 `will-change` 和 `transform` 用于动画元素
   - 避免 layout thrashing

**产出**：
- `client/src/composables/useSound.ts`（更新）
- 动画集成到各组件

---

### 任务 R8：功能集成和适配

**目标**：确保所有原有功能在新 UI 下正常工作
**前置**：R7
**验收**：CRUD、搜索、键盘快捷键、看板/日历视图全部正常

**步骤**：

1. 连接后端 API
   - TaskCard 的 CRUD 操作调用 Pinia store → API
   - Heatmap 和 ProjectProgress 从 store 读取数据

2. 搜索过滤
   - 在右侧面板标题区域添加搜索图标/输入框
   - 保持现有搜索逻辑，适配新布局

3. 键盘快捷键
   - 保持现有 `useKeyboard.ts` 逻辑
   - 确保快捷键在新布局下正常触发

4. 看板/日历/完成视图
   - 这些视图暂时保留现有样式，后续迭代
   - 通过左侧面板底部或右侧面板顶部的切换按钮进入

5. 响应式适配
   - 移动端：左侧面板折叠为底部抽屉或隐藏
   - 平板：左侧面板可收缩

**产出**：
- 功能集成到新 UI
- 响应式适配

---

## 依赖关系

```
R1（项目准备）
 ├── R2（Heatmap）
 ├── R3（ProjectProgress）
 ├── R4（TaskCard）
 └── R5（AddTask + CompletionModal）
      └── R6（布局重写）
           └── R7（音效动画调优）
                └── R8（功能集成）
```

R2/R3/R4/R5 可并行开发，R6 依赖全部完成。

---

## 技术选型

| 用途 | 当前 | 重构后 | 原因 |
|------|------|--------|------|
| 图标 | 手动 SVG | lucide-vue-next | 与设计稿一致，维护方便 |
| 动画 | GSAP | @vueuse/motion | Vue 原生集成，轻量 |
| 音效 | Howler.js + mp3 | Web Audio API | 设计稿用合成音，无文件依赖 |
| 主题 | 2 模式 | 3 模式 | 增加 system 跟随 |

---

## 验收标准

1. **视觉一致**：与设计稿逐像素对齐（参考 `design-tokens.md`）
2. **功能完整**：所有原有功能正常工作
3. **动画流畅**：完成动画全流程 60fps
4. **主题切换**：light/dark/system 三态正常
5. **音效正常**：完成/添加音效可播放、可关闭
6. **响应式**：桌面端双栏，移动端可折叠

---

## 更新日志

- 2026-06-27：创建 UI 重构计划
