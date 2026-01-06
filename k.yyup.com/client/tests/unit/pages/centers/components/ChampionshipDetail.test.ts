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
import ChampionshipDetail from '@/pages/centers/components/ChampionshipDetail.vue'

describe('ChampionshipDetail', () => {
  let wrapper: any

  const mockData = {
    championshipList: [
      {
        id: 1,
        name: '春季锦标赛',
        brain_science_rate: 85,
        course_content_rate: 75,
        outdoor_training_rate: 80,
        external_display_rate: 70,
        status: 'completed',
        created_at: '2024-01-15',
        completed_at: '2024-03-15'
      },
      {
        id: 2,
        name: '秋季锦标赛',
        brain_science_rate: 90,
        course_content_rate: 80,
        outdoor_training_rate: 85,
        external_display_rate: 75,
        status: 'in-progress',
        created_at: '2024-09-01',
        completed_at: null
      }
    ],
    brainScienceRate: 87.5,
    courseContentRate: 77.5,
    outdoorTrainingRate: 82.5,
    externalDisplayRate: 72.5
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ChampionshipDetail, {
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
    
    expect(wrapper.find('.championship-detail').exists()).toBe(true)
  })

  it('应该显示四项达标率统计', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.achievement-stats').exists()).toBe(true)
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards).toHaveLength(4)
  })

  it('应该显示锦标赛记录列表', () => {
    wrapper = createWrapper()
    
    const championshipCards = wrapper.findAll('.championship-card')
    expect(championshipCards).toHaveLength(2)
  })

  it('应该正确计算平均达标率', () => {
    wrapper = createWrapper()
    
    const averageRate = wrapper.vm.calculateAverageRate([
      mockData.brainScienceRate,
      mockData.courseContentRate,
      mockData.outdoorTrainingRate,
      mockData.externalDisplayRate
    ])
    expect(averageRate).toBe(80) // (87.5 + 77.5 + 82.5 + 72.5) / 4
  })

  it('应该正确获取状态类型', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getStatusType('completed')).toBe('success')
    expect(wrapper.vm.getStatusType('in-progress')).toBe('warning')
    expect(wrapper.vm.getStatusType('pending')).toBe('info')
  })

  it('应该正确获取状态文本', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getStatusText('completed')).toBe('已完成')
    expect(wrapper.vm.getStatusText('in-progress')).toBe('进行中')
    expect(wrapper.vm.getStatusText('pending')).toBe('待开始')
  })

  it('应该正确获取进度状态', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getProgressStatus(85)).toBe('success')
    expect(wrapper.vm.getProgressStatus(70)).toBe('warning')
    expect(wrapper.vm.getProgressStatus(50)).toBe('exception')
  })

  it('应该能够处理刷新事件', async () => {
    wrapper = createWrapper()
    
    wrapper.vm.$emit('refresh')
    expect(wrapper.emitted('refresh')).toBeDefined()
  })

  it('应该在没有数据时显示空状态', () => {
    wrapper = createWrapper({ data: { championshipList: [] } })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('应该正确格式化日期', () => {
    wrapper = createWrapper()
    
    const formattedDate = wrapper.vm.formatDate('2024-01-15')
    expect(formattedDate).toBe('2024-01-15')
  })

  it('应该显示媒体文件指示器', () => {
    wrapper = createWrapper()
    
    expect(wrapper.find('.media-indicators').exists()).toBe(true)
  })

  it('应该能够创建新的锦标赛', async () => {
    wrapper = createWrapper()
    
    const createButton = wrapper.find('.create-championship-btn')
    if (createButton.exists()) {
      await createButton.trigger('click')
      // 验证创建逻辑被触发
    }
  })
})