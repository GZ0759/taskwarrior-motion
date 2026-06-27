<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import { useKeyboard } from '@/composables/useKeyboard'
import TaskList from '@/components/TaskList.vue'
import TaskForm from '@/components/TaskForm.vue'
import KanbanView from '@/views/KanbanView.vue'
import CalendarView from '@/views/CalendarView.vue'
import DoneView from '@/views/DoneView.vue'
import type { Task, CreateTaskRequest } from '@/types/task'

const store = useTaskStore()
const { isDark, toggleTheme } = useTheme()

const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const activeTaskIndex = ref(-1)
const showHelp = ref(false)

type ViewType = 'next' | 'ready' | 'agenda' | 'forecast' | 'kanban' | 'calendar' | 'done'

const currentView = ref<ViewType>('next')

useKeyboard({
  onNewTask: () => {
    editingTask.value = null
    showForm.value = true
  },
  onNextTask: () => {
    if (activeTaskIndex.value < store.filteredTasks.length - 1) {
      activeTaskIndex.value++
    }
  },
  onPrevTask: () => {
    if (activeTaskIndex.value > 0) {
      activeTaskIndex.value--
    }
  },
  onCompleteTask: () => {
    if (activeTaskIndex.value >= 0 && activeTaskIndex.value < store.filteredTasks.length) {
      const task = store.filteredTasks[activeTaskIndex.value]
      store.completeTask(task.uuid)
    }
  },
  onEditTask: () => {
    if (activeTaskIndex.value >= 0 && activeTaskIndex.value < store.filteredTasks.length) {
      editingTask.value = store.filteredTasks[activeTaskIndex.value]
      showForm.value = true
    }
  },
  onCloseModal: () => {
    showForm.value = false
    editingTask.value = null
    showHelp.value = false
  },
  onShowHelp: () => {
    showHelp.value = !showHelp.value
  },
  onUndo: () => {
    store.undo()
  },
})

onMounted(() => {
  store.fetchTasks()
})

function handleSubmit(data: CreateTaskRequest) {
  if (editingTask.value) {
    store.updateTask(editingTask.value.uuid, data)
  } else {
    store.addTask(data)
  }
  showForm.value = false
  editingTask.value = null
}

function handleDelete(uuid: string) {
  store.deleteTask(uuid)
  if (activeTaskIndex.value >= store.filteredTasks.length) {
    activeTaskIndex.value = store.filteredTasks.length - 1
  }
}

function handleEdit(task: Task) {
  editingTask.value = task
  showForm.value = true
}

function openNewTaskForm() {
  editingTask.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingTask.value = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">taskwarrior-motion</h1>
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="toggleTheme"
          >
            <svg
              v-if="isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
          <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="showHelp = !showHelp"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] p-4"
      >
        <nav class="space-y-2">
          <button
            v-for="view in [
              'next',
              'ready',
              'agenda',
              'forecast',
              'kanban',
              'calendar',
              'done',
            ] as const"
            :key="view"
            class="w-full text-left px-3 py-2 rounded-lg transition-colors"
            :class="
              currentView === view
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            "
            @click="currentView = view"
          >
            {{ view.charAt(0).toUpperCase() + view.slice(1) }}
          </button>
        </nav>

        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Filters</h3>
          <div class="space-y-1">
            <button
              class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
              :class="
                store.activeFilter === ''
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
              @click="store.setFilter('')"
            >
              All
            </button>
            <button
              class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
              :class="
                store.activeFilter === 'status:pending'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
              @click="store.setFilter('status:pending')"
            >
              Pending
            </button>
            <button
              class="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
              :class="
                store.activeFilter === 'status:completed'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
              @click="store.setFilter('status:completed')"
            >
              Completed
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              :value="store.searchQuery"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search tasks..."
              @input="store.setSearch(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Add Task Button -->
        <div class="mb-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            @click="openNewTaskForm"
          >
            + New Task
          </button>
        </div>

        <!-- Task Form -->
        <div v-if="showForm" class="mb-6">
          <TaskForm
            :task="editingTask"
            :is-edit="!!editingTask"
            @submit="handleSubmit"
            @cancel="cancelForm"
          />
        </div>

        <!-- Task List -->
        <TaskList
          v-if="['next', 'ready', 'agenda', 'forecast'].includes(currentView)"
          :tasks="store.filteredTasks"
          :loading="store.loading"
          :active-task-uuid="
            activeTaskIndex >= 0 ? store.filteredTasks[activeTaskIndex]?.uuid : undefined
          "
          @complete="store.completeTask"
          @delete="handleDelete"
          @edit="handleEdit"
        />

        <!-- Kanban View -->
        <KanbanView v-else-if="currentView === 'kanban'" @edit="handleEdit" />

        <!-- Calendar View -->
        <CalendarView v-else-if="currentView === 'calendar'" @edit="handleEdit" />

        <!-- Done View -->
        <DoneView v-else-if="currentView === 'done'" @edit="handleEdit" />

        <!-- Error Toast -->
        <div
          v-if="store.error"
          class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {{ store.error }}
          <button class="ml-2" @click="store.error = null">×</button>
        </div>
      </main>
    </div>

    <!-- Help Modal -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showHelp = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">New task</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">n</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Next task</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">j</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Previous task</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">k</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Complete task</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">x</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Edit task</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Enter</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Close modal</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Escape</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Undo</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Ctrl+Z</kbd>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Show help</span>
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">?</kbd>
          </div>
        </div>
        <button
          class="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          @click="showHelp = false"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
