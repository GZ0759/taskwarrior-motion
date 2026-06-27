<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/types/task'

const store = useTaskStore()

type CalendarView = 'month' | 'week' | 'day'

const currentView = ref<CalendarView>('month')
const currentDate = ref(new Date())

const viewOptions: CalendarView[] = ['month', 'week', 'day']

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonth = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const days: Array<{ date: Date; isCurrentMonth: boolean; tasks: Task[] }> = []

  // Previous month days
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, isCurrentMonth: false, tasks: getTasksForDate(date) })
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i)
    days.push({ date, isCurrentMonth: true, tasks: getTasksForDate(date) })
  }

  // Next month days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false, tasks: getTasksForDate(date) })
  }

  return days
})

function getTasksForDate(date: Date): Task[] {
  const dateStr = date.toISOString().split('T')[0]
  return store.tasks.filter((t) => {
    if (t.due) {
      return t.due === dateStr
    }
    return false
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

const emit = defineEmits<{
  edit: [task: Task]
}>()
</script>

<template>
  <div class="calendar-view">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Calendar</h2>

      <div class="flex items-center gap-4">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            v-for="view in viewOptions"
            :key="view"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="
              currentView === view
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            "
            @click="currentView = view"
          >
            {{ view.charAt(0).toUpperCase() + view.slice(1) }}
          </button>
        </div>

        <!-- Navigation -->
        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="navigateMonth(-1)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            class="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            @click="goToToday"
          >
            Today
          </button>

          <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="navigateMonth(1)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <span class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ currentMonth }}
        </span>
      </div>
    </div>

    <!-- Month View -->
    <div
      v-if="currentView === 'month'"
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <!-- Day Headers -->
      <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 text-center"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="min-h-[100px] p-2 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0"
          :class="{
            'bg-gray-50 dark:bg-gray-900/50': !day.isCurrentMonth,
            'bg-blue-50 dark:bg-blue-900/10': isToday(day.date),
          }"
        >
          <div
            class="text-sm font-medium mb-1"
            :class="{
              'text-gray-400 dark:text-gray-600': !day.isCurrentMonth,
              'text-blue-600 dark:text-blue-400': isToday(day.date),
              'text-gray-900 dark:text-gray-100': day.isCurrentMonth && !isToday(day.date),
            }"
          >
            {{ day.date.getDate() }}
          </div>

          <div class="space-y-1">
            <div
              v-for="task in day.tasks.slice(0, 3)"
              :key="task.uuid"
              class="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
              :class="{
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300':
                  task.priority === 'H',
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300':
                  task.priority === 'M',
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300':
                  task.priority === 'L',
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': !task.priority,
              }"
              @click="emit('edit', task)"
            >
              {{ task.description }}
            </div>
            <div v-if="day.tasks.length > 3" class="text-xs text-gray-500 dark:text-gray-400">
              +{{ day.tasks.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week/Day View Placeholder -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center"
    >
      <p class="text-gray-500 dark:text-gray-400">
        {{ currentView === 'week' ? 'Week' : 'Day' }} view coming soon
      </p>
    </div>
  </div>
</template>
