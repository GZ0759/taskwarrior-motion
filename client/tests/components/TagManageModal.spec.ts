import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagManageModal from '@/components/TagManageModal.vue'
import type { Task } from '@/types/task'

const mockTasks: Task[] = [
  {
    uuid: '1', description: 'Tagged Task A', status: 'pending', project: '',
    priority: 'H', tags: ['urgent', 'dev'], annotations: [],
  },
  {
    uuid: '2', description: 'Tagged Task B', status: 'completed', project: '',
    priority: 'M', tags: ['urgent'], annotations: [],
  },
  {
    uuid: '3', description: 'Other Task', status: 'pending', project: '',
    priority: 'L', tags: ['dev'], annotations: [],
  },
]

describe('TagManageModal', () => {
  it('renders tag name with # prefix as title', () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('#urgent')
  })

  it('renders subtitle with task count', () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('2 个任务')
  })

  it('renders pending and completed task sections', () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('待办')
    expect(wrapper.text()).toContain('已完成')
    expect(wrapper.text()).toContain('Tagged Task A')
    expect(wrapper.text()).toContain('Tagged Task B')
  })

  it('does not show tasks without the tag', () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    expect(wrapper.text()).not.toContain('Other Task')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows rename and delete buttons', () => {
    const wrapper = mount(TagManageModal, {
      props: { tag: 'urgent', tasks: mockTasks, isDark: true },
    })
    expect(wrapper.text()).toContain('重命名')
    expect(wrapper.text()).toContain('删除标签')
  })
})
