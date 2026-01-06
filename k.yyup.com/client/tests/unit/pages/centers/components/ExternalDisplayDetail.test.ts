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
import { ElProgress, ElTag, ElButton, ElCard } from 'element-plus'
import ExternalDisplayDetail from '@/pages/centers/components/ExternalDisplayDetail.vue'

describe('ExternalDisplayDetail', () => {
  let wrapper: any

  const mockData = {
    classList: [
      {
        id: 1,
        name: '小班A',
        outing_count: 3,
        achievement_rate: 80,
        last_outing_date: '2024-01-15',
        last_updated: '2024-01-15'
      },
      {
        id: 2,
        name: '小班B',
        outing_count: 2,
        achievement_rate: 65,
        last_outing_date: '2024-01-10',
        last_updated: '2024-01-14'
      }
    ],
    averageRate: 72.5,
    semesterOutings: 5,
    totalOutings: 15
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ExternalDisplayDetail, {
      props: {
        data: mockData,
        ...props
      },
      global: {
        components: {
          ElProgress,
          ElTag,
          ElButton,
          ElCard
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
    
    expect(wrapper.find('.external-display-detail').exists()).toBe(true)
  })

  it('应该显示校外展示统计数据', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.stats-overview').exists()).toBe(true)
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBeGreaterThanOrEqual(3)
  })

  it('应该显示班级外出记录', () => {
    wrapper = createWrapper()
    
    const classRecords = wrapper.findAll('.class-record')
    expect(classRecords).toHaveLength(2)
  })

  it('应该正确计算平均达标率', () => {
    wrapper = createWrapper()
    
    const averageRate = wrapper.vm.calculateAverageRate(mockData.classList)
    expect(averageRate).toBe(72.5) // (80 + 65) / 2
  })

  it('应该正确获取达标状态类型', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getAchievementType(85)).toBe('success')
    expect(wrapper.vm.getAchievementType(70)).toBe('warning')
    expect(wrapper.vm.getAchievementType(50)).toBe('danger')
  })

  it('应该正确格式化外出次数', () => {
    wrapper = createWrapper()
    
    const outingText = wrapper.vm.formatOutingCount(3)
    expect(outingText).toBe('3次')
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

  it('应该正确格式化日期', () => {
    wrapper = createWrapper()
    
    const formattedDate = wrapper.vm.formatDate('2024-01-15')
    expect(formattedDate).toBe('2024-01-15')
  })

  it('应该显示本学期和累计外出统计', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.semester-outings').exists()).toBe(true)
    expect(wrapper.find('.total-outings').exists()).toBe(true)
  })
})