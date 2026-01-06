import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import * as echarts from 'echarts'
import MemoryVisualization from '@/components/ai/memory/MemoryVisualization.vue'
import { request } from '@/utils/request'

// Mock request
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn()
  }
}))

// Mock echarts
vi.mock('echarts/core', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn()
  }))
}))

vi.mock('echarts/charts', () => ({
  PieChart: {},
  BarChart: {},
  LineChart: {}
}))

vi.mock('echarts/components', () => ({
  TitleComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  GridComponent: {}
}))

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: {}
}))

// Mock window.resize
const mockResize = vi.fn()
Object.defineProperty(window, 'resize', {
  value: mockResize,
  writable: true
})

// Mock document.getElementById
const mockGetElementById = vi.fn()
document.getElementById = mockGetElementById

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryVisualization.vue', () => {
  let wrapper: any
  let mockTypeChart: any
  let mockImportanceChart: any
  let mockTrendChart: any

  const mockStats = {
    totalCount: 100,
    averageImportance: 0.75,
    typeDistribution: {
      immediate: 20,
      shortTerm: 30,
      longTerm: 50
    },
    importanceDistribution: {
      low: 10,
      medium: 60,
      high: 30
    },
    createdToday: 5,
    createdThisWeek: 25,
    createdThisMonth: 80,
    trendData: [10, 15, 8, 20, 12, 5, 18]
  }

  beforeEach(() => {
    // Mock DOM elements
    mockTypeChart = {
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn()
    }
    
    mockImportanceChart = {
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn()
    }
    
    mockTrendChart = {
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn()
    }

    // Mock getElementById to return elements with clientWidth and clientHeight
    mockGetElementById.mockImplementation((id) => {
      if (id === 'memory-type-chart') => {
        return {
          clientWidth: 400,
          clientHeight: 300
        }
      } else if (id === 'memory-importance-chart') {
        return {
          clientWidth: 400,
          clientHeight: 300
        }
      } else if (id === 'memory-trend-chart') {
        return {
          clientWidth: 800,
          clientHeight: 300
        }
      }
      return null
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock echarts.init to return different chart instances
    let chartCallCount = 0
    vi.mocked(echarts.init).mockImplementation(() => {
      chartCallCount++
      if (chartCallCount === 1) return mockTypeChart
      if (chartCallCount === 2) return mockImportanceChart
      return mockTrendChart
    })

    // Mock successful API response
    vi.mocked(request.get).mockResolvedValue({
      success: true,
      data: mockStats
    })

    wrapper = mount(MemoryVisualization, {
      props: {
        userId: 1
      },
      global: {
        stubs: {
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-radio-group': true,
          'el-radio-button': true
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

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.memory-visualization').exists()).toBe(true)
    })

    it('应该显示统计卡片', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(4)
    })

    it('应该显示图表容器', () => {
      expect(document.getElementById).toHaveBeenCalledWith('memory-type-chart')
      expect(document.getElementById).toHaveBeenCalledWith('memory-importance-chart')
      expect(document.getElementById).toHaveBeenCalledWith('memory-trend-chart')
    })

    it('应该显示时间范围选择器', () => {
      const radioGroup = wrapper.find('el-radio-group-stub')
      expect(radioGroup.exists()).toBe(true)
    })
  })

  describe('数据获取', () => {
    it('应该在组件挂载时获取统计数据', async () => {
      await nextTick()
      expect(request.get).toHaveBeenCalledWith('/ai/memory/stats/1')
    })

    it('应该处理API响应数据', async () => {
      await nextTick()
      expect(wrapper.vm.stats).toEqual(mockStats)
    })

    it('应该处理API错误', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('API错误'))
      
      const errorWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(errorWrapper.vm.stats.totalCount).toBe(0)
      errorWrapper.unmount()
    })

    it('应该处理空数据响应', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: null
      })
      
      const emptyWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(emptyWrapper.vm.stats.totalCount).toBe(0)
      emptyWrapper.unmount()
    })
  })

  describe('图表初始化', () => {
    it('应该初始化记忆类型分布图', async () => {
      await nextTick()
      expect(mockTypeChart.setOption).toHaveBeenCalled()
      
      const option = mockTypeChart.setOption.mock.calls[0][0]
      expect(option.series[0].type).toBe('pie')
      expect(option.series[0].data).toHaveLength(3)
      expect(option.series[0].data[0].value).toBe(20) // immediate
      expect(option.series[0].data[1].value).toBe(30) // shortTerm
      expect(option.series[0].data[2].value).toBe(50) // longTerm
    })

    it('应该初始化记忆重要性分布图', async () => {
      await nextTick()
      expect(mockImportanceChart.setOption).toHaveBeenCalled()
      
      const option = mockImportanceChart.setOption.mock.calls[0][0]
      expect(option.series[0].type).toBe('pie')
      expect(option.series[0].data).toHaveLength(3)
      expect(option.series[0].data[0].value).toBe(10) // low
      expect(option.series[0].data[1].value).toBe(60) // medium
      expect(option.series[0].data[2].value).toBe(30) // high
    })

    it('应该初始化记忆增长趋势图', async () => {
      await nextTick()
      expect(mockTrendChart.setOption).toHaveBeenCalled()
      
      const option = mockTrendChart.setOption.mock.calls[0][0]
      expect(option.series[0].type).toBe('bar')
      expect(option.xAxis.data).toEqual(['周一', '周二', '周三', '周四', '周五', '周六', '周日'])
    })

    it('应该处理容器尺寸为0的情况', async () => {
      mockGetElementById.mockImplementation((id) => {
        return {
          clientWidth: 0,
          clientHeight: 0
        }
      })
      
      const resizeWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      // 应该延迟初始化图表
      expect(setTimeout).toHaveBeenCalled()
      resizeWrapper.unmount()
    })
  })

  describe('时间范围切换', () => {
    it('应该响应时间范围变化', async () => {
      await nextTick()
      
      const radioGroup = wrapper.find('el-radio-group-stub')
      await radioGroup.vm.$emit('update:modelValue', 'month')
      
      expect(wrapper.vm.timeRange).toBe('month')
      expect(mockTrendChart.setOption).toHaveBeenCalledTimes(2)
    })

    it('应该切换到月视图', async () => {
      await nextTick()
      
      wrapper.setData({ timeRange: 'month' })
      await nextTick()
      
      const option = mockTrendChart.setOption.mock.calls[1][0]
      expect(option.xAxis.data).toHaveLength(30)
      expect(option.xAxis.data[0]).toBe('1日')
    })

    it('应该切换到年视图', async () => {
      await nextTick()
      
      wrapper.setData({ timeRange: 'year' })
      await nextTick()
      
      const option = mockTrendChart.setOption.mock.calls[1][0]
      expect(option.xAxis.data).toHaveLength(12)
      expect(option.xAxis.data[0]).toBe('1月')
    })
  })

  describe('格式化函数', () => {
    it('应该正确格式化百分比', () => {
      expect(wrapper.vm.formatPercent(0.75)).toBe('75%')
      expect(wrapper.vm.formatPercent(0)).toBe('0%')
      expect(wrapper.vm.formatPercent(1)).toBe('100%')
      expect(wrapper.vm.formatPercent(null)).toBe('0%')
      expect(wrapper.vm.formatPercent(undefined)).toBe('0%')
    })
  })

  describe('窗口大小变化', () => {
    it('应该在窗口大小变化时调整图表大小', async () => {
      await nextTick()
      
      window.dispatchEvent(new Event('resize'))
      
      expect(mockTypeChart.resize).toHaveBeenCalled()
      expect(mockImportanceChart.resize).toHaveBeenCalled()
      expect(mockTrendChart.resize).toHaveBeenCalled()
    })
  })

  describe('组件卸载', () => {
    it('应该在组件卸载时清理图表', () => {
      wrapper.unmount()
      
      expect(mockTypeChart.dispose).toHaveBeenCalled()
      expect(mockImportanceChart.dispose).toHaveBeenCalled()
      expect(mockTrendChart.dispose).toHaveBeenCalled()
    })

    it('应该在组件卸载时移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('错误处理', () => {
    it('应该处理图表初始化失败', async () => {
      vi.mocked(echarts.init).mockImplementationOnce(() => {
        throw new Error('图表初始化失败')
      })
      
      const errorWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(errorWrapper.exists()).toBe(true)
      errorWrapper.unmount()
    })

    it('应该处理容器元素不存在的情况', async () => {
      mockGetElementById.mockReturnValue(null)
      
      const noElementWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(noElementWrapper.exists()).toBe(true)
      noElementWrapper.unmount()
    })
  })

  describe('边界条件', () => {
    it('应该处理空统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {
          totalCount: 0,
          averageImportance: 0,
          typeDistribution: { immediate: 0, shortTerm: 0, longTerm: 0 },
          importanceDistribution: { low: 0, medium: 0, high: 0 },
          createdToday: 0,
          createdThisWeek: 0,
          createdThisMonth: 0
        }
      })
      
      const emptyWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(emptyWrapper.vm.stats.totalCount).toBe(0)
      emptyWrapper.unmount()
    })

    it('应该处理负数统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {
          totalCount: -1,
          averageImportance: -0.5,
          typeDistribution: { immediate: -10, shortTerm: -20, longTerm: -30 },
          importanceDistribution: { low: -5, medium: -15, high: -25 },
          createdToday: -1,
          createdThisWeek: -5,
          createdThisMonth: -10
        }
      })
      
      const negativeWrapper = mount(MemoryVisualization, {
        props: {
          userId: 1
        },
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-radio-group': true,
            'el-radio-button': true
          }
        }
      })
      
      await nextTick()
      expect(negativeWrapper.vm.stats.totalCount).toBe(-1)
      negativeWrapper.unmount()
    })
  })
})