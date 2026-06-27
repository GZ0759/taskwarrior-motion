<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task, CreateTaskRequest } from '@/types/task'

const props = defineProps<{
  task?: Task | null
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateTaskRequest]
  cancel: []
}>()

const description = ref('')
const project = ref('')
const tags = ref('')
const priority = ref<'H' | 'M' | 'L' | ''>('')
const due = ref('')

watch(
  () => props.task,
  (task) => {
    if (task) {
      description.value = task.description
      project.value = task.project || ''
      tags.value = task.tags?.join(', ') || ''
      priority.value = task.priority || ''
      due.value = task.due || ''
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  description.value = ''
  project.value = ''
  tags.value = ''
  priority.value = ''
  due.value = ''
}

function handleSubmit() {
  if (!description.value.trim()) return

  const data: CreateTaskRequest = {
    description: description.value.trim(),
  }

  if (project.value.trim()) {
    data.project = project.value.trim()
  }

  if (tags.value.trim()) {
    data.tags = tags.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  if (priority.value) {
    data.priority = priority.value
  }

  if (due.value) {
    data.due = due.value
  }

  emit('submit', data)
  resetForm()
}
</script>

<template>
  <form
    class="task-form p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    @submit.prevent="handleSubmit"
  >
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
      {{ isEdit ? 'Edit Task' : 'New Task' }}
    </h3>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <input
          v-model="description"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Task description..."
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project
          </label>
          <input
            v-model="project"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Project name..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            v-model="priority"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            <option value="H">High</option>
            <option value="M">Medium</option>
            <option value="L">Low</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <input
            v-model="tags"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tag1, tag2, ..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            v-model="due"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <button
        type="button"
        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>
