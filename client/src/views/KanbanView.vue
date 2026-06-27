<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/types/task'

const store = useTaskStore()

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
  <div class="kanban-view">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kanban Board</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div
        v-for="column in getColumnTasks"
        :key="column.key"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-700 dark:text-gray-300">
            {{ column.label }}
          </h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ column.tasks.length }}
          </span>
        </div>

        <div class="space-y-2">
          <div
            v-for="task in column.tasks"
            :key="task.uuid"
            class="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm text-gray-900 dark:text-gray-100 truncate"
                  :class="{ 'line-through text-gray-400': task.status === 'completed' }"
                >
                  {{ task.description }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    v-if="task.priority"
                    class="text-xs px-1.5 py-0.5 rounded"
                    :class="{
                      'text-red-500 bg-red-50 dark:bg-red-900/20': task.priority === 'H',
                      'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20': task.priority === 'M',
                      'text-blue-500 bg-blue-50 dark:bg-blue-900/20': task.priority === 'L',
                    }"
                  >
                    {{ task.priority }}
                  </span>
                  <span v-if="task.project" class="text-xs text-gray-500">
                    {{ task.project }}
                  </span>
                </div>
              </div>

              <div class="flex gap-1 ml-2">
                <button
                  v-if="column.key !== 'in-progress' && task.status === 'pending'"
                  class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  @click="moveToColumn(task, 'in-progress')"
                >
                  Start
                </button>
                <button
                  v-if="column.key !== 'done' && task.status === 'pending'"
                  class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                  @click="moveToColumn(task, 'done')"
                >
                  Done
                </button>
                <button
                  class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                  @click="emit('edit', task)"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="column.tasks.length === 0"
            class="text-center py-4 text-sm text-gray-400 dark:text-gray-500"
          >
            No tasks
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
