
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
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import PermissionCheck from '@/components/data-import/steps/PermissionCheck.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus components and icons
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    }
  }
})

vi.mock('@element-plus/icons-vue', () => ({
  Lock: { name: 'Lock' },
  Shield: { name: 'Shield' },
  InfoFilled: { name: 'InfoFilled' }
}))

// Mock API
const mockDataImportApi = {
  checkPermission: vi.fn(),
  getSupportedTypes: vi.fn()
}

vi.mock('@/api/data-import', () => ({
  dataImportApi: mockDataImportApi
}))

describe('PermissionCheck.vue', () => {
  let router: Router
  let wrapper: any

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })

    // Reset mocks
    vi.clearAllMocks()
    mockDataImportApi.checkPermission.mockResolvedValue({
      success: true,
      data: { hasPermission: true }
    })
    mockDataImportApi.getSupportedTypes.mockResolvedValue({
      success: true,
      data: {
        allTypes: [
          { type: 'student', displayName: '学生数据', hasPermission: true },
          { type: 'parent', displayName: '家长数据', hasPermission: true },
          { type: 'teacher', displayName: '教师数据', hasPermission: true }
        ]
      }
    })
  })

  const createWrapper = (props = {}) => {
    return mount(PermissionCheck, {
      props: {
        ...props
      },
      global: {
        plugins: [router, pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the permission check component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.permission-check').exists()).toBe(true)
      expect(wrapper.find('.check-header').exists()).toBe(true)
      expect(wrapper.find('.check-content').exists()).toBe(true)
    })

    it('renders header with icon and title', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.check-header')
      expect(header.find('.header-icon').exists()).toBe(true)
      expect(header.find('h4').text()).toBe('数据导入权限验证')
    })

    it('renders description text', () => {
      wrapper = createWrapper()
      
      const description = wrapper.find('.description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toContain('请选择您要导入的数据类型')
    })

    it('renders permission form', () => {
      wrapper = createWrapper()
      
      const form = wrapper.find('.permission-form')
      expect(form.exists()).toBe(true)
      expect(form.find('el-form').exists()).toBe(true)
    })

    it('renders import type select', () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      expect(select.exists()).toBe(true)
      expect(select.attributes('placeholder')).toBe('请选择导入类型')
    })

    it('renders verify permission button', () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('el-button[type="primary"]')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('验证权限')
    })

    it('renders permission info section', () => {
      wrapper = createWrapper()
      
      const infoSection = wrapper.find('.permission-info')
      expect(infoSection.exists()).toBe(true)
      expect(infoSection.find('h5').text()).toBe('权限说明')
    })

    it('has proper CSS classes applied', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.permission-check').classes()).toContain('permission-check')
    })
  })

  describe('Initial State', () => {
    it('has checking state as false initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.checking).toBe(false)
    })

    it('has empty check result initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.checkResult).toBe(null)
    })

    it('has empty form data initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.form.importType).toBe('')
    })

    it('has default import types', () => {
      wrapper = createWrapper()
      
      const types = wrapper.vm.importTypes
      expect(types).toHaveLength(3)
      expect(types[0]).toEqual({ value: 'student', label: '学生数据', available: true })
    })
  })

  describe('Import Type Selection', () => {
    it('renders import type options correctly', async () => {
      wrapper = createWrapper()
      
      await nextTick() // Wait for API call to complete
      
      const options = wrapper.findAll('el-option')
      expect(options.length).toBe(3)
      
      expect(options[0].text()).toBe('学生数据')
      expect(options[1].text()).toBe('家长数据')
      expect(options[2].text()).toBe('教师数据')
    })

    it('shows availability tags for unavailable types', async () => {
      mockDataImportApi.getSupportedTypes.mockResolvedValue({
        success: true,
        data: {
          allTypes: [
            { type: 'student', displayName: '学生数据', hasPermission: true },
            { type: 'parent', displayName: '家长数据', hasPermission: false },
            { type: 'teacher', displayName: '教师数据', hasPermission: true }
          ]
        }
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      const options = wrapper.findAll('el-option')
      const parentOption = options[1]
      
      expect(parentOption.find('el-tag').exists()).toBe(true)
      expect(parentOption.find('el-tag').text()).toBe('无权限')
    })

    it('disables unavailable options in select', async () => {
      mockDataImportApi.getSupportedTypes.mockResolvedValue({
        success: true,
        data: {
          allTypes: [
            { type: 'student', displayName: '学生数据', hasPermission: true },
            { type: 'parent', displayName: '家长数据', hasPermission: false },
            { type: 'teacher', displayName: '教师数据', hasPermission: true }
          ]
        }
      })
      
      wrapper = createWrapper()
      await nextTick()
      
      const options = wrapper.findAll('el-option')
      const parentOption = options[1]
      
      expect(parentOption.attributes('disabled')).toBeDefined()
    })

    it('clears check result when type changes', async () => {
      wrapper = createWrapper()
      
      // Set a check result first
      await wrapper.setData({
        checkResult: { success: true, message: 'Test result' }
      })
      
      // Change import type
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      expect(wrapper.vm.checkResult).toBe(null)
    })

    it('updates form data when type is selected', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('parent')
      
      expect(wrapper.vm.form.importType).toBe('parent')
    })
  })

  describe('Permission Checking', () => {
    it('calls checkPermission API when verify button is clicked', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      expect(mockDataImportApi.checkPermission).toHaveBeenCalledWith({
        importType: 'student'
      })
    })

    it('shows loading state during permission check', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      expect(wrapper.vm.checking).toBe(true)
      expect(button.attributes('loading')).toBeDefined()
    })

    it('handles successful permission check with permission granted', async () => {
      mockDataImportApi.checkPermission.mockResolvedValue({
        success: true,
        data: { hasPermission: true }
      })
      
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checking).toBe(false)
      expect(wrapper.vm.checkResult).toEqual({
        success: true,
        message: '权限验证通过，可以进行数据导入'
      })
      
      expect(wrapper.emitted('permission-checked')).toBeTruthy()
      expect(wrapper.emitted('permission-checked')[0][0]).toEqual({
        importType: 'student',
        hasPermission: true
      })
      
      expect(ElMessage.success).toHaveBeenCalledWith('权限验证通过')
    })

    it('handles successful permission check with permission denied', async () => {
      mockDataImportApi.checkPermission.mockResolvedValue({
        success: true,
        data: { hasPermission: false }
      })
      
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checkResult).toEqual({
        success: false,
        message: '权限验证失败，无法进行数据导入'
      })
      
      expect(wrapper.emitted('permission-checked')[0][0]).toEqual({
        importType: 'student',
        hasPermission: false
      })
      
      expect(ElMessage.error).toHaveBeenCalledWith('权限验证失败')
    })

    it('handles API error during permission check', async () => {
      mockDataImportApi.checkPermission.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checking).toBe(false)
      expect(wrapper.vm.checkResult).toEqual({
        success: false,
        message: 'API Error'
      })
      
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toBe('API Error')
      
      expect(ElMessage.error).toHaveBeenCalledWith('API Error')
    })

    it('handles non-success API response', async () => {
      mockDataImportApi.checkPermission.mockResolvedValue({
        success: false,
        message: 'Permission denied'
      })
      
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checkResult).toEqual({
        success: false,
        message: 'Permission denied'
      })
      
      expect(wrapper.emitted('error')).toBeTruthy()
    })

    it('does not call API when no import type is selected', async () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      expect(mockDataImportApi.checkPermission).not.toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('请先选择导入类型')
    })

    it('shows warning when no import type is selected', async () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请先选择导入类型')
    })
  })

  describe('Check Result Display', () => {
    it('displays success result correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        checkResult: {
          success: true,
          message: 'Permission granted'
        }
      })
      
      const result = wrapper.find('.check-result')
      expect(result.exists()).toBe(true)
      
      const alert = result.find('el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('type')).toBe('success')
      expect(alert.attributes('title')).toBe('Permission granted')
    })

    it('displays error result correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        checkResult: {
          success: false,
          message: 'Permission denied'
        }
      })
      
      const result = wrapper.find('.check-result')
      expect(result.exists()).toBe(true)
      
      const alert = result.find('el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('type')).toBe('error')
      expect(alert.attributes('title')).toBe('Permission denied')
    })

    it('displays result details correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        form: { importType: 'student' },
        checkResult: {
          success: true,
          message: 'Permission granted'
        }
      })
      
      const details = wrapper.find('.result-details')
      expect(details.exists()).toBe(true)
      
      const paragraphs = details.findAll('p')
      expect(paragraphs.length).toBe(3)
      
      expect(paragraphs[0].text()).toContain('导入类型: 学生数据')
      expect(paragraphs[1].text()).toContain('所需权限: STUDENT_CREATE')
      expect(paragraphs[2].text()).toContain('验证状态: ')
    })

    it('shows correct status tag in details', async () => {
      wrapper = createWrapper()
      
      // Test success status
      await wrapper.setData({
        form: { importType: 'student' },
        checkResult: {
          success: true,
          message: 'Success'
        }
      })
      
      const statusTag = wrapper.find('.result-details el-tag')
      expect(statusTag.exists()).toBe(true)
      expect(statusTag.text()).toBe('通过')
      expect(statusTag.attributes('type')).toBe('success')
      
      // Test error status
      await wrapper.setData({
        checkResult: {
          success: false,
          message: 'Error'
        }
      })
      
      const updatedStatusTag = wrapper.find('.result-details el-tag')
      expect(updatedStatusTag.text()).toBe('失败')
      expect(updatedStatusTag.attributes('type')).toBe('danger')
    })
  })

  describe('Permission Info Section', () => {
    it('displays permission information list', () => {
      wrapper = createWrapper()
      
      const infoSection = wrapper.find('.permission-info')
      const list = infoSection.find('ul')
      const items = list.findAll('li')
      
      expect(items.length).toBe(3)
      expect(items[0].text()).toContain('学生数据导入: 需要 STUDENT_CREATE 权限')
      expect(items[1].text()).toContain('家长数据导入: 需要 PARENT_MANAGE 权限')
      expect(items[2].text()).toContain('教师数据导入: 需要 TEACHER_MANAGE 权限')
    })

    it('displays info note with icon', () => {
      wrapper = createWrapper()
      
      const infoNote = wrapper.find('.info-note')
      expect(infoNote.exists()).toBe(true)
      expect(infoNote.text()).toContain('如果您没有相应权限，请联系系统管理员进行授权')
    })
  })

  describe('Methods', () => {
    it('gets correct type label for known types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeLabel('student')).toBe('学生数据')
      expect(wrapper.vm.getTypeLabel('parent')).toBe('家长数据')
      expect(wrapper.vm.getTypeLabel('teacher')).toBe('教师数据')
    })

    it('returns original type for unknown types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getTypeLabel('unknown')).toBe('unknown')
    })

    it('gets correct required permission for known types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getRequiredPermission('student')).toBe('STUDENT_CREATE')
      expect(wrapper.vm.getRequiredPermission('parent')).toBe('PARENT_MANAGE')
      expect(wrapper.vm.getRequiredPermission('teacher')).toBe('TEACHER_MANAGE')
    })

    it('returns UNKNOWN for unknown types', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getRequiredPermission('unknown')).toBe('UNKNOWN')
    })

    it('loads supported types on mount', async () => {
      wrapper = createWrapper()
      
      expect(mockDataImportApi.getSupportedTypes).toHaveBeenCalled()
      
      await nextTick()
      
      const types = wrapper.vm.importTypes
      expect(types).toHaveLength(3)
      expect(types[0]).toEqual({
        value: 'student',
        label: '学生数据',
        available: true
      })
    })

    it('handles API error when loading supported types', async () => {
      mockDataImportApi.getSupportedTypes.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await nextTick()
      
      // Should not crash and should use default types
      const types = wrapper.vm.importTypes
      expect(types).toHaveLength(3)
      expect(types[0]).toEqual({
        value: 'student',
        label: '学生数据',
        available: true
      })
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockDataImportApi.checkPermission.mockRejectedValue(new Error('Network Error'))
      
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checking).toBe(false)
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(ElMessage.error).toHaveBeenCalledWith('Network Error')
    })

    it('handles unexpected errors during permission check', async () => {
      wrapper = createWrapper()
      
      // Mock form validation to throw error
      const originalValidate = wrapper.vm.formRef?.validate
      if (wrapper.vm.formRef) {
        wrapper.vm.formRef.validate = vi.fn().mockRejectedValue(new Error('Validation Error'))
      }
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.checking).toBe(false)
      
      // Restore original method
      if (originalValidate) {
        wrapper.vm.formRef.validate = originalValidate
      }
    })
  })

  describe('Reactivity', () => {
    it('updates checking state reactively', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.checking).toBe(false)
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      expect(wrapper.vm.checking).toBe(true)
      
      // Wait for API call to complete
      await nextTick()
      
      expect(wrapper.vm.checking).toBe(false)
    })

    it('updates check result reactively', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.checkResult).toBe(null)
      
      await wrapper.setData({
        checkResult: { success: true, message: 'Test' }
      })
      
      expect(wrapper.vm.checkResult).toEqual({ success: true, message: 'Test' })
      expect(wrapper.find('.check-result').exists()).toBe(true)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.permission-check').classes()).toContain('permission-check')
      expect(wrapper.find('.check-header').classes()).toContain('check-header')
      expect(wrapper.find('.check-content').classes()).toContain('check-content')
    })

    it('maintains proper form layout', () => {
      wrapper = createWrapper()
      
      const form = wrapper.find('el-form')
      expect(form.attributes('label-width')).toBe('120px')
    })

    it('styles header icon correctly', () => {
      wrapper = createWrapper()
      
      const headerIcon = wrapper.find('.header-icon')
      expect(headerIcon.classes()).toContain('header-icon')
    })

    it('styles info note correctly', () => {
      wrapper = createWrapper()
      
      const infoNote = wrapper.find('.info-note')
      expect(infoNote.classes()).toContain('info-note')
    })
  })

  describe('Performance', () => {
    it('renders efficiently', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('.permission-check').exists()).toBe(true)
      expect(end - start).toBeLessThan(50)
    })

    it('handles API calls efficiently', async () => {
      wrapper = createWrapper()
      
      const start = performance.now()
      
      const select = wrapper.find('el-select')
      await select.setValue('student')
      
      const button = wrapper.find('el-button[type="primary"]')
      await button.trigger('click')
      
      await nextTick()
      
      const end = performance.now()
      
      expect(wrapper.find('.permission-check').exists()).toBe(true)
      expect(end - start).toBeLessThan(100) // Should complete quickly
    })
  })

  describe('Accessibility', () => {
    it('renders with semantic HTML structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.permission-check').exists()).toBe(true)
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('provides proper form labels', () => {
      wrapper = createWrapper()
      
      const formItem = wrapper.find('el-form-item')
      expect(formItem.text()).toContain('导入类型')
    })

    it('maintains proper heading hierarchy', () => {
      wrapper = createWrapper()
      
      const headings = wrapper.findAll('h4, h5')
      expect(headings.length).toBe(2)
      
      const mainHeading = wrapper.find('h4')
      expect(mainHeading.text()).toBe('数据导入权限验证')
      
      const subHeading = wrapper.find('h5')
      expect(subHeading.text()).toBe('权限说明')
    })

    it('provides clear status indications', () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('el-button[type="primary"]')
      expect(button.text()).toBe('验证权限')
    })
  })

  describe('Integration with Element Plus', () => {
    it('correctly integrates with ElSelect component', () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('el-select')
      expect(select.exists()).toBe(true)
      expect(select.attributes('placeholder')).toBe('请选择导入类型')
    })

    it('correctly integrates with ElButton component', () => {
      wrapper = createWrapper()
      
      const button = wrapper.find('el-button[type="primary"]')
      expect(button.exists()).toBe(true)
      expect(button.findComponent({ name: 'Shield' }).exists()).toBe(true)
    })

    it('correctly integrates with ElAlert component', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        checkResult: {
          success: true,
          message: 'Test result'
        }
      })
      
      const alert = wrapper.find('el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('show-icon')).toBeDefined()
      expect(alert.attributes('closable')).toBe('false')
    })

    it('correctly integrates with ElForm component', () => {
      wrapper = createWrapper()
      
      const form = wrapper.find('el-form')
      expect(form.exists()).toBe(true)
    })

    it('correctly integrates with ElFormItem component', () => {
      wrapper = createWrapper()
      
      const formItem = wrapper.find('el-form-item')
      expect(formItem.exists()).toBe(true)
    })
  })
})