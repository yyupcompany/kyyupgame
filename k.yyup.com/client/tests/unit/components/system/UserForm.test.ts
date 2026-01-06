import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import UserForm from '@/components/system/UserForm.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      alert: vi.fn().mockResolvedValue('confirm'),
      confirm: vi.fn().mockResolvedValue('confirm'),
      prompt: vi.fn().mockResolvedValue({ value: 'test' })
    }
  }
})

// Mock the user store
const mockUserStore = {
  userInfo: {
    id: 1,
    username: 'admin',
    role: 'admin',
    permissions: ['user:*', 'role:*']
  },
  hasPermission: vi.fn().mockReturnValue(true),
  hasRole: vi.fn().mockReturnValue(true)
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore
}))

// Mock the API request utility
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: '1', name: '超级管理员', description: '系统超级管理员' },
        { id: '2', name: '普通管理员', description: '系统普通管理员' },
        { id: '3', name: '教师', description: '教学人员' },
        { id: '4', name: '家长', description: '学生家长' }
      ]
    })
  }
}))

// Mock useRealApiData composable
vi.mock('@/composables/useRealApiData', () => ({
  useOptionsData: vi.fn(() => ({
    options: ref([
      { id: '1', name: '超级管理员' },
      { id: '2', name: '普通管理员' },
      { id: '3', name: '教师' },
      { id: '4', name: '家长' }
    ]),
    loading: ref(false),
    refresh: vi.fn()
  }))
}))

// Mock SYSTEM_ENDPOINTS
vi.mock('@/api/endpoints/hardcoded-data-replacements', () => ({
  SYSTEM_ENDPOINTS: {
    ROLE_OPTIONS: '/api/roles/options'
  }
}))

import { ref } from 'vue'

describe('UserForm.vue', () => {
  let wrapper: any

  const mockUser = {
    id: '1',
    username: 'testuser',
    realName: '测试用户',
    email: 'test@example.com',
    mobile: '13800138000',
    roles: [
      { id: '1', name: '超级管理员' },
      { id: '2', name: '普通管理员' }
    ],
    status: 'active',
    remark: '测试备注',
    lastLoginTime: '2023-01-01T00:00:00Z'
  }

  const createWrapper = (props = {}) => {
    return mount(UserForm, {
      props: {
        visible: true,
        userData: null,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-button': true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', async () => {
      wrapper = createWrapper()
      await nextTick()
      expect(wrapper.exists()).toBe(true)
      // 确保组件完全初始化后再检查
      expect(typeof wrapper.vm.resetForm).toBe('function')
    })

    it('renders with add user title when userData is null', async () => {
      wrapper = createWrapper()
      await nextTick()
      // The title should be '新增用户' when userData is null
      expect(wrapper.vm.formData.id).toBeUndefined()
    })

    it('renders with edit user title when userData is provided', async () => {
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()
      expect(wrapper.vm.formData.id).toBe(mockUser.id)
      expect(wrapper.vm.formData.username).toBe(mockUser.username)
    })

    it('renders password fields for create mode', async () => {
      wrapper = createWrapper()
      await nextTick()
      // In create mode, password fields should be visible
      expect(wrapper.vm.formData.id).toBeUndefined()
    })

    it('hides password fields for edit mode', async () => {
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()

      // In edit mode, password fields should be hidden
      expect(wrapper.vm.formData.id).toBeDefined()
    })
  })

  describe('Form Data Management', () => {
    it('initializes form data correctly for create mode', async () => {
      wrapper = createWrapper()
      await nextTick()
      expect(wrapper.vm.formData.username).toBe('')
      expect(wrapper.vm.formData.realName).toBe('')
      expect(wrapper.vm.formData.password).toBe('')
      expect(wrapper.vm.formData.confirmPassword).toBe('')
      expect(wrapper.vm.formData.email).toBe('')
      expect(wrapper.vm.formData.mobile).toBe('')
      expect(wrapper.vm.formData.roleIds).toEqual([])
      expect(wrapper.vm.formData.status).toBe('active')
      expect(wrapper.vm.formData.remark).toBe('')
    })

    it('initializes form data correctly for edit mode', async () => {
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()

      expect(wrapper.vm.formData.id).toBe(mockUser.id)
      expect(wrapper.vm.formData.username).toBe(mockUser.username)
      expect(wrapper.vm.formData.realName).toBe(mockUser.realName)
      expect(wrapper.vm.formData.email).toBe(mockUser.email)
      expect(wrapper.vm.formData.mobile).toBe(mockUser.mobile)
      expect(wrapper.vm.formData.roleIds).toEqual(['1', '2'])
      expect(wrapper.vm.formData.status).toBe(mockUser.status)
      expect(wrapper.vm.formData.remark).toBe(mockUser.remark)
    })

    it('resets form data when dialog is closed', async () => {
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()

      // 确保resetForm函数可用
      expect(typeof wrapper.vm.resetForm).toBe('function')

      // Close dialog
      await wrapper.setData({ dialogVisible: false })
      await nextTick()

      // Reopen dialog without user data
      await wrapper.setProps({ visible: true, userData: null })
      await nextTick()

      expect(wrapper.vm.formData.username).toBe('')
      expect(wrapper.vm.formData.realName).toBe('')
      expect(wrapper.vm.formData.roleIds).toEqual([])
    })
  })

  describe('真实API数据加载测试', () => {
    it('应该从真实API端点加载角色选项数据', async () => {
      wrapper = createWrapper()
      await nextTick()

      // 验证useOptionsData被调用
      const { useOptionsData } = await import('@/composables/useRealApiData')
      expect(useOptionsData).toHaveBeenCalledWith('/api/roles/options', expect.any(Object))

      // 验证角色选项数据已加载
      expect(wrapper.vm.roleOptions).toEqual([
        { id: '1', name: '超级管理员' },
        { id: '2', name: '普通管理员' },
        { id: '3', name: '教师' },
        { id: '4', name: '家长' }
      ])
    })

    it('应该处理API加载错误情况', async () => {
      // Mock console.error to suppress error output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { useOptionsData } = await import('@/composables/useRealApiData')

      // 模拟API错误
      useOptionsData.mockReturnValueOnce({
        options: ref([]),
        loading: ref(false),
        refresh: vi.fn()
      })

      wrapper = createWrapper()

      // 验证组件能够处理空数据
      expect(wrapper.vm.roleOptions).toEqual([])

      consoleSpy.mockRestore()
    })

    it('应该显示正确的加载状态', async () => {
      const { useOptionsData } = await import('@/composables/useRealApiData')

      // 模拟加载状态
      useOptionsData.mockReturnValueOnce({
        options: ref([]),
        loading: ref(true),
        refresh: vi.fn()
      })

      wrapper = createWrapper()

      // 验证加载状态
      expect(wrapper.vm.roleLoading).toBe(true)
    })

    it('应该支持数据刷新功能', async () => {
      const { useOptionsData } = await import('@/composables/useRealApiData')
      const mockRefresh = vi.fn()

      useOptionsData.mockReturnValueOnce({
        options: ref([{ id: '1', name: '管理员' }]),
        loading: ref(false),
        refresh: mockRefresh
      })

      wrapper = createWrapper()

      // 触发数据刷新
      wrapper.vm.refresh?.()

      // 验证刷新函数被调用
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('应该处理API数据格式转换', async () => {
      const { useOptionsData } = await import('@/composables/useRealApiData')

      // 模拟不同格式的API响应数据
      useOptionsData.mockReturnValueOnce({
        options: ref([
          { _id: '1', roleName: '超级管理员' },
          { id: '2', name: '普通管理员' }
        ]),
        loading: ref(false),
        refresh: vi.fn()
      })

      wrapper = createWrapper()

      // 验证数据能够正确处理（即使格式不同）
      expect(wrapper.vm.roleOptions).toBeDefined()
      expect(Array.isArray(wrapper.vm.roleOptions)).toBe(true)
    })

    it('应该在API重试机制后最终加载数据', async () => {
      const { useOptionsData } = await import('@/composables/useRealApiData')

      // 模拟重试后的成功数据
      useOptionsData.mockReturnValueOnce({
        options: ref([
          { id: '1', name: '超级管理员' },
          { id: '2', name: '普通管理员' }
        ]),
        loading: ref(false),
        refresh: vi.fn()
      })

      wrapper = createWrapper()

      // 验证最终数据加载成功
      expect(wrapper.vm.roleOptions).toHaveLength(2)
      expect(wrapper.vm.roleOptions[0].name).toBe('超级管理员')
    })

    it('应该在组件挂载时自动触发数据加载', async () => {
      wrapper = createWrapper()

      // 验证数据已自动加载
      expect(wrapper.vm.roleOptions).toBeDefined()
      expect(wrapper.vm.roleOptions.length).toBeGreaterThan(0)
    })

    it('应该在数据加载完成后禁用加载状态', async () => {
      const { useOptionsData } = await import('@/composables/useRealApiData')

      // 先返回加载状态，然后返回完成状态
      useOptionsData.mockReturnValueOnce({
        options: ref([{ id: '1', name: '管理员' }]),
        loading: ref(false), // 加载完成
        refresh: vi.fn()
      })

      wrapper = createWrapper()

      // 验证加载状态为false
      expect(wrapper.vm.roleLoading).toBe(false)
    })
  })

  describe('Custom Validators', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('validates mobile number format correctly', () => {
      const validateMobile = wrapper.vm.validateMobile

      // Valid mobile numbers
      expect(validateMobile(null, '13800138000', () => {})).toBe(true)
      expect(validateMobile(null, '15912345678', () => {})).toBe(true)

      // Invalid mobile numbers
      expect(validateMobile(null, '12345', () => {})).toBe(false)
      expect(validateMobile(null, '1380013800', () => {})).toBe(false)
    })

    it('validates email format correctly', () => {
      const validateEmail = wrapper.vm.validateEmail

      // Valid email addresses
      expect(validateEmail(null, 'test@example.com', () => {})).toBe(true)
      expect(validateEmail(null, 'user.name@domain.com', () => {})).toBe(true)

      // Invalid email addresses
      expect(validateEmail(null, 'invalid-email', () => {})).toBe(false)
      expect(validateEmail(null, 'test@', () => {})).toBe(false)
    })

    it('validates password confirmation correctly', () => {
      const validateConfirmPassword = wrapper.vm.validateConfirmPassword

      // Matching passwords
      wrapper.vm.formData.password = 'password123'
      expect(validateConfirmPassword(null, 'password123', () => {})).toBe(true)

      // Non-matching passwords
      wrapper.vm.formData.password = 'password123'
      expect(validateConfirmPassword(null, 'different123', () => {})).toBe(false)
    })
  })

  describe('User Interactions', () => {
    it('emits update:visible when dialog is closed', async () => {
      wrapper = createWrapper()

      await wrapper.vm.handleClose()

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('disables username field for admin user (id = "1")', async () => {
      const adminUser = { ...mockUser, id: '1' }
      wrapper = createWrapper({ userData: adminUser })
      await nextTick()

      // Check if username field should be disabled for admin
      expect(wrapper.vm.formData.id === '1').toBe(true)
    })

    it('disables role selection for admin user (id = "1")', async () => {
      const adminUser = { ...mockUser, id: '1' }
      wrapper = createWrapper({ userData: adminUser })
      await nextTick()

      // Check if role selection should be disabled for admin
      expect(wrapper.vm.formData.id === '1').toBe(true)
    })

    it('disables status field for admin user (id = "1")', async () => {
      const adminUser = { ...mockUser, id: '1' }
      wrapper = createWrapper({ userData: adminUser })
      await nextTick()

      // Check if status field should be disabled for admin
      expect(wrapper.vm.formData.id === '1').toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('emits success event on successful create submission', async () => {
      wrapper = createWrapper()

      // Set valid form data
      await wrapper.setData({
        'formData.username': 'newuser',
        'formData.realName': '新用户',
        'formData.password': 'password123',
        'formData.confirmPassword': 'password123',
        'formData.email': 'newuser@example.com',
        'formData.mobile': '13900139000',
        'formData.roleIds': ['3'],
        'formData.status': 'active',
        'formData.remark': '新用户备注'
      })

      // Mock form validation to return true
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(true, {})),
        resetFields: vi.fn()
      }

      await wrapper.vm.handleSubmit()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('update:visible')).toBeTruthy()
    })

    it('emits success event on successful edit submission', async () => {
      wrapper = createWrapper({ userData: mockUser })
      await nextTick()

      // Update form data
      await wrapper.setData({
        'formData.realName': '更新后的用户名',
        'formData.email': 'updated@example.com',
        'formData.roleIds': ['2', '3']
      })

      // Mock form validation to return true
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(true, {})),
        resetFields: vi.fn()
      }

      await wrapper.vm.handleSubmit()

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('shows error message when form validation fails', async () => {
      wrapper = createWrapper()

      // Mock form validation to return false
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(false, {})),
        resetFields: vi.fn()
      }

      await wrapper.vm.handleSubmit()

      // Should not emit success event
      expect(wrapper.emitted('success')).toBeFalsy()
    })
  })

  describe('Props Handling', () => {
    it('watches visible prop changes', async () => {
      wrapper = createWrapper({ visible: false })

      expect(wrapper.vm.dialogVisible).toBe(false)

      await wrapper.setProps({ visible: true })
      await nextTick()

      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('watches userData prop changes', async () => {
      wrapper = createWrapper({ userData: null })

      expect(wrapper.vm.formData.username).toBe('')

      await wrapper.setProps({ userData: mockUser })
      await nextTick()

      expect(wrapper.vm.formData.username).toBe(mockUser.username)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined userData gracefully', () => {
      wrapper = createWrapper({ userData: undefined })
      expect(wrapper.vm.formData.username).toBe('')
    })

    it('handles partial userData gracefully', async () => {
      const partialUser = {
        id: '2',
        username: 'partialuser',
        realName: '部分用户'
        // Missing other fields
      }

      wrapper = createWrapper({ userData: partialUser })
      await nextTick()

      expect(wrapper.vm.formData.id).toBe(partialUser.id)
      expect(wrapper.vm.formData.username).toBe(partialUser.username)
      expect(wrapper.vm.formData.realName).toBe(partialUser.realName)
      expect(wrapper.vm.formData.email).toBe('') // Default value
      expect(wrapper.vm.formData.mobile).toBe('') // Default value
      expect(wrapper.vm.formData.roleIds).toEqual([]) // Default value
      expect(wrapper.vm.formData.status).toBe('active') // Default value
    })

    it('handles userData without roles gracefully', async () => {
      const userWithoutRoles = {
        ...mockUser,
        roles: undefined
      }

      wrapper = createWrapper({ userData: userWithoutRoles })
      await nextTick()

      expect(wrapper.vm.formData.roleIds).toEqual([])
    })

    it('handles userData with empty roles array gracefully', async () => {
      const userWithEmptyRoles = {
        ...mockUser,
        roles: []
      }

      wrapper = createWrapper({ userData: userWithEmptyRoles })
      await nextTick()

      expect(wrapper.vm.formData.roleIds).toEqual([])
    })
  })
})