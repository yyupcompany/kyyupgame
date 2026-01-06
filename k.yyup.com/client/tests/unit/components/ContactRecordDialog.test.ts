import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ContactRecordDialog from '@/components/ContactRecordDialog.vue'

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

vi.mock('@element-plus/icons-vue', () => ({
  Plus: { name: 'Plus' }
}))

describe('ContactRecordDialog', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  let wrapper: any
  let mockParent: any
  let mockRecords: any[]

  beforeEach(() => {
    mockParent = {
      id: 1,
      name: '张三',
      phone: '13800138000'
    }

    mockRecords = [
      {
        id: 1,
        title: '第一次沟通',
        content: '了解孩子情况',
        time: '2024-01-15T10:00:00Z',
        type: '电话沟通',
        creator: '李老师'
      },
      {
        id: 2,
        title: '家长反馈',
        content: '对教学安排很满意',
        time: '2024-01-20T14:30:00Z',
        type: '微信沟通',
        creator: '王老师'
      }
    ]

    wrapper = mount(ContactRecordDialog, {
      props: {
        modelValue: true,
        parent: mockParent,
        records: mockRecords
      },
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-icon': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
          'el-form': true,
          'el-form-item': true,
          'el-date-picker': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('renders the dialog correctly', () => {
      expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
    })

    it('displays parent information when parent is provided', () => {
      const parentInfo = wrapper.find('.parent-info')
      expect(parentInfo.exists()).toBe(true)
      expect(parentInfo.find('h3').text()).toBe('家长信息')
      expect(parentInfo.text()).toContain('姓名：张三')
      expect(parentInfo.text()).toContain('电话：13800138000')
    })

    it('shows records section with header', () => {
      const recordsSection = wrapper.find('.records-section')
      expect(recordsSection.exists()).toBe(true)
      
      const sectionHeader = wrapper.find('.section-header')
      expect(sectionHeader.find('h3').text()).toBe('沟通记录')
    })

    it('displays contact records list', () => {
      const recordsList = wrapper.find('.records-list')
      expect(recordsList.exists()).toBe(true)
      
      const recordItems = wrapper.findAll('.record-item')
      expect(recordItems.length).toBe(2)
      
      // Check first record
      const firstRecord = recordItems[0]
      expect(firstRecord.find('.record-title').text()).toBe('第一次沟通')
      expect(firstRecord.find('.record-type').text()).toBe('电话沟通')
      expect(firstRecord.find('.record-content').text()).toBe('了解孩子情况')
    })

    it('shows empty state when no records', async () => {
      await wrapper.setProps({ records: [] })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state').text()).toBe('暂无沟通记录')
      expect(wrapper.find('.records-list').exists()).toBe(false)
    })

    it('shows add record button', () => {
      const addButton = wrapper.find('.section-header').findComponent({ name: 'ElButton' })
      expect(addButton.exists()).toBe(true)
    })
  })

  describe('Computed Properties', () => {
    it('computes visible correctly from modelValue', async () => {
      expect(wrapper.vm.visible).toBe(true)
      
      await wrapper.setProps({ modelValue: false })
      expect(wrapper.vm.visible).toBe(false)
    })

    it('updates modelValue when visible is set', async () => {
      wrapper.vm.visible = false
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })

  describe('Methods', () => {
    it('formats date correctly', () => {
      const dateString = '2024-01-15T10:00:00Z'
      const formattedDate = wrapper.vm.formatDate(dateString)
      
      expect(formattedDate).toContain('2024')
      expect(formattedDate).toContain('1')
      expect(formattedDate).toContain('15')
    })

    it('returns empty string for invalid date', () => {
      expect(wrapper.vm.formatDate('')).toBe('')
      expect(wrapper.vm.formatDate('invalid-date')).toContain('Invalid Date')
    })

    it('opens add record dialog with default values', () => {
      wrapper.vm.handleAddRecord()
      
      expect(wrapper.vm.recordDialogVisible).toBe(true)
      expect(wrapper.vm.recordForm).toEqual({
        type: '',
        title: '',
        content: '',
        time: expect.any(String)
      })
    })

    it('saves record successfully', async () => {
      const mockValidate = vi.fn().mockResolvedValue(true)
      wrapper.vm.recordFormRef = { validate: mockValidate }
      
      wrapper.vm.recordForm = {
        type: '电话沟通',
        title: '测试记录',
        content: '测试内容',
        time: '2024-01-15T10:00:00Z'
      }
      
      await wrapper.vm.saveRecord()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(wrapper.vm.recordSaving).toBe(true)
      expect(wrapper.emitted('add')).toBeTruthy()
      
      const emittedData = wrapper.emitted('add')[0][0]
      expect(emittedData).toEqual({
        type: '电话沟通',
        title: '测试记录',
        content: '测试内容',
        time: '2024-01-15T10:00:00Z',
        followupType: '电话沟通',
        followupDate: '2024-01-15T10:00:00Z'
      })
      
      expect(wrapper.vm.recordDialogVisible).toBe(false)
      expect(wrapper.vm.recordSaving).toBe(false)
    })

    it('handles save record validation failure', async () => {
      const mockValidate = vi.fn().mockRejectedValue(new Error('Validation failed'))
      wrapper.vm.recordFormRef = { validate: mockValidate }
      
      await wrapper.vm.saveRecord()
      
      expect(mockValidate).toHaveBeenCalled()
      expect(wrapper.vm.recordSaving).toBe(false)
      expect(wrapper.emitted('add')).toBeFalsy()
    })

    it('handles save record without form ref', async () => {
      wrapper.vm.recordFormRef = null
      
      await wrapper.vm.saveRecord()
      
      expect(wrapper.emitted('add')).toBeFalsy()
    })

    it('closes dialog correctly', () => {
      wrapper.vm.handleClose()
      
      expect(wrapper.vm.visible).toBe(false)
    })
  })

  describe('Watchers', () => {
    it('updates recordsList when records prop changes', async () => {
      const newRecords = [
        {
          id: 3,
          title: '新记录',
          content: '新内容',
          time: '2024-01-25T10:00:00Z',
          type: '面谈',
          creator: '赵老师'
        }
      ]
      
      await wrapper.setProps({ records: newRecords })
      
      expect(wrapper.vm.recordsList).toEqual(newRecords)
      expect(wrapper.vm.recordsList).not.toBe(newRecords) // Should be a copy
    })

    it('handles empty records prop', async () => {
      await wrapper.setProps({ records: [] })
      
      expect(wrapper.vm.recordsList).toEqual([])
    })

    it('handles undefined records prop', async () => {
      await wrapper.setProps({ records: undefined })
      
      expect(wrapper.vm.recordsList).toEqual([])
    })
  })

  describe('Event Handling', () => {
    it('emits update:modelValue when dialog is closed', async () => {
      wrapper.vm.visible = false
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('handles close button click', async () => {
      await wrapper.find('.dialog-footer').findAllComponents({ name: 'ElButton' })[0].trigger('click')
      
      expect(wrapper.vm.visible).toBe(false)
    })

    it('handles add record button click', async () => {
      await wrapper.find('.section-header').findComponent({ name: 'ElButton' }).trigger('click')
      
      expect(wrapper.vm.recordDialogVisible).toBe(true)
    })
  })

  describe('Form Validation Rules', () => {
    it('has correct validation rules for form fields', () => {
      expect(wrapper.vm.recordRules.type).toEqual([
        { required: true, message: '请选择沟通类型', trigger: 'change' }
      ])
      
      expect(wrapper.vm.recordRules.title).toEqual([
        { required: true, message: '请输入记录标题', trigger: 'blur' }
      ])
      
      expect(wrapper.vm.recordRules.content).toEqual([
        { required: true, message: '请输入沟通内容', trigger: 'blur' }
      ])
      
      expect(wrapper.vm.recordRules.time).toEqual([
        { required: true, message: '请选择沟通时间', trigger: 'change' }
      ])
    })
  })

  describe('Edge Cases', () => {
    it('handles null parent prop', async () => {
      await wrapper.setProps({ parent: null })
      
      expect(wrapper.find('.parent-info').exists()).toBe(false)
    })

    it('handles undefined parent prop', async () => {
      await wrapper.setProps({ parent: undefined })
      
      expect(wrapper.find('.parent-info').exists()).toBe(false)
    })

    it('handles record without content', () => {
      const recordWithoutContent = {
        id: 3,
        title: '无内容记录',
        time: '2024-01-25T10:00:00Z',
        type: '面谈',
        creator: '赵老师'
      }
      
      wrapper.vm.recordsList = [recordWithoutContent]
      
      expect(wrapper.find('.record-content').exists()).toBe(false)
    })

    it('handles record with empty content', () => {
      const recordWithEmptyContent = {
        id: 3,
        title: '空内容记录',
        content: '',
        time: '2024-01-25T10:00:00Z',
        type: '面谈',
        creator: '赵老师'
      }
      
      wrapper.vm.recordsList = [recordWithEmptyContent]
      
      const contentElement = wrapper.find('.record-content')
      expect(contentElement.exists()).toBe(true)
      expect(contentElement.text()).toBe('')
    })

    it('shows loading state during save', async () => {
      const mockValidate = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 100)
        })
      })
      
      wrapper.vm.recordFormRef = { validate: mockValidate }
      
      // Start save operation
      wrapper.vm.saveRecord()
      
      expect(wrapper.vm.recordSaving).toBe(true)
      
      // Wait for save to complete
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.recordSaving).toBe(false)
    })

    it('handles save error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockValidate = vi.fn().mockRejectedValue(new Error('Network error'))
      
      wrapper.vm.recordFormRef = { validate: mockValidate }
      
      await wrapper.vm.saveRecord()
      
      expect(consoleSpy).toHaveBeenCalledWith('保存沟通记录失败:', expect.any(Error))
      expect(wrapper.vm.recordSaving).toBe(false)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Styling and Classes', () => {
    it('applies correct classes to record items', () => {
      const recordItem = wrapper.find('.record-item')
      expect(recordItem.classes()).toContain('record-item')
    })

    it('applies correct classes to record header', () => {
      const recordHeader = wrapper.find('.record-header')
      expect(recordHeader.classes()).toContain('record-header')
    })

    it('applies correct classes to record type badge', () => {
      const recordType = wrapper.find('.record-type')
      expect(recordType.classes()).toContain('record-type')
    })

    it('applies correct classes to dialog footer', () => {
      const dialogFooter = wrapper.find('.dialog-footer')
      expect(dialogFooter.classes()).toContain('dialog-footer')
    })
  })

  describe('Default Props', () => {
    it('uses default props when not provided', () => {
      const wrapperWithDefaults = mount(ContactRecordDialog, {
        props: {
          modelValue: true
        },
        global: {
          stubs: {
            'el-dialog': true,
            'el-button': true,
            'el-icon': true,
            'el-select': true,
            'el-option': true,
            'el-input': true,
            'el-form': true,
            'el-form-item': true,
            'el-date-picker': true
          }
        }
      })
      
      expect(wrapperWithDefaults.vm.parent).toBe(null)
      expect(wrapperWithDefaults.vm.records).toEqual([])
      
      wrapperWithDefaults.unmount()
    })
  })

  describe('Component State', () => {
    it('initializes with correct default state', () => {
      expect(wrapper.vm.recordsList).toEqual(mockRecords)
      expect(wrapper.vm.recordDialogVisible).toBe(false)
      expect(wrapper.vm.recordSaving).toBe(false)
      expect(wrapper.vm.recordFormRef).toBeUndefined()
      expect(wrapper.vm.recordForm).toEqual({
        type: '',
        title: '',
        content: '',
        time: ''
      })
    })

    it('resets form correctly when adding new record', () => {
      // Set some form data
      wrapper.vm.recordForm = {
        type: '电话沟通',
        title: '旧记录',
        content: '旧内容',
        time: '2024-01-15T10:00:00Z'
      }
      
      wrapper.vm.handleAddRecord()
      
      expect(wrapper.vm.recordForm.type).toBe('')
      expect(wrapper.vm.recordForm.title).toBe('')
      expect(wrapper.vm.recordForm.content).toBe('')
      expect(wrapper.vm.recordForm.time).toBe(expect.any(String))
    })
  })
})