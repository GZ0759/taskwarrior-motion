<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskItem from '@/components/TaskItem.vue'
import type { Task } from '@/types/task'

const store = useTaskStore()

const daysToShow = ref(14)

const completedTasks = computed(() => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToShow.value)

  return store.completedTasks
    .filter((t) => {
      if (t.end) {
        return new Date(t.end) >= cutoffDate
      }
      return false
    })
    .sort((a, b) => {
      if (a.end && b.end) {
        return new Date(b.end).getTime() - new Date(a.end).getTime()
      }
      return 0
    })
})

const emit = defineEmits<{
  edit: [task: Task]
}>()
</script>

<template>
  <div class="done-view">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Completed Tasks</h2>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">Show last:</label>
        <select
          v-model="daysToShow"
          class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option :value="7">7 days</option>
          <option :value="14">14 days</option>
          <option :value="30">30 days</option>
          <option :value="90">90 days</option>
        </select>
      </div>
    </div>

    <div
      v-if="completedTasks.length === 0"
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p>No completed tasks in the last {{ daysToShow }} days</p>
    </div>

    <div v-else class="space-y-2">
      <TaskItem
        v-for="task in completedTasks"
        :key="task.uuid"
        :task="task"
        @complete="store.completeTask"
        @delete="store.deleteTask"
        @edit="emit('edit', task)"
      />
    </div>
  </div>
</template>
