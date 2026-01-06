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
import TeachingCenterTimeline from '@/pages/centers/TeachingCenterTimeline.vue'
import * as teachingCenterApi from '@/api/endpoints/teaching-center'

// Mock Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElTimeline: {
      name: 'ElTimeline',
      template: '<div class="el-timeline"><slot /></div>'
    },
    ElTimelineItem: {
      name: 'ElTimelineItem',
      template: '<div class="el-timeline-item"><slot /></div>',
      props: ['type', 'color', 'icon', 'size', 'placement']
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot /></span>',
      props: ['type', 'size', 'effect']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot /></button>',
      props: ['type', 'size', 'icon', 'disabled']
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress"></div>',
      props: ['percentage', 'status', 'strokeWidth']
    },
    ElDrawer: {
      name: 'ElDrawer',
      template: '<div class="el-drawer"><slot /></div>',
      props: ['modelValue', 'title', 'direction', 'size']
    },
    ElEmpty: {
      name: 'ElEmpty',
      template: '<div class="el-empty"><slot /></div>',
      props: ['description', 'image']
    },
    ElIcon: {
      name: 'ElIcon',
      template: '<i class="el-icon"><slot /></i>'
    }
  }
})

// Mock子组件
vi.mock('@/pages/centers/components/CoursePlanDetail.vue', () => ({
  default: {
    name: 'CoursePlanDetail',
    template: '<div class="course-plan-detail">Course Plan Detail</div>',
    props: ['data']
  }
}))

vi.mock('@/pages/centers/components/OutdoorTrainingDetail.vue', () => ({
  default: {
    name: 'OutdoorTrainingDetail',
    template: '<div class="outdoor-training-detail">Outdoor Training Detail</div>',
    props: ['data']
  }
}))

vi.mock('@/pages/centers/components/ExternalDisplayDetail.vue', () => ({
  default: {
    name: 'ExternalDisplayDetail',
    template: '<div class="external-display-detail">External Display Detail</div>',
    props: ['data']
  }
}))

vi.mock('@/pages/centers/components/ChampionshipDetail.vue', () => ({
  default: {
    name: 'ChampionshipDetail',
    template: '<div class="championship-detail">Championship Detail</div>',
    props: ['data']
  }
}))

// Mock API
vi.mock('@/api/endpoints/teaching-center', () => ({
  teachingCenterApi: {
    getCourseProgressStats: vi.fn(),
    getOutdoorTrainingStats: vi.fn(),
    getExternalDisplayStats: vi.fn(),
    getChampionshipStats: vi.fn()
  }
}))

describe('TeachingCenterTimeline', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock API responses
    vi.mocked(teachingCenterApi.teachingCenterApi.getCourseProgressStats).mockResolvedValue({
      success: true,
      data: {
        overall_stats: {
          overall_completion_rate: 75,
          overall_achievement_rate: 80
        },
        course_plans: []
      }
    })

    vi.mocked(teachingCenterApi.teachingCenterApi.getOutdoorTrainingStats).mockResolvedValue({
      success: true,
      data: {
        overview: {
          outdoor_training: {
            average_rate: 65,
            completed_weeks: 8
          }
        },
        class_statistics: []
      }
    })

    vi.mocked(teachingCenterApi.teachingCenterApi.getExternalDisplayStats).mockResolvedValue({
      success: true,
      data: {
        overview: {
          average_achievement_rate: 70,
          semester_total_outings: 3,
          all_time_total_outings: 15
        },
        class_statistics: []
      }
    })

    vi.mocked(teachingCenterApi.teachingCenterApi.getChampionshipStats).mockResolvedValue({
      success: true,
      data: {
        achievement_rates: {
          brain_science_plan: 85,
          course_content: 75,
          outdoor_training_display: 80,
          external_display: 70
        },
        championship_list: []
      }
    })
  })

  const createWrapper = (props = {}) => {
    return mount(TeachingCenterTimeline, {
      props,
      global: {
        stubs: {
          'el-drawer': true,
          'el-empty': true,
          'el-icon': true
        }
      }
    })
  }

  it('应该正确渲染组件结构', async () => {
    wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.teaching-center-timeline').exists()).toBe(true)
    expect(wrapper.find('.timeline-section').exists()).toBe(true)
    expect(wrapper.find('.content-section').exists()).toBe(true)
  })

  it('应该显示教学进度总览卡片', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    await wrapper.vm.$nextTick()
    
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards).toHaveLength(4)
    
    // 检查统计卡片内容
    expect(wrapper.find('.progress-overview').exists()).toBe(true)
    expect(wrapper.find('.overview-title').text()).toBe('教学进度总览')
  })

  it('应该正确加载时间轴数据', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    expect(teachingCenterApi.teachingCenterApi.getCourseProgressStats).toHaveBeenCalled()
    expect(teachingCenterApi.teachingCenterApi.getOutdoorTrainingStats).toHaveBeenCalled()
    expect(teachingCenterApi.teachingCenterApi.getExternalDisplayStats).toHaveBeenCalled()
    expect(teachingCenterApi.teachingCenterApi.getChampionshipStats).toHaveBeenCalled()
    
    const timelineItems = wrapper.vm.timelineItems
    expect(timelineItems).toHaveLength(4)
    expect(timelineItems[0].type).toBe('course-plan')
    expect(timelineItems[1].type).toBe('outdoor-training')
    expect(timelineItems[2].type).toBe('external-display')
    expect(timelineItems[3].type).toBe('championship')
  })

  it('应该能够选择时间轴项目', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    const firstItem = wrapper.vm.timelineItems[0]
    wrapper.vm.selectTimelineItem(firstItem)
    
    expect(wrapper.vm.selectedItem).toEqual(firstItem)
    expect(wrapper.find('.selected-detail').exists()).toBe(true)
  })

  it('应该显示正确的组件详情', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    const coursePlanItem = wrapper.vm.timelineItems.find(item => item.type === 'course-plan')
    wrapper.vm.selectTimelineItem(coursePlanItem)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.course-plan-detail').exists()).toBe(true)
  })

  it('应该正确计算进度状态', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getProgressStatus(95)).toBe('completed')
    expect(wrapper.vm.getProgressStatus(75)).toBe('in-progress')
    expect(wrapper.vm.getProgressStatus(25)).toBe('pending')
    expect(wrapper.vm.getProgressStatus(0)).toBe('not-started')
  })

  it('应该正确获取时间轴类型', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getTimelineType('completed')).toBe('success')
    expect(wrapper.vm.getTimelineType('in-progress')).toBe('primary')
    expect(wrapper.vm.getTimelineType('pending')).toBe('warning')
    expect(wrapper.vm.getTimelineType('not-started')).toBe('info')
  })

  it('应该正确获取时间轴颜色', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getTimelineColor('completed')).toBe('#67c23a')
    expect(wrapper.vm.getTimelineColor('in-progress')).toBe('#409eff')
    expect(wrapper.vm.getTimelineColor('pending')).toBe('#e6a23c')
    expect(wrapper.vm.getTimelineColor('not-started')).toBe('#909399')
  })

  it('应该正确获取时间轴图标', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getTimelineIcon('course-plan')).toBeDefined()
    expect(wrapper.vm.getTimelineIcon('outdoor-training')).toBeDefined()
    expect(wrapper.vm.getTimelineIcon('external-display')).toBeDefined()
    expect(wrapper.vm.getTimelineIcon('championship')).toBeDefined()
  })

  it('应该正确获取状态文本', () => {
    wrapper = createWrapper()
    
    expect(wrapper.vm.getStatusText('completed')).toBe('已完成')
    expect(wrapper.vm.getStatusText('in-progress')).toBe('进行中')
    expect(wrapper.vm.getStatusText('pending')).toBe('待处理')
    expect(wrapper.vm.getStatusText('not-started')).toBe('未开始')
  })

  it('应该显示快捷操作按钮', async () => {
    wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    
    const quickActions = wrapper.findAll('.action-btn')
    expect(quickActions).toHaveLength(4)
    
    const actionLabels = quickActions.map(btn => btn.text())
    expect(actionLabels).toContain('创建课程计划')
    expect(actionLabels).toContain('记录户外训练')
    expect(actionLabels).toContain('添加校外展示')
    expect(actionLabels).toContain('创建锦标赛')
  })

  it('应该能够处理快捷操作', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    // 测试创建课程计划快捷操作
    wrapper.vm.handleCreateCourse()
    expect(wrapper.vm.selectedItem?.type).toBe('course-plan')
    expect(wrapper.vm.showDrawer).toBe(true)
    
    // 重置状态
    wrapper.vm.showDrawer = false
    
    // 测试记录户外训练快捷操作
    wrapper.vm.handleOutdoorRecord()
    expect(wrapper.vm.selectedItem?.type).toBe('outdoor-training')
    expect(wrapper.vm.showDrawer).toBe(true)
  })

  it('应该正确处理API加载错误', async () => {
    // Mock API错误
    vi.mocked(teachingCenterApi.teachingCenterApi.getCourseProgressStats).mockRejectedValue(
      new Error('API Error')
    )
    
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    // 应该有默认的空数据
    expect(wrapper.vm.timelineItems).toHaveLength(4)
    expect(wrapper.vm.progressStats.overallProgress).toBe(0)
  })

  it('应该在没有选中项目时显示空状态', async () => {
    wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.selected-detail').exists()).toBe(false)
  })

  it('应该能够显示原始内容抽屉', async () => {
    wrapper = createWrapper()
    await wrapper.vm.loadTimelineData()
    
    const firstItem = wrapper.vm.timelineItems[0]
    wrapper.vm.selectTimelineItem(firstItem)
    wrapper.vm.showOriginalContent()
    
    expect(wrapper.vm.showDrawer).toBe(true)
  })

  it('应该响应式适配不同屏幕尺寸', async () => {
    wrapper = createWrapper()
    
    // 测试移动端样式类
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    })
    
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.teaching-center-timeline').exists()).toBe(true)
  })
})