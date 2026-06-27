import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi } from '@/api/taskwarrior'
import type { Stats } from '@/api/taskwarrior'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const activeFilter = ref('')

  // 视图专用数据
  const pendingTasks = ref<Task[]>([])
  const completedTasks = ref<Task[]>([])
  const calendarTasks = ref<Task[]>([])
  const stats = ref<Stats | null>(null)

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

  async function fetchPendingTasks() {
    loading.value = true
    error.value = null
    try {
      pendingTasks.value = await taskApi.getPendingTasks()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchCompletedTasks(days: number = 14) {
    loading.value = true
    error.value = null
    try {
      completedTasks.value = await taskApi.getCompletedTasks(days)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchCalendarTasks() {
    loading.value = true
    error.value = null
    try {
      calendarTasks.value = await taskApi.getCalendarTasks()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchCompletedOnDate(date: string): Promise<Task[]> {
    loading.value = true
    error.value = null
    try {
      return await taskApi.getCompletedOnDate(date)
    } catch (e) {
      error.value = (e as Error).message
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      stats.value = await taskApi.getStats()
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
      // 重新获取任务列表
      await fetchPendingTasks()
      await fetchStats()
      // 将新任务移到顶部（通过 description 匹配）
      const newIndex = pendingTasks.value.findIndex(t => t.description === task.description)
      if (newIndex > 0) {
        const [newTask] = pendingTasks.value.splice(newIndex, 1)
        pendingTasks.value.unshift(newTask)
      }
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
      await fetchPendingTasks()
      await fetchStats()
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
      await fetchPendingTasks()
      await fetchStats()
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
      await fetchPendingTasks()
      await fetchStats()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function uncompleteTask(uuid: string) {
    loading.value = true
    error.value = null
    try {
      await taskApi.uncompleteTask(uuid)
      await fetchPendingTasks()
      await fetchCompletedTasks()
      await fetchStats()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function startTask(uuid: string) {
    loading.value = true
    error.value = null
    try {
      await taskApi.startTask(uuid)
      await fetchPendingTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function stopTask(uuid: string) {
    loading.value = true
    error.value = null
    try {
      await taskApi.stopTask(uuid)
      await fetchPendingTasks()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function undo() {
    loading.value = true
    error.value = null
    try {
      await taskApi.undo()
      await fetchPendingTasks()
      await fetchStats()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function deleteProject(name: string) {
    // 将该项目下的所有任务的 project 清空
    tasks.value
      .filter((t) => t.project === name)
      .forEach((t) => updateTask(t.uuid, { project: '' }))
  }

  function deleteTag(name: string) {
    // 从所有任务中移除该标签
    tasks.value
      .filter((t) => t.tags?.includes(name))
      .forEach((t) =>
        updateTask(t.uuid, { tags: t.tags?.filter((tag) => tag !== name) })
      )
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
    calendarTasks,
    stats,
    filteredTasks,
    fetchTasks,
    fetchPendingTasks,
    fetchCompletedTasks,
    fetchCalendarTasks,
    fetchCompletedOnDate,
    fetchStats,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    startTask,
    stopTask,
    undo,
    clearError,
    deleteProject,
    deleteTag,
    setSearch,
    setFilter,
  }
})
