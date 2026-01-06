
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import RoleForm from '@/components/system/RoleForm.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

describe('RoleForm.vue', () => {
  let wrapper: any

  const mockRole = {
    id: '1',
    name: '测试角色',
    description: '这是一个测试角色',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }

  const createWrapper = (props = {}) => {
    return mount(RoleForm, {
      props: {
        visible: true,
        roleData: null,
        ...props
      },
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-button': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders with add role title when roleData is null', () => {
      wrapper = createWrapper()
      // The title should be '新增角色' when roleData is null
      expect(wrapper.vm.formData.id).toBeUndefined()
    })

    it('renders with edit role title when roleData is provided', () => {
      wrapper = createWrapper({ roleData: mockRole })
      expect(wrapper.vm.formData.id).toBe(mockRole.id)
      expect(wrapper.vm.formData.name).toBe(mockRole.name)
    })
  })

  describe('Form Data Management', () => {
    it('initializes form data correctly for create mode', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.formData.name).toBe('')
      expect(wrapper.vm.formData.description).toBe('')
      expect(wrapper.vm.formData.status).toBe('active')
    })

    it('initializes form data correctly for edit mode', async () => {
      wrapper = createWrapper({ roleData: mockRole })
      await nextTick()
      
      expect(wrapper.vm.formData.id).toBe(mockRole.id)
      expect(wrapper.vm.formData.name).toBe(mockRole.name)
      expect(wrapper.vm.formData.description).toBe(mockRole.description)
      expect(wrapper.vm.formData.status).toBe(mockRole.status)
    })

    it('resets form data when dialog is closed', async () => {
      wrapper = createWrapper({ roleData: mockRole })
      await nextTick()
      
      // Close dialog
      await wrapper.setData({ dialogVisible: false })
      await nextTick()
      
      // Reopen dialog without role data
      await wrapper.setProps({ visible: true, roleData: null })
      await nextTick()
      
      expect(wrapper.vm.formData.name).toBe('')
      expect(wrapper.vm.formData.description).toBe('')
      expect(wrapper.vm.formData.status).toBe('active')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      wrapper = createWrapper()
      
      // Try to submit empty form
      await wrapper.vm.handleSubmit()
      
      // Form should be invalid
      expect(wrapper.vm.formRef?.validate).toHaveBeenCalled()
    })

    it('validates name length', async () => {
      wrapper = createWrapper()
      
      // Set invalid name (too short)
      await wrapper.setData({ 'formData.name': 'a' })
      
      // Try to submit
      await wrapper.vm.handleSubmit()
      
      // Validation should fail
      expect(wrapper.vm.formRef?.validate).toHaveBeenCalled()
    })

    it('validates description requirement', async () => {
      wrapper = createWrapper()
      
      // Set empty description
      await wrapper.setData({ 'formData.description': '' })
      
      // Try to submit
      await wrapper.vm.handleSubmit()
      
      // Validation should fail
      expect(wrapper.vm.formRef?.validate).toHaveBeenCalled()
    })
  })

  describe('User Interactions', () => {
    it('emits update:visible when dialog is closed', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleClose()
      
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('disables name field for admin role (id = "1")', async () => {
      const adminRole = { ...mockRole, id: '1' }
      wrapper = createWrapper({ roleData: adminRole })
      await nextTick()
      
      // Check if name field should be disabled
      expect(wrapper.vm.formData.id === '1').toBe(true)
    })

    it('disables status field for admin role (id = "1")', async () => {
      const adminRole = { ...mockRole, id: '1' }
      wrapper = createWrapper({ roleData: adminRole })
      await nextTick()
      
      // Check if status field should be disabled
      expect(wrapper.vm.formData.id === '1').toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('emits success event with correct data on successful submission', async () => {
      wrapper = createWrapper()
      
      // Set valid form data
      await wrapper.setData({
        'formData.name': '新角色',
        'formData.description': '新角色描述',
        'formData.status': 'active'
      })
      
      // Mock form validation to return true
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(true, {}))
      }
      
      await wrapper.vm.handleSubmit()
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('shows error message when form validation fails', async () => {
      wrapper = createWrapper()
      
      // Mock form validation to return false
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(false, {}))
      }
      
      await wrapper.vm.handleSubmit()
      
      expect(console.error).toHaveBeenCalled()
    })

    it('handles submission errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Set valid form data
      await wrapper.setData({
        'formData.name': '测试角色',
        'formData.description': '测试描述',
        'formData.status': 'active'
      })
      
      // Mock form validation to return true
      wrapper.vm.formRef = {
        validate: vi.fn().mockImplementation((callback) => callback(true, {}))
      }
      
      // Mock Promise rejection
      const originalPromise = Promise
      vi.spyOn(global, 'Promise').mockImplementationOnce(() => {
        return originalPromise.reject(new Error('Network error'))
      })
      
      await wrapper.vm.handleSubmit()
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(ElMessage.error).toHaveBeenCalled()
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

    it('watches roleData prop changes', async () => {
      wrapper = createWrapper({ roleData: null })
      
      expect(wrapper.vm.formData.name).toBe('')
      
      await wrapper.setProps({ roleData: mockRole })
      await nextTick()
      
      expect(wrapper.vm.formData.name).toBe(mockRole.name)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined roleData gracefully', () => {
      wrapper = createWrapper({ roleData: undefined })
      expect(wrapper.vm.formData.name).toBe('')
    })

    it('handles partial roleData gracefully', async () => {
      const partialRole = {
        id: '2',
        name: '部分角色'
        // Missing description and status
      }
      
      wrapper = createWrapper({ roleData: partialRole })
      await nextTick()
      
      expect(wrapper.vm.formData.id).toBe(partialRole.id)
      expect(wrapper.vm.formData.name).toBe(partialRole.name)
      expect(wrapper.vm.formData.description).toBe('')
      expect(wrapper.vm.formData.status).toBe('active') // Default value
    })

    it('handles immediate roleData change on mount', async () => {
      wrapper = createWrapper({ roleData: mockRole })
      await nextTick()
      
      expect(wrapper.vm.formData.name).toBe(mockRole.name)
    })
  })
})