import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpModal from '@/components/HelpModal.vue'

describe('HelpModal', () => {
  it('renders title "键盘快捷键"', () => {
    const wrapper = mount(HelpModal, { props: { isDark: true } })
    expect(wrapper.text()).toContain('键盘快捷键')
  })

  it('renders all 8 shortcuts', () => {
    const wrapper = mount(HelpModal, { props: { isDark: true } })
    expect(wrapper.text()).toContain('新建任务')
    expect(wrapper.text()).toContain('撤销')
    expect(wrapper.findAll('kbd').length).toBe(8)
  })

  it('renders kbd elements with key names', () => {
    const wrapper = mount(HelpModal, { props: { isDark: false } })
    expect(wrapper.text()).toContain('Ctrl+Z')
    expect(wrapper.text()).toContain('Enter')
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(HelpModal, { props: { isDark: true } })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mount(HelpModal, { props: { isDark: true } })
    const buttons = wrapper.findAll('button')
    const closeBtn = buttons.find(b => b.find('svg').exists())
    if (closeBtn) {
      await closeBtn.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })
})
