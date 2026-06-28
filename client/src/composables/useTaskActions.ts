import { useTaskStore } from '@/stores/task'
import { useTimeTracking } from '@/composables/useTimeTracking'
import type { Task, UpdateTaskRequest } from '@/types/task'

export function useTaskActions() {
  const store = useTaskStore()
  const { startTracking, stopTracking, activeTask } = useTimeTracking()

  function startTask(uuid: string) {
    const task = store.tasks.find(t => t.uuid === uuid)
    if (!task) return
    store.startTask(uuid)
    startTracking(task)
  }

  function stopTask(uuid: string) {
    if (activeTask.value?.uuid === uuid) {
      stopTracking()
    }
    store.stopTask(uuid)
  }

  function updateTask(uuid: string, data: Partial<Task>, currentStatus?: string) {
    if (data.status === 'started') {
      store.startTask(uuid)
    } else if (data.status === 'pending') {
      if (currentStatus === 'completed') {
        store.uncompleteTask(uuid)
      } else {
        store.stopTask(uuid)
      }
    } else {
      store.updateTask(uuid, data as UpdateTaskRequest)
    }
  }

  async function completeTask(uuid: string, desc: string, achievementEnabled: boolean) {
    await store.completeTask(uuid)
    await store.fetchStats()
    if (achievementEnabled) {
      return { description: desc }
    }
    return null
  }

  function deleteTask(uuid: string) {
    store.deleteTask(uuid)
  }

  function saveEdit(uuid: string, data: UpdateTaskRequest) {
    store.updateTask(uuid, data)
  }

  function uncompleteTask(uuid: string) {
    store.uncompleteTask(uuid)
  }

  return {
    startTask,
    stopTask,
    updateTask,
    completeTask,
    deleteTask,
    saveEdit,
    uncompleteTask,
  }
}
