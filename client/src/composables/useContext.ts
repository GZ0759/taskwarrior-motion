import { ref } from 'vue'
import { useTaskStore } from '@/stores/task'

interface Context {
  name: string
  filter: string
  description?: string
}

export function useContext() {
  const store = useTaskStore()
  const contexts = ref<Context[]>([])
  const activeContext = ref<Context | null>(null)

  // Load contexts from localStorage
  function loadContexts() {
    const saved = localStorage.getItem('taskwarrior-contexts')
    if (saved) {
      try {
        contexts.value = JSON.parse(saved)
      } catch {
        contexts.value = []
      }
    }
  }

  // Save contexts to localStorage
  function saveContexts() {
    localStorage.setItem('taskwarrior-contexts', JSON.stringify(contexts.value))
  }

  // Add a new context
  function addContext(name: string, filter: string, description?: string) {
    const existing = contexts.value.find((c) => c.name === name)
    if (existing) {
      existing.filter = filter
      existing.description = description
    } else {
      contexts.value.push({ name, filter, description })
    }
    saveContexts()
  }

  // Remove a context
  function removeContext(name: string) {
    contexts.value = contexts.value.filter((c) => c.name !== name)
    if (activeContext.value?.name === name) {
      activeContext.value = null
      store.setFilter('')
    }
    saveContexts()
  }

  // Apply a context
  function applyContext(context: Context) {
    activeContext.value = context
    store.setFilter(context.filter)
  }

  // Clear active context
  function clearContext() {
    activeContext.value = null
    store.setFilter('')
  }

  // Initialize
  loadContexts()

  return {
    contexts,
    activeContext,
    addContext,
    removeContext,
    applyContext,
    clearContext,
  }
}
