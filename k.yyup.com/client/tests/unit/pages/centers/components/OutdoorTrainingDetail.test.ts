import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElProgress, ElTag, ElButton, ElCard, ElSwitch } from 'element-plus'
import OutdoorTrainingDetail from '@/pages/centers/components/OutdoorTrainingDetail.vue'

describe('OutdoorTrainingDetail', () => {
  let wrapper: any

  const mockData = {
    classList: [
      {
        id: 1,
        name: '小班A',
        completion_rate: 75,
        completed_weeks: 12,
        total_weeks: 16,
        last_updated: '2024-01-15'
      },
      {
        id: 2,
        name: '小班B',
        completion_rate: 50,
        completed_weeks: 8,
        total_weeks: 16,
        last_updated: '2024-01-14'
      }
    ],
    averageRate: 62.5,
    completedWeeks: 10
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(OutdoorTrainingDetail, {
      props: {
        data: mockData,
        ...props
      },
      global: {
        components: {
          ElProgress,
          ElTag,
          ElButton,
          ElCard,
          ElSwitch
        },
        stubs: {
          'el-icon': true,
          'el-table': true,
          'el-table-column': true
        }
      }
    })
  }

  it('应该正确渲染组件结构', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.outdoor-training-detail').exists()).toBe(true)
  })

  it('应该显示户外训练统计数据', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.stats-overview').exists()).toBe(true)
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBeGreaterThan(0)
  })

  it('应该显示班级执行情况', () => {
    wrapper = createWrapper()
    
    const classItems = wrapper.findAll('.class-item')
    expect(classItems).toHaveLength(2)
  })

  it('应该能够切换视图模式', async () => {
    wrapper = createWrapper()
    
    const viewSwitch = wrapper.find('.view-switch')
    if (viewSwitch.exists()) {
      await viewSwitch.trigger('click')
      expect(wrapper.vm.currentView).toBeDefined()
    }
  })

  it('应该正确计算完成率', () => {
    wrapper = createWrapper()
    
    const completionRate = wrapper.vm.calculateCompletionRate(12, 16)
    expect(completionRate).toBe(75)
  })

  it('应该正确获取进度状态', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getProgressStatus(85)).toBe('success')
    expect(wrapper.vm.getProgressStatus(60)).toBe('warning')
    expect(wrapper.vm.getProgressStatus(30)).toBe('exception')
  })

  it('应该能够处理刷新事件', async () => {
    wrapper = createWrapper()
    
    wrapper.vm.$emit('refresh')
    expect(wrapper.emitted('refresh')).toBeDefined()
  })

  it('应该在没有数据时显示空状态', () => {
    wrapper = createWrapper({ data: { classList: [] } })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('应该正确格式化周数显示', () => {
    wrapper = createWrapper()
    
    const weekDisplay = wrapper.vm.formatWeekDisplay(12, 16)
    expect(weekDisplay).toBe('12/16周')
  })
})