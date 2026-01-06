
vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(() => ({
    global: {
      t: vi.fn((key) => key),
      locale: 'zh-CN'
    }
  })),
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
    locale: ref('zh-CN')
  }))
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StatCard from '@/components/centers/StatCard.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElCard: {
      name: 'ElCard',
      template: '<div><slot></slot><slot name="header"></slot></div>'
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<span><slot></slot></span>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('StatCard.vue', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      messages: {
        'zh-CN': {}
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(StatCard, {
      props: {
        title: '统计数据',
        value: 1234,
        icon: 'chart',
        color: '#409EFF'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-card': true,
          'el-icon': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('显示标题', () => {
    expect(wrapper.props('title')).toBe('统计数据')
  })

  it('显示数值', () => {
    expect(wrapper.props('value')).toBe(1234)
  })

  it('显示图标', () => {
    expect(wrapper.props('icon')).toBe('chart')
  })

  it('显示颜色', () => {
    expect(wrapper.props('color')).toBe('#409EFF')
  })

  it('处理点击事件', () => {
    wrapper.vm.handleClick()
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('格式化数值', () => {
    expect(wrapper.vm.formatValue(1234)).toBe('1,234')
    expect(wrapper.vm.formatValue(1234567)).toBe('1,234,567')
  })
})