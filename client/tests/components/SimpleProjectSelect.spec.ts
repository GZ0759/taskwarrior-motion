import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SimpleProjectSelect from '@/components/SimpleProjectSelect.vue'

describe('SimpleProjectSelect', () => {
  it('renders "无项目" when no value', () => {
    const wrapper = mount(SimpleProjectSelect, {
      props: { modelValue: '', options: ['Work', 'Personal'], isDark: true },
    })
    expect(wrapper.text()).toContain('无项目')
  })

  it('renders project name when value is set', () => {
    const wrapper = mount(SimpleProjectSelect, {
      props: { modelValue: 'Work', options: ['Work', 'Personal'], isDark: false },
    })
    expect(wrapper.text()).toContain('Work')
  })

  it('renders trigger with current value', () => {
    const wrapper = mount(SimpleProjectSelect, {
      props: { modelValue: 'Work', options: ['Work', 'Personal'], isDark: true },
    })
    expect(wrapper.text()).toContain('Work')
  })
})
