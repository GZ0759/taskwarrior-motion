<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types/task'
import TaskItem from './TaskItem.vue'

const props = defineProps<{
  tasks: Task[]
  loading?: boolean
  activeTaskUuid?: string
  trackingUuid?: string
}>()

const emit = defineEmits<{
  complete: [uuid: string]
  delete: [uuid: string]
  edit: [task: Task]
  toggleTimer: [uuid: string]
  bulkComplete: [uuids: string[]]
  bulkDelete: [uuids: string[]]
}>()

const selectedTasks = ref<Set<string>>(new Set())

const isAllSelected = computed(() => {
  return props.tasks.length > 0 && selectedTasks.value.size === props.tasks.length
})

const selectedCount = computed(() => selectedTasks.value.size)

function toggleSelect(uuid: string) {
  if (selectedTasks.value.has(uuid)) {
    selectedTasks.value.delete(uuid)
  } else {
    selectedTasks.value.add(uuid)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedTasks.value.clear()
  } else {
    props.tasks.forEach((t) => selectedTasks.value.add(t.uuid))
  }
}

function bulkComplete() {
  emit('bulkComplete', Array.from(selectedTasks.value))
  selectedTasks.value.clear()
}

function bulkDelete() {
  emit('bulkDelete', Array.from(selectedTasks.value))
  selectedTasks.value.clear()
}
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

    <div v-else>
      <!-- Bulk Actions Bar -->
      <div
        v-if="selectedCount > 0"
        class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between"
      >
        <span class="text-sm text-blue-700 dark:text-blue-300">
          {{ selectedCount }} task{{ selectedCount > 1 ? 's' : '' }} selected
        </span>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            @click="bulkComplete"
          >
            Complete All
          </button>
          <button
            class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            @click="bulkDelete"
          >
            Delete All
          </button>
          <button
            class="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            @click="selectedTasks.clear()"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Select All -->
      <div class="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          :checked="isAllSelected"
          class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
          @change="toggleSelectAll"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">Select all</span>
      </div>

      <!-- Task Items -->
      <div class="space-y-2">
        <div v-for="task in tasks" :key="task.uuid" class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="selectedTasks.has(task.uuid)"
            class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            @change="toggleSelect(task.uuid)"
          />
          <div class="flex-1">
            <TaskItem
              :task="task"
              :is-active="task.uuid === activeTaskUuid"
              :is-tracking="task.uuid === trackingUuid"
              @complete="emit('complete', $event)"
              @delete="emit('delete', $event)"
              @edit="emit('edit', $event)"
              @toggle-timer="emit('toggleTimer', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
