import { ref, computed } from 'vue'
import type { Task } from '@/types/task'

// 模块级单例状态
const activeTask = ref<Task | null>(null)
const startTime = ref<Date | null>(null)
const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const isTracking = computed(() => activeTask.value !== null)

const formattedTime = computed(() => {
  const seconds = elapsedTime.value
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
})

export function useTimeTracking() {
  function startTracking(task: Task) {
    if (activeTask.value) {
      stopTracking()
    }

    activeTask.value = task
    startTime.value = new Date()
    elapsedTime.value = 0

    timerInterval = setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)
      }
    }, 1000)
  }

  function stopTracking() {
    cleanup()
  }

  function cleanup() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    activeTask.value = null
    startTime.value = null
    elapsedTime.value = 0
  }

  function toggleTracking(task: Task) {
    if (activeTask.value?.uuid === task.uuid) {
      stopTracking()
    } else {
      startTracking(task)
    }
  }

  return {
    activeTask,
    isTracking,
    formattedTime,
    startTracking,
    stopTracking,
    toggleTracking,
    cleanup,
  }
}
