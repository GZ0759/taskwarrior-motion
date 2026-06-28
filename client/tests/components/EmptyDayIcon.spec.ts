import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyDayIcon from '@/components/EmptyDayIcon.vue'

describe('EmptyDayIcon', () => {
  it('renders an SVG element', () => {
    const wrapper = mount(EmptyDayIcon, {
      props: { isDark: true },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders with correct dimensions', () => {
    const wrapper = mount(EmptyDayIcon, {
      props: { isDark: true },
    })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('68')
    expect(svg.attributes('height')).toBe('68')
  })

  it('renders dark theme colors', () => {
    const wrapper = mount(EmptyDayIcon, {
      props: { isDark: true },
    })
    const circle = wrapper.find('circle')
    expect(circle.attributes('stroke')).toBe('rgba(255,255,255,0.22)')
  })

  it('renders light theme colors', () => {
    const wrapper = mount(EmptyDayIcon, {
      props: { isDark: false },
    })
    const circle = wrapper.find('circle')
    expect(circle.attributes('stroke')).toBe('rgba(15,10,40,0.16)')
  })
})
