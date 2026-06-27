<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Sparkles, Volume2, VolumeX, Sun, Moon, Monitor } from '@lucide/vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import { useKeyboard } from '@/composables/useKeyboard'
import { useSound } from '@/composables/useSound'
import Heatmap from '@/components/Heatmap.vue'
import ProjectProgress from '@/components/ProjectProgress.vue'
import TaskCard from '@/components/TaskCard.vue'
import AddTask from '@/components/AddTask.vue'
import CompletionModal from '@/components/CompletionModal.vue'
import TaskList from '@/components/TaskList.vue'
import KanbanView from '@/views/KanbanView.vue'
import CalendarView from '@/views/CalendarView.vue'
import DoneView from '@/views/DoneView.vue'
import type { UpdateTaskRequest } from '@/types/task'

const store = useTaskStore()
const { theme, isDark, toggleTheme } = useTheme()
const { soundEnabled, toggleSound } = useSound()

// 完成弹窗
const doneInfo = ref<{ description: string; todayCount: number; totalDone: number } | null>(null)

// 视图切换
type ViewType = 'next' | 'kanban' | 'calendar' | 'done'
const currentView = ref<ViewType>('next')

// 项目和标签管理
const allProjects = computed(() => {
  const set = new Set<string>()
  store.tasks.forEach((t) => {
    if (t.project) set.add(t.project)
  })
  return Array.from(set)
})

const allTags = computed(() => {
  const set = new Set<string>()
  store.tasks.forEach((t) => {
    t.tags?.forEach((tag) => set.add(tag))
  })
  return Array.from(set)
})

// 今日完成数和累计完成数
const todayStr = new Date().toISOString().split('T')[0]
const todayCount = computed(() => {
  return store.completedTasks.filter((t) => {
    if (!t.end) return false
    const dateStr = t.end.slice(0, 4) + '-' + t.end.slice(4, 6) + '-' + t.end.slice(6, 8)
    return dateStr === todayStr
  }).length
})
const totalDone = computed(() => store.completedTasks.length)

// 活跃任务数
const activeCount = computed(() => store.pendingTasks.length)

// 主题图标
const themeIcon = computed(() => {
  if (theme.value === 'light') return Sun
  if (theme.value === 'dark') return Moon
  return Monitor
})

// 键盘快捷键
useKeyboard({
  onNewTask: () => {
    // AddTask 组件自己处理
  },
  onNextTask: () => {},
  onPrevTask: () => {},
  onCompleteTask: () => {},
  onEditTask: () => {},
  onCloseModal: () => {
    doneInfo.value = null
  },
  onShowHelp: () => {},
  onUndo: () => {
    store.undo()
  },
})

onMounted(() => {
  store.fetchTasks()
})

// 添加任务
function handleAddTask(description: string) {
  store.addTask({ description })
}

// 完成任务（带动画和弹窗）
function handleCompleteTask(uuid: string, desc: string) {
  store.completeTask(uuid)
  // 计算统计数据
  const newTodayCount = todayCount.value + 1
  const newTotalDone = totalDone.value + 1
  setTimeout(() => {
    doneInfo.value = {
      description: desc,
      todayCount: newTodayCount,
      totalDone: newTotalDone,
    }
  }, 60)
}

// 更新任务
function handleUpdateTask(uuid: string, data: UpdateTaskRequest) {
  store.updateTask(uuid, data)
}

// 删除任务
function handleDeleteTask(uuid: string) {
  store.deleteTask(uuid)
}

// 项目/标签 CRUD（通过修改任务实现）
function handleAddProject(_name: string) {
  // 项目是任务的属性，添加项目时不需要额外操作
  // 当用户在 ProjectPicker 中添加新项目并保存任务时，项目会自动出现
}

function handleDeleteProject(name: string) {
  // 删除项目：将该项目下的所有任务的 project 清空
  store.tasks
    .filter((t) => t.project === name)
    .forEach((t) => store.updateTask(t.uuid, { project: '' }))
}

function handleAddTag(_name: string) {
  // 标签同理，添加时不需要额外操作
}

function handleDeleteTag(name: string) {
  // 删除标签：从所有任务中移除该标签
  store.tasks
    .filter((t) => t.tags?.includes(name))
    .forEach((t) =>
      store.updateTask(t.uuid, { tags: t.tags?.filter((tag) => tag !== name) })
    )
}
</script>

<template>
  <div
    class="h-screen flex overflow-hidden"
    :class="isDark ? 'mesh-dark' : 'mesh-light'"
  >
    <div class="flex gap-5 p-5 w-full h-full">
      <!-- ── 左侧面板 ── -->
      <div
        class="flex flex-col rounded-3xl shadow-2xl overflow-hidden shrink-0"
        :class="isDark ? 'glass-dark' : 'glass-light'"
        :style="{ width: '310px', minWidth: '270px' }"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
          :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}` }"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 logo-gradient">
              <Sparkles :size="15" class="text-white" />
            </div>
            <div>
              <div class="text-[13px] font-bold" :style="{ color: 'var(--txt-primary)' }">
                taskwarrior
              </div>
              <div class="text-[10px]" :style="{ color: 'var(--txt-muted)' }">motion</div>
            </div>
          </div>
          <div class="flex gap-0.5">
            <button
              class="p-2 rounded-xl transition-colors"
              :style="{ color: 'var(--ctrl-btn)' }"
              @click="toggleSound"
            >
              <Volume2 v-if="soundEnabled" :size="14" />
              <VolumeX v-else :size="14" />
            </button>
            <button
              class="p-2 rounded-xl transition-colors"
              :style="{ color: 'var(--ctrl-btn)' }"
              @click="toggleTheme"
            >
              <component :is="themeIcon" :size="14" />
            </button>
          </div>
        </div>

        <!-- 热力图 + 项目进度 -->
        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <Heatmap />

          <div
            :style="{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}`, paddingTop: '20px' }"
          >
            <ProjectProgress />
          </div>
        </div>
      </div>

      <!-- ── 右侧面板 ── -->
      <div
        class="flex-1 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
        :class="isDark ? 'glass-dark' : 'glass-light'"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 pt-5 pb-4 shrink-0"
          :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}` }"
        >
          <div>
            <h1 class="text-xl font-black" :style="{ color: 'var(--txt-primary)' }">待办事项</h1>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--txt-muted)' }">
              {{ activeCount > 0 ? `${activeCount} 项待完成` : '全部完成了' }}
            </p>
          </div>

          <!-- 视图切换 -->
          <div class="flex gap-1">
            <button
              v-for="view in [
                { key: 'next', label: '列表' },
                { key: 'kanban', label: '看板' },
                { key: 'calendar', label: '日历' },
                { key: 'done', label: '已完成' },
              ]"
              :key="view.key"
              class="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
              :class="currentView === view.key
                ? (isDark ? 'bg-white/15 text-white' : 'bg-indigo-500 text-white')
                : (isDark ? 'text-white/40 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-100')"
              @click="currentView = view.key as ViewType"
            >{{ view.label }}</button>
          </div>
        </div>

        <!-- 内容区 -->
        <div
          class="flex-1 px-6 pt-4 pb-6 min-h-0"
          :class="(currentView === 'kanban' || currentView === 'calendar') ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'"
        >
          <!-- 列表视图 -->
          <template v-if="currentView === 'next'">
            <!-- 添加任务 -->
            <div class="mb-4">
              <AddTask @add="handleAddTask" />
            </div>

            <!-- 空状态 -->
            <div
              v-if="store.pendingTasks.length === 0"
              class="flex flex-col items-center justify-center py-20 text-center"
            >
              <div
                class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                :style="{
                  background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(99,102,241,0.18)',
                }"
              >
                <Sparkles
                  :size="26"
                  :style="{ color: isDark ? 'rgba(255,255,255,0.45)' : '#818CF8' }"
                />
              </div>
              <p class="text-base font-black mb-1" :style="{ color: 'var(--txt-primary)' }">
                今日任务全部完成
              </p>
              <p class="text-sm" :style="{ color: 'var(--txt-muted)' }">
                再添加一些，继续保持状态
              </p>
            </div>

            <!-- 任务卡片列表 -->
            <template v-else>
              <TaskCard
                v-for="(task, i) in store.pendingTasks"
                :key="task.uuid"
                :task="task"
                :index="i"
                :all-projects="allProjects"
                :all-tags="allTags"
                @complete="handleCompleteTask"
                @update="handleUpdateTask"
                @delete="handleDeleteTask"
                @add-project="handleAddProject"
                @delete-project="handleDeleteProject"
                @add-tag="handleAddTag"
                @delete-tag="handleDeleteTag"
              />
            </template>
          </template>

          <!-- 看板视图 -->
          <KanbanView v-else-if="currentView === 'kanban'" />

          <!-- 日历视图 -->
          <CalendarView v-else-if="currentView === 'calendar'" />

          <!-- 已完成视图 -->
          <DoneView v-else-if="currentView === 'done'" />
        </div>
      </div>
    </div>

    <!-- 完成弹窗 -->
    <CompletionModal
      v-if="doneInfo"
      :description="doneInfo.description"
      :today-count="doneInfo.todayCount"
      :total-done="doneInfo.totalDone"
      @close="doneInfo = null"
    />

    <!-- 错误提示 -->
    <div
      v-if="store.error"
      class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    >
      {{ store.error }}
      <button class="ml-2" @click="store.error = null">×</button>
    </div>
  </div>
</template>
