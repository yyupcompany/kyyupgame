import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StudentEditDialog from '@/components/StudentEditDialog.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot></slot><slot name="footer"></slot></div>'
    },
    ElForm: {
      name: 'ElForm',
      template: '<div class="el-form"><slot></slot></div>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot></slot></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" />'
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select"><slot></slot></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option"></option>'
    },
    ElRow: {
      name: 'ElRow',
      template: '<div class="el-row"><slot></slot></div>'
    },
    ElCol: {
      name: 'ElCol',
      template: '<div class="el-col"><slot></slot></div>'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<input class="el-date-picker" />'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    }
  }
})

// Mock API functions
vi.mock('@/api/modules/student', () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn()
}))

describe('StudentEditDialog.vue', () => {
  let wrapper: any
  let pinia: any

  const mockStudent = {
    id: '1',
    name: '张小明',
    gender: 'MALE',
    birthDate: '2020-01-01',
    classId: 'class1',
    guardian: {
      name: '张三',
      phone: '13800138000'
    },
    notes: '测试备注'
  }

  const mockClassList = [
    { id: 'class1', name: '小一班' },
    { id: 'class2', name: '小二班' }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(StudentEditDialog, {
      props: {
        modelValue: true,
        student: null,
        classList: mockClassList
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-row': true,
          'el-col': true,
          'el-date-picker': true,
          'el-button': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
  })

  it('displays correct title for new student', () => {
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('新增学生')
  })

  it('displays correct title for editing student', async () => {
    await wrapper.setProps({ student: mockStudent })
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('编辑学生')
  })

  it('computes visible correctly', () => {
    expect(wrapper.vm.visible).toBe(true)
  })

  it('updates visible when modelValue changes', async () => {
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.vm.visible).toBe(false)
  })

  it('emits update:modelValue when visible is set', async () => {
    wrapper.vm.visible = false
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('initializes form with default values', () => {
    expect(wrapper.vm.form).toEqual({
      name: '',
      gender: 'MALE',
      birthDate: '',
      classId: '',
      guardian: {
        name: '',
        phone: ''
      },
      notes: ''
    })
  })

  it('initializes form with student data when provided', async () => {
    await wrapper.setProps({ student: mockStudent })
    expect(wrapper.vm.form.name).toBe(mockStudent.name)
    expect(wrapper.vm.form.gender).toBe(mockStudent.gender)
    expect(wrapper.vm.form.birthDate).toBe(mockStudent.birthDate)
    expect(wrapper.vm.form.classId).toBe(mockStudent.classId)
    expect(wrapper.vm.form.guardian.name).toBe(mockStudent.guardian.name)
    expect(wrapper.vm.form.guardian.phone).toBe(mockStudent.guardian.phone)
    expect(wrapper.vm.form.notes).toBe(mockStudent.notes)
  })

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.rules
    expect(rules.name).toBeDefined()
    expect(rules.gender).toBeDefined()
    expect(rules.birthDate).toBeDefined()
    expect(rules['guardian.name']).toBeDefined()
    expect(rules['guardian.phone']).toBeDefined()
  })

  it('validates required name field', () => {
    const rules = wrapper.vm.rules.name
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请输入学生姓名' })
    )
  })

  it('validates required gender field', () => {
    const rules = wrapper.vm.rules.gender
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择性别' })
    )
  })

  it('validates required birthDate field', () => {
    const rules = wrapper.vm.rules.birthDate
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择出生日期' })
    )
  })

  it('validates required guardian name field', () => {
    const rules = wrapper.vm.rules['guardian.name']
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请输入家长姓名' })
    )
  })

  it('validates guardian phone format', () => {
    const rules = wrapper.vm.rules['guardian.phone']
    expect(rules).toContainEqual(
      expect.objectContaining({ 
        pattern: /^1[3-9]\d{9}$/, 
        message: '请输入正确的手机号' 
      })
    )
  })

  it('resets form to default values', () => {
    wrapper.vm.form.name = 'Test Name'
    wrapper.vm.resetForm()
    
    expect(wrapper.vm.form).toEqual({
      name: '',
      gender: 'MALE',
      birthDate: '',
      classId: '',
      guardian: {
        name: '',
        phone: ''
      },
      notes: ''
    })
  })

  it('calls form resetFields when resetting form', () => {
    const mockFormRef = {
      resetFields: vi.fn()
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.resetForm()
    
    expect(mockFormRef.resetFields).toHaveBeenCalled()
  })

  it('watches student data changes and updates form', async () => {
    await wrapper.setProps({ student: mockStudent })
    
    expect(wrapper.vm.form.name).toBe(mockStudent.name)
    expect(wrapper.vm.form.gender).toBe(mockStudent.gender)
  })

  it('watches student data changes and resets form when student is null', async () => {
    await wrapper.setProps({ student: mockStudent })
    expect(wrapper.vm.form.name).toBe(mockStudent.name)
    
    await wrapper.setProps({ student: null })
    expect(wrapper.vm.form.name).toBe('')
  })

  it('emits update:modelValue when handleCancel is called', async () => {
    await wrapper.vm.handleCancel()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('resets form when handleCancel is called', async () => {
    const resetFormSpy = vi.spyOn(wrapper.vm, 'resetForm')
    
    await wrapper.vm.handleCancel()
    
    expect(resetFormSpy).toHaveBeenCalled()
  })

  it('does not save when formRef is not available', async () => {
    wrapper.vm.formRef = null
    
    await wrapper.vm.handleSave()
    
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('does not save when form validation fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('creates new student when form validation passes', async () => {
    const { createStudent } = require('@/api/modules/student')
    const mockResponse = {
      success: true,
      data: { id: 'new-student-id', name: 'Test Student' }
    }
    createStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    // Set form data
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Test notes'
    }
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(createStudent).toHaveBeenCalledWith({
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      guardian: {
        name: 'Parent Name',
        relationship: '家长',
        phone: '13800138000'
      },
      enrollmentDate: expect.any(String),
      classId: 'class1',
      notes: 'Test notes'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('学生创建成功')
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')[0]).toEqual([mockResponse.data])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('updates existing student when form validation passes', async () => {
    const { updateStudent } = require('@/api/modules/student')
    const mockResponse = {
      success: true,
      data: { id: '1', name: 'Updated Student' }
    }
    updateStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.setProps({ student: mockStudent })
    
    // Set form data
    wrapper.vm.form = {
      name: 'Updated Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Updated notes'
    }
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(updateStudent).toHaveBeenCalledWith(mockStudent.id, {
      name: 'Updated Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      guardian: {
        name: 'Parent Name',
        relationship: '家长',
        phone: '13800138000'
      },
      enrollmentDate: expect.any(String),
      classId: 'class1',
      notes: 'Updated notes'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('学生信息更新成功')
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')[0]).toEqual([mockResponse.data])
  })

  it('handles API error when creating student', async () => {
    const { createStudent } = require('@/api/modules/student')
    const mockResponse = {
      success: false,
      message: '创建失败'
    }
    createStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Test notes'
    }
    
    await wrapper.vm.handleSave()
    
    expect(ElMessage.error).toHaveBeenCalledWith('创建失败')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('handles API error when updating student', async () => {
    const { updateStudent } = require('@/api/modules/student')
    const mockResponse = {
      success: false,
      message: '更新失败'
    }
    updateStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.setProps({ student: mockStudent })
    
    wrapper.vm.form = {
      name: 'Updated Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Updated notes'
    }
    
    await wrapper.vm.handleSave()
    
    expect(ElMessage.error).toHaveBeenCalledWith('更新失败')
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('handles unexpected error during save', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Test notes'
    }
    
    // Mock createStudent to throw error
    const { createStudent } = require('@/api/modules/student')
    createStudent.mockRejectedValue(new Error('Network error'))
    
    await wrapper.vm.handleSave()
    
    expect(consoleSpy).toHaveBeenCalledWith('保存学生信息失败:', expect.any(Error))
    expect(ElMessage.error).toHaveBeenCalledWith('保存学生信息失败')
    
    consoleSpy.mockRestore()
  })

  it('sets loading state during save', async () => {
    const { createStudent } = require('@/api/modules/student')
    createStudent.mockResolvedValue({ success: true, data: {} })
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Test notes'
    }
    
    const savePromise = wrapper.vm.handleSave()
    expect(wrapper.vm.loading).toBe(true)
    
    await savePromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('resets loading state even when save fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    const savePromise = wrapper.vm.handleSave()
    expect(wrapper.vm.loading).toBe(true)
    
    await savePromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('formats enrollmentDate correctly', async () => {
    const { createStudent } = require('@/api/modules/student')
    const mockResponse = { success: true, data: {} }
    createStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: 'class1',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: 'Test notes'
    }
    
    await wrapper.vm.handleSave()
    
    const callArgs = createStudent.mock.calls[0][0]
    expect(callArgs.enrollmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('omits optional fields when they are empty', async () => {
    const { createStudent } = require('@/api/modules/student')
    const mockResponse = { success: true, data: {} }
    createStudent.mockResolvedValue(mockResponse)
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: 'Test Student',
      gender: 'MALE',
      birthDate: '2020-01-01',
      classId: '',
      guardian: {
        name: 'Parent Name',
        phone: '13800138000'
      },
      notes: ''
    }
    
    await wrapper.vm.handleSave()
    
    const callArgs = createStudent.mock.calls[0][0]
    expect(callArgs.classId).toBeUndefined()
    expect(callArgs.notes).toBeUndefined()
  })
})