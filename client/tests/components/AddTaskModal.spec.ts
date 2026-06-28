import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddTaskModal from '@/components/AddTaskModal.vue'

vi.mock('@/composables/useSound', () => ({
  useSound: () => ({
    playAdd: vi.fn(),
    soundEnabled: { value: true },
  }),
}))

describe('AddTaskModal', () => {
  it('renders input with placeholder', () => {
    const wrapper = mount(AddTaskModal, {
      props: { isDark: true },
    })
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe('今天要完成什么？')
  })

  it('renders "新建任务" label', () => {
    const wrapper = mount(AddTaskModal, {
      props: { isDark: true },
    })
    expect(wrapper.text()).toContain('新建任务')
  })

  it('emits close when overlay is clicked', async () => {
    const wrapper = mount(AddTaskModal, {
      props: { isDark: true },
    })
    await wrapper.find('.glass-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close on Escape key', async () => {
    const wrapper = mount(AddTaskModal, {
      props: { isDark: true },
    })
    await wrapper.find('input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close without add when submitting empty input', async () => {
    const wrapper = mount(AddTaskModal, {
      props: { isDark: true },
    })
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('add')).toBeFalsy()
  })
})
