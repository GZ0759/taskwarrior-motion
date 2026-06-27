import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '@/stores/task'

describe('TaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty tasks', () => {
    const store = useTaskStore()
    expect(store.tasks).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('computes pending tasks', () => {
    const store = useTaskStore()
    store.tasks = [
      { uuid: '1', description: 'Task 1', status: 'pending', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 1 },
      { uuid: '2', description: 'Task 2', status: 'completed', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 2 },
    ]

    expect(store.pendingTasks).toHaveLength(1)
    expect(store.pendingTasks[0].uuid).toBe('1')
  })

  it('computes completed tasks', () => {
    const store = useTaskStore()
    store.tasks = [
      { uuid: '1', description: 'Task 1', status: 'pending', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 1 },
      { uuid: '2', description: 'Task 2', status: 'completed', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 2 },
    ]

    expect(store.completedTasks).toHaveLength(1)
    expect(store.completedTasks[0].uuid).toBe('2')
  })

  it('sets search query', () => {
    const store = useTaskStore()
    store.setSearch('test')
    expect(store.searchQuery).toBe('test')
  })

  it('sets filter', () => {
    const store = useTaskStore()
    store.setFilter('status:pending')
    expect(store.activeFilter).toBe('status:pending')
  })

  it('filters tasks by search query', () => {
    const store = useTaskStore()
    store.tasks = [
      { uuid: '1', description: 'Buy milk', status: 'pending', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 1 },
      { uuid: '2', description: 'Write code', status: 'pending', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 2 },
    ]

    store.setSearch('milk')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].description).toBe('Buy milk')
  })

  it('filters tasks by status', () => {
    const store = useTaskStore()
    store.tasks = [
      { uuid: '1', description: 'Task 1', status: 'pending', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 1 },
      { uuid: '2', description: 'Task 2', status: 'completed', entry: '2026-06-27', modified: '2026-06-27', urgency: 0, id: 2 },
    ]

    store.setFilter('status:pending')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].status).toBe('pending')
  })
})
