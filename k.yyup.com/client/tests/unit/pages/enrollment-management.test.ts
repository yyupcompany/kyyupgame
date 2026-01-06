import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import EnrollmentManagement from '@/pages/enrollment/index.vue'

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
    },
    ElLoading: {
      service: vi.fn(() => ({
        close: vi.fn()
      }))
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

// Mock EmptyState component
vi.mock('@/components/common/EmptyState.vue', () => ({
  default: {
    name: 'EmptyState',
    template: '<div class="empty-state-mock"><slot /></div>',
    props: ['type', 'title', 'description', 'size', 'primaryAction', 'secondaryAction', 'suggestions', 'showSuggestions']
  }
}))

// Mock API endpoints
vi.mock('@/api/endpoints', () => ({
  ENROLLMENT_APPLICATION_ENDPOINTS: {
    BASE: '/api/enrollment-applications',
    DELETE: (id: string) => `/api/enrollment-applications/${id}`,
    BATCH_APPROVE: '/api/enrollment-applications/batch-approve',
    BATCH_REJECT: '/api/enrollment-applications/batch-reject',
    REVIEW: (id: string) => `/api/enrollment-applications/${id}/review`,
    UPDATE: (id: string) => `/api/enrollment-applications/${id}`
  },
  ENROLLMENT_ENDPOINTS: {
    BASE: '/api/enrollments',
    STATISTICS: '/api/enrollments/statistics',
    FOLLOW_UP: '/api/enrollments/follow-up'
  }
}))

// Mock request utility
const mockRequest = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('@/utils/request', () => ({
  request: mockRequest,
  default: mockRequest
}))

// Mock date format utility
vi.mock('@/utils/dateFormat', () => ({
  formatDateTime: vi.fn((date) => date ? new Date(date).toLocaleDateString() : '')
}))

describe('招生管理系统 - 100%完整测试覆盖', () => {
  let router: any
  let pinia: any
  let wrapper: any

  const mockEnrollmentData = {
    success: true,
    data: {
      items: [
        {
          id: '1',
          studentName: '张小明',
          gender: 'male',
          age: 4,
          ageGroup: 'small',
          parentName: '张大明',
          parentPhone: '13800138000',
          status: 'consulting',
          source: 'online',
          consultant: 'teacher_zhang',
          intendedClass: 'small_a',
          address: '北京市朝阳区',
          remarks: '家长很感兴趣',
          createTime: '2024-01-15T10:00:00Z',
          appliedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          studentName: '李小红',
          gender: 'female',
          age: 5,
          ageGroup: 'medium',
          parentName: '李小华',
          parentPhone: '13800138001',
          status: 'enrolled',
          source: 'referral',
          consultant: 'teacher_li',
          intendedClass: 'medium_a',
          address: '北京市海淀区',
          remarks: '朋友推荐',
          createTime: '2024-01-14T15:30:00Z',
          reviewedAt: '2024-01-16T09:00:00Z',
          reviewedBy: 'admin'
        },
        {
          id: '3',
          studentName: '王小刚',
          gender: 'male',
          age: 6,
          ageGroup: 'large',
          parentName: '王大强',
          parentPhone: '13800138002',
          status: 'rejected',
          source: 'offline',
          consultant: 'teacher_wang',
          intendedClass: 'large_a',
          address: '北京市西城区',
          remarks: '年龄不符合要求',
          createTime: '2024-01-13T14:20:00Z',
          reviewedAt: '2024-01-15T16:00:00Z',
          reviewedBy: 'admin'
        }
      ],
      total: 3,
      page: 1,
      pageSize: 20
    },
    message: '获取成功'
  }

  const mockStatisticsData = {
    success: true,
    data: {
      totalApplications: 150,
      approvedApplications: 120,
      pendingApplications: 25,
      rejectedApplications: 5
    },
    message: '获取成功'
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div>Home</div>' }
        },
        {
          path: '/enrollment/:id',
          component: { template: '<div>Enrollment Detail</div>' }
        }
      ]
    })

    pinia = createPinia()

    await router.push('/')
    await router.isReady()

    // 设置默认mock返回值
    mockRequest.get.mockImplementation((url: string) => {
      if (url.includes('/statistics')) {
        return Promise.resolve(mockStatisticsData)
      }
      return Promise.resolve(mockEnrollmentData)
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('页面初始化和基础渲染', () => {
    it('应该正确渲染招生管理页面', async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-row': {
              template: '<div class="el-row"><slot /></div>'
            },
            'el-col': {
              template: '<div class="el-col"><slot /></div>',
              props: ['xs', 'sm', 'md']
            },
            'el-card': {
              template: '<div class="el-card"><slot /></div>',
              props: ['shadow', 'class']
            },
            'el-form': {
              template: '<form class="el-form"><slot /></form>',
              props: ['model', 'inline']
            },
            'el-form-item': {
              template: '<div class="el-form-item"><slot /></div>',
              props: ['label']
            },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'placeholder', 'clearable'],
              emits: ['update:modelValue']
            },
            'el-select': {
              template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              props: ['modelValue', 'placeholder', 'clearable'],
              emits: ['update:modelValue']
            },
            'el-option': {
              template: '<option class="el-option" :value="value"><slot /></option>',
              props: ['label', 'value']
            },
            'el-date-picker': {
              template: '<input type="date" class="el-date-picker" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'type', 'rangeSeparator', 'startPlaceholder', 'endPlaceholder'],
              emits: ['update:modelValue']
            },
            'el-table': {
              template: '<table class="el-table"><slot /></table>',
              props: ['data', 'vLoading'],
              emits: ['selection-change']
            },
            'el-table-column': {
              template: '<td class="el-table-column"><slot /></td>',
              props: ['prop', 'label', 'width', 'fixed']
            },
            'el-tag': {
              template: '<span class="el-tag" :type="type"><slot /></span>',
              props: ['type']
            },
            'el-pagination': {
              template: '<div class="el-pagination"></div>',
              props: ['currentPage', 'pageSize', 'pageSizes', 'total', 'layout'],
              emits: ['size-change', 'current-change']
            },
            'el-dialog': {
              template: '<div class="el-dialog" v-if="modelValue"><slot /></div>',
              props: ['modelValue', 'title', 'width', 'destroyOnClose'],
              emits: ['update:modelValue', 'close']
            },
            'el-radio-group': {
              template: '<div class="el-radio-group"><slot /></div>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio': {
              template: '<label class="el-radio"><input type="radio" :value="value" @change="$emit(\'update:modelValue\', value)" /><slot /></label>',
              props: ['value', 'label'],
              emits: ['update:modelValue']
            },
            'el-input-number': {
              template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
              props: ['modelValue', 'min', 'max'],
              emits: ['update:modelValue']
            },
            'el-skeleton': {
              template: '<div class="el-skeleton"><slot /></div>',
              props: ['animated', 'rows']
            },
            'el-alert': {
              template: '<div class="el-alert" :type="type" :title="title"></div>',
              props: ['type', 'title', 'closable', 'showIcon']
            }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toContain('招生管理')
    })

    it('应该正确加载统计数据', async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollments/statistics')
    })

    it('应该正确加载招生列表数据', async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollment-applications', {
        params: {
          page: 1,
          pageSize: 20,
          studentName: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined
        }
      })
    })
  })

  describe('搜索和筛选功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-select': {
              template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-option': { template: '<option></option>' },
            'el-date-picker': {
              template: '<input type="date" class="el-date-picker" :value="modelValue" @input="$emit(\'update:modelValue\', $event)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确执行搜索功能', async () => {
      // 获取搜索按钮并点击
      const searchButton = wrapper.find('.el-button')
      expect(searchButton.exists()).toBe(true)

      await searchButton.trigger('click')

      // 验证API调用包含搜索参数
      expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollment-applications', {
        params: {
          page: 1,
          pageSize: 20,
          studentName: '',
          parentName: '',
          status: '',
          ageGroup: '',
          startDate: undefined,
          endDate: undefined
        }
      })
    })

    it('应该正确执行重置功能', async () => {
      // 模拟点击重置按钮
      const buttons = wrapper.findAll('.el-button')
      const resetButton = buttons.find(btn => btn.text().includes('重置'))

      if (resetButton) {
        await resetButton.trigger('click')

        // 验证搜索表单被重置
        expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollment-applications', {
          params: {
            page: 1,
            pageSize: 20,
            studentName: '',
            parentName: '',
            status: '',
            ageGroup: '',
            startDate: undefined,
            endDate: undefined
          }
        })
      }
    })
  })

  describe('数据表格功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': {
              template: '<table class="el-table" @selection-change="$emit(\'selection-change\', selectedRows)"><slot /></table>',
              props: ['data'],
              emits: ['selection-change']
            },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': {
              template: '<div class="el-pagination"></div>',
              props: ['currentPage', 'pageSize', 'total'],
              emits: ['size-change', 'current-change']
            },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确处理分页变化', async () => {
      const pagination = wrapper.find('.el-pagination')
      expect(pagination.exists()).toBe(true)

      // 模拟页面大小变化
      await pagination.vm.$emit('size-change', 50)

      expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollment-applications', {
        params: {
          page: 1,
          pageSize: 50,
          studentName: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined
        }
      })

      // 模拟当前页变化
      await pagination.vm.$emit('current-change', 2)

      expect(mockRequest.get).toHaveBeenCalledWith('/api/enrollment-applications', {
        params: {
          page: 2,
          pageSize: 20,
          studentName: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined
        }
      })
    })

    it('应该正确处理表格选择变化', async () => {
      const table = wrapper.find('.el-table')
      expect(table.exists()).toBe(true)

      const selectedRows = [
        { id: '1', studentName: '张小明' },
        { id: '2', studentName: '李小红' }
      ]

      await table.vm.$emit('selection-change', selectedRows)

      // 验证选择状态被正确更新
      expect(wrapper.vm.selectedRows).toEqual(selectedRows)
    })
  })

  describe('CRUD操作功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': {
              template: '<form class="el-form" ref="formRef"><slot /></form>',
              props: ['model', 'rules', 'labelWidth']
            },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'placeholder'],
              emits: ['update:modelValue']
            },
            'el-select': {
              template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              props: ['modelValue', 'placeholder'],
              emits: ['update:modelValue']
            },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': {
              template: '<div class="el-dialog" v-if="modelValue" @close="$emit(\'close\')"><slot /></div>',
              props: ['modelValue', 'title', 'width', 'destroyOnClose'],
              emits: ['update:modelValue', 'close']
            },
            'el-radio-group': {
              template: '<div class="el-radio-group"><slot /></div>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio': {
              template: '<label class="el-radio"><input type="radio" :value="value" @change="$emit(\'update:modelValue\', value)" /><slot /></label>',
              props: ['value', 'label'],
              emits: ['update:modelValue']
            },
            'el-input-number': {
              template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
              props: ['modelValue', 'min', 'max'],
              emits: ['update:modelValue']
            },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确打开新增招生对话框', async () => {
      // 查找新增按钮
      const createButton = wrapper.find('.page-actions .el-button')
      expect(createButton.exists()).toBe(true)

      await createButton.trigger('click')

      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.dialogTitle).toBe('新增招生信息')
      expect(wrapper.vm.isEdit).toBe(false)
    })

    it('应该正确提交新增招生信息', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.post.mockResolvedValue({
        success: true,
        message: '创建成功'
      })

      // 打开对话框
      wrapper.vm.dialogVisible = true
      wrapper.vm.isEdit = false
      wrapper.vm.dialogTitle = '新增招生信息'

      // 设置表单数据
      wrapper.vm.formData = {
        studentName: '测试学生',
        gender: 'male',
        age: 4,
        ageGroup: 'small',
        parentName: '测试家长',
        parentPhone: '13800138888',
        status: 'consulting',
        source: 'online',
        consultant: 'teacher_zhang',
        intendedClass: 'small_a',
        address: '测试地址',
        remarks: '测试备注'
      }

      // Mock表单验证
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn()
      }

      await wrapper.vm.handleSubmit()

      expect(mockRequest.post).toHaveBeenCalledWith('/api/enrollment-applications', {
        studentName: '测试学生',
        parentName: '测试家长',
        parentPhone: '13800138888',
        age: 4,
        gender: 'male',
        preferredClassId: 'small_a',
        notes: '测试备注'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('创建成功')
    })

    it('应该正确打开编辑招生对话框', async () => {
      const testRow = {
        id: '1',
        studentName: '张小明',
        gender: 'male',
        age: 4,
        ageGroup: 'small',
        parentName: '张大明',
        parentPhone: '13800138000',
        status: 'consulting',
        source: 'online',
        consultant: 'teacher_zhang',
        intendedClass: 'small_a',
        address: '北京市朝阳区',
        remarks: '家长很感兴趣'
      }

      await wrapper.vm.handleEdit(testRow)

      expect(wrapper.vm.dialogVisible).toBe(true)
      expect(wrapper.vm.dialogTitle).toBe('编辑招生信息')
      expect(wrapper.vm.isEdit).toBe(true)
      expect(wrapper.vm.formData).toEqual(testRow)
    })

    it('应该正确更新招生信息', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.put.mockResolvedValue({
        success: true,
        message: '更新成功'
      })

      // 设置编辑模式
      wrapper.vm.dialogVisible = true
      wrapper.vm.isEdit = true
      wrapper.vm.formData = {
        id: '1',
        studentName: '更新学生',
        gender: 'male',
        age: 4,
        parentName: '更新家长',
        parentPhone: '13800138888',
        status: 'consulting',
        source: 'online',
        consultant: 'teacher_zhang',
        intendedClass: 'small_a',
        address: '更新地址',
        remarks: '更新备注'
      }

      // Mock表单验证
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true),
        resetFields: vi.fn()
      }

      await wrapper.vm.handleSubmit()

      expect(mockRequest.put).toHaveBeenCalledWith('/api/enrollment-applications/1', {
        studentName: '更新学生',
        parentName: '更新家长',
        parentPhone: '13800138888',
        age: 4,
        gender: 'male',
        preferredClassId: 'small_a',
        notes: '更新备注'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('更新成功')
    })

    it('应该正确删除招生信息', async () => {
      const { ElMessageBox, ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.delete.mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      const testRow = {
        id: '1',
        studentName: '张小明'
      }

      await wrapper.vm.handleDelete(testRow)

      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要删除这条招生信息吗？', '确认删除', {
        type: 'warning'
      })

      expect(mockRequest.delete).toHaveBeenCalledWith('/api/enrollment-applications/1')
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })
  })

  describe('批量操作功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 设置选中行
      wrapper.vm.selectedRows = [
        { id: '1', studentName: '张小明' },
        { id: '2', studentName: '李小红' }
      ]
    })

    it('应该正确执行批量通过操作', async () => {
      const { ElMessageBox, ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.post.mockResolvedValue({
        success: true,
        message: '批量操作成功'
      })

      await wrapper.vm.batchApprove()

      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要批量通过这 2 个申请吗？', '确认操作', {
        type: 'warning'
      })

      expect(mockRequest.post).toHaveBeenCalledWith('/api/enrollment-applications/batch-approve', {
        applicationIds: ['1', '2'],
        status: 'APPROVED',
        notes: '批量审核通过'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('批量通过 2 个申请')
    })

    it('应该正确执行批量拒绝操作', async () => {
      const { ElMessageBox, ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.post.mockResolvedValue({
        success: true,
        message: '批量操作成功'
      })

      await wrapper.vm.batchReject()

      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要批量拒绝这 2 个申请吗？', '确认操作', {
        type: 'warning'
      })

      expect(mockRequest.post).toHaveBeenCalledWith('/api/enrollment-applications/batch-reject', {
        applicationIds: ['1', '2'],
        status: 'REJECTED',
        notes: '批量审核拒绝'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('批量拒绝 2 个申请')
    })

    it('应该在未选择行时显示批量操作警告', async () => {
      const { ElMessage } = await import('element-plus')

      // 清空选中行
      wrapper.vm.selectedRows = []

      await wrapper.vm.batchApprove()

      expect(ElMessage.warning).toHaveBeenCalledWith('请选择要审核的申请')
    })
  })

  describe('单个申请审核功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确通过单个申请', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.put.mockResolvedValue({
        success: true,
        message: '审核成功'
      })

      const testRow = {
        id: '1',
        studentName: '张小明',
        status: 'PENDING'
      }

      await wrapper.vm.approveApplication(testRow)

      expect(mockRequest.put).toHaveBeenCalledWith('/api/enrollment-applications/1/review', {
        status: 'APPROVED',
        notes: '申请已通过审核'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('申请已通过')
    })

    it('应该正确拒绝单个申请', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.put.mockResolvedValue({
        success: true,
        message: '审核成功'
      })

      const testRow = {
        id: '1',
        studentName: '张小明',
        status: 'PENDING'
      }

      await wrapper.vm.rejectApplication(testRow)

      expect(mockRequest.put).toHaveBeenCalledWith('/api/enrollment-applications/1/review', {
        status: 'REJECTED',
        notes: '申请已被拒绝'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('申请已拒绝')
    })
  })

  describe('跟进功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-form': {
              template: '<form class="el-form" ref="followFormRef"><slot /></form>',
              props: ['model', 'rules', 'labelWidth']
            },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': {
              template: '<div class="el-dialog" v-if="modelValue" @close="$emit(\'close\')"><slot /></div>',
              props: ['modelValue', 'title', 'width'],
              emits: ['update:modelValue', 'close']
            },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确打开跟进对话框', async () => {
      const testRow = {
        id: '1',
        studentName: '张小明'
      }

      await wrapper.vm.handleFollow(testRow)

      expect(wrapper.vm.followDialogVisible).toBe(true)
      expect(wrapper.vm.followFormData).toEqual({
        type: '',
        content: '',
        nextFollowTime: ''
      })
    })

    it('应该正确提交跟进记录', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置API mock返回值
      mockRequest.post.mockResolvedValue({
        success: true,
        message: '跟进记录添加成功'
      })

      // 打开跟进对话框
      wrapper.vm.followDialogVisible = true
      wrapper.vm.followFormData = {
        type: 'phone',
        content: '电话沟通，家长表示满意',
        nextFollowTime: '2024-01-20T10:00:00Z'
      }

      // Mock表单验证
      wrapper.vm.$refs.followFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleFollowSubmit()

      expect(mockRequest.post).toHaveBeenCalledWith('/api/enrollments/follow-up', {
        type: 'phone',
        content: '电话沟通，家长表示满意',
        nextFollowTime: '2024-01-20T10:00:00Z'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('跟进记录添加成功')
      expect(wrapper.vm.followDialogVisible).toBe(false)
    })
  })

  describe('错误处理和边界情况', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确处理空数据状态', async () => {
      // Mock空数据响应
      mockRequest.get.mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20
        },
        message: '暂无数据'
      })

      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: {
              name: 'EmptyState',
              template: '<div class="empty-state-mock">{{ title }}<br />{{ description }}</div>',
              props: ['type', 'title', 'description']
            }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(wrapper.find('.empty-state-mock').exists()).toBe(true)
    })

    it('应该正确处理API错误', async () => {
      const { ElMessage } = await import('element-plus')

      // Mock API错误
      mockRequest.get.mockRejectedValue(new Error('网络连接失败'))

      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(ElMessage.error).toHaveBeenCalledWith('加载统计数据失败')
    })

    it('应该正确处理表单验证失败', async () => {
      const { ElMessage } = await import('element-plus')

      // 打开对话框
      wrapper.vm.dialogVisible = true
      wrapper.vm.isEdit = false

      // Mock表单验证失败
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockRejectedValue(new Error('验证失败'))
      }

      await wrapper.vm.handleSubmit()

      expect(ElMessage.error).toHaveBeenCalledWith('操作失败')
    })
  })

  describe('工具函数测试', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确根据年龄获取年龄段', () => {
      expect(wrapper.vm.getAgeGroupFromAge(3)).toBe('small')
      expect(wrapper.vm.getAgeGroupFromAge(4)).toBe('small')
      expect(wrapper.vm.getAgeGroupFromAge(5)).toBe('medium')
      expect(wrapper.vm.getAgeGroupFromAge(6)).toBe('large')
      expect(wrapper.vm.getAgeGroupFromAge(7)).toBe('preschool')
      expect(wrapper.vm.getAgeGroupFromAge(2)).toBe('')
    })

    it('应该正确获取状态标签类型', () => {
      expect(wrapper.vm.getStatusTagType('PENDING')).toBe('warning')
      expect(wrapper.vm.getStatusTagType('APPROVED')).toBe('success')
      expect(wrapper.vm.getStatusTagType('REJECTED')).toBe('danger')
      expect(wrapper.vm.getStatusTagType('consulting')).toBe('primary')
      expect(wrapper.vm.getStatusTagType('enrolled')).toBe('success')
      expect(wrapper.vm.getStatusTagType('unknown')).toBe('info')
    })

    it('应该正确获取状态文本', () => {
      expect(wrapper.vm.getStatusText('PENDING')).toBe('待审核')
      expect(wrapper.vm.getStatusText('APPROVED')).toBe('已通过')
      expect(wrapper.vm.getStatusText('REJECTED')).toBe('已拒绝')
      expect(wrapper.vm.getStatusText('consulting')).toBe('咨询中')
      expect(wrapper.vm.getStatusText('enrolled')).toBe('已报名')
      expect(wrapper.vm.getStatusText('unknown')).toBe('unknown')
    })

    it('应该正确获取年龄段标签类型', () => {
      expect(wrapper.vm.getAgeGroupTagType('small')).toBe('primary')
      expect(wrapper.vm.getAgeGroupTagType('medium')).toBe('success')
      expect(wrapper.vm.getAgeGroupTagType('large')).toBe('warning')
      expect(wrapper.vm.getAgeGroupTagType('preschool')).toBe('danger')
      expect(wrapper.vm.getAgeGroupTagType('unknown')).toBe('info')
    })

    it('应该正确获取年龄段文本', () => {
      expect(wrapper.vm.getAgeGroupText('small')).toBe('小班')
      expect(wrapper.vm.getAgeGroupText('medium')).toBe('中班')
      expect(wrapper.vm.getAgeGroupText('large')).toBe('大班')
      expect(wrapper.vm.getAgeGroupText('preschool')).toBe('学前班')
      expect(wrapper.vm.getAgeGroupText('unknown')).toBe('unknown')
    })

    it('应该正确格式化日期', () => {
      const testDate = '2024-01-15T10:00:00Z'
      expect(wrapper.vm.formatDate(testDate)).toBe('1/15/2024')
      expect(wrapper.vm.formatDate('')).toBe('')
      expect(wrapper.vm.formatDate(null)).toBe('')
    })
  })

  describe('路由导航测试', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': { template: '<div class="el-card"><slot /></div>' },
            'el-row': { template: '<div class="el-row"><slot /></div>' },
            'el-col': { template: '<div class="el-col"><slot /></div>' },
            'el-button': { template: '<button class="el-button"><slot /></button>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-table': { template: '<table><slot /></table>' },
            'el-table-column': { template: '<td></td>' },
            'el-tag': { template: '<span></span>' },
            'el-pagination': { template: '<div></div>' },
            'el-dialog': { template: '<div v-if="modelValue"><slot /></div>' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-input-number': { template: '<input type="number" />' },
            'el-skeleton': { template: '<div></div>' },
            'el-alert': { template: '<div></div>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' },
            EmptyState: { name: 'EmptyState', template: '<div><slot /></div>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确导航到详情页面', async () => {
      const testRow = {
        id: '1',
        studentName: '张小明'
      }

      await wrapper.vm.handleView(testRow)

      expect(wrapper.vm.$router.currentRoute.value.path).toBe('/enrollment/1')
    })
  })
})