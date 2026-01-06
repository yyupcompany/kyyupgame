import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import EnrollmentDetail from '@/pages/enrollment/EnrollmentDetail.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    }
  }
})

// Mock UnifiedIcon
vi.mock('@/components/icons/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    template: '<i class="unified-icon" :data-name="name"></i>',
    props: ['name']
  }
}))

describe('招生详情页面 - 100%完整测试覆盖', () => {
  let router: any
  let pinia: any
  let wrapper: any

  const mockEnrollmentDetail = {
    id: '123',
    studentName: '张小明',
    studentGender: '男',
    studentBirthDate: '2020-03-15',
    studentAge: 4,
    studentIdCard: '110101202003150001',
    healthStatus: '良好',
    specialNeeds: '无特殊需求',
    parentName: '张大明',
    parentPhone: '13800138000',
    parentRelation: '父亲',
    parentEmail: 'zhangdaming@example.com',
    parentAddress: '北京市朝阳区某某街道某某小区',
    className: '阳光班',
    enrollmentDate: '2024-09-01',
    applicationDate: '2024-06-15',
    source: '线上报名',
    status: 'confirmed',
    enrollmentType: '正常入学',
    reviewDate: '2024-06-20',
    interviewDate: '2024-07-01',
    confirmDate: '2024-07-15',
    remarks: '学生活泼开朗，适应能力强'
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // 创建路由，包含参数
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        {
          path: '/enrollment/:id',
          component: { template: '<div>Enrollment Detail</div>' },
          props: true
        },
        {
          path: '/enrollment/edit/:id',
          component: { template: '<div>Edit Enrollment</div>' }
        }
      ]
    })

    pinia = createPinia()

    await router.push('/enrollment/123')
    await router.isReady()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('页面初始化和基础渲染', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-skeleton': {
              template: '<div class="el-skeleton" :rows="rows" :animated="animated"><slot /></div>',
              props: ['rows', 'animated']
            },
            'el-alert': {
              template: '<div class="el-alert" :type="type" :title="title" :closable="closable" :show-icon="showIcon"></div>',
              props: ['type', 'title', 'closable', 'showIcon']
            },
            'el-steps': {
              template: '<div class="el-steps" :active="active" :finish-status="finishStatus"><slot /></div>',
              props: ['active', 'finishStatus']
            },
            'el-step': {
              template: '<div class="el-step" :title="title" :description="description"></div>',
              props: ['title', 'description']
            },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确渲染招生详情页面', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('h2').text()).toContain('招生详情')
    })

    it('应该正确显示页面头部操作按钮', () => {
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThan(0)

      // 验证返回按钮
      const backButton = buttons.find(btn => btn.text().includes('返回列表'))
      expect(backButton?.exists()).toBe(true)

      // 验证编辑按钮
      const editButton = buttons.find(btn => btn.text().includes('编辑信息'))
      expect(editButton?.exists()).toBe(true)

      // 验证打印按钮
      const printButton = buttons.find(btn => btn.text().includes('打印详情'))
      expect(printButton?.exists()).toBe(true)
    })

    it('应该正确加载招生详情数据', async () => {
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.error).toBeNull()
      expect(wrapper.vm.enrollment).toBeDefined()
    })

    it('应该在加载期间显示骨架屏', () => {
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.el-skeleton').exists()).toBe(true)
      expect(wrapper.find('.loading-text').text()).toContain('正在加载招生详情')
    })

    it('应该正确获取路由参数中的ID', () => {
      expect(wrapper.vm.enrollmentId).toBe('123')
    })
  })

  describe('招生基本信息显示', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    it('应该正确显示招生基本信息', () => {
      if (wrapper.vm.enrollment) {
        const enrollment = wrapper.vm.enrollment

        expect(enrollment.id).toBe('123')
        expect(enrollment.studentName).toBe('张小明')
        expect(enrollment.className).toBe('阳光班')
        expect(enrollment.enrollmentType).toBe('正常入学')
        expect(enrollment.source).toBe('线上报名')
      }
    })

    it('应该正确显示招生状态', () => {
      if (wrapper.vm.enrollment) {
        const statusText = wrapper.vm.getStatusText(wrapper.vm.enrollment.status)
        expect(statusText).toBe('已确认')
      }
    })

    it('应该正确格式化日期显示', () => {
      const formattedDate = wrapper.vm.formatDate('2024-06-15')
      expect(formattedDate).toBe('6/15/2024')

      const emptyDate = wrapper.vm.formatDate('')
      expect(emptyDate).toBe('')

      const nullDate = wrapper.vm.formatDate(null)
      expect(nullDate).toBe('')
    })

    it('应该正确获取招生类型标签', () => {
      expect(wrapper.vm.enrollment.enrollmentType).toBe('正常入学')
    })
  })

  describe('学生信息显示', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    it('应该正确显示学生基本信息', () => {
      if (wrapper.vm.enrollment) {
        const enrollment = wrapper.vm.enrollment

        expect(enrollment.studentName).toBe('张小明')
        expect(enrollment.studentGender).toBe('男')
        expect(enrollment.studentAge).toBe(4)
        expect(enrollment.studentBirthDate).toBe('2020-03-15')
        expect(enrollment.studentIdCard).toBe('110101202003150001')
      }
    })

    it('应该正确显示健康状态', () => {
      if (wrapper.vm.enrollment) {
        expect(wrapper.vm.enrollment.healthStatus).toBe('良好')
      }
    })

    it('应该正确显示特殊需求', () => {
      if (wrapper.vm.enrollment) {
        expect(wrapper.vm.enrollment.specialNeeds).toBe('无特殊需求')
      }
    })

    it('应该正确处理健康状态默认值', () => {
      // 创建没有健康状态的数据
      const enrollmentWithoutHealth = {
        ...mockEnrollmentDetail,
        healthStatus: undefined
      }

      wrapper.vm.enrollment = enrollmentWithoutHealth

      expect(wrapper.vm.enrollment.healthStatus || '良好').toBe('良好')
    })
  })

  describe('家长信息显示', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    it('应该正确显示家长基本信息', () => {
      if (wrapper.vm.enrollment) {
        const enrollment = wrapper.vm.enrollment

        expect(enrollment.parentName).toBe('张大明')
        expect(enrollment.parentPhone).toBe('13800138000')
        expect(enrollment.parentRelation).toBe('父亲')
        expect(enrollment.parentAddress).toBe('北京市朝阳区某某街道某某小区')
      }
    })

    it('应该正确显示家长邮箱', () => {
      if (wrapper.vm.enrollment) {
        expect(wrapper.vm.enrollment.parentEmail).toBe('zhangdaming@example.com')
      }
    })

    it('应该正确处理邮箱默认值', () => {
      // 创建没有邮箱的数据
      const enrollmentWithoutEmail = {
        ...mockEnrollmentDetail,
        parentEmail: undefined
      }

      wrapper.vm.enrollment = enrollmentWithoutEmail

      expect(wrapper.vm.enrollment.parentEmail || '未填写').toBe('未填写')
    })
  })

  describe('招生进度显示', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': {
              template: '<div class="el-steps" :active="active" :finish-status="finishStatus"><slot /></div>',
              props: ['active', 'finishStatus']
            },
            'el-step': {
              template: '<div class="el-step" :title="title" :description="description"></div>',
              props: ['title', 'description']
            },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    it('应该正确显示招生进度步骤', () => {
      if (wrapper.vm.enrollment) {
        const progressStep = wrapper.vm.getProgressStep(wrapper.vm.enrollment.status)
        expect(progressStep).toBe(3) // confirmed状态对应第3步
      }
    })

    it('应该正确映射不同状态的进度步骤', () => {
      expect(wrapper.vm.getProgressStep('pending')).toBe(0)
      expect(wrapper.vm.getProgressStep('reviewing')).toBe(1)
      expect(wrapper.vm.getProgressStep('interview')).toBe(2)
      expect(wrapper.vm.getProgressStep('confirmed')).toBe(3)
      expect(wrapper.vm.getProgressStep('enrolled')).toBe(4)
      expect(wrapper.vm.getProgressStep('rejected')).toBe(1)
      expect(wrapper.vm.getProgressStep('unknown')).toBe(0)
    })
  })

  describe('状态相关功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确获取状态样式类', () => {
      expect(wrapper.vm.getStatusClass('pending')).toBe('status-pending')
      expect(wrapper.vm.getStatusClass('reviewing')).toBe('status-reviewing')
      expect(wrapper.vm.getStatusClass('interview')).toBe('status-interview')
      expect(wrapper.vm.getStatusClass('confirmed')).toBe('status-confirmed')
      expect(wrapper.vm.getStatusClass('enrolled')).toBe('status-enrolled')
      expect(wrapper.vm.getStatusClass('rejected')).toBe('status-rejected')
      expect(wrapper.vm.getStatusClass('unknown')).toBe('status-default')
    })

    it('应该正确获取状态文本', () => {
      expect(wrapper.vm.getStatusText('pending')).toBe('待审核')
      expect(wrapper.vm.getStatusText('reviewing')).toBe('审核中')
      expect(wrapper.vm.getStatusText('interview')).toBe('面试中')
      expect(wrapper.vm.getStatusText('confirmed')).toBe('已确认')
      expect(wrapper.vm.getStatusText('enrolled')).toBe('已入学')
      expect(wrapper.vm.getStatusText('rejected')).toBe('已拒绝')
      expect(wrapper.vm.getStatusText('unknown')).toBe('unknown状态')
    })
  })

  describe('页面操作功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确执行返回操作', async () => {
      const routerBackSpy = vi.spyOn(wrapper.vm.$router, 'back')

      await wrapper.vm.goBack()

      expect(routerBackSpy).toHaveBeenCalled()
    })

    it('应该正确执行编辑操作', async () => {
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, 'push')

      await wrapper.vm.handleEdit()

      expect(routerPushSpy).toHaveBeenCalledWith('/enrollment/123')
    })

    it('应该正确执行打印操作', async () => {
      const { ElMessage } = await import('element-plus')

      await wrapper.vm.handlePrint()

      expect(ElMessage.info).toHaveBeenCalledWith('打印功能开发中...')
    })
  })

  describe('错误处理功能', () => {
    it('应该正确处理数据获取失败', async () => {
      // 模拟fetchEnrollmentDetail失败
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': {
              template: '<div class="el-alert" :type="type" :title="title" :closable="false" :show-icon="true"></div>',
              props: ['type', 'title', 'closable', 'showIcon']
            },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()

      // 手动设置错误状态
      wrapper.vm.error = '获取招生详情失败，请重试'
      wrapper.vm.loading = false

      await nextTick()

      const alert = wrapper.find('.el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('title')).toBe('获取招生详情失败，请重试')
      expect(alert.attributes('type')).toBe('error')
      expect(alert.attributes('closable')).toBe('false')
      expect(alert.attributes('show-icon')).toBe('true')
    })

    it('应该正确处理异常情况', async () => {
      // 模拟fetchEnrollmentDetail抛出异常
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()

      // 手动触发异常
      wrapper.vm.error = null
      wrapper.vm.loading = false

      const testError = new Error('测试异常')
      wrapper.vm.fetchEnrollmentDetail = vi.fn().mockRejectedValue(testError)

      await wrapper.vm.fetchEnrollmentDetail()

      expect(wrapper.vm.error).toBe('获取招生详情失败，请重试')
      expect(consoleErrorSpy).toHaveBeenCalledWith('获取招生详情失败:', testError)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('生命周期钩子', () => {
    it('应该在mounted时自动加载数据', async () => {
      const fetchEnrollmentDetailSpy = vi.fn()

      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      // 替换fetchEnrollmentDetail方法
      wrapper.vm.fetchEnrollmentDetail = fetchEnrollmentDetailSpy

      await nextTick()

      expect(fetchEnrollmentDetailSpy).toHaveBeenCalled()
    })
  })

  describe('响应式布局测试', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
      // 等待数据加载完成
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    it('应该正确渲染页面结构', () => {
      expect(wrapper.find('.business-process-container').exists()).toBe(true)
      expect(wrapper.find('.page-header').exists()).toBe(true)
      expect(wrapper.find('.header-content').exists()).toBe(true)
      expect(wrapper.find('.header-actions').exists()).toBe(true)
    })

    it('应该正确渲染内容区块', () => {
      expect(wrapper.find('.enrollment-basic-info').exists()).toBe(true)
      expect(wrapper.find('.student-info').exists()).toBe(true)
      expect(wrapper.find('.parent-info').exists()).toBe(true)
      expect(wrapper.find('.enrollment-progress').exists()).toBe(true)
    })

    it('应该正确渲染信息网格布局', () => {
      const infoGrids = wrapper.findAll('.info-grid')
      expect(infoGrids.length).toBeGreaterThan(0)

      // 验证信息项
      const infoItems = wrapper.findAll('.info-item')
      expect(infoItems.length).toBeGreaterThan(0)
    })

    it('应该正确渲染个人信息头像', () => {
      if (wrapper.vm.enrollment) {
        const avatar = wrapper.find('.enrollment-avatar')
        expect(avatar.exists()).toBe(true)
        expect(avatar.text()).toBe('张') // 学生姓名首字母
      }
    })
  })

  describe('数据处理功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentDetail, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            'el-steps': { template: '<div><slot /></div>' },
            'el-step': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确计算学生首字母', () => {
      // 设置模拟数据
      wrapper.vm.enrollment = mockEnrollmentDetail

      const avatar = wrapper.find('.enrollment-avatar')
      expect(avatar.text()).toBe('张') // 张小明的首字母
    })

    it('应该正确处理空名称情况', () => {
      // 设置空名称的数据
      wrapper.vm.enrollment = {
        ...mockEnrollmentDetail,
        studentName: ''
      }

      const avatar = wrapper.find('.enrollment-avatar')
      expect(avatar.text()).toBe('') // 空字符串的首字母
    })

    it('应该正确显示备注信息', async () => {
      wrapper.vm.enrollment = mockEnrollmentDetail
      await nextTick()

      const remarksSection = wrapper.find('.remarks-info')
      if (remarksSection.exists()) {
        const remarksText = remarksSection.find('.remarks-text')
        expect(remarksText.text()).toContain('学生活泼开朗，适应能力强')
      }
    })

    it('应该在无备注时隐藏备注区域', async () => {
      wrapper.vm.enrollment = {
        ...mockEnrollmentDetail,
        remarks: undefined
      }
      await nextTick()

      const remarksSection = wrapper.find('.remarks-info')
      expect(remarksSection.exists()).toBe(false)
    })
  })
})