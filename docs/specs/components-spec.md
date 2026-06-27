# 组件规范

## 概述

本文档定义了 taskwarrior-motion 前端组件的开发规范。

---

## 命名规范

### 组件命名

- **格式**：PascalCase
- **示例**：`TaskItem.vue`、`TaskList.vue`、`TaskForm.vue`
- **前缀**：`Task`/`List`/`Form`/`Modal`

### 文件命名

- **格式**：kebab-case
- **示例**：`task-item.vue`、`task-list.vue`

### 目录结构

```
client/src/
├── components/           # 通用组件
│   ├── TaskItem.vue
│   ├── TaskList.vue
│   ├── TaskForm.vue
│   └── ...
├── views/                # 页面视图
│   ├── KanbanView.vue
│   ├── CalendarView.vue
│   └── DoneView.vue
├── composables/          # 组合式函数
│   ├── useAnimation.ts
│   ├── useSound.ts
│   └── useContext.ts
├── stores/               # 状态管理
│   └── task.ts
├── api/                  # API 封装
│   └── taskwarrior.ts
├── types/                # TypeScript 类型
│   └── task.ts
└── utils/                # 工具函数
    └── date.ts
```

---

## 组件结构

### 单文件组件 (SFC)

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 脚本
</script>

<style scoped>
/* 样式 */
</style>
```

### 组件顺序

1. `<template>`
2. `<script setup>`
3. `<style scoped>`

---

## Props 规范

### 定义方式

```typescript
// 使用 TypeScript 类型定义
const props = defineProps<{
  task: Task
  isEdit?: boolean
}>()
```

### 命名规范

- **格式**：camelCase
- **示例**：`task`、`isEdit`、`showModal`

### 类型定义

```typescript
interface Task {
  uuid: string
  description: string
  status: 'pending' | 'completed' | 'deleted'
  project?: string
  tags?: string[]
  priority?: 'H' | 'M' | 'L'
  due?: string
}
```

---

## 事件规范

### 定义方式

```typescript
const emit = defineEmits<{
  edit: [task: Task]
  delete: [uuid: string]
  complete: [uuid: string]
}>()
```

### 命名规范

- **格式**：动词 + 名词
- **示例**：`edit`、`delete`、`complete`

### 触发方式

```typescript
// 触发事件
emit('edit', task)
emit('delete', uuid)
emit('complete', uuid)
```

---

## 状态管理

### Pinia Store

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const pendingTasks = computed(() => 
    tasks.value.filter(t => t.status === 'pending')
  )

  // 方法
  async function fetchTasks() {
    loading.value = true
    try {
      tasks.value = await taskApi.getTasks()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    pendingTasks,
    fetchTasks,
  }
})
```

---

## 组合式函数

### 命名规范

- **格式**：`use` + 功能名
- **示例**：`useAnimation`、`useSound`、`useContext`

### 示例

```typescript
// composables/useAnimation.ts
import { ref } from 'vue'
import { gsap } from 'gsap'

export function useAnimation() {
  const isAnimating = ref(false)

  async function animateComplete(element: HTMLElement) {
    isAnimating.value = true
    await gsap.to(element, {
      x: 100,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
    isAnimating.value = false
  }

  return {
    isAnimating,
    animateComplete,
  }
}
```

---

## 样式规范

### Tailwind CSS

```vue
<template>
  <div class="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-gray-800">
    <!-- 内容 -->
  </div>
</template>
```

### 响应式设计

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 内容 -->
  </div>
</template>
```

### 暗色模式

```vue
<template>
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <!-- 内容 -->
  </div>
</template>
```

---

## 动画规范

### GSAP 动画

```typescript
import { gsap } from 'gsap'

// 淡入
gsap.from(element, {
  opacity: 0,
  y: 20,
  duration: 0.4,
  ease: 'power2.out',
})

// 淡出
gsap.to(element, {
  opacity: 0,
  y: -20,
  duration: 0.3,
  ease: 'power2.in',
})
```

### 动画时长

| 类型 | 时长 | 缓动函数 |
|------|------|----------|
| 进入 | 400ms | power2.out / back.out |
| 离开 | 300ms | power2.in |
| 微交互 | 200ms | power2.out |

---

## 音效规范

### Howler.js

```typescript
import { Howl } from 'howler'

const completeSound = new Howl({
  src: ['/sounds/complete.mp3'],
  volume: 0.5,
})

completeSound.play()
```

### 音效文件

| 类型 | 文件名 | 音量 | 时长 |
|------|--------|------|------|
| 完成 | complete.mp3 | 0.5 | < 1s |
| 删除 | delete.mp3 | 0.3 | < 1s |
| 添加 | add.mp3 | 0.4 | < 1s |

---

## 键盘快捷键

### 全局快捷键

```typescript
// composables/useKeyboard.ts
import { onMounted, onUnmounted } from 'vue'

export function useKeyboard() {
  function handleKeydown(e: KeyboardEvent) {
    // n - 新建任务
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      // 打开新建弹窗
    }
    
    // Escape - 关闭弹窗
    if (e.key === 'Escape') {
      // 关闭弹窗
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
```

---

## 组件示例

### TaskItem.vue

```vue
<template>
  <div 
    ref="taskRef"
    class="task-item group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
  >
    <!-- 完成按钮 -->
    <button 
      @click="handleComplete"
      class="complete-btn w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
    >
      <svg v-if="task.status === 'completed'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
    
    <!-- 任务内容 -->
    <div class="flex-1 min-w-0">
      <span class="description text-gray-900 dark:text-gray-100">
        {{ task.description }}
      </span>
    </div>
    
    <!-- 操作按钮 -->
    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button @click="$emit('edit', task)" class="edit-btn p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      
      <button @click="handleDelete" class="delete-btn p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { Howl } from 'howler'
import type { Task } from '@/types/task'
import { useTaskStore } from '@/stores/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  edit: [task: Task]
}>()

const taskRef = ref<HTMLElement>()
const taskStore = useTaskStore()

const completeSound = new Howl({
  src: ['/sounds/complete.mp3'],
  volume: 0.5,
})

const deleteSound = new Howl({
  src: ['/sounds/delete.mp3'],
  volume: 0.3,
})

async function handleComplete() {
  if (!taskRef.value) return
  
  completeSound.play()
  
  await gsap.to(taskRef.value, {
    x: 100,
    opacity: 0,
    scale: 0.8,
    duration: 0.4,
    ease: 'power2.out',
  })
  
  await taskStore.completeTask(props.task.uuid)
  
  gsap.set(taskRef.value, { x: 0, opacity: 1, scale: 1 })
}

async function handleDelete() {
  if (!taskRef.value) return
  
  deleteSound.play()
  
  await gsap.to(taskRef.value, {
    x: -100,
    opacity: 0,
    scale: 0.8,
    duration: 0.4,
    ease: 'power2.out',
  })
  
  await taskStore.deleteTask(props.task.uuid)
}
</script>

<style scoped>
.task-item {
  backdrop-filter: blur(10px);
}

.complete-btn:hover {
  transform: scale(1.1);
}

.edit-btn:hover,
.delete-btn:hover {
  transform: scale(1.1);
}
</style>
```

---

## 参考项目

### taskwarrior-webui

- **组件设计**：Vue.js 组件
- **参考**：
  - TaskItem 组件
  - TaskList 组件
  - TaskForm 组件

### taskwarrior-web-portal

- **组件设计**：Go templ 模板
- **参考**：
  - 行组件设计
  - 列表视图设计
  - 弹窗设计
