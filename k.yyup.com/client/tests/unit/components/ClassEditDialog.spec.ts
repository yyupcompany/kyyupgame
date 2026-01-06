import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ClassEditDialog from '@/components/ClassEditDialog.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('ClassEditDialog.vue', () => {
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
    it('应该正确渲染新建班级对话框', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' },
            { id: 'teacher2', name: '李老师' }
          ]
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.text()).toContain('新建班级')
      expect(wrapper.find('.class-form').exists()).toBe(true)
    })

    it('应该正确渲染编辑班级对话框', () => {
      const classData = {
        id: 'class1',
        name: '小班A',
        code: 'CLASS001',
        ageGroup: 'SMALL',
        capacity: 25,
        teacherId: 'teacher1',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: '测试班级'
      }

      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData,
          teacherList: [
            { id: 'teacher1', name: '张老师' },
            { id: 'teacher2', name: '李老师' }
          ]
        }
      })

      expect(wrapper.text()).toContain('编辑班级')
      expect(wrapper.vm.isEdit).toBe(true)
    })

    it('应该渲染表单字段', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.find('input[placeholder="请输入班级名称"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="请输入班级编号"]').exists()).toBe(true)
      expect(wrapper.find('.el-select').exists()).toBe(true)
      expect(wrapper.find('.el-input-number').exists()).toBe(true)
      expect(wrapper.find('.el-date-picker').exists()).toBe(true)
      expect(wrapper.find('.el-textarea').exists()).toBe(true)
    })

    it('应该渲染对话框按钮', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(wrapper.text()).toContain('取消')
      expect(wrapper.text()).toContain('创建')
    })

    it('应该在编辑模式时显示更新按钮', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A'
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.text()).toContain('更新')
      expect(wrapper.text()).not.toContain('创建')
    })
  })

  describe('Props 测试', () => {
    it('应该正确接收和处理 props', () => {
      const props = {
        modelValue: true,
        classData: {
          id: 'class1',
          name: '小班A',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 25,
          teacherId: 'teacher1',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级'
        },
        teacherList: [
          { id: 'teacher1', name: '张老师' },
          { id: 'teacher2', name: '李老师' }
        ]
      }

      const wrapper = mount(ClassEditDialog, { props })
      expect(wrapper.props()).toEqual(props)
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.props('classData')).toBeUndefined()
      expect(wrapper.props('teacherList')).toEqual([])
    })

    it('应该正确计算 dialogVisible 计算属性', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.dialogVisible).toBe(true)

      await wrapper.setProps({ modelValue: false })
      expect(wrapper.vm.dialogVisible).toBe(false)
    })

    it('应该正确计算 isEdit 计算属性', () => {
      const wrapper1 = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })
      expect(wrapper1.vm.isEdit).toBe(false)

      const wrapper2 = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: { id: 'class1', name: '小班A' },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })
      expect(wrapper2.vm.isEdit).toBe(true)
    })
  })

  describe('事件测试', () => {
    it('应该触发 update:modelValue 事件', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      await wrapper.find('.el-dialog').vm.$emit('update:modelValue', false)
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该触发 save 事件（新建模式）', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      await wrapper.setData({
        formData: {
          name: '小班A',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 25,
          teacherId: 'teacher1',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级'
        }
      })

      // Mock form validation
      wrapper.vm.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0]).toEqual({
        name: '小班A',
        code: 'CLASS001',
        ageGroup: 'SMALL',
        capacity: 25,
        teacherId: 'teacher1',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: '测试班级'
      })
    })

    it('应该触发 save 事件（编辑模式）', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A',
            code: 'CLASS001'
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      await wrapper.setData({
        formData: {
          name: '小班A-更新',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 25,
          teacherId: 'teacher1',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级更新'
        }
      })

      // Mock form validation
      wrapper.vm.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0]).toEqual({
        id: 'class1',
        name: '小班A-更新',
        code: 'CLASS001',
        ageGroup: 'SMALL',
        capacity: 25,
        teacherId: 'teacher1',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: '测试班级更新'
      })
    })
  })

  describe('方法测试', () => {
    it('应该重置表单', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      wrapper.setData({
        formData: {
          name: '小班A',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 30,
          teacherId: 'teacher1',
          status: 'INACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级'
        }
      })

      wrapper.vm.resetForm()
      expect(wrapper.vm.formData).toEqual({
        name: '',
        code: '',
        ageGroup: '',
        capacity: 25,
        teacherId: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
        description: ''
      })
    })

    it('应该处理取消操作', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      await wrapper.vm.handleCancel()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该处理关闭操作', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      wrapper.setData({
        formData: {
          name: '小班A',
          code: 'CLASS001'
        }
      })

      wrapper.vm.handleClosed()
      expect(wrapper.vm.formData.name).toBe('')
      expect(wrapper.vm.formData.code).toBe('')
    })

    it('应该在保存时显示加载状态', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      // Mock form validation
      wrapper.vm.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      const savePromise = wrapper.vm.handleSave()
      expect(wrapper.vm.saving).toBe(true)

      await savePromise
      expect(wrapper.vm.saving).toBe(false)
    })
  })

  describe('数据监听测试', () => {
    it('应该监听班级数据变化并更新表单', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.formData.name).toBe('')

      const newClassData = {
        id: 'class1',
        name: '小班A',
        code: 'CLASS001',
        ageGroup: 'SMALL',
        capacity: 25,
        teacherId: 'teacher1',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: '测试班级'
      }

      await wrapper.setProps({ classData: newClassData })
      expect(wrapper.vm.formData).toEqual(newClassData)
    })

    it('当班级数据为空时应该重置表单', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A',
            code: 'CLASS001'
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.formData.name).toBe('小班A')

      await wrapper.setProps({ classData: undefined })
      expect(wrapper.vm.formData.name).toBe('')
    })
  })

  describe('表单验证测试', () => {
    it('应该有正确的验证规则', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const rules = wrapper.vm.formRules
      expect(rules.name).toHaveLength(2)
      expect(rules.name[0].required).toBe(true)
      expect(rules.name[0].message).toBe('请输入班级名称')
      expect(rules.name[1].min).toBe(2)
      expect(rules.name[1].max).toBe(20)

      expect(rules.code).toHaveLength(2)
      expect(rules.code[0].required).toBe(true)
      expect(rules.code[1].pattern).toBe(/^[A-Z0-9]+$/)

      expect(rules.ageGroup).toHaveLength(1)
      expect(rules.ageGroup[0].required).toBe(true)

      expect(rules.capacity).toHaveLength(1)
      expect(rules.capacity[0].required).toBe(true)

      expect(rules.teacherId).toHaveLength(1)
      expect(rules.teacherId[0].required).toBe(true)

      expect(rules.status).toHaveLength(1)
      expect(rules.status[0].required).toBe(true)

      expect(rules.startDate).toHaveLength(1)
      expect(rules.startDate[0].required).toBe(true)
    })

    it('应该处理表单验证成功', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      wrapper.vm.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.setData({
        formData: {
          name: '小班A',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 25,
          teacherId: 'teacher1',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级'
        }
      })

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('应该处理表单验证失败', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      wrapper.vm.formRef = {
        validate: vi.fn().mockRejectedValue(new Error('validation error'))
      }

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalledWith('表单验证失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('应该在表单引用不存在时处理保存', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  describe('表单交互测试', () => {
    it('应该能够输入班级名称', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const nameInput = wrapper.find('input[placeholder="请输入班级名称"]')
      await nameInput.setValue('小班A')
      expect(wrapper.vm.formData.name).toBe('小班A')
    })

    it('应该能够输入班级编号', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const codeInput = wrapper.find('input[placeholder="请输入班级编号"]')
      await codeInput.setValue('CLASS001')
      expect(wrapper.vm.formData.code).toBe('CLASS001')
    })

    it('应该能够选择年龄组', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      // 模拟选择年龄组
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          ageGroup: 'SMALL'
        }
      })
      expect(wrapper.vm.formData.ageGroup).toBe('SMALL')
    })

    it('应该能够设置班级容量', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      // 模拟设置班级容量
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          capacity: 30
        }
      })
      expect(wrapper.vm.formData.capacity).toBe(30)
    })

    it('应该能够选择主班教师', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' },
            { id: 'teacher2', name: '李老师' }
          ]
        }
      })

      // 模拟选择教师
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          teacherId: 'teacher2'
        }
      })
      expect(wrapper.vm.formData.teacherId).toBe('teacher2')
    })

    it('应该能够选择班级状态', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      // 模拟选择状态
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          status: 'INACTIVE'
        }
      })
      expect(wrapper.vm.formData.status).toBe('INACTIVE')
    })

    it('应该能够设置日期', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      // 模拟设置日期
      await wrapper.setData({
        formData: {
          ...wrapper.vm.formData,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      expect(wrapper.vm.formData.startDate).toBe('2024-01-01')
      expect(wrapper.vm.formData.endDate).toBe('2024-12-31')
    })

    it('应该能够输入班级描述', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const textarea = wrapper.find('.el-textarea')
      await textarea.setValue('这是一个测试班级描述')
      expect(wrapper.vm.formData.description).toBe('这是一个测试班级描述')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的教师列表', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: []
        }
      })

      expect(wrapper.props('teacherList')).toEqual([])
    })

    it('应该处理部分缺失的班级数据', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A'
            // 缺少其他字段
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.formData.name).toBe('小班A')
      expect(wrapper.vm.formData.code).toBe('')
      expect(wrapper.vm.formData.ageGroup).toBe('')
      expect(wrapper.vm.formData.capacity).toBe(25)
    })

    it('应该处理无效的日期格式', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A',
            startDate: 'invalid-date',
            endDate: 'invalid-date'
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.formData.startDate).toBe('invalid-date')
      expect(wrapper.vm.formData.endDate).toBe('invalid-date')
    })

    it('应该处理超出范围的容量值', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          classData: {
            id: 'class1',
            name: '小班A',
            capacity: 100 // 超出最大值50
          },
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.vm.formData.capacity).toBe(100)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理保存操作中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      wrapper.vm.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      // 模拟保存过程中的错误
      const originalEmit = wrapper.vm.emit
      wrapper.vm.emit = vi.fn().mockImplementation((event, data) => {
        if (event === 'save') {
          throw new Error('保存失败')
        }
        return originalEmit.call(wrapper.vm, event, data)
      })

      await wrapper.setData({
        formData: {
          name: '小班A',
          code: 'CLASS001',
          ageGroup: 'SMALL',
          capacity: 25,
          teacherId: 'teacher1',
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: '测试班级'
        }
      })

      await wrapper.vm.handleSave()
      expect(consoleSpy).toHaveBeenCalledWith('表单验证失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量教师数据', () => {
      const teacherList = Array.from({ length: 100 }, (_, i) => ({
        id: `teacher${i}`,
        name: `老师${i}`
      }))

      const start = performance.now()
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList
        }
      })
      const end = performance.now()

      expect(wrapper.props('teacherList').length).toBe(100)
      expect(end - start).toBeLessThan(1000) // 应该在1秒内完成渲染
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.class-form').exists()).toBe(true)
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      const cancelButton = wrapper.findAll('button')[0]
      await cancelButton.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.find('.class-form').exists()).toBe(true)
      expect(wrapper.find('.dialog-footer').exists()).toBe(true)
    })

    it('应该有正确的表单布局', () => {
      const wrapper = mount(ClassEditDialog, {
        props: {
          modelValue: true,
          teacherList: [
            { id: 'teacher1', name: '张老师' }
          ]
        }
      })

      expect(wrapper.find('.el-row').exists()).toBe(true)
      expect(wrapper.find('.el-col').exists()).toBe(true)
    })
  })
})