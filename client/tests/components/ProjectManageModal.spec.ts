import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectManageModal from '@/components/ProjectManageModal.vue'
import type { Task } from '@/types/task'

const mockTasks: Task[] = [
  {
    uuid: '1', description: 'Task A', status: 'pending', project: 'Design System',
    priority: 'H', tags: [], annotations: [],
  },
  {
    uuid: '2', description: 'Task B', status: 'completed', project: 'Design System',
    priority: 'M', tags: [], annotations: [],
  },
  {
    uuid: '3', description: 'Task C', status: 'pending', project: 'Other',
    priority: 'L', tags: [], annotations: [],
  },
]

describe('ProjectManageModal', () => {
  it('renders project name as title', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    expect(wrapper.text()).toContain('Design System')
  })

  it('renders subtitle with completion stats', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    expect(wrapper.text()).toContain('1/2 完成')
  })

  it('renders pending and completed task sections', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    expect(wrapper.text()).toContain('待办')
    expect(wrapper.text()).toContain('已完成')
    expect(wrapper.text()).toContain('Task A')
    expect(wrapper.text()).toContain('Task B')
  })

  it('does not show tasks from other projects', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    expect(wrapper.text()).not.toContain('Task C')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows delete and confirm buttons', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    expect(wrapper.text()).toContain('删除')
    expect(wrapper.text()).toContain('确定')
  })

  it('does not show add project input at bottom', () => {
    const wrapper = mount(ProjectManageModal, {
      props: { project: 'Design System', tasks: mockTasks, isDark: true, allProjects: [] },
    })
    const input = wrapper.find('input[placeholder="新建项目名…"]')
    expect(input.exists()).toBe(false)
  })
})
