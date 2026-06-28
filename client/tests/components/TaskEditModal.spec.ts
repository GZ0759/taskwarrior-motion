import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskEditModal from '@/components/TaskEditModal.vue'
import type { Task } from '@/types/task'

const baseTask: Task = {
  uuid: 'abc-123',
  description: 'Edit me',
  status: 'pending',
  project: 'Design System',
  priority: 'H',
  tags: ['dev', 'urgent'],
  annotations: [],
  due: '20260701T000000Z',
}

describe('TaskEditModal', () => {
  it('renders task description in input', () => {
    const wrapper = mount(TaskEditModal, {
      props: { task: baseTask, isDark: true, allProjects: ['Design System'], allTags: ['dev', 'urgent'] },
    })
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('Edit me')
  })

  it('renders project select', () => {
    const wrapper = mount(TaskEditModal, {
      props: { task: baseTask, isDark: true, allProjects: ['Design System'], allTags: ['dev', 'urgent'] },
    })
    expect(wrapper.text()).toContain('Design System')
  })

  it('renders priority buttons with Chinese labels', () => {
    const wrapper = mount(TaskEditModal, {
      props: { task: baseTask, isDark: true, allProjects: ['Design System'], allTags: ['dev', 'urgent'] },
    })
    expect(wrapper.text()).toContain('紧急')
    expect(wrapper.text()).toContain('普通')
    expect(wrapper.text()).toContain('低优')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(TaskEditModal, {
      props: { task: baseTask, isDark: true, allProjects: ['Design System'], allTags: ['dev', 'urgent'] },
    })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('renders tag select section', () => {
    const wrapper = mount(TaskEditModal, {
      props: { task: baseTask, isDark: true, allProjects: ['Design System'], allTags: ['dev', 'urgent'] },
    })
    expect(wrapper.text()).toContain('dev')
    expect(wrapper.text()).toContain('urgent')
  })
})
