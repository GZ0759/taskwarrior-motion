# UI 重写设计令牌（Design Tokens）

> 从 `design/Design task management app/src/app/App.tsx` 精确提取，实现时必须逐值对照。

---

## 1. Mesh 渐变背景

### Dark 模式（底色 `#060010`）

```css
background: radial-gradient(ellipse 70% 60% at  8% 18%, rgba(139,92,246,.72)  0%, transparent 55%),
            radial-gradient(ellipse 60% 55% at 88% 12%, rgba(59,130,246,.62)  0%, transparent 52%),
            radial-gradient(ellipse 55% 60% at 55% 88%, rgba(236,72,153,.52)  0%, transparent 50%),
            radial-gradient(ellipse 48% 48% at 92% 78%, rgba(20,184,166,.48)  0%, transparent 46%),
            radial-gradient(ellipse 42% 42% at  5% 90%, rgba(251,146,60,.44)  0%, transparent 42%),
            #060010;
```

### Light 模式（底色 `#EBE8FF`）

```css
background: radial-gradient(ellipse 70% 60% at  8% 18%, rgba(186,148,255,.50) 0%, transparent 55%),
            radial-gradient(ellipse 60% 55% at 88% 12%, rgba(120,185,255,.46) 0%, transparent 52%),
            radial-gradient(ellipse 55% 60% at 55% 88%, rgba(255,160,210,.42) 0%, transparent 50%),
            radial-gradient(ellipse 48% 48% at 92% 78%, rgba(100,230,210,.38) 0%, transparent 46%),
            radial-gradient(ellipse 42% 42% at  5% 90%, rgba(255,210,120,.36) 0%, transparent 42%),
            #EBE8FF;
```

---

## 2. 玻璃拟态面板

### 通用属性

- `backdrop-filter: blur(24px)`（`backdrop-blur-2xl`）
- `border-radius: 24px`（`rounded-3xl`）
- `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`（`shadow-2xl`）

### Dark 面板

```css
background: rgba(255,255,255,0.07);
border: 1px solid rgba(255,255,255,0.13);
```

### Light 面板

```css
background: rgba(255,255,255,0.55);
border: 1px solid rgba(255,255,255,0.80);
```

---

## 3. 项目色彩卡片

### 固定项目配色

| 项目 | 渐变 (135deg) | 辉光 | 强调色 |
|------|--------------|------|--------|
| Design System | `rgba(120,80,200,0.60)` → `rgba(85,55,170,0.66)` | `rgba(120,80,200,0.20)` | `#C4B5FD` |
| API Migration | `rgba(38,140,200,0.58)` → `rgba(18,115,185,0.64)` | `rgba(38,140,200,0.18)` | `#7DD3FC` |
| Marketing | `rgba(205,75,145,0.58)` → `rgba(180,50,105,0.64)` | `rgba(205,75,145,0.18)` | `#F9A8D4` |
| Q3 Planning | `rgba(200,135,35,0.60)` → `rgba(195,85,45,0.66)` | `rgba(200,135,35,0.20)` | `#FCD34D` |

### Fallback 配色（未匹配项目按 index 轮询）

| Index | 渐变 (135deg) | 辉光 | 强调色 |
|-------|--------------|------|--------|
| 0 | `rgba(95,90,200,0.58)` → `rgba(70,65,175,0.64)` | `rgba(95,90,200,0.18)` | `#A5B4FC` |
| 1 | `rgba(28,170,120,0.58)` → `rgba(15,145,100,0.64)` | `rgba(28,170,120,0.18)` | `#6EE7B7` |
| 2 | `rgba(220,90,40,0.58)` → `rgba(195,65,30,0.64)` | `rgba(220,90,40,0.18)` | `#FCA5A5` |

### 卡片结构

```css
/* 外层 motion.div — 控制布局动画 */
border-radius: 16px;  /* rounded-2xl */
overflow: hidden;

/* 内层 div — 视觉容器 */
backdrop-filter: blur(20px);  /* backdrop-blur-xl */
background: {project.gradient};
box-shadow: 0 5px 28px {project.glow}, 0 1px 0 rgba(255,255,255,0.18) inset;
border: 1px solid rgba(255,255,255,0.15);

/* 主行 padding */
padding: 14px 16px;  /* py-3.5 px-4 */

/* 展开编辑区 */
background: rgba(0,0,0,0.22);
backdrop-filter: blur(8px);
padding: 8px 16px 16px;  /* pt-2 px-4 pb-4 */
```

### 卡片内元素

| 元素 | 尺寸 | 样式 |
|------|------|------|
| 完成按钮 | `24×24px`，圆角全满 | `border: 2px solid rgba(255,255,255,0.45)` |
| 完成按钮 (hover) | — | `border-color: white; background: rgba(255,255,255,0.20)` |
| 完成按钮 (checked) | — | `background: rgba(255,255,255,0.92)` |
| 任务文字 | `14px`（`text-sm`） | `font-weight: 600`（`font-semibold`），`color: white` |
| 截止日期标签 | `10px`，`px-2 py-0.5`，`rounded-full` | `background: rgba(255,255,255,0.17)`（正常）或 `rgba(239,68,68,0.45)`（逾期） |
| 优先级圆点 | `6×6px`（`w-1.5 h-1.5`） | H: `#FCA5A5`, M: `#FDE68A`, L: `#BAE6FD` |
| 展开/折叠按钮 | `13px` icon | `color: rgba(255,255,255,0.40)` |

---

## 4. 热力图

### 格子尺寸

- 7 列网格，`gap: 6px`（`gap-1.5`）
- 格子：`aspect-square`，`border-radius: 12px`（`rounded-xl`）

### 热力图颜色（Dark）

| 完成数 | 背景色 |
|--------|--------|
| 0 | `rgba(255,255,255,0.09)` |
| 1 | `rgba(74,222,128,0.55)` |
| 2 | `rgba(34,197,94,0.75)` |
| 3 | `rgba(22,163,74,0.88)` |
| 4+ | `rgba(21,128,61,0.96)` |

### 热力图颜色（Light）

| 完成数 | 背景色 |
|--------|--------|
| 0 | `rgba(0,0,0,0.07)` |
| 1 | `rgba(34,197,94,0.55)` |
| 2 | `rgba(22,163,74,0.72)` |
| 3 | `rgba(21,128,61,0.85)` |
| 4+ | `rgba(20,83,45,0.92)` |

### 文字颜色

| 用途 | Dark | Light |
|------|------|-------|
| 有完成数的格子 | `rgba(255,255,255,0.95)` | `rgba(255,255,255,0.96)` |
| 无完成数的格子 | `rgba(255,255,255,0.40)` | `rgba(0,0,0,0.38)` |
| 主文字 | `rgba(255,255,255,0.90)` | `rgba(15,10,40,0.88)` |
| 弱化文字 | `rgba(255,255,255,0.42)` | `rgba(15,10,40,0.46)` |
| 极弱文字 | `rgba(255,255,255,0.30)` | `rgba(15,10,40,0.30)` |
| 星期标签 | `rgba(255,255,255,0.36)` | `rgba(15,10,40,0.38)` |
| 今日圆环 | `rgba(255,255,255,0.75)` | `rgba(99,102,241,0.85)` |

### 今日圆环

```css
outline: 2.5px solid {todayRing};
outline-offset: 2px;
border-radius: 12px;
```

### 格子文字

- `font-size: 13px`，`font-weight: 700`，`tabular-nums`

---

## 5. 完成弹窗（Completion Modal）

### 遮罩层

```css
background: rgba(0,0,0,0.70);
backdrop-filter: blur(14px);
```

### 弹窗卡片

```css
width: 320px;  /* w-80 */
border-radius: 24px;  /* rounded-3xl */
background: linear-gradient(158deg, #FFBA42 0%, #FF6B35 48%, #FF3D6B 100%);
box-shadow: 0 32px 90px rgba(255,100,53,0.52), 0 8px 32px rgba(0,0,0,0.35);
```

### 入场动画

```css
/* spring physics */
initial: scale(0.48), opacity(0), y(60)
animate: scale(1), opacity(1), y(0)
stiffness: 265, damping: 22
```

### 粒子效果

- 数量：24 个
- 颜色池：`["#FFD700","#FF9F1C","#FF6B35","#FFBF69","#FFF59D","#FF8A65","#FFCC02","#F9A825"]`
- 分布：圆周均匀，角度随机偏移 ±0.4 rad
- 距离：`55 + random(0..85)` px
- 大小：`4 + random(0..8)` px
- 动画：`duration: 0.85s, delay: 0.18s, ease: "easeOut"`

### 浮动星星（✦）

- 数量：14 个
- 大小：`9 + random(0..14)` px
- 分布：`x ∈ [-150, 150]`, `y ∈ [-190, 190]`
- 动画循环：`opacity [0, 0.95, 0.55, 0], scale [0, 1.2, 0.9, 0]`
- `duration: 1.5s, delay: 0.22 + random(0..0.8)s, repeat: Infinity, repeatDelay: 2.0s`

### 成就徽章

```css
/* 外圈 */
width: 128px; height: 128px;

/* SVG sunburst: 16 条线 */
stroke: rgba(255,255,255,0.38);
strokeWidth: 2.5;
innerRadius: 34px, outerRadius: 50px;

/* 中心圆形 */
inset: 16px;
background: linear-gradient(148deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%);
backdrop-filter: blur(16px);
box-shadow: 0 8px 30px rgba(0,0,0,0.14), inset 0 1.5px 0 rgba(255,255,255,0.55), 0 0 0 2px rgba(255,255,255,0.28);

/* 入场 spring */
initial: scale(0), rotate(-18deg)
animate: scale(1), rotate(0deg)
delay: 0.12s, stiffness: 255, damping: 17

/* 脉冲光环 */
animate: scale [1, 1.1, 1], opacity [0.45, 0.75, 0.45]
duration: 2.4s, repeat: Infinity
box-shadow: 0 0 0 3px rgba(255,255,255,0.38)
```

### 统计数字

- `font-size: 28px`, `font-weight: 900`（`font-black`）
- `tabular-nums`
- 入场：`scale(0) → scale(1)`, spring `stiffness: 280, damping: 18`, delay: 0.45s

### 底部按钮

```css
background: rgba(255,255,255,0.95);
color: #E8540A;
border-radius: 16px;  /* rounded-2xl */
padding: 16px;  /* py-4 */
font-size: 14px; font-weight: 900;
box-shadow: 0 4px 22px rgba(0,0,0,0.14);
```

---

## 6. 添加任务输入框

### 未激活状态

```css
/* Dark */
background: rgba(255,255,255,0.07);
border: 1px solid rgba(255,255,255,0.13);

/* Light */
background: rgba(255,255,255,0.60);
border: 1px solid rgba(255,255,255,0.75);

/* 通用 */
backdrop-filter: blur(20px);  /* backdrop-blur-xl */
border-radius: 16px;  /* rounded-2xl */
padding: 14px 16px;  /* py-3.5 px-4 */
```

### 激活状态（额外）

```css
/* Dark */
ring: 1px solid rgba(255,255,255,0.18);

/* Light */
ring: 1px solid rgba(99,102,241,0.50);
```

### 图标圆圈

```css
width: 24px; height: 24px;
border-radius: 50%;
border: 2px solid;
/* Dark: rgba(255,255,255,0.30), hover: rgba(255,255,255,0.60) + bg rgba(255,255,255,0.12) */
/* Light: indigo-300, hover: indigo-400 + bg indigo-50 */
```

---

## 7. 项目/标签选择器

### 项目选择器

```css
border-radius: 12px;  /* rounded-xl */
background: rgba(0,0,0,0.22);
padding: 6px;  /* p-1.5 */
max-height: 144px;  /* max-h-36 */

/* 选项按钮 */
padding: 6px 12px;  /* py-1.5 px-3 */
border-radius: 8px;  /* rounded-lg */
font-size: 12px; font-weight: 600;
/* 选中: bg-white text-gray-800 */
/* 未选中: text-white/55 hover:bg-white/10 hover:text-white/80 */
```

### 标签选择器

```css
/* 标签按钮 */
font-size: 10px;
padding: 4px 10px;  /* py-1 px-2.5 */
border-radius: 9999px;  /* rounded-full */
/* 选中: bg-white text-gray-800 */
/* 未选中: bg-white/12 text-white/65 */

/* 输入区 */
background: rgba(255,255,255,0.10);
border-radius: 12px;
```

---

## 8. 动画 Keyframes

### taskShake

```css
@keyframes taskShake {
  0%,100% { transform: translateX(0) rotate(0deg); }
  16%      { transform: translateX(-9px) rotate(-2.5deg); }
  33%      { transform: translateX(8px)  rotate(2deg); }
  50%      { transform: translateX(-6px) rotate(-1.5deg); }
  66%      { transform: translateX(5px)  rotate(1deg); }
  83%      { transform: translateX(-3px); }
}
/* duration: 0.50s, easing: cubic-bezier(.36,.07,.19,.97), fill: both */
```

### checkPop

```css
@keyframes checkPop {
  0%   { transform: scale(0) rotate(-20deg); opacity:0; }
  60%  { transform: scale(1.4) rotate(5deg);  opacity:1; }
  100% { transform: scale(1)  rotate(0deg);   opacity:1; }
}
/* duration: 0.28s, easing: ease, fill: forwards */
```

---

## 9. 音效参数（Web Audio API）

### 完成音效

```js
oscillator.frequency: 523 → 1047 Hz (exponential ramp, 0.18s)
gain: 0.13 → 0.001 (exponential ramp, 0.32s)
duration: 0.32s
```

### 添加音效

```js
oscillator.frequency: 660 Hz (constant)
gain: 0.09 → 0.001 (exponential ramp, 0.10s)
duration: 0.10s
```

---

## 10. 布局尺寸

| 区域 | 尺寸 |
|------|------|
| 左侧面板宽度 | `310px`（min `270px`） |
| 左侧面板圆角 | `24px`（`rounded-3xl`） |
| 右侧面板圆角 | `24px`（`rounded-3xl`） |
| 面板间距 | `20px`（`gap-5`） |
| 页面 padding | `20px`（`p-5`） |
| Logo 图标 | `32×32px`，`rounded-xl`，渐变 `#7C3AED → #6366F1` |

---

## 11. 字体

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

| 用途 | 大小 | 粗细 |
|------|------|------|
| 标题 "taskwarrior" | 13px | 700 |
| 副标题 "motion" | 10px | 400 |
| 右侧标题 | 20px（`text-xl`） | 900（`font-black`） |
| 副标题（任务数） | 12px | 400 |
| 任务描述 | 14px | 600 |
| 日期标签 | 10px | 600 |
| 编辑区标签 | 9px | 900，大写，`letter-spacing: 0.1em` |
| 热力图日期数字 | 13px | 700 |
| 今日完成数字 | 48px（`text-5xl`） | 900 |
| 累计完成数字 | 24px（`text-2xl`） | 900 |

---

## 12. 间距速查

| 场景 | 值 |
|------|-----|
| 面板内 padding | `20px`（`px-5 py-5`） |
| 卡片间距 | `10px`（`mb-2.5`） |
| 卡片内 padding | `14px 16px` |
| 展开区 padding | `8px 16px 16px` |
| 热力图格子间距 | `6px` |
| 项目进度条间距 | `12px`（`space-y-3`） |
| 左右面板内容间距 | `24px`（`space-y-6`） |
