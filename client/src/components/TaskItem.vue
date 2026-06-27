<script setup lang="ts">
import type { Task } from '@/types/task'

defineProps<{
  task: Task
  isActive?: boolean
  isTracking?: boolean
}>()

const emit = defineEmits<{
  complete: [uuid: string]
  delete: [uuid: string]
  edit: [task: Task]
  toggleTimer: [uuid: string]
}>()

function getPriorityColor(priority?: string) {
  switch (priority) {
    case 'H':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20'
    case 'M':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    case 'L':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    default:
      return ''
  }
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div
    class="task-item group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    :class="{ 'ring-2 ring-blue-500': isActive }"
  >
    <button
      class="complete-btn w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-green-500 dark:hover:border-green-400 transition-colors"
      @click="emit('complete', task.uuid)"
    >
      <svg
        v-if="task.status === 'completed'"
        class="w-4 h-4 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span
          class="description text-gray-900 dark:text-gray-100"
          :class="{ 'line-through text-gray-400 dark:text-gray-500': task.status === 'completed' }"
        >
          {{ task.description }}
        </span>
        <span
          v-if="task.priority"
          class="priority-badge px-1.5 py-0.5 text-xs font-medium rounded"
          :class="getPriorityColor(task.priority)"
        >
          {{ task.priority }}
        </span>
      </div>
      <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="task.project" class="project">{{ task.project }}</span>
        <span v-if="task.due" class="due">Due: {{ formatDate(task.due) }}</span>
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="tag px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <button
        v-if="task.status === 'pending'"
        class="timer-btn p-1.5 rounded-lg"
        :class="
          isTracking
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        "
        @click="emit('toggleTimer', task.uuid)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="isTracking"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            v-if="!isTracking"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <button
        class="edit-btn p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="emit('edit', task)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        class="delete-btn p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
        @click="emit('delete', task.uuid)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

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
