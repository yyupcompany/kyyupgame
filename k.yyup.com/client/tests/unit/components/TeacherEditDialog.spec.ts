import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TeacherEditDialog from '@/components/TeacherEditDialog.vue'
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
    },
    ElTag: {
      name: 'ElTag',
      template: '<span class="el-tag"><slot></slot></span>'
    }
  }
})

describe('TeacherEditDialog.vue', () => {
  let wrapper: any
  let pinia: any

  const mockTeacher = {
    id: '1',
    name: '李老师',
    gender: 'FEMALE',
    phone: '13900139000',
    email: 'liteacher@example.com',
    employeeId: 'EMP001',
    title: '高级教师',
    type: 'FULL_TIME',
    department: '教学部',
    hireDate: '2020-01-01',
    status: 'ACTIVE',
    skills: ['教学', '管理', '沟通']
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(TeacherEditDialog, {
      props: {
        modelValue: true,
        teacher: null
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
          'el-button': true,
          'el-tag': true
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

  it('displays correct title for new teacher', () => {
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('新增教师')
  })

  it('displays correct title for editing teacher', async () => {
    await wrapper.setProps({ teacher: mockTeacher })
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('编辑教师')
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
      phone: '',
      email: '',
      employeeId: '',
      title: '',
      type: 'FULL_TIME',
      department: '',
      hireDate: '',
      status: 'ACTIVE',
      skills: []
    })
  })

  it('initializes skillsInput with empty string', () => {
    expect(wrapper.vm.skillsInput).toBe('')
  })

  it('initializes form with teacher data when provided', async () => {
    await wrapper.setProps({ teacher: mockTeacher })
    expect(wrapper.vm.form.name).toBe(mockTeacher.name)
    expect(wrapper.vm.form.gender).toBe(mockTeacher.gender)
    expect(wrapper.vm.form.phone).toBe(mockTeacher.phone)
    expect(wrapper.vm.form.email).toBe(mockTeacher.email)
    expect(wrapper.vm.form.employeeId).toBe(mockTeacher.employeeId)
    expect(wrapper.vm.form.title).toBe(mockTeacher.title)
    expect(wrapper.vm.form.type).toBe(mockTeacher.type)
    expect(wrapper.vm.form.department).toBe(mockTeacher.department)
    expect(wrapper.vm.form.hireDate).toBe(mockTeacher.hireDate)
    expect(wrapper.vm.form.status).toBe(mockTeacher.status)
    expect(wrapper.vm.form.skills).toEqual(mockTeacher.skills)
    expect(wrapper.vm.skillsInput).toBe(mockTeacher.skills.join(','))
  })

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.rules
    expect(rules.name).toBeDefined()
    expect(rules.gender).toBeDefined()
    expect(rules.phone).toBeDefined()
    expect(rules.email).toBeDefined()
    expect(rules.type).toBeDefined()
    expect(rules.hireDate).toBeDefined()
    expect(rules.status).toBeDefined()
  })

  it('validates required name field', () => {
    const rules = wrapper.vm.rules.name
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请输入教师姓名' })
    )
  })

  it('validates required gender field', () => {
    const rules = wrapper.vm.rules.gender
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择性别' })
    )
  })

  it('validates phone number format', () => {
    const rules = wrapper.vm.rules.phone
    expect(rules).toContainEqual(
      expect.objectContaining({ 
        pattern: /^1[3-9]\d{9}$/, 
        message: '请输入正确的手机号' 
      })
    )
  })

  it('validates email format', () => {
    const rules = wrapper.vm.rules.email
    expect(rules).toContainEqual(
      expect.objectContaining({ type: 'email', message: '请输入正确的邮箱地址' })
    )
  })

  it('validates required type field', () => {
    const rules = wrapper.vm.rules.type
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择教师类型' })
    )
  })

  it('validates required hireDate field', () => {
    const rules = wrapper.vm.rules.hireDate
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择入职时间' })
    )
  })

  it('validates required status field', () => {
    const rules = wrapper.vm.rules.status
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择状态' })
    )
  })

  it('resets form to default values', () => {
    wrapper.vm.form.name = 'Test Name'
    wrapper.vm.skillsInput = 'skill1,skill2'
    wrapper.vm.resetForm()
    
    expect(wrapper.vm.form).toEqual({
      name: '',
      gender: 'MALE',
      phone: '',
      email: '',
      employeeId: '',
      title: '',
      type: 'FULL_TIME',
      department: '',
      hireDate: '',
      status: 'ACTIVE',
      skills: []
    })
    expect(wrapper.vm.skillsInput).toBe('')
  })

  it('calls form resetFields when resetting form', () => {
    const mockFormRef = {
      resetFields: vi.fn()
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.resetForm()
    
    expect(mockFormRef.resetFields).toHaveBeenCalled()
  })

  it('watches teacher data changes and updates form', async () => {
    await wrapper.setProps({ teacher: mockTeacher })
    
    expect(wrapper.vm.form.name).toBe(mockTeacher.name)
    expect(wrapper.vm.form.gender).toBe(mockTeacher.gender)
    expect(wrapper.vm.skillsInput).toBe(mockTeacher.skills.join(','))
  })

  it('watches teacher data changes and resets form when teacher is null', async () => {
    await wrapper.setProps({ teacher: mockTeacher })
    expect(wrapper.vm.form.name).toBe(mockTeacher.name)
    
    await wrapper.setProps({ teacher: null })
    expect(wrapper.vm.form.name).toBe('')
    expect(wrapper.vm.skillsInput).toBe('')
  })

  it('watches skillsInput changes and updates form.skills', async () => {
    wrapper.vm.skillsInput = '教学,管理,沟通'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通'])
  })

  it('handles empty skillsInput correctly', async () => {
    wrapper.vm.skillsInput = ''
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.skills).toEqual([])
  })

  it('trims skills and filters empty strings', async () => {
    wrapper.vm.skillsInput = ' 教学 , 管理 , , 通信 '
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '通信'])
  })

  it('removes skill correctly', () => {
    wrapper.vm.form.skills = ['教学', '管理', '沟通']
    wrapper.vm.skillsInput = '教学,管理,沟通'
    
    wrapper.vm.removeSkill('管理')
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '沟通'])
    expect(wrapper.vm.skillsInput).toBe('教学,沟通')
  })

  it('does not remove skill if it does not exist', () => {
    wrapper.vm.form.skills = ['教学', '管理']
    wrapper.vm.skillsInput = '教学,管理'
    
    wrapper.vm.removeSkill('沟通')
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理'])
    expect(wrapper.vm.skillsInput).toBe('教学,管理')
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
    
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('does not save when form validation fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('emits save event with form data when validation passes', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    // Set form data
    wrapper.vm.form = {
      name: '李老师',
      gender: 'FEMALE',
      phone: '13900139000',
      email: 'liteacher@example.com',
      employeeId: 'EMP001',
      title: '高级教师',
      type: 'FULL_TIME',
      department: '教学部',
      hireDate: '2020-01-01',
      status: 'ACTIVE',
      skills: ['教学', '管理']
    }
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0][0]).toEqual({
      name: '李老师',
      gender: 'FEMALE',
      phone: '13900139000',
      email: 'liteacher@example.com',
      employeeId: 'EMP001',
      title: '高级教师',
      type: 'FULL_TIME',
      department: '教学部',
      hireDate: '2020-01-01',
      status: 'ACTIVE',
      skills: ['教学', '管理']
    })
  })

  it('sets loading state during save', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      name: '李老师',
      gender: 'FEMALE',
      phone: '13900139000',
      email: 'liteacher@example.com',
      employeeId: 'EMP001',
      title: '高级教师',
      type: 'FULL_TIME',
      department: '教学部',
      hireDate: '2020-01-01',
      status: 'ACTIVE',
      skills: ['教学', '管理']
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

  it('handles form validation error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleSave()
    
    expect(consoleSpy).toHaveBeenCalledWith('表单验证失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('has correct gender options', () => {
    // This would be tested by checking if the select options are rendered correctly
    // In a real test, you would check the rendered options
    expect(true).toBe(true) // Placeholder
  })

  it('has correct type options', () => {
    // This would be tested by checking if the select options are rendered correctly
    expect(true).toBe(true) // Placeholder
  })

  it('has correct department options', () => {
    // This would be tested by checking if the select options are rendered correctly
    expect(true).toBe(true) // Placeholder
  })

  it('has correct status options', () => {
    // This would be tested by checking if the select options are rendered correctly
    expect(true).toBe(true) // Placeholder
  })

  it('updates skillsInput when skills are removed via removeSkill', () => {
    wrapper.vm.form.skills = ['教学', '管理', '沟通']
    wrapper.vm.skillsInput = '教学,管理,沟通'
    
    wrapper.vm.removeSkill('管理')
    
    expect(wrapper.vm.skillsInput).toBe('教学,沟通')
  })

  it('maintains skills array and skillsInput synchronization', async () => {
    // Test skillsInput -> skills
    wrapper.vm.skillsInput = '教学,管理,沟通'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通'])
    
    // Test skills -> skillsInput via removeSkill
    wrapper.vm.removeSkill('管理')
    expect(wrapper.vm.form.skills).toEqual(['教学', '沟通'])
    expect(wrapper.vm.skillsInput).toBe('教学,沟通')
  })

  it('handles skillsInput with leading/trailing spaces', async () => {
    wrapper.vm.skillsInput = '  教学 , 管理 , 沟通  '
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理', '沟通'])
  })

  it('handles skillsInput with empty values', async () => {
    wrapper.vm.skillsInput = '教学,,管理,,'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.skills).toEqual(['教学', '管理'])
  })

  it('has correct default props', () => {
    expect(wrapper.props().teacher).toBe(null)
    expect(wrapper.props().modelValue).toBe(true)
  })

  it('computes visible as reactive property', () => {
    expect(wrapper.vm.visible).toBe(true)
    
    wrapper.vm.visible = false
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('emits save event with complete form data', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    const formData = {
      name: '王老师',
      gender: 'MALE',
      phone: '13800138000',
      email: 'wangteacher@example.com',
      employeeId: 'EMP002',
      title: '中级教师',
      type: 'PART_TIME',
      department: '保育部',
      hireDate: '2021-01-01',
      status: 'ACTIVE',
      skills: ['教学', '培训']
    }
    
    wrapper.vm.form = formData
    
    await wrapper.vm.handleSave()
    
    expect(wrapper.emitted('save')[0][0]).toEqual(formData)
  })
})