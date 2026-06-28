import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

describe('ToggleSwitch', () => {
  it('renders in off state', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { on: false, 'onUpdate:on': () => {} },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders in on state', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { on: true, 'onUpdate:on': () => {} },
    })
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
  })

  it('emits update:on with true when clicked from off state', async () => {
    const wrapper = mount(ToggleSwitch, {
      props: { on: false, 'onUpdate:on': (v: boolean) => wrapper.setProps({ on: v }) },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:on')).toBeTruthy()
    expect(wrapper.emitted('update:on')![0]).toEqual([true])
  })

  it('emits update:on with false when clicked from on state', async () => {
    const wrapper = mount(ToggleSwitch, {
      props: { on: true, 'onUpdate:on': (v: boolean) => wrapper.setProps({ on: v }) },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:on')).toBeTruthy()
    expect(wrapper.emitted('update:on')![0]).toEqual([false])
  })
})
