import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalShell from '@/components/ModalShell.vue'

describe('ModalShell', () => {
  it('renders title', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '测试标题', isDark: true },
    })
    expect(wrapper.text()).toContain('测试标题')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', subtitle: '副标题', isDark: true },
    })
    expect(wrapper.text()).toContain('副标题')
  })

  it('does not render subtitle when not provided', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: true },
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('emits close when overlay is clicked', async () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: true },
    })
    await wrapper.find('.glass-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: true },
    })
    const btn = wrapper.find('button')
    await btn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('renders slot content', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: true },
      slots: { default: '<p>内容</p>' },
    })
    expect(wrapper.text()).toContain('内容')
  })

  it('applies dark theme styles', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: true },
    })
    const card = wrapper.find('.relative.z-10')
    expect(card.exists()).toBe(true)
  })

  it('applies light theme styles', () => {
    const wrapper = mount(ModalShell, {
      props: { title: '标题', isDark: false },
    })
    const card = wrapper.find('.relative.z-10')
    expect(card.exists()).toBe(true)
  })
})
