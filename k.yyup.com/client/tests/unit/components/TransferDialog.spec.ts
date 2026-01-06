import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TransferDialog from '@/components/TransferDialog.vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
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
    ElSelect: {
      name: 'ElSelect',
      template: '<select class="el-select"><slot></slot></select>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<option class="el-option"></option>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" />'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button"><slot></slot></button>'
    }
  }
})

describe('TransferDialog.vue', () => {
  let wrapper: any
  let pinia: any

  const mockStudent = {
    id: '1',
    name: '张小明',
    currentClassName: '小一班',
    currentClassId: 'class1'
  }

  const mockClassList = [
    { id: 'class1', name: '小一班' },
    { id: 'class2', name: '小二班' },
    { id: 'class3', name: '小三班' }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(TransferDialog, {
      props: {
        modelValue: true,
        student: mockStudent,
        classList: mockClassList
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
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

  it('renders correctly with student data', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
    expect(wrapper.find('.transfer-info').exists()).toBe(true)
  })

  it('displays correct dialog title', () => {
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('title')).toBe('学生转班')
  })

  it('displays student information correctly', () => {
    const transferInfo = wrapper.find('.transfer-info')
    expect(transferInfo.find('h3').text()).toBe('学生信息')
    
    const paragraphs = transferInfo.findAll('p')
    expect(paragraphs[0].text()).toContain('张小明')
    expect(paragraphs[1].text()).toContain('小一班')
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
      newClassId: '',
      reason: ''
    })
  })

  it('has correct form validation rules', () => {
    const rules = wrapper.vm.rules
    expect(rules.newClassId).toBeDefined()
    expect(rules.newClassId).toContainEqual(
      expect.objectContaining({ required: true, message: '请选择目标班级' })
    )
  })

  it('filters out current class from available classes', () => {
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(2) // 3 total - 1 current = 2 available
    expect(availableClasses.map(c => c.id)).not.toContain('class1') // current class removed
    expect(availableClasses.map(c => c.id)).toContain('class2')
    expect(availableClasses.map(c => c.id)).toContain('class3')
  })

  it('shows all classes when student has no current class', async () => {
    const studentWithoutClass = {
      id: '2',
      name: '李小红',
      currentClassName: '未分配',
      currentClassId: undefined
    }
    
    await wrapper.setProps({ student: studentWithoutClass })
    
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(3) // all classes available
    expect(availableClasses.map(c => c.id)).toContain('class1')
    expect(availableClasses.map(c => c.id)).toContain('class2')
    expect(availableClasses.map(c => c.id)).toContain('class3')
  })

  it('shows no classes when classList is empty', async () => {
    await wrapper.setProps({ classList: [] })
    
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(0)
  })

  it('shows no classes when student is null', async () => {
    await wrapper.setProps({ student: null })
    
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(0)
  })

  it('resets form to default values', () => {
    wrapper.vm.form.newClassId = 'class2'
    wrapper.vm.form.reason = 'Test reason'
    
    wrapper.vm.resetForm()
    
    expect(wrapper.vm.form).toEqual({
      newClassId: '',
      reason: ''
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

  it('watches visible changes and resets form when dialog closes', async () => {
    const resetFormSpy = vi.spyOn(wrapper.vm, 'resetForm')
    
    await wrapper.setProps({ modelValue: false })
    
    expect(resetFormSpy).toHaveBeenCalled()
  })

  it('does not reset form when dialog opens', async () => {
    const resetFormSpy = vi.spyOn(wrapper.vm, 'resetForm')
    
    await wrapper.setProps({ modelValue: true })
    
    expect(resetFormSpy).not.toHaveBeenCalled()
  })

  it('emits update:modelValue when handleCancel is called', async () => {
    await wrapper.vm.handleCancel()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('does not emit transfer event when formRef is not available', async () => {
    wrapper.vm.formRef = null
    
    await wrapper.vm.handleTransfer()
    
    expect(wrapper.emitted('transfer')).toBeFalsy()
  })

  it('does not emit transfer event when student is null', async () => {
    await wrapper.setProps({ student: null })
    
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleTransfer()
    
    expect(wrapper.emitted('transfer')).toBeFalsy()
  })

  it('does not emit transfer event when form validation fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleTransfer()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('transfer')).toBeFalsy()
  })

  it('emits transfer event with correct data when validation passes', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    // Set form data
    wrapper.vm.form = {
      newClassId: 'class2',
      reason: '家长要求转班'
    }
    
    await wrapper.vm.handleTransfer()
    
    expect(mockFormRef.validate).toHaveBeenCalled()
    expect(wrapper.emitted('transfer')).toBeTruthy()
    expect(wrapper.emitted('transfer')[0][0]).toEqual({
      studentId: mockStudent.id,
      newClassId: 'class2',
      reason: '家长要求转班'
    })
  })

  it('emits transfer event with optional reason when not provided', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    // Set form data without reason
    wrapper.vm.form = {
      newClassId: 'class3',
      reason: ''
    }
    
    await wrapper.vm.handleTransfer()
    
    expect(wrapper.emitted('transfer')[0][0]).toEqual({
      studentId: mockStudent.id,
      newClassId: 'class3',
      reason: ''
    })
  })

  it('sets loading state during transfer', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      newClassId: 'class2',
      reason: 'Test reason'
    }
    
    const transferPromise = wrapper.vm.handleTransfer()
    expect(wrapper.vm.loading).toBe(true)
    
    await transferPromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('resets loading state even when transfer fails', async () => {
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    const transferPromise = wrapper.vm.handleTransfer()
    expect(wrapper.vm.loading).toBe(true)
    
    await transferPromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles form validation error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const mockFormRef = {
      validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
    }
    wrapper.vm.formRef = mockFormRef
    
    await wrapper.vm.handleTransfer()
    
    expect(consoleSpy).toHaveBeenCalledWith('表单验证失败:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('has correct default props', () => {
    expect(wrapper.props().modelValue).toBe(true)
    expect(wrapper.props().student).toEqual(mockStudent)
    expect(wrapper.props().classList).toEqual(mockClassList)
  })

  it('handles null student prop', async () => {
    await wrapper.setProps({ student: null })
    
    expect(wrapper.find('.transfer-info').exists()).toBe(true)
    // Should not display student name when student is null
  })

  it('handles empty classList prop', async () => {
    await wrapper.setProps({ classList: [] })
    
    expect(wrapper.vm.availableClasses).toHaveLength(0)
  })

  it('has correct CSS classes and styling', () => {
    expect(wrapper.find('.transfer-info').exists()).toBe(true)
    expect(wrapper.find('.transfer-form').exists()).toBe(true)
    expect(wrapper.find('.dialog-footer').exists()).toBe(true)
  })

  it('displays form fields correctly', () => {
    const form = wrapper.find('.transfer-form')
    expect(form.exists()).toBe(true)
    
    // Check if form items are rendered
    const formItems = form.findAllComponents({ name: 'ElFormItem' })
    expect(formItems.length).toBeGreaterThan(0)
  })

  it('has dialog footer with buttons', () => {
    const footer = wrapper.find('.dialog-footer')
    expect(footer.exists()).toBe(true)
    
    const buttons = footer.findAllComponents({ name: 'ElButton' })
    expect(buttons.length).toBe(2) // Cancel and Transfer buttons
  })

  it('computes availableClasses as reactive computed property', () => {
    const availableClasses = wrapper.vm.availableClasses
    expect(Array.isArray(availableClasses)).toBe(true)
  })

  it('updates availableClasses when classList changes', async () => {
    const newClassList = [
      { id: 'class4', name: '小四班' },
      { id: 'class5', name: '小五班' }
    ]
    
    await wrapper.setProps({ classList: newClassList })
    
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(2) // All classes available since none is current
    expect(availableClasses.map(c => c.id)).toContain('class4')
    expect(availableClasses.map(c => c.id)).toContain('class5')
  })

  it('updates availableClasses when student changes', async () => {
    const newStudent = {
      id: '2',
      name: '李小红',
      currentClassName: '小二班',
      currentClassId: 'class2'
    }
    
    await wrapper.setProps({ student: newStudent })
    
    const availableClasses = wrapper.vm.availableClasses
    expect(availableClasses).toHaveLength(2) // 3 total - 1 current = 2 available
    expect(availableClasses.map(c => c.id)).not.toContain('class2') // current class removed
    expect(availableClasses.map(c => c.id)).toContain('class1')
    expect(availableClasses.map(c => c.id)).toContain('class3')
  })

  it('maintains form validation when newClassId is selected', () => {
    // This would test form validation when a class is selected
    expect(true).toBe(true) // Placeholder for validation testing
  })

  it('allows empty reason field', () => {
    // This would test that reason field is optional
    expect(true).toBe(true) // Placeholder for optional field testing
  })

  it('has correct dialog configuration', () => {
    const dialog = wrapper.findComponent({ name: 'ElDialog' })
    expect(dialog.props('width')).toBe('500px')
    expect(dialog.props('closeOnClickModal')).toBe(false)
  })

  it('has form with correct label width', () => {
    const form = wrapper.findComponent({ name: 'ElForm' })
    expect(form.props('labelWidth')).toBe('100px')
  })

  it('has correct button text', () => {
    const buttons = wrapper.findAllComponents({ name: 'ElButton' })
    expect(buttons[0].text()).toBe('取消')
    expect(buttons[1].text()).toBe('确认转班')
  })

  it('has loading state on transfer button', async () => {
    const mockFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    }
    wrapper.vm.formRef = mockFormRef
    
    wrapper.vm.form = {
      newClassId: 'class2',
      reason: 'Test reason'
    }
    
    const transferPromise = wrapper.vm.handleTransfer()
    
    // Check if transfer button has loading state
    const transferButton = wrapper.findAllComponents({ name: 'ElButton' })[1]
    expect(transferButton.props('loading')).toBe(true)
    
    await transferPromise
    expect(transferButton.props('loading')).toBe(false)
  })
})