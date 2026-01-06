import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ClassAssignDialog from '@/components/ClassAssignDialog.vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('ClassAssignDialog.vue', () => {
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
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            employeeId: 'EMP001'
          }
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.assign-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('班级分配')
    })

    it('应该渲染教师信息', () => {
      const teacher = {
        id: 'teacher1',
        name: '张老师',
        employeeId: 'EMP001',
        classIds: ['class1'],
        classNames: ['小班A']
      }
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher
        }
      })

      expect(wrapper.find('.assign-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('教师信息')
      expect(wrapper.text()).toContain('张老师')
      expect(wrapper.text()).toContain('EMP001')
      expect(wrapper.text()).toContain('小班A')
    })

    it('应该渲染班级选择表单', () => {
      const classList = [
        { id: 'class1', name: '小班A' },
        { id: 'class2', name: '小班B' }
      ]
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList
        }
      })

      expect(wrapper.find('.assign-form').exists()).toBe(true)
      expect(wrapper.find('.el-checkbox-group').exists()).toBe(true)
      expect(wrapper.findAll('.el-checkbox').length).toBe(2)
    })

    it('应该渲染备注输入框', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      expect(wrapper.find('.el-textarea').exists()).toBe(true)
      expect(wrapper.text()).toContain('备注')
    })

    it('应该渲染对话框按钮', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(wrapper.text()).toContain('取消')
      expect(wrapper.text()).toContain('确认分配')
    })

    it('当教师未分配班级时显示未分配状态', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            employeeId: 'EMP001',
            classIds: [],
            classNames: []
          }
        }
      })

      expect(wrapper.text()).toContain('未分配')
      expect(wrapper.find('.text-muted').exists()).toBe(true)
    })
  })

  describe('Props 测试', () => {
    it('应该正确接收和处理 props', () => {
      const props = {
        modelValue: true,
        teacher: {
          id: 'teacher1',
          name: '测试教师',
          employeeId: 'EMP001',
          classIds: ['class1'],
          classNames: ['小班A']
        },
        classList: [
          { id: 'class1', name: '小班A' },
          { id: 'class2', name: '小班B' }
        ]
      }

      const wrapper = mount(ClassAssignDialog, { props })
      expect(wrapper.props()).toEqual(props)
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.props('teacher')).toBe(null)
      expect(wrapper.props('classList')).toEqual([])
    })

    it('应该正确计算 visible 计算属性', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
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
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.find('.el-dialog').vm.$emit('update:modelValue', false)
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该触发 assign 事件', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({
        form: {
          classIds: ['class1', 'class2'],
          remark: '测试备注'
        }
      })

      await wrapper.vm.handleAssign()
      expect(wrapper.emitted('assign')).toBeTruthy()
      expect(wrapper.emitted('assign')[0]).toEqual([{
        teacherId: 'teacher1',
        classIds: ['class1', 'class2'],
        remark: '测试备注'
      }])
    })

    it('不应该在没有教师数据时触发 assign 事件', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: null
        }
      })

      await wrapper.vm.handleAssign()
      expect(wrapper.emitted('assign')).toBeFalsy()
    })
  })

  describe('方法测试', () => {
    it('应该重置表单', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      wrapper.setData({
        form: {
          classIds: ['class1', 'class2'],
          remark: '测试备注'
        }
      })

      wrapper.vm.resetForm()
      expect(wrapper.vm.form).toEqual({
        classIds: [],
        remark: ''
      })
    })

    it('应该处理取消操作', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.vm.handleCancel()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该处理分配操作', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({
        form: {
          classIds: ['class1'],
          remark: '测试备注'
        }
      })

      await wrapper.vm.handleAssign()
      expect(wrapper.emitted('assign')).toBeTruthy()
    })

    it('应该在分配时显示加载状态', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({
        form: {
          classIds: ['class1'],
          remark: '测试备注'
        }
      })

      const assignPromise = wrapper.vm.handleAssign()
      expect(wrapper.vm.loading).toBe(true)

      await assignPromise
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('数据监听测试', () => {
    it('应该监听教师数据变化并更新表单', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            classIds: ['class1'],
            classNames: ['小班A']
          }
        }
      })

      expect(wrapper.vm.form.classIds).toEqual(['class1'])

      const newTeacher = {
        id: 'teacher2',
        name: '新教师',
        classIds: ['class2', 'class3'],
        classNames: ['小班B', '小班C']
      }

      await wrapper.setProps({ teacher: newTeacher })
      expect(wrapper.vm.form.classIds).toEqual(['class2', 'class3'])
      expect(wrapper.vm.form.remark).toBe('')
    })

    it('当教师数据为空时应该重置表单', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            classIds: ['class1']
          }
        }
      })

      expect(wrapper.vm.form.classIds).toEqual(['class1'])

      await wrapper.setProps({ teacher: null })
      expect(wrapper.vm.form.classIds).toEqual([])
      expect(wrapper.vm.form.remark).toBe('')
    })

    it('应该监听对话框显示状态变化', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({
        form: {
          classIds: ['class1'],
          remark: '测试备注'
        }
      })

      await wrapper.setProps({ modelValue: false })
      expect(wrapper.vm.form.classIds).toEqual([])
      expect(wrapper.vm.form.remark).toBe('')
    })
  })

  describe('表单交互测试', () => {
    it('应该能够选择班级', async () => {
      const classList = [
        { id: 'class1', name: '小班A' },
        { id: 'class2', name: '小班B' }
      ]
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList
        }
      })

      const checkboxes = wrapper.findAll('.el-checkbox')
      expect(checkboxes.length).toBe(2)

      // 模拟选择班级
      await checkboxes[0].setValue(true)
      expect(wrapper.vm.form.classIds).toContain('class1')

      await checkboxes[1].setValue(true)
      expect(wrapper.vm.form.classIds).toContain('class2')
    })

    it('应该能够取消选择班级', async () => {
      const classList = [
        { id: 'class1', name: '小班A' },
        { id: 'class2', name: '小班B' }
      ]
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList
        }
      })

      const checkboxes = wrapper.findAll('.el-checkbox')
      
      // 先选择班级
      await checkboxes[0].setValue(true)
      expect(wrapper.vm.form.classIds).toContain('class1')

      // 再取消选择
      await checkboxes[0].setValue(false)
      expect(wrapper.vm.form.classIds).not.toContain('class1')
    })

    it('应该能够输入备注', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      const textarea = wrapper.find('.el-textarea')
      await textarea.setValue('这是一个测试备注')
      expect(wrapper.vm.form.remark).toBe('这是一个测试备注')
    })

    it('应该能够清空备注', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({
        form: {
          classIds: [],
          remark: '测试备注'
        }
      })

      const textarea = wrapper.find('.el-textarea')
      await textarea.setValue('')
      expect(wrapper.vm.form.remark).toBe('')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的教师数据', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: null
        }
      })

      expect(wrapper.find('.assign-info').exists()).toBe(false)
    })

    it('应该处理空的班级列表', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList: []
        }
      })

      expect(wrapper.find('.el-checkbox-group').exists()).toBe(true)
      expect(wrapper.findAll('.el-checkbox').length).toBe(0)
    })

    it('应该处理教师没有工号的情况', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      expect(wrapper.text()).toContain('暂无')
    })

    it('应该处理教师没有班级分配的情况', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            employeeId: 'EMP001'
          }
        }
      })

      expect(wrapper.text()).toContain('未分配')
    })

    it('应该处理大量的班级数据', () => {
      const classList = Array.from({ length: 50 }, (_, i) => ({
        id: `class${i}`,
        name: `班级${i}`
      }))

      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList
        }
      })

      expect(wrapper.findAll('.el-checkbox').length).toBe(50)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理分配操作中的错误', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      // 模拟错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await wrapper.setData({
        form: {
          classIds: ['class1'],
          remark: '测试备注'
        }
      })

      await wrapper.vm.handleAssign()
      
      expect(consoleSpy).toHaveBeenCalledWith('分配失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('应该在加载状态下禁用按钮', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      await wrapper.setData({ loading: true })
      
      const assignButton = wrapper.find('button[type="primary"]')
      expect(assignButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量班级数据', () => {
      const classList = Array.from({ length: 100 }, (_, i) => ({
        id: `class${i}`,
        name: `班级${i}`
      }))

      const start = performance.now()
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          },
          classList
        }
      })
      const end = performance.now()

      expect(wrapper.findAll('.el-checkbox').length).toBe(100)
      expect(end - start).toBeLessThan(1000) // 应该在1秒内完成渲染
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.assign-info').exists()).toBe(true)
      expect(wrapper.find('.assign-form').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      const cancelButton = wrapper.findAll('button')[0]
      await cancelButton.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师'
          }
        }
      })

      expect(wrapper.find('.assign-info').exists()).toBe(true)
      expect(wrapper.find('.assign-form').exists()).toBe(true)
      expect(wrapper.find('.text-muted').exists()).toBe(false) // 只有在有未分配状态时才存在
    })

    it('应该应用正确的文本样式', () => {
      const wrapper = mount(ClassAssignDialog, {
        props: {
          modelValue: true,
          teacher: {
            id: 'teacher1',
            name: '测试教师',
            employeeId: 'EMP001'
          }
        }
      })

      expect(wrapper.text()).toContain('教师信息')
      expect(wrapper.text()).toContain('姓名')
      expect(wrapper.text()).toContain('工号')
      expect(wrapper.text()).toContain('当前班级')
    })
  })
})