
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
import EnrollmentChart from '@/components/charts/EnrollmentChart.vue'

// 模拟ECharts
const mockECharts = {
  init: vi.fn().mockReturnValue({
    setOption: vi.fn(),
    on: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn()
  })
}

vi.mock('echarts', () => ({
  default: mockECharts
}))

// 模拟Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElCard: {
      name: 'ElCard',
      template: '<div><slot></slot><slot name="header"></slot></div>'
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option :value="value"><slot></slot></option>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentChart.vue', () => {
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

    wrapper = mount(EnrollmentChart, {
      props: {
        title: '招生统计图表',
        data: [
          { month: '1月', count: 100 },
          { month: '2月', count: 150 },
          { month: '3月', count: 200 }
        ]
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-card': true,
          'el-select': true,
          'el-option': true
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

  it('显示图表标题', () => {
    expect(wrapper.props('title')).toBe('招生统计图表')
  })

  it('显示图表数据', () => {
    expect(wrapper.props('data')).toEqual([
      { month: '1月', count: 100 },
      { month: '2月', count: 150 },
      { month: '3月', count: 200 }
    ])
  })

  it('初始化图表实例', async () => {
    await wrapper.vm.$nextTick()
    expect(mockECharts.init).toHaveBeenCalled()
  })

  it('更新图表数据', async () => {
    const newData = [
      { month: '4月', count: 250 },
      { month: '5月', count: 300 }
    ]
    
    await wrapper.setProps({ data: newData })
    expect(wrapper.vm.chartInstance.setOption).toHaveBeenCalled()
  })

  it('处理图表类型切换', () => {
    wrapper.vm.handleTypeChange('bar')
    expect(wrapper.vm.chartType).toBe('bar')
  })

  it('调整图表大小', () => {
    wrapper.vm.resizeChart()
    expect(wrapper.vm.chartInstance.resize).toHaveBeenCalled()
  })

  it('清理图表实例', () => {
    wrapper.vm.cleanup()
    expect(wrapper.vm.chartInstance.dispose).toHaveBeenCalled()
  })
})