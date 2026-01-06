import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils'
import ActivityAnalytics from '@/components/centers/activity/ActivityAnalytics.vue'
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../../utils/component-test-helper'

// Mock activity-center API module
vi.mock('@/api/activity-center', () => ({
  getActivities: vi.fn(() => Promise.resolve({
    success: true,
    data: [
      { id: 1, name: '春游活动', type: 'outdoor' },
      { id: 2, name: '手工制作', type: 'indoor' }
    ]
  })),
  getActivityAnalytics: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      overview: { totalActivities: 10, totalParticipants: 200 },
      engagement: [{ activity: '春游', rate: 85 }],
      satisfaction: [{ activity: '春游', score: 4.5 }],
      trends: [{ date: '2024-01', count: 5 }]
    }
  }))
}))

// Mock ChartContainer component
vi.mock('@/components/centers/ChartContainer.vue', () => ({
  default: {
    name: 'ChartContainer',
    template: '<div class="mock-chart-container"><slot></slot></div>',
    props: ['data', 'type', 'height', 'loading']
  }
}))

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot></slot></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot><slot name="label"></slot></div>'
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select"><slot></slot></select>',
      props: ['modelValue']
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option" :value="value"><slot></slot></option>',
      props: ['value', 'label']
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input class="el-date-picker" type="text" />',
      props: ['modelValue']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      template: '<div class="el-radio-group"><slot></slot></div>',
      props: ['modelValue']
    },
    ElRadioButton: {
      name: 'ElRadioButton',
      template: '<label class="el-radio-button"><slot></slot></label>',
      props: ['label']
    },
    ElTable: {
      name: 'ElTable',
      template: '<table class="el-table"><slot></slot></table>',
      props: ['data', 'stripe']
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<td class="el-table-column"><slot></slot><slot name="default"></slot></td>',
      props: ['prop', 'label', 'width', 'formatter']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>',
      props: ['type', 'size']
    },
    ElRate: {
      name: 'ElRate',
      template: '<div class="el-rate"><slot></slot></div>',
      props: ['modelValue', 'disabled', 'showScore']
    },
    ElTimeline: {
      name: 'ElTimeline',
      template: '<div class="el-timeline"><slot></slot></div>'
    },
    ElTimelineItem: {
      name: 'ElTimelineItem',
      template: '<div class="el-timeline-item"><slot></slot></div>',
      props: ['timestamp', 'placement']
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ActivityAnalytics.vue', () => {
  let wrapper: VueWrapper<any>
  const cleanup = createTestCleanup()

  const mockAnalyticsData = {
    overview: {
      totalParticipants: 150,
      completionRate: 0.85,
      satisfactionScore: 4.2,
      revenue: 15000
    },
    participation: {
      byAge: [
        { age: '3-4岁', count: 45 },
        { age: '4-5岁', count: 65 },
        { age: '5-6岁', count: 40 }
      ],
      byGender: [
        { gender: '男', count: 80 },
        { gender: '女', count: 70 }
      ],
      bySource: [
        { source: '线上', count: 90 },
        { source: '线下', count: 60 }
      ]
    },
    feedback: {
      ratings: [
        { rating: 5, count: 80 },
        { rating: 4, count: 50 },
        { rating: 3, count: 15 },
        { rating: 2, count: 3 },
        { rating: 1, count: 2 }
      ],
      comments: [
        {
          id: '1',
          rating: 5,
          comment: '活动非常棒，孩子很开心！',
          date: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          rating: 4,
          comment: '整体不错，还有改进空间',
          date: '2024-01-14T14:30:00Z'
        }
      ]
    }
  }

  const mockActivities = [
    { id: '1', title: '春季亲子活动' },
    { id: '2', title: '科学实验课' },
    { id: '3', title: '艺术创作坊' }
  ]

  const createWrapper = (props = {}) => {
    return createComponentWrapper(ActivityAnalytics, {
      props,
      withPinia: true,
      withRouter: false,
      global: {
        },
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-button': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-rate': true,
          'el-timeline': true,
          'el-timeline-item': true
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
    cleanup.addCleanup(() => wrapper?.unmount())
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    cleanup.cleanup()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染分析页面基本结构', () => {
      expect(wrapper.find('.activity-analytics, .analytics-container').exists()).toBe(true)
    })

    it('应该渲染筛选器表单', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.filters .el-form').exists()).toBe(true)
      expect(wrapper.findAll('.filters .el-form-item').length).toBeGreaterThan(0)
    })

    it('应该渲染概览统计卡片', () => {
      wrapper = createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
      
      expect(statCards[0].find('.stat-value').text()).toBe('150')
      expect(statCards[0].find('.stat-label').text()).toBe('总参与人数')
      
      expect(statCards[1].find('.stat-value').text()).toBe('85.0%')
      expect(statCards[1].find('.stat-label').text()).toBe('完成率')
      
      expect(statCards[2].find('.stat-value').text()).toBe('4.2')
      expect(statCards[2].find('.stat-label').text()).toBe('满意度评分')
      
      expect(statCards[3].find('.stat-value').text()).toBe('¥15,000')
      expect(statCards[3].find('.stat-label').text()).toBe('总收入')
    })

    it('应该渲染图表网格', () => {
      wrapper = createWrapper()
      
      const chartCards = wrapper.findAll('.chart-card')
      expect(chartCards.length).toBe(3)
      
      expect(chartCards[0].find('.chart-header h4').text()).toBe('参与度分析')
      expect(chartCards[1].find('.chart-header h4').text()).toBe('满意度分析')
      expect(chartCards[2].find('.chart-header h4').text()).toBe('活动效果趋势')
    })

    it('应该渲染详细报告区域', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.detailed-report').exists()).toBe(true)
      expect(wrapper.find('.report-header').exists()).toBe(true)
      expect(wrapper.find('.report-content').exists()).toBe(true)
    })
  })

  describe('数据加载和显示', () => {
    it('应该在组件挂载时加载活动选项', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const { getActivities } = require('@/api/activity-center')
      expect(getActivities).toHaveBeenCalledWith({ pageSize: 100 })
    })

    it('应该在组件挂载时加载分析数据', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      const { getActivityAnalytics } = require('@/api/activity-center')
      expect(getActivityAnalytics).toHaveBeenCalledWith(wrapper.vm.filterForm)
    })

    it('应该正确显示加载状态', async () => {
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, data: mockAnalyticsData })
          }, 1000)
        })
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.chartLoading).toBe(true)
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.vm.chartLoading).toBe(false)
    })

    it('应该处理 API 加载失败', async () => {
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockRejectedValueOnce(new Error('加载失败'))
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.analyticsData).toBe(null)
    })
  })

  describe('筛选功能', () => {
    it('应该正确设置筛选表单', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.filterForm).toEqual({
        activityId: '',
        startDate: '',
        endDate: '',
        type: ''
      })
    })

    it('应该处理日期范围变化', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleDateRangeChange(['2024-01-01', '2024-01-31'])
      
      expect(wrapper.vm.filterForm.startDate).toBe('2024-01-01')
      expect(wrapper.vm.filterForm.endDate).toBe('2024-01-31')
    })

    it('应该处理空日期范围', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleDateRangeChange(null)
      
      expect(wrapper.vm.filterForm.startDate).toBe('')
      expect(wrapper.vm.filterForm.endDate).toBe('')
    })

    it('应该触发分析操作', async () => {
      wrapper = createWrapper()
      
      const { getActivityAnalytics } = require('@/api/activity-center')
      
      await wrapper.vm.handleAnalyze()
      
      expect(getActivityAnalytics).toHaveBeenCalledWith(wrapper.vm.filterForm)
    })

    it('应该重置筛选表单', async () => {
      wrapper = createWrapper()
      
      // 先设置一些值
      wrapper.vm.filterForm.activityId = '1'
      wrapper.vm.filterForm.type = 'trial'
      wrapper.vm.dateRange = ['2024-01-01', '2024-01-31']
      
      await wrapper.vm.handleReset()
      
      expect(wrapper.vm.filterForm).toEqual({
        activityId: '',
        startDate: '',
        endDate: '',
        type: ''
      })
      expect(wrapper.vm.dateRange).toBe(null)
    })
  })

  describe('图表功能', () => {
    it('应该正确计算参与度图表数据', async () => {
      wrapper = createWrapper()
      
      // 等待数据加载
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      wrapper.vm.analyticsData = mockAnalyticsData
      
      // 测试年龄分布
      wrapper.vm.participationTab = 'age'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.participationChartData).toEqual(mockAnalyticsData.participation.byAge)
      expect(wrapper.vm.participationChartType).toBe('bar')
      
      // 测试性别分布
      wrapper.vm.participationTab = 'gender'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.participationChartData).toEqual(mockAnalyticsData.participation.byGender)
      expect(wrapper.vm.participationChartType).toBe('pie')
      
      // 测试来源分析
      wrapper.vm.participationTab = 'source'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.participationChartData).toEqual(mockAnalyticsData.participation.bySource)
      expect(wrapper.vm.participationChartType).toBe('pie')
    })

    it('应该正确计算满意度图表数据', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.analyticsData = mockAnalyticsData
      await wrapper.vm.$nextTick()
      
      const expectedData = [
        { name: '5星', value: 80 },
        { name: '4星', value: 50 },
        { name: '3星', value: 15 },
        { name: '2星', value: 3 },
        { name: '1星', value: 2 }
      ]
      
      expect(wrapper.vm.satisfactionChartData).toEqual(expectedData)
    })

    it('应该正确计算趋势图表数据', () => {
      wrapper = createWrapper()
      
      const trendData = wrapper.vm.trendChartData
      
      expect(trendData).toHaveLength(6)
      expect(trendData[0]).toEqual({
        name: '1月',
        participants: 120,
        satisfaction: 4.2
      })
    })

    it('应该正确计算参与度表格数据', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.analyticsData = mockAnalyticsData
      await wrapper.vm.$nextTick()
      
      const tableData = wrapper.vm.participationTableData
      
      expect(tableData).toHaveLength(3)
      expect(tableData[0].category).toBe('3-4岁')
      expect(tableData[0].count).toBe(45)
    })

    it('应该正确计算反馈列表数据', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.analyticsData = mockAnalyticsData
      await wrapper.vm.$nextTick()
      
      const feedbackList = wrapper.vm.feedbackList
      
      expect(feedbackList).toHaveLength(2)
      expect(feedbackList[0].comment).toBe('活动非常棒，孩子很开心！')
    })
  })

  describe('用户交互', () => {
    it('应该处理参与度标签页变化', async () => {
      wrapper = createWrapper()
      
      const spy = vi.spyOn(wrapper.vm, 'handleParticipationTabChange')
      
      wrapper.vm.participationTab = 'gender'
      await wrapper.vm.$nextTick()
      
      expect(spy).toHaveBeenCalled()
    })

    it('应该处理导出报告操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleExportReport()
      
      // 验证是否显示了正确的消息
      expect(wrapper.vm.$message).toHaveBeenCalled()
    })

    it('应该处理生成报告操作', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleGenerateReport()
      
      // 验证是否显示了正确的消息
      expect(wrapper.vm.$message).toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化百分比', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatPercentage(0.85)).toBe('85.0%')
      expect(wrapper.vm.formatPercentage(0)).toBe('0%')
      expect(wrapper.vm.formatPercentage(undefined)).toBe('0%')
    })

    it('应该正确格式化分数', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatScore(4.2)).toBe('4.2')
      expect(wrapper.vm.formatScore(0)).toBe('0.0')
      expect(wrapper.vm.formatScore(undefined)).toBe('0.0')
    })

    it('应该正确格式化金额', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.formatMoney(15000)).toBe('15,000')
      expect(wrapper.vm.formatMoney(0)).toBe('0')
      expect(wrapper.vm.formatMoney(undefined)).toBe('0')
    })

    it('应该正确格式化日期', () => {
      wrapper = createWrapper()
      
      const dateStr = '2024-01-15T10:00:00Z'
      const formatted = wrapper.vm.formatDate(dateStr)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('应该正确获取趋势标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTrendTagType('up')).toBe('success')
      expect(wrapper.vm.getTrendTagType('down')).toBe('danger')
      expect(wrapper.vm.getTrendTagType('stable')).toBe('info')
    })

    it('应该正确获取趋势标签', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTrendLabel('up')).toBe('上升')
      expect(wrapper.vm.getTrendLabel('down')).toBe('下降')
      expect(wrapper.vm.getTrendLabel('stable')).toBe('稳定')
    })

    it('应该正确获取优先级标签类型', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getPriorityTagType('高')).toBe('danger')
      expect(wrapper.vm.getPriorityTagType('中')).toBe('warning')
      expect(wrapper.vm.getPriorityTagType('低')).toBe('info')
    })
  })

  describe('图表组件集成', () => {
    it('应该正确渲染图表容器', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.analyticsData = mockAnalyticsData
      await wrapper.vm.$nextTick()
      
      const chartContainers = wrapper.findAllComponents(ChartContainer)
      expect(chartContainers.length).toBeGreaterThan(0)
      
      // 检查第一个图表容器的属性
      const firstChart = chartContainers[0]
      expect(firstChart.props('data')).toBeDefined()
      expect(firstChart.props('type')).toBeDefined()
      expect(firstChart.props('height')).toBeDefined()
    })

    it('应该传递正确的加载状态到图表容器', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.chartLoading = true
      await wrapper.vm.$nextTick()
      
      const chartContainers = wrapper.findAllComponents(ChartContainer)
      chartContainers.forEach(container => {
        expect(container.props('loading')).toBe(true)
      })
      
      wrapper.vm.chartLoading = false
      await wrapper.vm.$nextTick()
      
      chartContainers.forEach(container => {
        expect(container.props('loading')).toBe(false)
      })
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空的分析数据', async () => {
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockResolvedValueOnce({
        success: true,
        data: null
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.analyticsData).toBe(null)
      
      // 检查计算属性是否正确处理空数据
      expect(wrapper.vm.participationChartData).toEqual([])
      expect(wrapper.vm.satisfactionChartData).toEqual([])
      expect(wrapper.vm.participationTableData).toEqual([])
      expect(wrapper.vm.feedbackList).toEqual([])
    })

    it('应该处理部分缺失的数据', async () => {
      const partialData = {
        overview: {
          totalParticipants: 100,
          completionRate: 0.8,
          satisfactionScore: 4.0,
          revenue: 10000
        },
        participation: {
          byAge: [],
          byGender: [],
          bySource: []
        },
        feedback: {
          ratings: [],
          comments: []
        }
      }
      
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockResolvedValueOnce({
        success: true,
        data: partialData
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.analyticsData).toEqual(partialData)
      expect(wrapper.vm.participationChartData).toEqual([])
      expect(wrapper.vm.satisfactionChartData).toEqual([])
    })

    it('应该处理异常数据格式', async () => {
      const malformedData = {
        overview: {
          totalParticipants: 'invalid',
          completionRate: 'invalid',
          satisfactionScore: 'invalid',
          revenue: 'invalid'
        },
        participation: 'invalid',
        feedback: 'invalid'
      }
      
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockResolvedValueOnce({
        success: true,
        data: malformedData
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      // 组件应该能够处理异常数据而不崩溃
      expect(wrapper.vm.analyticsData).toEqual(malformedData)
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染组件', () => {
      const startTime = performance.now()
      
      wrapper = createWrapper()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 渲染时间应该小于 100ms
    })

    it('应该正确处理大量数据', async () => {
      const largeData = {
        overview: {
          totalParticipants: 10000,
          completionRate: 0.9,
          satisfactionScore: 4.5,
          revenue: 100000
        },
        participation: {
          byAge: Array.from({ length: 100 }, (_, i) => ({
            age: `${i}-${i+1}岁`,
            count: Math.floor(Math.random() * 1000)
          })),
          byGender: Array.from({ length: 50 }, (_, i) => ({
            gender: `性别${i}`,
            count: Math.floor(Math.random() * 1000)
          })),
          bySource: Array.from({ length: 200 }, (_, i) => ({
            source: `来源${i}`,
            count: Math.floor(Math.random() * 1000)
          }))
        },
        feedback: {
          ratings: Array.from({ length: 100 }, (_, i) => ({
            rating: i % 5 + 1,
            count: Math.floor(Math.random() * 1000)
          })),
          comments: Array.from({ length: 500 }, (_, i) => ({
            id: `${i}`,
            rating: i % 5 + 1,
            comment: `评论${i}`,
            date: new Date().toISOString()
          }))
        }
      }
      
      const { getActivityAnalytics } = require('@/api/activity-center')
      getActivityAnalytics.mockResolvedValueOnce({
        success: true,
        data: largeData
      })
      
      wrapper = createWrapper()
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.analyticsData).toEqual(largeData)
      
      // 测试计算属性的性能
      const startTime = performance.now()
      const chartData = wrapper.vm.participationChartData
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // 计算时间应该小于 50ms
    })
  })
})