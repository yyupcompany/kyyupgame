
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
import TabContainer from '@/components/centers/TabContainer.vue'

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElTabs: {
      name: 'ElTabs',
      template: '<div><slot></slot></div>'
    },
    ElTabPane: {
      name: 'ElTabPane',
      template: '<div><slot></slot><slot name="default"></slot></div>'
    }
  }
})

const mockTabs = [
  { key: 'tab1', label: '标签页1' },
  { key: 'tab2', label: '标签页2' },
  { key: 'tab3', label: '标签页3' }
]

// 控制台错误检测变量
let consoleSpy: any

describe('TabContainer.vue', () => {
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

    wrapper = mount(TabContainer, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab1'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-tabs': true,
          'el-tab-pane': true
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

  it('显示标签页', () => {
    expect(wrapper.props('tabs')).toEqual(mockTabs)
  })

  it('显示激活的标签页', () => {
    expect(wrapper.props('activeTab')).toBe('tab1')
  })

  it('处理标签页切换', () => {
    wrapper.vm.handleTabChange('tab2')
    expect(wrapper.emitted('update:activeTab')).toBeTruthy()
    expect(wrapper.emitted('update:activeTab')[0]).toEqual(['tab2'])
    expect(wrapper.emitted('tab-change')).toBeTruthy()
    expect(wrapper.emitted('tab-change')[0]).toEqual(['tab2'])
  })

  it('获取激活的标签页信息', () => {
    const activeTab = wrapper.vm.getActiveTab()
    expect(activeTab).toEqual(mockTabs[0])
  })
})