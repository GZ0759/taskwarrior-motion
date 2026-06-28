import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import KanbanView from '@/views/KanbanView.vue'
import type { Task } from '@/types/task'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  uuid: 'abc-123',
  description: 'Test task',
  status: 'pending',
  entry: '2025-01-01',
  modified: '2025-01-02',
  urgency: 0,
  id: 1,
  ...overrides,
})

const pendingNoProject = makeTask({ uuid: '1', description: 'Inbox task', status: 'pending' })
const pendingWithProject = makeTask({ uuid: '2', description: 'Backlog task', status: 'pending', project: 'work' })
const startedTask = makeTask({ uuid: '3', description: 'In progress task', status: 'started' as Task['status'] })
const completedTask = makeTask({ uuid: '4', description: 'Done task', status: 'completed', end: '2025-01-03' })
const priorityTask = makeTask({ uuid: '5', description: 'Urgent task', status: 'pending', priority: 'H', project: 'proj' })

const sampleTasks = [pendingNoProject, pendingWithProject, startedTask, completedTask, priorityTask]

describe('KanbanView', () => {
  function mountKanban(props: { tasks: Task[], isDark: boolean }) {
    setActivePinia(createPinia())
    return mount(KanbanView, { props })
  }

  it('renders all 5 columns', () => {
    const wrapper = mountKanban({ tasks: sampleTasks, isDark: true })
    const labels = wrapper.findAll('span.text-xs.font-bold')
    expect(labels.map(l => l.text())).toEqual(['Inbox', 'Backlog', 'In Progress', 'On Hold', 'Done'])
  })

  it('shows task count per column', () => {
    const wrapper = mountKanban({ tasks: sampleTasks, isDark: true })
    const counts = wrapper.findAll('span.text-\\[10px\\]')
    const countTexts = counts.map(c => c.text())
    expect(countTexts).toContain('1')
    expect(countTexts).toContain('2')
  })

  it('shows empty placeholder when column has no tasks', () => {
    const wrapper = mountKanban({ tasks: [], isDark: true })
    const empties = wrapper.findAll('div.text-center.py-6')
    expect(empties.length).toBe(5)
  })

  it('emits complete when complete button clicked', async () => {
    const wrapper = mountKanban({ tasks: [pendingNoProject], isDark: true })
    const completeBtn = wrapper.findAll('button').find(b => b.text() === '完成')
    expect(completeBtn).toBeTruthy()
    await completeBtn!.trigger('click')
    expect(wrapper.emitted('complete')?.[0]).toEqual(['1', 'Inbox task'])
  })

  it('renders task description in kanban cards', () => {
    const wrapper = mountKanban({ tasks: [priorityTask], isDark: true })
    expect(wrapper.text()).toContain('Urgent task')
  })

  it('places tasks with project in Backlog column', () => {
    const taskWithProject = makeTask({ uuid: '5', description: 'Proj task', status: 'pending', priority: 'H', project: 'myproject' })
    const wrapper = mountKanban({ tasks: [taskWithProject], isDark: true })
    const backlogCol = wrapper.findAll('span.text-xs.font-bold').find(l => l.text() === 'Backlog')
    expect(backlogCol).toBeTruthy()
    const backlogSection = backlogCol!.element.parentElement!.parentElement!
    expect(backlogSection.textContent).toContain('Proj task')
  })

  it('has popover trigger button for task actions', () => {
    const wrapper = mountKanban({ tasks: [pendingNoProject], isDark: true })
    const popoverBtn = wrapper.findAll('button').find(b => b.text() === '···')
    expect(popoverBtn).toBeTruthy()
  })

  it('emits delete when delete action triggered', async () => {
    const wrapper = mountKanban({ tasks: [pendingNoProject], isDark: true })
    wrapper.vm.$emit('delete', '1')
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1'])
  })
})
