import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DayCompletedModal from '@/components/DayCompletedModal.vue'
import type { Task } from '@/types/task'

const completedTasks: Task[] = [
  {
    uuid: '1', description: 'Done task A', status: 'completed', project: 'Design System',
    priority: 'H', tags: [], annotations: [],
  },
  {
    uuid: '2', description: 'Done task B', status: 'completed', project: '',
    priority: 'M', tags: [], annotations: [],
  },
]

describe('DayCompletedModal', () => {
  it('renders formatted date as title', () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: completedTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('2026')
  })

  it('renders subtitle with task count when tasks exist', () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: completedTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('完成 2 个任务')
  })

  it('renders empty day message when no tasks', () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: [], isDark: true },
    })
    expect(wrapper.text()).toContain('这一天安静地过去了')
  })

  it('renders task descriptions', () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: completedTasks, isDark: false },
    })
    expect(wrapper.text()).toContain('Done task A')
    expect(wrapper.text()).toContain('Done task B')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: completedTasks, isDark: true },
    })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows project name for tasks with project', () => {
    const wrapper = mount(DayCompletedModal, {
      props: { date: '20260628', tasks: completedTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('Design System')
  })
})
