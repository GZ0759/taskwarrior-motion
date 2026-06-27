<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import type { Task } from '@/types/task'

const store = useTaskStore()
const { isDark } = useTheme()

type CalendarView = 'month' | 'week' | 'day'

const currentView = ref<CalendarView>('month')
const currentDate = ref(new Date())

const viewOptions: CalendarView[] = ['month', 'week', 'day']
const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']

const currentMonth = computed(() => {
  return currentDate.value.toLocaleString('zh-CN', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const days: Array<{ date: Date; isCurrentMonth: boolean; tasks: Task[] }> = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, isCurrentMonth: false, tasks: getTasksForDate(date) })
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i)
    days.push({ date, isCurrentMonth: true, tasks: getTasksForDate(date) })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false, tasks: getTasksForDate(date) })
  }

  return days
})

function getTasksForDate(date: Date): Task[] {
  const dateStr = date.toISOString().split('T')[0]
  return store.calendarTasks.filter((t) => {
    if (!t.due) return false
    // taskwarrior due 格式: "20260628T000000Z" → 转为 "2026-06-28"
    const taskDate = t.due.length >= 8
      ? `${t.due.slice(0, 4)}-${t.due.slice(4, 6)}-${t.due.slice(6, 8)}`
      : t.due
    return taskDate === dateStr
  })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function navigateMonth(direction: number) {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDate.value = newDate
}

function goToToday() {
  currentDate.value = new Date()
}

// 周视图
const weekDays = computed(() => {
  const date = new Date(currentDate.value)
  const day = date.getDay()
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - day)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return {
      date: d,
      tasks: getTasksForDate(d),
      isToday: isToday(d),
    }
  })
})

const weekRange = computed(() => {
  const start = weekDays.value[0].date
  const end = weekDays.value[6].date
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
})

function navigateWeek(direction: number) {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + direction * 7)
  currentDate.value = newDate
}

const emit = defineEmits<{
  edit: [task: Task]
}>()
</script>

<template>
  <div class="h-full flex flex-col min-h-0">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-black" :style="{ color: 'var(--txt-primary)' }">日历</h2>

      <div class="flex items-center gap-4">
        <!-- 视图切换 -->
        <div
          class="flex rounded-xl p-1"
          :style="{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }"
        >
          <button
            v-for="view in viewOptions"
            :key="view"
            class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
            :class="currentView === view
              ? (isDark ? 'bg-white/15 text-white' : 'bg-white text-gray-800 shadow-sm')
              : ''"
            :style="currentView !== view ? { color: 'var(--txt-muted)' } : {}"
            @click="currentView = view"
          >{{ view === 'month' ? '月' : view === 'week' ? '周' : '日' }}</button>
        </div>

        <!-- 导航 -->
        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-xl transition-colors"
            :style="{ color: 'var(--txt-muted)' }"
            @click="currentView === 'week' ? navigateWeek(-1) : navigateMonth(-1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors"
            :style="{ color: 'var(--txt-primary)' }"
            @click="goToToday"
          >今天</button>

          <button
            class="p-2 rounded-xl transition-colors"
            :style="{ color: 'var(--txt-muted)' }"
            @click="currentView === 'week' ? navigateWeek(1) : navigateMonth(1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <span class="text-sm font-bold" :style="{ color: 'var(--txt-primary)' }">
          {{ currentView === 'week' ? weekRange : currentMonth }}
        </span>
      </div>
    </div>

    <!-- 月视图 -->
    <div
      v-if="currentView === 'month'"
      class="rounded-2xl overflow-y-auto flex-1 min-h-0"
      :style="{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.30)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.50)'}`,
      }"
    >
      <!-- 星期头部 -->
      <div
        class="grid grid-cols-7"
        :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }"
      >
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="px-4 py-2 text-xs font-bold text-center"
          :style="{ color: 'var(--txt-muted)' }"
        >{{ day }}</div>
      </div>

      <!-- 日历格子 -->
      <div class="grid grid-cols-7">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="min-h-[90px] p-2"
          :style="{
            borderRight: (index % 7 !== 6) ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
            background: isToday(day.date)
              ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)')
              : (!day.isCurrentMonth ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent'),
          }"
        >
          <div
            class="text-xs font-bold mb-1"
            :style="{
              color: isToday(day.date)
                ? (isDark ? '#818cf8' : '#6366f1')
                : (!day.isCurrentMonth ? 'var(--txt-subtle)' : 'var(--txt-primary)'),
            }"
          >{{ day.date.getDate() }}</div>

          <div class="space-y-1">
            <div
              v-for="task in day.tasks.slice(0, 3)"
              :key="task.uuid"
              class="text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer font-medium"
              :style="{
                background: task.priority === 'H'
                  ? (isDark ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.10)')
                  : task.priority === 'M'
                    ? (isDark ? 'rgba(234,179,8,0.20)' : 'rgba(234,179,8,0.10)')
                    : (isDark ? 'rgba(99,102,241,0.20)' : 'rgba(99,102,241,0.10)'),
                color: task.priority === 'H'
                  ? (isDark ? '#fca5a5' : '#ef4444')
                  : task.priority === 'M'
                    ? (isDark ? '#fde68a' : '#eab308')
                    : (isDark ? '#a5b4fc' : '#6366f1'),
              }"
              @click="emit('edit', task)"
            >{{ task.description }}</div>
            <div
              v-if="day.tasks.length > 3"
              class="text-[10px]"
              :style="{ color: 'var(--txt-subtle)' }"
            >+{{ day.tasks.length - 3 }} 更多</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div
      v-else-if="currentView === 'week'"
      class="rounded-2xl overflow-y-auto flex-1 min-h-0"
      :style="{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.30)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.50)'}`,
      }"
    >
      <div class="grid grid-cols-7 h-full">
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="p-3 min-h-[200px]"
          :style="{
            borderRight: index < 6 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none',
            background: day.isToday
              ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)')
              : 'transparent',
          }"
        >
          <div
            class="text-sm font-bold mb-2"
            :style="{
              color: day.isToday
                ? (isDark ? '#818cf8' : '#6366f1')
                : 'var(--txt-primary)',
            }"
          >
            {{ daysOfWeek[index] }} {{ day.date.getDate() }}
          </div>
          <div class="space-y-1">
            <div
              v-for="task in day.tasks"
              :key="task.uuid"
              class="text-[10px] px-2 py-1 rounded-lg cursor-pointer font-medium truncate"
              :style="{
                background: task.priority === 'H'
                  ? (isDark ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.10)')
                  : task.priority === 'M'
                    ? (isDark ? 'rgba(234,179,8,0.20)' : 'rgba(234,179,8,0.10)')
                    : (isDark ? 'rgba(99,102,241,0.20)' : 'rgba(99,102,241,0.10)'),
                color: task.priority === 'H'
                  ? (isDark ? '#fca5a5' : '#ef4444')
                  : task.priority === 'M'
                    ? (isDark ? '#fde68a' : '#eab308')
                    : (isDark ? '#a5b4fc' : '#6366f1'),
              }"
              @click="emit('edit', task)"
            >{{ task.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日视图占位 -->
    <div
      v-else
      class="rounded-2xl p-8 text-center"
      :style="{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.30)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.50)'}`,
      }"
    >
      <p class="text-sm" :style="{ color: 'var(--txt-muted)' }">日视图开发中</p>
    </div>
  </div>
</template>
