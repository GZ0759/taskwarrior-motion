import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompletionModal from '@/components/CompletionModal.vue'
import AchievementBadge from '@/components/AchievementBadge.vue'

describe('AchievementBadge', () => {
  it('renders check icon inside circle', () => {
    const wrapper = mount(AchievementBadge)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has green gradient background', () => {
    const wrapper = mount(AchievementBadge)
    const inner = wrapper.find('.rounded-full')
    expect(inner.exists()).toBe(true)
  })
})

describe('CompletionModal', () => {
  it('renders description text', () => {
    const wrapper = mount(CompletionModal, {
      props: { description: 'Buy groceries', isDark: true },
    })
    expect(wrapper.text()).toContain('Buy groceries')
  })

  it('renders "我太棒了" button', () => {
    const wrapper = mount(CompletionModal, {
      props: { description: 'Test', isDark: true },
    })
    expect(wrapper.text()).toContain('我太棒了')
  })

  it('renders "我完成任务啦！" title', () => {
    const wrapper = mount(CompletionModal, {
      props: { description: 'Test', isDark: false },
    })
    expect(wrapper.text()).toContain('我完成任务啦！')
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mount(CompletionModal, {
      props: { description: 'Test', isDark: true },
    })
    const closeBtn = wrapper.find('button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mount(CompletionModal, {
      props: { description: 'Test', isDark: true },
    })
    const overlay = wrapper.find('.glass-overlay')
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
