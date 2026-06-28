import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CreateModal from '@/components/CreateModal.vue'

vi.mock('@/composables/useSound', () => ({
  useSound: () => ({
    playAdd: vi.fn(),
    soundEnabled: { value: true },
  }),
}))

describe('CreateModal (replaces AddTaskModal)', () => {
  function mountCreate(type: 'task' | 'project' | 'tag' = 'task') {
    setActivePinia(createPinia())
    return mount(CreateModal, {
      props: { type, isDark: true },
    })
  }

  it('renders input for task type', () => {
    const wrapper = mountCreate('task')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders title based on type', () => {
    const wrapper = mountCreate('task')
    expect(wrapper.text()).toContain('新建任务')
  })

  it('emits close when overlay is clicked', async () => {
    const wrapper = mountCreate('task')
    await wrapper.find('.glass-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
