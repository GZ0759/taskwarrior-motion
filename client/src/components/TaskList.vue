<script setup lang="ts">
import type { Task } from '@/types/task'
import TaskItem from './TaskItem.vue'

defineProps<{
  tasks: Task[]
  loading?: boolean
  activeTaskUuid?: string
}>()

const emit = defineEmits<{
  complete: [uuid: string]
  delete: [uuid: string]
  edit: [task: Task]
}>()
</script>

<template>
  <div class="task-list">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div
      v-else-if="tasks.length === 0"
      class="empty-state text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p>No tasks found</p>
    </div>

    <div v-else class="space-y-2">
      <TaskItem
        v-for="task in tasks"
        :key="task.uuid"
        :task="task"
        :is-active="task.uuid === activeTaskUuid"
        @complete="emit('complete', $event)"
        @delete="emit('delete', $event)"
        @edit="emit('edit', $event)"
      />
    </div>
  </div>
</template>
