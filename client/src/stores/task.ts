import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi } from '@/api/taskwarrior'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const activeFilter = ref('')

  const pendingTasks = computed(() => tasks.value.filter((t) => t.status === 'pending'))

  const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'completed'))

  const filteredTasks = computed(() => {
    let result = tasks.value

    if (activeFilter.value) {
      result = result.filter((t) => {
        if (activeFilter.value === 'status:pending') return t.status === 'pending'
        if (activeFilter.value === 'status:completed') return t.status === 'completed'
        if (activeFilter.value.startsWith('project:')) {
          return t.project === activeFilter.value.replace('project:', '')
        }
        if (activeFilter.value.startsWith('priority:')) {
          return t.priority === activeFilter.value.replace('priority:', '')
        }
        return true
      })
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.project?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    return result
  })

  async function fetchTasks(params?: { filter?: string; sort?: string; search?: string }) {
    loading.value = true
    error.value = null
    try {
      tasks.value = await taskApi.getTasks(params)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function addTask(task: CreateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      await taskApi.createTask(task)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTask(uuid: string, task: UpdateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      await taskApi.updateTask(uuid, task)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(uuid: string) {
    loading.value = true
    error.value = null
    try {
      await taskApi.deleteTask(uuid)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function completeTask(uuid: string) {
    loading.value = true
    error.value = null
    try {
      await taskApi.doneTask(uuid)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function startTask(uuid: string) {
    try {
      await taskApi.startTask(uuid)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  async function stopTask(uuid: string) {
    try {
      await taskApi.stopTask(uuid)
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  async function undo() {
    try {
      await taskApi.undo()
      await fetchTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  function setFilter(filter: string) {
    activeFilter.value = filter
  }

  return {
    tasks,
    loading,
    error,
    searchQuery,
    activeFilter,
    pendingTasks,
    completedTasks,
    filteredTasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    startTask,
    stopTask,
    undo,
    setSearch,
    setFilter,
  }
})
