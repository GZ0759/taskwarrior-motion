import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AddTaskBtn from '@/components/AddTaskBtn.vue'

describe('AddTaskBtn', () => {
  it('renders button with text', () => {
    const wrapper = mount(AddTaskBtn, {
      props: { isDark: true },
    })
    expect(wrapper.text()).toContain('添加任务')
  })

  it('emits open when clicked', async () => {
    const wrapper = mount(AddTaskBtn, {
      props: { isDark: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('renders Plus icon', () => {
    const wrapper = mount(AddTaskBtn, {
      props: { isDark: true },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
