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
import CoursePlanDetail from '@/pages/centers/components/CoursePlanDetail.vue'

describe('CoursePlanDetail', () => {
  let wrapper: any

  const mockData = {
    classList: [
      {
        id: 1,
        name: '小班A',
        completion_rate: 80,
        achievement_rate: 85,
        media_status: 'completed',
        last_updated: '2024-01-15'
      },
      {
        id: 2,
        name: '小班B',
        completion_rate: 65,
        achievement_rate: 70,
        media_status: 'in-progress',
        last_updated: '2024-01-14'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(CoursePlanDetail, {
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
    
    expect(wrapper.find('.course-plan-detail').exists()).toBe(true)
  })

  it('应该显示班级进度信息', () => {
    wrapper = createWrapper()
    
    const classItems = wrapper.findAll('.class-item')
    expect(classItems).toHaveLength(2)
  })

  it('应该正确计算平均进度', () => {
    wrapper = createWrapper()
    
    const averageProgress = wrapper.vm.averageProgress
    expect(averageProgress).toBe(72.5) // (80 + 65) / 2
  })

  it('应该正确计算平均达标率', () => {
    wrapper = createWrapper()
    
    const averageAchievement = wrapper.vm.averageAchievement
    expect(averageAchievement).toBe(77.5) // (85 + 70) / 2
  })

  it('应该正确获取媒体状态类型', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getMediaType('completed')).toBe('success')
    expect(wrapper.vm.getMediaType('in-progress')).toBe('warning')
    expect(wrapper.vm.getMediaType('not-started')).toBe('info')
  })

  it('应该正确获取媒体状态文本', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getMediaText('completed')).toBe('已完成')
    expect(wrapper.vm.getMediaText('in-progress')).toBe('进行中')
    expect(wrapper.vm.getMediaText('not-started')).toBe('未开始')
  })

  it('应该能够处理刷新事件', async () => {
    wrapper = createWrapper()
    
    const refreshSpy = vi.fn()
    wrapper.vm.$emit('refresh')
    
    // 测试事件触发
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
})