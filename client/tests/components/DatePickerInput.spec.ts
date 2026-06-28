import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatePickerInput from '@/components/DatePickerInput.vue'

describe('DatePickerInput', () => {
  it('renders placeholder when no value', () => {
    const wrapper = mount(DatePickerInput, {
      props: { modelValue: '', isDark: true },
    })
    expect(wrapper.text()).toContain('选择日期')
  })

  it('renders display value when value is set', () => {
    const wrapper = mount(DatePickerInput, {
      props: { modelValue: '2025-06-15', isDark: false },
    })
    expect(wrapper.text()).toContain('2025')
  })

  it('shows clear button when value is set', () => {
    const wrapper = mount(DatePickerInput, {
      props: { modelValue: '2025-06-15', isDark: true },
    })
    const clearBtn = wrapper.find('.hover\\:opacity-70')
    expect(clearBtn.exists()).toBe(true)
  })

  it('hides clear button when no value', () => {
    const wrapper = mount(DatePickerInput, {
      props: { modelValue: '', isDark: true },
    })
    const clearBtn = wrapper.find('.hover\\:opacity-70')
    expect(clearBtn.exists()).toBe(false)
  })

  it('emits update:modelValue when clear is clicked', async () => {
    const wrapper = mount(DatePickerInput, {
      props: { modelValue: '2025-06-15', isDark: true },
    })
    const clearBtn = wrapper.find('.hover\\:opacity-70')
    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })
})
