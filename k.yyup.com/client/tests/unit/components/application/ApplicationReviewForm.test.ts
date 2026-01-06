
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VueWrapper } from '@vue/test-utils'
import ApplicationReviewForm from '@/components/application/ApplicationReviewForm.vue'
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../utils/component-test-helper'

// Mock表单验证
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn(() => Promise.resolve(true))
}

// Mock Element Plus消息组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

describe('ApplicationReviewForm.vue', () => {
  let wrapper: VueWrapper<any>
  const cleanup = createTestCleanup()

  const mockApplication = {
    id: 1,
    studentName: '张小明',
    status: 'pending',
    submitDate: '2024-01-15'
  }

  const createWrapper = (props = {}) => {
    return createComponentWrapper(ApplicationReviewForm, {
      props: {
        application: mockApplication,
        visible: true,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        provide: {
          formRef: mockFormRef
        },
        stubs: {
          'el-form': {
            template: '<form ref="formRef"><slot /></form>',
            methods: mockFormRef
          },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { template: '<input />' },
          'el-select': { template: '<select><slot /></select>' },
          'el-option': { template: '<option><slot /></option>' },
          'el-button': { template: '<button><slot /></button>' },
          'el-dialog': { template: '<div class="el-dialog"><slot /></div>' },
          'el-date-picker': { template: '<input type="date" />' },
          'el-radio-group': { template: '<div><slot /></div>' },
          'el-radio': { template: '<input type="radio" />' }
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
    cleanup.addCleanup(() => wrapper?.unmount())
  })

  afterEach(() => {
    cleanup.cleanup()
    vi.clearAllMocks()
  })
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })

    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(ApplicationReviewForm, {
      props: {
        applicationId: 1,
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
    it('renders the review form correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.application-review-form').exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('el-form').exists()).toBe(true)
    })

    it('renders radio group for status selection', () => {
      wrapper = createWrapper()
      
      const radioGroup = wrapper.find('el-radio-group')
      expect(radioGroup.exists()).toBe(true)
      
      const radioButtons = wrapper.findAll('el-radio')
      expect(radioButtons.length).toBe(2)
      expect(radioButtons[0].text()).toBe('通过')
      expect(radioButtons[1].text()).toBe('拒绝')
    })

    it('renders enrollment date picker when status is approved', async () => {
      wrapper = createWrapper()
      
      // Set status to approved
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const datePicker = wrapper.find('el-date-picker')
      expect(datePicker.exists()).toBe(true)
    })

    it('renders reject reason select when status is rejected', async () => {
      wrapper = createWrapper()
      
      // Set status to rejected
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      const select = wrapper.find('el-select')
      expect(select.exists()).toBe(true)
    })

    it('renders remark textarea', () => {
      wrapper = createWrapper()
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      expect(textarea.exists()).toBe(true)
      expect(textarea.attributes('maxlength')).toBe('200')
      expect(textarea.attributes('show-word-limit')).toBeDefined()
    })

    it('renders action buttons', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('el-button')
      expect(buttons.length).toBe(2)
      expect(buttons[0].text()).toBe('提交审核')
      expect(buttons[1].text()).toBe('重置')
    })
  })

  describe('Props Handling', () => {
    it('accepts applicationId prop', () => {
      wrapper = createWrapper({ applicationId: 123 })
      
      expect(wrapper.props('applicationId')).toBe(123)
    })

    it('uses default initialStatus when not provided', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      expect(vm.reviewForm.status).toBe('approved')
    })

    it('uses provided initialStatus when specified', () => {
      wrapper = createWrapper({ initialStatus: 'rejected' })
      
      const vm = wrapper.vm
      expect(vm.reviewForm.status).toBe('rejected')
    })

    it('updates form data when props change', async () => {
      wrapper = createWrapper({ initialStatus: 'approved' })
      
      expect(wrapper.vm.reviewForm.status).toBe('approved')
      
      await wrapper.setProps({ initialStatus: 'rejected' })
      
      expect(wrapper.vm.reviewForm.status).toBe('rejected')
    })
  })

  describe('Form Data and Reactivity', () => {
    it('initializes form data correctly', () => {
      wrapper = createWrapper({ applicationId: 456, initialStatus: 'pending' })
      
      const vm = wrapper.vm
      expect(vm.reviewForm.id).toBe(456)
      expect(vm.reviewForm.status).toBe('pending')
      expect(vm.reviewForm.rejectReason).toBeUndefined()
      expect(vm.reviewForm.remark).toBe('')
      expect(vm.reviewForm.enrollmentDate).toBeUndefined()
    })

    it('updates form data when radio group changes', async () => {
      wrapper = createWrapper()
      
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      expect(wrapper.vm.reviewForm.status).toBe('rejected')
    })

    it('updates enrollment date when date picker changes', async () => {
      wrapper = createWrapper()
      
      // First set status to approved
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const datePicker = wrapper.find('el-date-picker')
      await datePicker.setValue('2024-01-15')
      
      expect(wrapper.vm.reviewForm.enrollmentDate).toBe('2024-01-15')
    })

    it('updates reject reason when select changes', async () => {
      wrapper = createWrapper()
      
      // First set status to rejected
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      const select = wrapper.find('el-select')
      await select.setValue('quota_full')
      
      expect(wrapper.vm.reviewForm.rejectReason).toBe('quota_full')
    })

    it('updates remark when textarea changes', async () => {
      wrapper = createWrapper()
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Test remark content')
      
      expect(wrapper.vm.reviewForm.remark).toBe('Test remark content')
    })
  })

  describe('Form Validation Rules', () => {
    it('requires status field', async () => {
      wrapper = createWrapper()
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      await form.vm.validate()
      
      // Should pass validation as status has default value
      expect(wrapper.vm.reviewForm.status).toBeDefined()
    })

    it('requires reject reason when status is rejected', async () => {
      wrapper = createWrapper()
      
      // Set status to rejected
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      const isValid = await form.vm.validate()
      
      // Should fail validation as reject reason is required but not provided
      expect(isValid).toBe(false)
    })

    it('requires enrollment date when status is approved', async () => {
      wrapper = createWrapper()
      
      // Set status to approved
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      const isValid = await form.vm.validate()
      
      // Should fail validation as enrollment date is required but not provided
      expect(isValid).toBe(false)
    })

    it('validates remark length', async () => {
      wrapper = createWrapper()
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      const longText = 'A'.repeat(250) // Exceeds 200 character limit
      
      await textarea.setValue(longText)
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      const isValid = await form.vm.validate()
      
      // Should fail validation due to length constraint
      expect(isValid).toBe(false)
    })

    it('passes validation when all required fields are provided correctly', async () => {
      wrapper = createWrapper()
      
      // Set status to approved with enrollment date
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const datePicker = wrapper.find('el-date-picker')
      await datePicker.setValue('2024-01-15')
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Valid remark')
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      const isValid = await form.vm.validate()
      
      // Should pass validation
      expect(isValid).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with correct data when form is valid', async () => {
      wrapper = createWrapper()
      
      // Setup form with valid data
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const datePicker = wrapper.find('el-date-picker')
      await datePicker.setValue('2024-01-15')
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Test submission')
      
      // Submit form
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')).toHaveLength(1)
      
      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData.id).toBe(1)
      expect(emittedData.status).toBe('approved')
      expect(emittedData.enrollmentDate).toBe('2024-01-15')
      expect(emittedData.remark).toBe('Test submission')
      expect(emittedData.rejectReason).toBeUndefined() // Should be removed for approved status
    })

    it('emits submit event with reject reason when status is rejected', async () => {
      wrapper = createWrapper()
      
      // Setup form with rejected status
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      const select = wrapper.find('el-select')
      await select.setValue('quota_full')
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Rejection reason')
      
      // Submit form
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      
      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData.status).toBe('rejected')
      expect(emittedData.rejectReason).toBe('quota_full')
      expect(emittedData.enrollmentDate).toBeUndefined() // Should be removed for rejected status
    })

    it('does not emit submit event when form validation fails', async () => {
      wrapper = createWrapper()
      
      // Try to submit without required fields
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('shows loading state during submission', async () => {
      wrapper = createWrapper()
      
      // Setup valid form
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('approved')
      
      await nextTick()
      
      const datePicker = wrapper.find('el-date-picker')
      await datePicker.setValue('2024-01-15')
      
      // Start submission
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      // Check loading state
      expect(wrapper.vm.submitting).toBe(true)
      expect(submitButton.attributes('loading')).toBeDefined()
    })

    it('handles submission errors gracefully', async () => {
      wrapper = createWrapper()
      
      // Mock form validation to throw error
      const formRef = wrapper.vm.formRef
      formRef.validate = vi.fn().mockRejectedValue(new Error('Validation error'))
      
      // Try to submit
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      // Should handle error without crashing
      expect(wrapper.vm.submitting).toBe(false)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Form Reset', () => {
    it('emits reset event when reset button is clicked', async () => {
      wrapper = createWrapper()
      
      // Modify form data
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Modified remark')
      
      // Reset form
      const resetButton = wrapper.find('el-button:not([type="primary"])')
      await resetButton.trigger('click')
      
      expect(wrapper.emitted('reset')).toBeTruthy()
      expect(wrapper.emitted('reset')).toHaveLength(1)
    })

    it('resets form fields to initial values', async () => {
      wrapper = createWrapper({ initialStatus: 'approved' })
      
      // Modify form data
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      const textarea = wrapper.find('el-input[type="textarea"]')
      await textarea.setValue('Modified remark')
      
      // Reset form
      const resetButton = wrapper.find('el-button:not([type="primary"])')
      await resetButton.trigger('click')
      
      await nextTick()
      
      // Check if form is reset to initial values
      expect(wrapper.vm.reviewForm.status).toBe('approved')
      expect(wrapper.vm.reviewForm.remark).toBe('')
    })

    it('calls form ref resetFields method', async () => {
      wrapper = createWrapper()
      
      const formRef = wrapper.vm.formRef
      formRef.resetFields = vi.fn()
      
      // Reset form
      const resetButton = wrapper.find('el-button:not([type="primary"])')
      await resetButton.trigger('click')
      
      expect(formRef.resetFields).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('handles missing form ref gracefully', async () => {
      wrapper = createWrapper()
      
      // Remove form ref
      wrapper.vm.formRef = null
      
      // Try to submit
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      // Should not crash
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('handles validation errors in console', async () => {
      wrapper = createWrapper()
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock validation to return invalid
      const formRef = wrapper.vm.formRef
      formRef.validate = vi.fn().mockResolvedValue({ valid: false, fields: {} })
      
      // Try to submit
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('handles async submission errors', async () => {
      wrapper = createWrapper()
      
      // Mock form validation to throw async error
      const formRef = wrapper.vm.formRef
      formRef.validate = vi.fn().mockRejectedValue(new Error('Async error'))
      
      // Try to submit
      const submitButton = wrapper.find('el-button[type="primary"]')
      await submitButton.trigger('click')
      
      // Should handle error and reset loading state
      expect(wrapper.vm.submitting).toBe(false)
    })
  })

  describe('Conditional Field Logic', () => {
    it('shows enrollment date only for approved status', async () => {
      wrapper = createWrapper()
      
      // Initially approved - should show date picker
      expect(wrapper.find('el-date-picker').exists()).toBe(true)
      
      // Change to rejected - should hide date picker
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      expect(wrapper.find('el-date-picker').exists()).toBe(false)
    })

    it('shows reject reason only for rejected status', async () => {
      wrapper = createWrapper()
      
      // Initially approved - should not show reject reason
      expect(wrapper.find('el-select').exists()).toBe(false)
      
      // Change to rejected - should show reject reason
      const radioGroup = wrapper.find('el-radio-group')
      await radioGroup.setValue('rejected')
      
      await nextTick()
      
      expect(wrapper.find('el-select').exists()).toBe(true)
    })

    it('dynamically updates validation rules based on status', async () => {
      wrapper = createWrapper()
      
      const formRef = wrapper.vm.formRef
      
      // Test approved status validation
      await wrapper.setData({ reviewForm: { status: 'approved' } })
      const approvedRules = formRef.rules
      expect(approvedRules.enrollmentDate).toBeDefined()
      
      // Test rejected status validation
      await wrapper.setData({ reviewForm: { status: 'rejected' } })
      const rejectedRules = formRef.rules
      expect(rejectedRules.rejectReason).toBeDefined()
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.application-review-form').exists()).toBe(true)
    })

    it('maintains proper form layout structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('el-form').exists()).toBe(true)
      expect(wrapper.find('el-form').attributes('label-width')).toBe('100px')
    })

    it('renders form items with correct structure', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('el-form-item')
      expect(formItems.length).toBeGreaterThan(0)
      
      // Check that form items have proper labels
      const statusItem = formItems.find(item => item.text().includes('审核结果'))
      expect(statusItem).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('renders form with proper accessibility attributes', () => {
      wrapper = createWrapper()
      
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
    })

    it('provides proper labels for form controls', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('el-form-item')
      const statusItem = formItems.find(item => item.text().includes('审核结果'))
      expect(statusItem).toBeTruthy()
    })

    it('maintains proper form control types', () => {
      wrapper = createWrapper()
      
      const radioGroup = wrapper.find('el-radio-group')
      const textarea = wrapper.find('el-input[type="textarea"]')
      
      expect(radioGroup.exists()).toBe(true)
      expect(textarea.exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal data', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('.application-review-form').exists()).toBe(true)
      expect(end - start).toBeLessThan(50) // Should render quickly
    })

    it('handles form state changes efficiently', async () => {
      wrapper = createWrapper()
      
      // Perform multiple state changes
      for (let i = 0; i < 5; i++) {
        await wrapper.setData({ 
          reviewForm: { 
            status: i % 2 === 0 ? 'approved' : 'rejected',
            remark: `Test remark ${i}`
          }
        })
      }
      
      expect(wrapper.find('.application-review-form').exists()).toBe(true)
    })
  })
})