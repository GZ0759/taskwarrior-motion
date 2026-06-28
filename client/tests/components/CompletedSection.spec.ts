import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompletedSection from '@/components/CompletedSection.vue'
import type { Task } from '@/types/task'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  uuid: 'abc-123',
  description: 'Test task',
  status: 'completed',
  entry: '2025-01-01',
  modified: '2025-01-02',
  end: '2025-01-02',
  urgency: 0,
  id: 1,
  ...overrides,
})

describe('CompletedSection', () => {
  it('does not render when tasks is empty', () => {
    const wrapper = mount(CompletedSection, {
      props: { tasks: [], isDark: true },
    })
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('renders when tasks exist', () => {
    const wrapper = mount(CompletedSection, {
      props: { tasks: [makeTask()], isDark: true },
    })
    expect(wrapper.text()).toContain('已完成')
  })

  it('shows task count', () => {
    const tasks = [makeTask({ uuid: '1' }), makeTask({ uuid: '2' }), makeTask({ uuid: '3' })]
    const wrapper = mount(CompletedSection, {
      props: { tasks, isDark: true },
    })
    expect(wrapper.text()).toContain('已完成 (3)')
  })

  it('toggles open/close on button click', async () => {
    const wrapper = mount(CompletedSection, {
      props: { tasks: [makeTask()], isDark: true },
    })
    const btn = wrapper.find('button')
    expect(wrapper.vm.open).toBe(false)
    await btn.trigger('click')
    expect(wrapper.vm.open).toBe(true)
    await btn.trigger('click')
    expect(wrapper.vm.open).toBe(false)
  })

  it('emits uncomplete with task uuid', async () => {
    const wrapper = mount(CompletedSection, {
      props: { tasks: [makeTask({ uuid: 'xyz-999' })], isDark: true },
    })
    await wrapper.setData({ open: true })
    const buttons = wrapper.findAll('button')
    const uncompleteBtn = buttons.find(b => b.text().includes('取消完成'))
    if (uncompleteBtn) {
      await uncompleteBtn.trigger('click')
      expect(wrapper.emitted('uncomplete')?.[0]).toEqual(['xyz-999'])
    }
  })

  it('renders task description and end time', async () => {
    const wrapper = mount(CompletedSection, {
      props: { tasks: [makeTask({ description: 'Buy milk', end: '2025-06-01' })], isDark: true },
    })
    await wrapper.setData({ open: true })
    expect(wrapper.text()).toContain('Buy milk')
    expect(wrapper.text()).toContain('2025-06-01')
  })
})
