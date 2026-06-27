<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import type { Task } from '@/types/task'

const store = useTaskStore()
const { isDark } = useTheme()

const columns = [
  { key: 'inbox', label: 'Inbox', filter: (t: Task) => !t.project && t.status === 'pending' },
  {
    key: 'backlog',
    label: 'Backlog',
    filter: (t: Task) => !!t.project && t.status === 'pending' && !t.start,
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    filter: (t: Task) => !!t.start && t.status === 'pending',
  },
  { key: 'on-hold', label: 'On Hold', filter: (t: Task) => t.wait && t.status === 'pending' },
  { key: 'done', label: 'Done', filter: (t: Task) => t.status === 'completed' },
]

const getColumnTasks = computed(() => {
  return columns.map((col) => ({
    ...col,
    tasks: store.tasks.filter(col.filter),
  }))
})

function moveToColumn(task: Task, targetColumn: string) {
  switch (targetColumn) {
    case 'in-progress':
      store.startTask(task.uuid)
      break
    case 'done':
      store.completeTask(task.uuid)
      break
    case 'backlog':
      if (task.start) {
        store.stopTask(task.uuid)
      }
      break
  }
}

const emit = defineEmits<{
  edit: [task: Task]
}>()
</script>

<template>
  <div class="h-full flex flex-col">
    <h2 class="text-lg font-black mb-4 shrink-0" :style="{ color: 'var(--txt-primary)' }">看板</h2>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-0">
      <div
        v-for="column in getColumnTasks"
        :key="column.key"
        class="rounded-2xl p-4 flex flex-col min-h-0"
        :style="{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.30)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.50)'}`,
        }"
      >
        <!-- 列头 -->
        <div class="flex items-center justify-between mb-3 shrink-0">
          <h3 class="font-semibold text-sm" :style="{ color: 'var(--txt-primary)' }">
            {{ column.label }}
          </h3>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :style="{
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
              color: 'var(--txt-muted)',
            }"
          >{{ column.tasks.length }}</span>
        </div>

        <!-- 任务列表（固定高度，内部滚动） -->
        <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
          <div
            v-for="task in column.tasks"
            :key="task.uuid"
            class="rounded-xl p-3 transition-colors"
            :style="{
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.60)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.70)'}`,
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate"
                  :style="{ color: 'var(--txt-primary)' }"
                  :class="{ 'line-through opacity-50': task.status === 'completed' }"
                >{{ task.description }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    v-if="task.priority"
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    :class="{
                      'priority-h': task.priority === 'H',
                      'priority-m': task.priority === 'M',
                      'priority-l': task.priority === 'L',
                    }"
                    :style="{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }"
                  >{{ task.priority }}</span>
                  <span
                    v-if="task.project"
                    class="text-[10px]"
                    :style="{ color: 'var(--txt-muted)' }"
                  >{{ task.project }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-1.5 mt-2">
              <button
                v-if="column.key !== 'in-progress' && task.status === 'pending'"
                class="text-[10px] px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                :style="{
                  background: isDark ? 'rgba(59,130,246,0.20)' : 'rgba(59,130,246,0.10)',
                  color: isDark ? '#93c5fd' : '#3b82f6',
                }"
                @click="moveToColumn(task, 'in-progress')"
              >开始</button>
              <button
                v-if="column.key !== 'done' && task.status === 'pending'"
                class="text-[10px] px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                :style="{
                  background: isDark ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.10)',
                  color: isDark ? '#86efac' : '#22c55e',
                }"
                @click="moveToColumn(task, 'done')"
              >完成</button>
              <button
                class="text-[10px] px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                :style="{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  color: 'var(--txt-muted)',
                }"
                @click="emit('edit', task)"
              >编辑</button>
            </div>
          </div>

          <div
            v-if="column.tasks.length === 0"
            class="text-center py-4 text-xs"
            :style="{ color: 'var(--txt-subtle)' }"
          >无任务</div>
        </div>
      </div>
    </div>
  </div>
</template>
