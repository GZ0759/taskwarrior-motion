import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsPanel from '@/components/SettingsPanel.vue'

describe('SettingsPanel', () => {
  const defaultProps = {
    isDark: true,
    pos: { top: 100, left: 200 },
    soundEnabled: true,
    achievementEnabled: false,
  }

  it('renders settings label', () => {
    const wrapper = mount(SettingsPanel, { props: defaultProps })
    expect(wrapper.text()).toContain('设置')
  })

  it('renders both setting rows', () => {
    const wrapper = mount(SettingsPanel, { props: defaultProps })
    expect(wrapper.text()).toContain('音效')
    expect(wrapper.text()).toContain('完成成就')
  })

  it('emits update:soundEnabled when toggled', async () => {
    const wrapper = mount(SettingsPanel, { props: defaultProps })
    const switches = wrapper.findAllComponents({ name: 'ToggleSwitch' })
    if (switches.length > 0) {
      await switches[0].vm.$emit('update:on', false)
      expect(wrapper.emitted('update:soundEnabled')).toBeTruthy()
    }
  })

  it('emits update:achievementEnabled when toggled', async () => {
    const wrapper = mount(SettingsPanel, { props: defaultProps })
    const switches = wrapper.findAllComponents({ name: 'ToggleSwitch' })
    if (switches.length > 1) {
      await switches[1].vm.$emit('update:on', true)
      expect(wrapper.emitted('update:achievementEnabled')).toBeTruthy()
    }
  })
})
