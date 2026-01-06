import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import MemoryStatistics from '@/components/ai/memory/MemoryStatistics.vue'
import type { Mock } from 'vitest'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

// Mock echarts
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn()
    }))
  }
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement
const mockCreateElement = vi.fn()
mockCreateElement.mockReturnValue({
  href: '',
  download: '',
  click: vi.fn()
})
document.createElement = mockCreateElement

// 控制台错误检测变量
let consoleSpy: any

describe('MemoryStatistics.vue', () => {
  let wrapper: any
  let mockPieChart: any

  const mockStats = {
    totalMemories: 100,
    shortTermCount: 30,
    longTermCount: 50,
    workingCount: 20,
    averageImportance: 0.75,
    latestMemory: '2024-01-15T10:30:00Z'
  }

  const defaultProps = {
    userId: 1,
    stats: mockStats,
    loading: false
  }

  beforeEach(() => {
    mockPieChart = {
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn()
    }
    
    vi.mocked(echarts.init).mockReturnValue(mockPieChart)
    
    wrapper = mount(MemoryStatistics, {
      props: defaultProps,
      global: {
        stubs: {
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-button': true,
          'el-card': true
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
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
      expect(wrapper.find('.memory-statistics').exists()).toBe(true)
    })

    it('应该显示统计卡片', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(4)
    })

    it('应该正确显示统计数据', () => {
      expect(wrapper.text()).toContain('100') // totalMemories
      expect(wrapper.text()).toContain('30') // shortTermCount
      expect(wrapper.text()).toContain('50') // longTermCount
      expect(wrapper.text()).toContain('20') // workingCount
    })

    it('应该显示重要性百分比', () => {
      expect(wrapper.text()).toContain('75.0%')
    })

    it('应该显示格式化的日期', () => {
      expect(wrapper.text()).toContain('2024/1/15')
    })
  })

  describe('图表初始化', () => {
    it('应该在组件挂载时初始化饼图', async () => {
      await nextTick()
      expect(echarts.init).toHaveBeenCalled()
      expect(mockPieChart.setOption).toHaveBeenCalled()
    })

    it('应该在组件卸载时清理图表', () => {
      wrapper.unmount()
      expect(mockPieChart.dispose).toHaveBeenCalled()
    })

    it('应该正确设置饼图选项', async () => {
      await nextTick()
      const optionCall = mockPieChart.setOption.mock.calls[0][0]
      
      expect(optionCall.series).toHaveLength(1)
      expect(optionCall.series[0].type).toBe('pie')
      expect(optionCall.series[0].data).toHaveLength(3)
      expect(optionCall.series[0].data[0].value).toBe(30) // shortTermCount
      expect(optionCall.series[0].data[1].value).toBe(50) // longTermCount
      expect(optionCall.series[0].data[2].value).toBe(20) // workingCount
    })
  })

  describe('数据更新', () => {
    it('应该在统计数据变化时更新图表', async () => {
      await nextTick()
      
      const updatedStats = {
        ...mockStats,
        shortTermCount: 40,
        longTermCount: 40,
        workingCount: 20
      }
      
      await wrapper.setProps({ stats: updatedStats })
      await nextTick()
      
      expect(mockPieChart.setOption).toHaveBeenCalledTimes(2)
    })

    it('应该处理空数据', async () => {
      const emptyStats = {
        totalMemories: 0,
        shortTermCount: 0,
        longTermCount: 0,
        workingCount: 0,
        averageImportance: 0,
        latestMemory: null
      }
      
      await wrapper.setProps({ stats: emptyStats })
      await nextTick()
      
      expect(wrapper.text()).toContain('0')
      expect(wrapper.text()).toContain('暂无')
    })
  })

  describe('用户交互', () => {
    it('应该触发刷新事件', async () => {
      const refreshButton = wrapper.find('button[title="刷新统计"]')
      await refreshButton.trigger('click')
      
      expect(wrapper.emitted('refresh')).toBeTruthy()
      expect(wrapper.emitted('refresh')).toHaveLength(1)
    })

    it('应该导出统计数据', async () => {
      const exportButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('导出数据')
      )
      
      await exportButton.trigger('click')
      
      expect(ElMessage.success).toHaveBeenCalledWith('统计数据已导出')
      expect(mockCreateElement).toHaveBeenCalled()
    })

    it('应该正确生成导出数据', async () => {
      const exportButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('导出数据')
      )
      
      await exportButton.trigger('click')
      
      const mockElement = mockCreateElement.mock.results[0].value
      expect(mockElement.download).toMatch(/memory-stats-1-\d+\.json/)
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', async () => {
      await wrapper.setProps({ loading: true })
      
      expect(wrapper.find('.memory-statistics').attributes('loading')).toBeDefined()
    })

    it('应该在加载时禁用按钮', async () => {
      await wrapper.setProps({ loading: true })
      
      const refreshButton = wrapper.find('button[title="刷新统计"]')
      expect(refreshButton.attributes('loading')).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理图表初始化失败', () => {
      vi.mocked(echarts.init).mockImplementationOnce(() => {
        throw new Error('图表初始化失败')
      })
      
      const errorWrapper = mount(MemoryStatistics, {
        props: defaultProps,
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true
          }
        }
      })
      
      expect(errorWrapper.exists()).toBe(true)
      errorWrapper.unmount()
    })

    it('应该处理导出失败', () => {
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error('导出失败')
      })
      
      const exportButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('导出数据')
      )
      
      exportButton.trigger('click')
      
      expect(ElMessage.success).not.toHaveBeenCalled()
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕下正确显示', async () => {
      // 模拟小屏幕
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))
      
      await nextTick()
      
      expect(wrapper.exists()).toBe(true)
      // 检查响应式样式类
      expect(wrapper.html()).toContain('@media')
    })
  })

  describe('边界条件', () => {
    it('应该处理负数统计数据', async () => {
      const negativeStats = {
        ...mockStats,
        totalMemories: -1,
        averageImportance: -0.5
      }
      
      await wrapper.setProps({ stats: negativeStats })
      await nextTick()
      
      expect(wrapper.text()).toContain('-1')
      expect(wrapper.text()).toContain('-50.0%')
    })

    it('应该处理超过100%的重要性', async () => {
      const highImportanceStats = {
        ...mockStats,
        averageImportance: 1.5
      }
      
      await wrapper.setProps({ stats: highImportanceStats })
      await nextTick()
      
      expect(wrapper.text()).toContain('150.0%')
    })

    it('应该处理无效日期', async () => {
      const invalidDateStats = {
        ...mockStats,
        latestMemory: 'invalid-date'
      }
      
      await wrapper.setProps({ stats: invalidDateStats })
      await nextTick()
      
      expect(wrapper.text()).toContain('Invalid Date')
    })
  })
})