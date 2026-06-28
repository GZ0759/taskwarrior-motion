import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SimpleTagSelect from '@/components/SimpleTagSelect.vue'

describe('SimpleTagSelect', () => {
  it('renders all tag options', () => {
    const wrapper = mount(SimpleTagSelect, {
      props: { selected: [], options: ['urgent', 'review', 'bug'], isDark: true },
    })
    expect(wrapper.text()).toContain('urgent')
    expect(wrapper.text()).toContain('review')
    expect(wrapper.text()).toContain('bug')
  })

  it('shows check icon for selected tags', () => {
    const wrapper = mount(SimpleTagSelect, {
      props: { selected: ['urgent'], options: ['urgent', 'review'], isDark: true },
    })
    const buttons = wrapper.findAll('button')
    const urgentBtn = buttons.find(b => b.text().includes('urgent'))
    expect(urgentBtn?.find('svg').exists()).toBe(true)
  })

  it('emits update:selected when tag is clicked', async () => {
    const wrapper = mount(SimpleTagSelect, {
      props: { selected: [], options: ['urgent', 'review'], isDark: true },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([['urgent']])
  })

  it('removes tag from selection when already selected', async () => {
    const wrapper = mount(SimpleTagSelect, {
      props: { selected: ['urgent'], options: ['urgent', 'review'], isDark: true },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([[]])
  })
})
