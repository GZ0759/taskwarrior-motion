import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarView from '@/views/CalendarView.vue'
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

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const y = today.getFullYear()
const m = today.getMonth()

const taskToday = makeTask({
  uuid: '1',
  description: 'Today task',
  status: 'pending',
  due: `${y}${String(m + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}T120000Z`,
  priority: 'H',
})

const taskCompleted = makeTask({
  uuid: '2',
  description: 'Completed task',
  status: 'completed',
  due: `${y}${String(m + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}T120000Z`,
})

const taskNoDue = makeTask({
  uuid: '3',
  description: 'No due date task',
  status: 'pending',
})

describe('CalendarView', () => {
  it('renders month/week tab toggle', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [], isDark: true },
    })
    expect(wrapper.text()).toContain('月')
    expect(wrapper.text()).toContain('周')
  })

  it('shows today button', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [], isDark: true },
    })
    expect(wrapper.text()).toContain('今天')
  })

  it('renders day name headers in month view', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [], isDark: true },
    })
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    dayNames.forEach(d => {
      expect(wrapper.text()).toContain(d)
    })
  })

  it('shows tasks on their due date in month view', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [taskToday], isDark: true },
    })
    expect(wrapper.text()).toContain('Today task')
  })

  it('does not show completed tasks', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [taskCompleted], isDark: true },
    })
    expect(wrapper.text()).not.toContain('Completed task')
  })

  it('does not show tasks without due date', () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [taskNoDue], isDark: true },
    })
    expect(wrapper.text()).not.toContain('No due date task')
  })

  it('emits edit when task chip is clicked', async () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [taskToday], isDark: true },
    })
    const taskBtn = wrapper.findAll('button').find(b => b.text().includes('Today task'))
    expect(taskBtn).toBeTruthy()
    await taskBtn!.trigger('click')
    expect(wrapper.emitted('edit')?.[0]).toEqual([taskToday])
  })

  it('switches to week view when week tab clicked', async () => {
    const wrapper = mount(CalendarView, {
      props: { tasks: [], isDark: true },
    })
    const weekBtn = wrapper.findAll('button').find(b => b.text() === '周')
    expect(weekBtn).toBeTruthy()
    await weekBtn!.trigger('click')
    expect(wrapper.vm.calView).toBe('week')
  })
})
