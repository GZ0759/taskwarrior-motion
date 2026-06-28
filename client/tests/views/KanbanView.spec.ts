import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
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
  it('renders all 5 columns', () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: sampleTasks, isDark: true },
    })
    const labels = wrapper.findAll('span.text-xs.font-bold')
    expect(labels.map(l => l.text())).toEqual(['Inbox', 'Backlog', 'In Progress', 'On Hold', 'Done'])
  })

  it('shows task count per column', () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: sampleTasks, isDark: true },
    })
    const counts = wrapper.findAll('span.text-\\[10px\\]')
    const countTexts = counts.map(c => c.text())
    expect(countTexts).toContain('1')
    expect(countTexts).toContain('2')
  })

  it('shows empty placeholder when column has no tasks', () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: [], isDark: true },
    })
    const empties = wrapper.findAll('div.text-center.py-6')
    expect(empties.length).toBe(5)
  })

  it('emits edit when edit button clicked', async () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: [pendingNoProject], isDark: true },
    })
    const editBtn = wrapper.findAll('button').find(b => b.text() === '编辑')
    expect(editBtn).toBeTruthy()
    await editBtn!.trigger('click')
    expect(wrapper.emitted('edit')?.[0]).toEqual([pendingNoProject])
  })

  it('emits complete when complete button clicked', async () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: [pendingNoProject], isDark: true },
    })
    const completeBtn = wrapper.findAll('button').find(b => b.text() === '完成')
    expect(completeBtn).toBeTruthy()
    await completeBtn!.trigger('click')
    expect(wrapper.emitted('complete')?.[0]).toEqual(['1', 'Inbox task'])
  })

  it('emits update when start button clicked', async () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: [pendingNoProject], isDark: true },
    })
    const startBtn = wrapper.findAll('button').find(b => b.text() === '开始')
    expect(startBtn).toBeTruthy()
    await startBtn!.trigger('click')
    expect(wrapper.emitted('update')?.[0]).toEqual(['1', { status: 'started' }])
  })

  it('shows priority badge for tasks with priority', () => {
    const wrapper = mount(KanbanView, {
      props: { tasks: [priorityTask], isDark: true },
    })
    expect(wrapper.text()).toContain('紧急')
  })

  it('shows project name for tasks with project', () => {
    const taskWithProject = makeTask({ uuid: '5', description: 'Proj task', status: 'pending', priority: 'H', project: 'myproject' })
    const wrapper = mount(KanbanView, {
      props: { tasks: [taskWithProject], isDark: true },
    })
    expect(wrapper.text()).toContain('myproject')
  })
})
