
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
import StudentEditDialog from '@/components/dialogs/StudentEditDialog.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="el-dialog"><slot /></div>'
  },
  ElForm: {
    name: 'ElForm',
    template: '<div class="el-form"><slot /></div>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />'
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot /></div>'
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<label class="el-radio"><slot /></label>'
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<div class="el-date-picker" />'
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<div class="el-select"><slot /></div>'
  },
  ElOption: {
    name: 'ElOption',
    template: '<div class="el-option" />'
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider" />'
  },
  ElCheckboxGroup: {
    name: 'ElCheckboxGroup',
    template: '<div class="el-checkbox-group"><slot /></div>'
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<label class="el-checkbox"><slot /></label>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot /></button>'
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('StudentEditDialog.vue', () => {
  let wrapper: any
  const mockStudentData = {
    id: 1,
    name: '张小明',
    studentId: 'ST202301001',
    gender: '男',
    birthDate: '2018-05-15',
    classId: '5',
    enrollmentDate: '2023-09-01',
    parentName: '张伟',
    phone: '13800138001',
    relationship: 'father',
    address: '北京市朝阳区',
    emergencyContact: '李女士 13900139001',
    healthStatus: ['healthy'],
    allergyInfo: '',
    medicationInfo: '',
    notes: '',
    hobbies: [],
    personality: []
  }

  const createWrapper = (props = {}) => {
    return mount(StudentEditDialog, {
      props: {
        modelValue: true,
        studentData: mockStudentData,
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
          'el-date-picker': true,
          'el-select': true,
          'el-option': true,
          'el-divider': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-button': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog with correct title', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.el-dialog').exists()).toBe(true)
  })

  it('initializes form with student data', () => {
    wrapper = createWrapper()
    expect(wrapper.vm.formData.name).toBe(mockStudentData.name)
    expect(wrapper.vm.formData.studentId).toBe(mockStudentData.studentId)
    expect(wrapper.vm.formData.gender).toBe(mockStudentData.gender)
  })

  it('computes visible property correctly', async () => {
    wrapper = createWrapper({ modelValue: true })
    expect(wrapper.vm.visible).toBe(true)
    
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.vm.visible).toBe(false)
  })

  it('emits update:modelValue when dialog is closed', async () => {
    wrapper = createWrapper()
    await wrapper.vm.closeDialog()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('resets form data correctly', () => {
    wrapper = createWrapper()
    wrapper.vm.formData.name = '测试姓名'
    wrapper.vm.resetForm()
    expect(wrapper.vm.formData.name).toBe('')
  })

  it('has correct form validation rules', () => {
    wrapper = createWrapper()
    const rules = wrapper.vm.rules
    expect(rules.name).toBeDefined()
    expect(rules.studentId).toBeDefined()
    expect(rules.gender).toBeDefined()
    expect(rules.phone).toBeDefined()
  })

  it('validates student ID format correctly', () => {
    wrapper = createWrapper()
    const studentIdRule = wrapper.vm.rules.studentId.find(
      (rule: any) => rule.pattern
    )
    expect(studentIdRule.pattern).toBe(/^ST\d{8}$/)
  })

  it('validates phone number format correctly', () => {
    wrapper = createWrapper()
    const phoneRule = wrapper.vm.rules.phone.find(
      (rule: any) => rule.pattern
    )
    expect(phoneRule.pattern).toBe(/^1[3-9]\d{9}$/)
  })

  it('submits form successfully when validation passes', async () => {
    wrapper = createWrapper()
    const validateSpy = vi.fn().mockResolvedValue(true)
    wrapper.vm.formRef = { validate: validateSpy }
    
    await wrapper.vm.submitForm()
    expect(validateSpy).toHaveBeenCalled()
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('does not submit form when validation fails', async () => {
    wrapper = createWrapper()
    const validateSpy = vi.fn().mockResolvedValue(false)
    wrapper.vm.formRef = { validate: validateSpy }
    
    await wrapper.vm.submitForm()
    expect(validateSpy).toHaveBeenCalled()
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('shows loading state during submission', async () => {
    wrapper = createWrapper()
    const validateSpy = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 100)
      })
    })
    wrapper.vm.formRef = { validate: validateSpy }
    
    const submitPromise = wrapper.vm.submitForm()
    expect(wrapper.vm.submitting).toBe(true)
    
    await submitPromise
    expect(wrapper.vm.submitting).toBe(false)
  })

  it('watches studentData prop and updates form', async () => {
    wrapper = createWrapper()
    const newStudentData = { ...mockStudentData, name: '新姓名' }
    
    await wrapper.setProps({ studentData: newStudentData })
    expect(wrapper.vm.formData.name).toBe('新姓名')
  })

  it('watches visible prop and resets form when opened', async () => {
    wrapper = createWrapper({ modelValue: false })
    wrapper.vm.formData.name = '测试姓名'
    
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.vm.formData.name).toBe(mockStudentData.name)
  })

  it('has correct default form values', () => {
    wrapper = createWrapper({ studentData: {} })
    expect(wrapper.vm.formData.gender).toBe('男')
    expect(wrapper.vm.formData.relationship).toBe('mother')
    expect(wrapper.vm.formData.healthStatus).toEqual(['healthy'])
  })

  it('emits submit event with correct data structure', async () => {
    wrapper = createWrapper()
    const validateSpy = vi.fn().mockResolvedValue(true)
    wrapper.vm.formRef = { validate: validateSpy }
    
    await wrapper.vm.submitForm()
    
    const emittedData = wrapper.emitted('submit')[0][0]
    expect(emittedData).toHaveProperty('name')
    expect(emittedData).toHaveProperty('studentId')
    expect(emittedData).toHaveProperty('gender')
    expect(emittedData).toHaveProperty('birthDate')
    expect(emittedData).toHaveProperty('classId')
  })
})