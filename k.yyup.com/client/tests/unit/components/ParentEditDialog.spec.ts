import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ParentEditDialog from '@/components/ParentEditDialog.vue'
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
    ElSwitch: {
      name: 'ElSwitch',
      template: '<input type="checkbox" class="el-switch" />'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    }
  }
})

// 控制台错误检测变量
let consoleSpy: any

describe('ParentEditDialog.vue', () => {
  let wrapper: any
  let pinia: any

  const mockParentData = {
    id: '1',
    name: '张三',
    gender: 'MALE',
    phone: '13800138000',
    wechat: 'zhangsan',
    relationship: '父亲',
    occupation: '工程师',
    email: 'zhangsan@example.com',
    status: '在读家长',
    address: '北京市朝阳区',
    emergencyContact: '李四',
    emergencyPhone: '13900139000',
    notes: '备注信息',
    registerDate: '2023-01-01',
    isPrimary: true
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(ParentEditDialog, {
      props: {
        modelValue: true,
        parentData: null
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
          'el-switch': true,
          'el-button': true
        }
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('renders correctly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
    expect(wrapper.find('.el-dialog').exists()).toBe(true)
  })

  it('displays correct title for new parent', () => {
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('新增家长')
  })

  it('displays correct title for editing parent', async () => {
    await wrapper.setProps({ parentData: mockParentData })
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('编辑家长')
  })

  it('computes isEdit correctly when parentData has id', async () => {
    await wrapper.setProps({ parentData: mockParentData })
    expect(wrapper.vm.isEdit).toBe(true)
  })

  it('computes isEdit correctly when parentData is null', () => {
    expect(wrapper.vm.isEdit).toBe(false)
  })

  it('initializes form data with default values', () => {
    expect(wrapper.vm.formData).toEqual({
      name: '',
      gender: '',
      phone: '',
      wechat: '',
      relationship: '',
      occupation: '',
      email: '',
      status: '潜在家长',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      registerDate: '',
      isPrimary: false
    })
  })

  it('initializes form data with parent data when provided', async () => {
    await wrapper.setProps({ parentData: mockParentData })
    expect(wrapper.vm.formData.name).toBe(mockParentData.name)
    expect(wrapper.vm.formData.gender).toBe(mockParentData.gender)
    expect(wrapper.vm.formData.phone).toBe(mockParentData.phone)
  })

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.formRules
    expect(rules.name).toBeDefined()
    expect(rules.phone).toBeDefined()
    expect(rules.relationship).toBeDefined()
    expect(rules.status).toBeDefined()
    expect(rules.email).toBeDefined()
    expect(rules.emergencyPhone).toBeDefined()
  })

  it('validates required name field', () => {
    const rules = wrapper.vm.formRules.name
    expect(rules).toContainEqual(
      expect.objectContaining({ required: true, message: '请输入家长姓名' })
    )
  })

  it('validates phone number format', () => {
    const rules = wrapper.vm.formRules.phone
    expect(rules).toContainEqual(
      expect.objectContaining({ 
        pattern: /^1[3-9]\d{9}$/, 
        message: '请输入正确的手机号码' 
      })
    )
  })

  it('validates email format', () => {
    const rules = wrapper.vm.formRules.email
    expect(rules).toContainEqual(
      expect.objectContaining({ 
        pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, 
        message: '请输入正确的邮箱地址' 
      })
    )
  })

  it('resets form to default values', () => {
    wrapper.vm.resetForm()
    expect(wrapper.vm.formData).toEqual({
      name: '',
      gender: '',
      phone: '',
      wechat: '',
      relationship: '',
      occupation: '',
      email: '',
      status: '潜在家长',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      registerDate: '',
      isPrimary: false
    })
  })

  it('initializes form with provided data', () => {
    wrapper.vm.initFormData(mockParentData)
    expect(wrapper.vm.formData.name).toBe(mockParentData.name)
    expect(wrapper.vm.formData.gender).toBe(mockParentData.gender)
    expect(wrapper.vm.formData.phone).toBe(mockParentData.phone)
  })

  it('emits update:modelValue when handleCancel is called', async () => {
    await wrapper.vm.handleCancel()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('emits save event with form data when handleSave is called', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    // Set form data
    wrapper.vm.formData = { ...mockParentData }
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0][0]).toEqual(
      expect.objectContaining({
        name: mockParentData.name,
        gender: mockParentData.gender,
        phone: mockParentData.phone
      })
    )
  })

  it('does not emit save event when form validation fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleSave()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('includes id in submit data when editing', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.setProps({ parentData: mockParentData })
    wrapper.vm.formData = { ...mockParentData }
    
    await wrapper.vm.handleSave()
    
    expect(wrapper.emitted('save')[0][0]).toEqual(
      expect.objectContaining({
        id: mockParentData.id
      })
    )
  })

  it('does not include id in submit data when creating new', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.formData = { ...mockParentData }
    delete wrapper.vm.formData.id
    
    await wrapper.vm.handleSave()
    
    expect(wrapper.emitted('save')[0][0]).not.toHaveProperty('id')
  })

  it('sets saving state during handleSave', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.formData = { ...mockParentData }
    
    const savePromise = wrapper.vm.handleSave()
    expect(wrapper.vm.saving).toBe(true)
    
    await savePromise
    expect(wrapper.vm.saving).toBe(false)
  })

  it('calls handleClosed when dialog is closed', () => {
    const handleClosedSpy = vi.spyOn(wrapper.vm, 'handleClosed')
    wrapper.vm.handleClosed()
    expect(handleClosedSpy).toHaveBeenCalled()
  })

  it('resets form when handleClosed is called', () => {
    const resetFormSpy = vi.spyOn(wrapper.vm, 'resetForm')
    wrapper.vm.handleClosed()
    expect(resetFormSpy).toHaveBeenCalled()
  })

  it('watches parentData changes and updates form', async () => {
    const initFormDataSpy = vi.spyOn(wrapper.vm, 'initFormData')
    
    await wrapper.setProps({ parentData: mockParentData })
    
    expect(initFormDataSpy).toHaveBeenCalledWith(mockParentData)
  })

  it('watches modelValue changes and initializes form when dialog opens', async () => {
    const initFormDataSpy = vi.spyOn(wrapper.vm, 'initFormData')
    
    await wrapper.setProps({ modelValue: true, parentData: mockParentData })
    
    expect(initFormDataSpy).toHaveBeenCalled()
  })

  it('has correct default form data structure', () => {
    const defaultData = wrapper.vm.getDefaultFormData()
    expect(defaultData).toEqual({
      name: '',
      gender: '',
      phone: '',
      wechat: '',
      relationship: '',
      occupation: '',
      email: '',
      status: '潜在家长',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      registerDate: '',
      isPrimary: false
    })
  })

  it('uses parent data when getting default form data', () => {
    const dataWithParent = wrapper.vm.getDefaultFormData(mockParentData)
    expect(dataWithParent.name).toBe(mockParentData.name)
    expect(dataWithParent.gender).toBe(mockParentData.gender)
    expect(dataWithParent.phone).toBe(mockParentData.phone)
  })

  it('computes dialogVisible correctly', () => {
    expect(wrapper.vm.dialogVisible).toBe(true)
  })

  it('updates dialogVisible when modelValue changes', async () => {
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.vm.dialogVisible).toBe(false)
  })

  it('emits update:modelValue when dialogVisible is set', async () => {
    wrapper.vm.dialogVisible = false
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })
})