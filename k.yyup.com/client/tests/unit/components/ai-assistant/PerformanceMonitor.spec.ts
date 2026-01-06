import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import PerformanceMonitor from '@/components/ai-assistant/PerformanceMonitor.vue'
import { request } from '@/utils/request'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    }
  }
})

// Mock request
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn()
  }
}))

// Mock timers
vi.useFakeTimers()

// 控制台错误检测变量
let consoleSpy: any

describe('PerformanceMonitor.vue', () => {
  let wrapper: any

  const mockStatsData = {
    optimization: {
      tokenSavingRate: '75%',
      directQueryRate: '60%'
    },
    performance: {
      averageResponseTime: 1200,
      totalTokensSaved: 45000,
      totalQueries: 100,
      directQueries: 60,
      semanticQueries: 30,
      complexQueries: 10
    },
    router: {
      keywordCount: 150,
      directMatchCount: 45,
      complexityThreshold: 0.7
    },
    directService: {
      supportedActions: ['action1', 'action2', 'action3']
    },
    vectorIndex: {
      totalItems: 200
    },
    semanticSearch: {
      cache: {
        size: 50,
        hitRate: 0.85
      }
    },
    complexityEvaluator: {
      totalEvaluations: 80,
      levelDistribution: {
        simple: 30,
        moderate: 35,
        complex: 12,
        expert: 3
      },
      averageConfidence: 0.78
    },
    dynamicContext: {
      cacheSize: 25
    }
  }

  beforeEach(() => {
    vi.mocked(request.get).mockResolvedValue({
      success: true,
      data: mockStatsData
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(PerformanceMonitor, {
      global: {
        stubs: {
          'el-icon': true,
          'el-card': true,
          'el-button': true,
          'el-tag': true,
          'el-switch': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.performance-monitor').exists()).toBe(true)
    })

    it('应该显示统计卡片', () => {
      expect(wrapper.find('.stats-card').exists()).toBe(true)
    })

    it('应该显示监控卡片', () => {
      expect(wrapper.find('.monitor-card').exists()).toBe(true)
    })

    it('应该显示刷新按钮', () => {
      const refreshButton = wrapper.find('button')
      expect(refreshButton.exists()).toBe(true)
      expect(refreshButton.text()).toContain('刷新')
    })

    it('应该显示核心指标', () => {
      expect(wrapper.text()).toContain('AI助手性能优化统计')
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时获取统计数据', async () => {
      await nextTick()
      expect(request.get).toHaveBeenCalledWith('/ai-assistant-optimized/stats')
    })

    it('应该正确处理API响应数据', async () => {
      await nextTick()
      expect(wrapper.vm.stats).toEqual(mockStatsData)
    })

    it('应该显示核心指标数据', async () => {
      await nextTick()
      expect(wrapper.text()).toContain('75%') // tokenSavingRate
      expect(wrapper.text()).toContain('60%') // directQueryRate
      expect(wrapper.text()).toContain('1,200') // averageResponseTime
      expect(wrapper.text()).toContain('45,000') // totalTokensSaved
    })

    it('应该处理API错误', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('API错误'))
      
      const errorWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(errorWrapper.vm.stats).toEqual({})
      errorWrapper.unmount()
    })

    it('应该处理空数据响应', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: null
      })
      
      const emptyWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(emptyWrapper.vm.stats).toEqual({})
      emptyWrapper.unmount()
    })
  })

  describe('用户交互', () => {
    it('应该刷新统计数据', async () => {
      await nextTick()
      
      const refreshButton = wrapper.find('button')
      await refreshButton.trigger('click')
      
      expect(wrapper.vm.loading).toBe(true)
      expect(request.get).toHaveBeenCalledTimes(2)
    })

    it('应该在刷新时显示加载状态', async () => {
      await nextTick()
      
      const refreshButton = wrapper.find('button')
      await refreshButton.trigger('click')
      
      expect(refreshButton.attributes('loading')).toBeDefined()
    })

    it('应该在刷新完成后隐藏加载状态', async () => {
      await nextTick()
      
      const refreshButton = wrapper.find('button')
      await refreshButton.trigger('click')
      
      // 模拟API响应
      await nextTick()
      
      expect(refreshButton.attributes('loading')).toBeUndefined()
    })

    it('应该切换实时监控', async () => {
      await nextTick()
      
      const switchComponent = wrapper.find('el-switch-stub')
      await switchComponent.vm.$emit('update:modelValue', true)
      
      expect(wrapper.vm.realtimeEnabled).toBe(true)
    })

    it('应该关闭实时监控', async () => {
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: true
      })
      
      const switchComponent = wrapper.find('el-switch-stub')
      await switchComponent.vm.$emit('update:modelValue', false)
      
      expect(wrapper.vm.realtimeEnabled).toBe(false)
    })
  })

  describe('实时监控', () => {
    it('应该启动实时监控定时器', async () => {
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: true
      })
      
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000)
    })

    it('应该停止实时监控定时器', async () => {
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: true
      })
      
      const timer = setInterval as any
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      await wrapper.setData({
        realtimeEnabled: false
      })
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('应该在实时监控启用时定期刷新数据', async () => {
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: true
      })
      
      // 快进时间
      vi.advanceTimersByTime(5000)
      
      expect(request.get).toHaveBeenCalledTimes(2)
    })

    it('应该在实时监控禁用时不刷新数据', async () => {
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: false
      })
      
      // 快进时间
      vi.advanceTimersByTime(5000)
      
      expect(request.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('格式化函数', () => {
    it('应该正确格式化数字', () => {
      expect(wrapper.vm.formatNumber(1000)).toBe('1,000')
      expect(wrapper.vm.formatNumber(1000000)).toBe('1,000,000')
      expect(wrapper.vm.formatNumber(0)).toBe('0')
      expect(wrapper.vm.formatNumber(null)).toBe('0')
      expect(wrapper.vm.formatNumber(undefined)).toBe('0')
    })

    it('应该计算正确的百分比', () => {
      wrapper.vm.stats = mockStatsData
      
      expect(wrapper.vm.getPercentage('direct')).toBe(60) // 60/100 * 100
      expect(wrapper.vm.getPercentage('semantic')).toBe(30) // 30/100 * 100
      expect(wrapper.vm.getPercentage('complex')).toBe(10) // 10/100 * 100
    })

    it('应该处理零除数', () => {
      wrapper.vm.stats = {
        performance: {
          totalQueries: 0,
          directQueries: 0,
          semanticQueries: 0,
          complexQueries: 0
        }
      }
      
      expect(wrapper.vm.getPercentage('direct')).toBe(0)
      expect(wrapper.vm.getPercentage('semantic')).toBe(0)
      expect(wrapper.vm.getPercentage('complex')).toBe(0)
    })

    it('应该获取正确的标签类型', () => {
      expect(wrapper.vm.getTagType('direct')).toBe('success')
      expect(wrapper.vm.getTagType('semantic')).toBe('warning')
      expect(wrapper.vm.getTagType('complex')).toBe('info')
      expect(wrapper.vm.getTagType('unknown')).toBe('info')
    })

    it('应该获取正确的级别显示名称', () => {
      expect(wrapper.vm.getLevelDisplayName('direct')).toBe('直接匹配')
      expect(wrapper.vm.getLevelDisplayName('semantic')).toBe('语义检索')
      expect(wrapper.vm.getLevelDisplayName('complex')).toBe('复杂分析')
      expect(wrapper.vm.getLevelDisplayName('unknown')).toBe('unknown')
    })

    it('应该获取正确的复杂度级别名称', () => {
      expect(wrapper.vm.getComplexityLevelName('simple')).toBe('简单')
      expect(wrapper.vm.getComplexityLevelName('moderate')).toBe('中等')
      expect(wrapper.vm.getComplexityLevelName('complex')).toBe('复杂')
      expect(wrapper.vm.getComplexityLevelName('expert')).toBe('专家级')
      expect(wrapper.vm.getComplexityLevelName('unknown')).toBe('unknown')
    })
  })

  describe('查询分布显示', () => {
    it('应该显示查询分布统计', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('查询分布统计')
      expect(wrapper.text()).toContain('直接匹配')
      expect(wrapper.text()).toContain('语义检索')
      expect(wrapper.text()).toContain('复杂分析')
    })

    it('应该显示正确的查询次数', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('60次') // directQueries
      expect(wrapper.text()).toContain('30次') // semanticQueries
      expect(wrapper.text()).toContain('10次') // complexQueries
    })

    it('应该显示正确的分布条宽度', async () => {
      await nextTick()
      
      const distributionBars = wrapper.findAll('.level-fill')
      expect(distributionBars[0].attributes('style')).toContain('width: 60%') // direct
      expect(distributionBars[1].attributes('style')).toContain('width: 30%') // semantic
      expect(distributionBars[2].attributes('style')).toContain('width: 10%') // complex
    })
  })

  describe('系统信息显示', () => {
    it('应该显示系统信息', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('系统信息')
      expect(wrapper.text()).toContain('关键词词典')
      expect(wrapper.text()).toContain('直接匹配规则')
      expect(wrapper.text()).toContain('复杂度阈值')
    })

    it('应该显示正确的系统数据', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('150 个关键词')
      expect(wrapper.text()).toContain('45 条规则')
      expect(wrapper.text()).toContain('0.7')
      expect(wrapper.text()).toContain('3 种')
    })

    it('应该显示向量索引信息', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('向量索引')
      expect(wrapper.text()).toContain('200 个实体')
    })

    it('应该显示语义缓存信息', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('语义缓存')
      expect(wrapper.text()).toContain('50 项')
    })
  })

  describe('高级统计显示', () => {
    it('应该显示高级统计', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('高级统计')
      expect(wrapper.text()).toContain('复杂度分布')
      expect(wrapper.text()).toContain('语义检索效果')
    })

    it('应该显示复杂度分布', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('简单')
      expect(wrapper.text()).toContain('中等')
      expect(wrapper.text()).toContain('复杂')
      expect(wrapper.text()).toContain('专家级')
    })

    it('应该显示正确的复杂度计数', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('35')
      expect(wrapper.text()).toContain('12')
      expect(wrapper.text()).toContain('3')
    })

    it('应该显示语义检索效果', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('缓存命中率')
      expect(wrapper.text()).toContain('85.0%')
      expect(wrapper.text()).toContain('平均置信度')
      expect(wrapper.text()).toContain('78.0%')
    })
  })

  describe('实时监控显示', () => {
    it('应该显示实时监控', async () => {
      await nextTick()
      
      expect(wrapper.text()).toContain('实时性能监控')
      expect(wrapper.text()).toContain('最近查询级别')
      expect(wrapper.text()).toContain('最近响应时间')
      expect(wrapper.text()).toContain('最近Token消耗')
    })

    it('应该显示实时监控开关', async () => {
      await nextTick()
      
      const switchComponent = wrapper.find('el-switch-stub')
      expect(switchComponent.exists()).toBe(true)
      expect(switchComponent.attributes('active-text')).toBe('开启')
      expect(switchComponent.attributes('inactive-text')).toBe('关闭')
    })

    it('应该根据条件显示监控卡片', async () => {
      await nextTick()
      
      expect(wrapper.find('.monitor-card').exists()).toBe(true)
      
      await wrapper.setData({
        realtimeEnabled: false
      })
      
      expect(wrapper.find('.monitor-card').exists()).toBe(true) // 应该仍然显示，只是功能禁用
    })
  })

  describe('错误处理', () => {
    it('应该处理刷新失败', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('刷新失败'))
      
      await nextTick()
      
      const refreshButton = wrapper.find('button')
      await refreshButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该处理实时监控刷新失败', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('实时监控失败'))
      
      await nextTick()
      
      await wrapper.setData({
        realtimeEnabled: true
      })
      
      // 快进时间
      vi.advanceTimersByTime(5000)
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该处理统计数据格式错误', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: 'invalid data'
      })
      
      const formatErrorWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(formatErrorWrapper.vm.stats).toBe('invalid data')
      formatErrorWrapper.unmount()
    })
  })

  describe('组件生命周期', () => {
    it('应该在组件卸载时清理定时器', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('应该处理组件卸载时的清理', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('边界条件', () => {
    it('应该处理空统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {}
      })
      
      const emptyStatsWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(emptyStatsWrapper.vm.stats).toEqual({})
      emptyStatsWrapper.unmount()
    })

    it('应该处理部分缺失的统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {
          optimization: {
            tokenSavingRate: '75%'
          }
          // 缺少其他字段
        }
      })
      
      const partialStatsWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(partialStatsWrapper.vm.stats.optimization.tokenSavingRate).toBe('75%')
      partialStatsWrapper.unmount()
    })

    it('应该处理负数统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {
          performance: {
            averageResponseTime: -100,
            totalTokensSaved: -500,
            totalQueries: -10
          }
        }
      })
      
      const negativeStatsWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(negativeStatsWrapper.vm.stats.performance.averageResponseTime).toBe(-100)
      negativeStatsWrapper.unmount()
    })

    it('应该处理超大统计数据', async () => {
      vi.mocked(request.get).mockResolvedValue({
        success: true,
        data: {
          performance: {
            totalTokensSaved: 999999999,
            totalQueries: 1000000
          }
        }
      })
      
      const largeStatsWrapper = mount(PerformanceMonitor, {
        global: {
          stubs: {
            'el-icon': true,
            'el-card': true,
            'el-button': true,
            'el-tag': true,
            'el-switch': true
          }
        }
      })
      
      await nextTick()
      expect(wrapper.vm.formatNumber(999999999)).toBe('999,999,999')
      largeStatsWrapper.unmount()
    })
  })
})