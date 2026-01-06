import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ContactRecordDialog from '@/components/ContactRecordDialog.vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

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

// Mock Plus icon
vi.mock('@element-plus/icons-vue', () => ({
  Plus: {
    name: 'Plus'
  }
}))

describe('ContactRecordDialog.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染基本对话框', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.contact-records').exists()).toBe(true)
      expect(wrapper.text()).toContain('沟通记录')
    })

    it('应该渲染家长信息', () => {
      const parent = {
        id: 1,
        name: '张三',
        phone: '13900139000'
      }
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent
        }
      })

      expect(wrapper.find('.parent-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('家长信息')
      expect(wrapper.text()).toContain('张三')
      expect(wrapper.text()).toContain('13900139000')
    })

    it('应该渲染沟通记录列表', () => {
      const records = [
        {
          id: 'record1',
          title: '第一次沟通',
          content: '沟通内容详情',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      expect(wrapper.find('.records-section').exists()).toBe(true)
      expect(wrapper.find('.records-list').exists()).toBe(true)
      expect(wrapper.text()).toContain('沟通记录')
      expect(wrapper.text()).toContain('第一次沟通')
    })

    it('应该渲染添加记录按钮', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const addButton = wrapper.find('button[type="primary"]')
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toContain('添加记录')
    })

    it('当没有记录数据时应该显示空状态', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records: []
        }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无沟通记录')
    })

    it('应该渲染记录项的详细信息', () => {
      const records = [
        {
          id: 'record1',
          title: '测试沟通',
          content: '这是沟通的详细内容',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '李老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordItem = wrapper.find('.record-item')
      expect(recordItem.exists()).toBe(true)
      expect(recordItem.text()).toContain('测试沟通')
      expect(recordItem.text()).toContain('电话沟通')
      expect(recordItem.text()).toContain('这是沟通的详细内容')
      expect(recordItem.text()).toContain('李老师')
    })
  })

  describe('Props 测试', () => {
    it('应该正确接收和处理 props', () => {
      const props = {
        modelValue: true,
        parent: {
          id: 1,
          name: '测试家长',
          phone: '13800138000'
        },
        records: [
          {
            id: 'record1',
            title: '测试记录',
            content: '测试内容',
            time: '2024-01-01T10:00:00.000Z',
            type: '电话沟通',
            creator: '张老师'
          }
        ]
      }

      const wrapper = mount(ContactRecordDialog, { props })
      expect(wrapper.props()).toEqual(props)
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.props('parent')).toBe(null)
      expect(wrapper.props('records')).toEqual([])
    })

    it('应该正确计算 visible 计算属性', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.visible).toBe(true)

      await wrapper.setProps({ modelValue: false })
      expect(wrapper.vm.visible).toBe(false)
    })
  })

  describe('事件测试', () => {
    it('应该触发 update:modelValue 事件', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.find('.el-dialog').vm.$emit('update:modelValue', false)
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该触发 add 事件', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      // 设置表单数据
      await wrapper.setData({
        recordForm: {
          type: '电话沟通',
          title: '测试标题',
          content: '测试内容',
          time: new Date().toISOString()
        }
      })

      // Mock form validation
      wrapper.vm.recordFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.saveRecord()
      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')[0]).toEqual([{
        type: '电话沟通',
        title: '测试标题',
        content: '测试内容',
        time: expect.any(String),
        followupType: '电话沟通',
        followupDate: expect.any(String)
      }])
    })
  })

  describe('方法测试', () => {
    it('应该正确格式化日期', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const dateString = '2024-01-01T10:00:00.000Z'
      const formattedDate = wrapper.vm.formatDate(dateString)
      expect(formattedDate).toContain('2024')
      expect(formattedDate).toContain('1')
      expect(formattedDate).toContain('10')
    })

    it('应该处理空日期字符串', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const formattedDate = wrapper.vm.formatDate('')
      expect(formattedDate).toBe('')
    })

    it('应该处理添加记录操作', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.vm.handleAddRecord()
      expect(wrapper.vm.recordDialogVisible).toBe(true)
      expect(wrapper.vm.recordForm.type).toBe('')
      expect(wrapper.vm.recordForm.title).toBe('')
      expect(wrapper.vm.recordForm.content).toBe('')
      expect(wrapper.vm.recordForm.time).toBe(expect.any(String))
    })

    it('应该处理关闭对话框操作', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.vm.handleClose()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该在保存记录时显示加载状态', async () => {
      vi.mocked(ElMessage.success).mockImplementation(() => {})
      
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      wrapper.vm.recordFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      const savePromise = wrapper.vm.saveRecord()
      expect(wrapper.vm.recordSaving).toBe(true)

      await savePromise
      expect(wrapper.vm.recordSaving).toBe(false)
    })
  })

  describe('数据监听测试', () => {
    it('应该监听记录数据变化并更新列表', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records: []
        }
      })

      expect(wrapper.vm.recordsList).toEqual([])

      const newRecords = [
        {
          id: 'record1',
          title: '新记录',
          content: '新记录内容',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        }
      ]

      await wrapper.setProps({ records: newRecords })
      expect(wrapper.vm.recordsList).toEqual(newRecords)
    })

    it('当记录数据为空时应该重置列表', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records: [
            {
              id: 'record1',
              title: '测试记录',
              content: '测试内容',
              time: '2024-01-01T10:00:00.000Z',
              type: '电话沟通',
              creator: '张老师'
            }
          ]
        }
      })

      expect(wrapper.vm.recordsList.length).toBe(1)

      await wrapper.setProps({ records: [] })
      expect(wrapper.vm.recordsList).toEqual([])
    })
  })

  describe('表单验证测试', () => {
    it('应该有正确的验证规则', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const rules = wrapper.vm.recordRules
      expect(rules.type).toHaveLength(1)
      expect(rules.type[0].required).toBe(true)
      expect(rules.type[0].message).toBe('请选择沟通类型')

      expect(rules.title).toHaveLength(1)
      expect(rules.title[0].required).toBe(true)
      expect(rules.title[0].message).toBe('请输入记录标题')

      expect(rules.content).toHaveLength(1)
      expect(rules.content[0].required).toBe(true)
      expect(rules.content[0].message).toBe('请输入沟通内容')

      expect(rules.time).toHaveLength(1)
      expect(rules.time[0].required).toBe(true)
      expect(rules.time[0].message).toBe('请选择沟通时间')
    })

    it('应该处理表单验证成功', async () => {
      vi.mocked(ElMessage.success).mockImplementation(() => {})
      
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      wrapper.vm.recordFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.setData({
        recordForm: {
          type: '电话沟通',
          title: '测试标题',
          content: '测试内容',
          time: new Date().toISOString()
        }
      })

      await wrapper.vm.saveRecord()
      expect(wrapper.emitted('add')).toBeTruthy()
      expect(ElMessage.success).toHaveBeenCalledWith('沟通记录添加成功')
    })

    it('应该处理表单验证失败', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      wrapper.vm.recordFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('validation error'))
      }

      await wrapper.setData({
        recordDialogVisible: true
      })

      await wrapper.vm.saveRecord()
      expect(wrapper.emitted('add')).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalledWith('保存沟通记录失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('应该在表单引用不存在时处理保存', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.vm.saveRecord()
      expect(wrapper.emitted('add')).toBeFalsy()
    })
  })

  describe('表单交互测试', () => {
    it('应该能够选择沟通类型', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      // 模拟选择沟通类型
      await wrapper.setData({
        recordForm: {
          ...wrapper.vm.recordForm,
          type: '微信沟通'
        }
      })
      expect(wrapper.vm.recordForm.type).toBe('微信沟通')
    })

    it('应该能够输入记录标题', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const titleInput = wrapper.find('input[placeholder="请输入记录标题"]')
      await titleInput.setValue('测试沟通记录')
      expect(wrapper.vm.recordForm.title).toBe('测试沟通记录')
    })

    it('应该能够输入沟通内容', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const textarea = wrapper.find('.el-textarea')
      await textarea.setValue('这是详细的沟通内容记录')
      expect(wrapper.vm.recordForm.content).toBe('这是详细的沟通内容记录')
    })

    it('应该能够选择沟通时间', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      // 模拟选择沟通时间
      const testTime = '2024-01-01T10:00:00.000Z'
      await wrapper.setData({
        recordForm: {
          ...wrapper.vm.recordForm,
          time: testTime
        }
      })
      expect(wrapper.vm.recordForm.time).toBe(testTime)
    })
  })

  describe('记录项渲染测试', () => {
    it('应该正确渲染记录项的头部信息', () => {
      const records = [
        {
          id: 'record1',
          title: '测试沟通',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordHeader = wrapper.find('.record-header')
      expect(recordHeader.exists()).toBe(true)

      const recordInfo = wrapper.find('.record-info')
      expect(recordInfo.exists()).toBe(true)
      expect(recordInfo.text()).toContain('测试沟通')
      expect(recordInfo.text()).toContain('电话沟通')

      const recordMeta = wrapper.find('.record-meta')
      expect(recordMeta.exists()).toBe(true)
      expect(recordMeta.text()).toContain('张老师')
    })

    it('应该正确渲染记录项的内容', () => {
      const records = [
        {
          id: 'record1',
          title: '测试沟通',
          content: '这是多行的\n沟通内容\n记录',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordContent = wrapper.find('.record-content')
      expect(recordContent.exists()).toBe(true)
      expect(recordContent.text()).toBe('这是多行的\n沟通内容\n记录')
    })

    it('应该渲染多个记录项', () => {
      const records = [
        {
          id: 'record1',
          title: '第一次沟通',
          content: '第一次沟通内容',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        },
        {
          id: 'record2',
          title: '第二次沟通',
          content: '第二次沟通内容',
          time: '2024-01-02T10:00:00.000Z',
          type: '微信沟通',
          creator: '李老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordItems = wrapper.findAll('.record-item')
      expect(recordItems.length).toBe(2)
      expect(recordItems[0].text()).toContain('第一次沟通')
      expect(recordItems[1].text()).toContain('第二次沟通')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的家长数据', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: null
        }
      })

      expect(wrapper.find('.parent-info').exists()).toBe(false)
    })

    it('应该处理未定义的记录数据', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.recordsList).toEqual([])
    })

    it('应该处理记录项缺少某些字段的情况', () => {
      const records = [
        {
          id: 'record1',
          title: '测试沟通'
          // 缺少其他字段
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordItem = wrapper.find('.record-item')
      expect(recordItem.exists()).toBe(true)
      expect(recordItem.text()).toContain('测试沟通')
    })

    it('应该处理大量的记录数据', () => {
      const records = Array.from({ length: 50 }, (_, i) => ({
        id: `record${i}`,
        title: `记录${i}`,
        content: `内容${i}`,
        time: `2024-01-01T10:00:00.000Z`,
        type: '电话沟通',
        creator: '张老师'
      }))

      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      expect(wrapper.findAll('.record-item').length).toBe(50)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理保存操作中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      wrapper.vm.recordFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      // 模拟保存过程中的错误
      const originalEmit = wrapper.vm.emit
      wrapper.vm.emit = vi.fn().mockImplementation((event, data) => {
        if (event === 'add') {
          throw new Error('保存失败')
        }
        return originalEmit.call(wrapper.vm, event, data)
      })

      await wrapper.setData({
        recordForm: {
          type: '电话沟通',
          title: '测试标题',
          content: '测试内容',
          time: new Date().toISOString()
        }
      })

      await wrapper.vm.saveRecord()
      expect(consoleSpy).toHaveBeenCalledWith('保存沟通记录失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量记录数据', () => {
      const records = Array.from({ length: 100 }, (_, i) => ({
        id: `record${i}`,
        title: `记录${i}`,
        content: `内容${i}`,
        time: `2024-01-01T10:00:00.000Z`,
        type: '电话沟通',
        creator: '张老师'
      }))

      const start = performance.now()
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })
      const end = performance.now()

      expect(wrapper.vm.recordsList.length).toBe(100)
      expect(end - start).toBeLessThan(1000) // 应该在1秒内完成渲染
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.contact-records').exists()).toBe(true)
      expect(wrapper.find('.parent-info').exists()).toBe(true)
      expect(wrapper.find('.records-section').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const addButton = wrapper.find('button[type="primary"]')
      await addButton.trigger('keydown', { key: 'Enter' })
      expect(wrapper.vm.recordDialogVisible).toBe(true)
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.find('.contact-records').exists()).toBe(true)
      expect(wrapper.find('.parent-info').exists()).toBe(true)
      expect(wrapper.find('.records-section').exists()).toBe(true)
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('应该有正确的记录项样式', () => {
      const records = [
        {
          id: 'record1',
          title: '测试沟通',
          content: '测试内容',
          time: '2024-01-01T10:00:00.000Z',
          type: '电话沟通',
          creator: '张老师'
        }
      ]
      const wrapper = mount(ContactRecordDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          records
        }
      })

      const recordItem = wrapper.find('.record-item')
      expect(recordItem.classes()).toContain('record-item')

      const recordHeader = wrapper.find('.record-header')
      expect(recordHeader.classes()).toContain('record-header')

      const recordContent = wrapper.find('.record-content')
      expect(recordContent.classes()).toContain('record-content')
    })
  })
})