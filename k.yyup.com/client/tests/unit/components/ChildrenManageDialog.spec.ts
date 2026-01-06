import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChildrenManageDialog from '@/components/ChildrenManageDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock Plus icon
vi.mock('@element-plus/icons-vue', () => ({
  Plus: {
    name: 'Plus'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ChildrenManageDialog.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('组件渲染', () => {
    it('应该正确渲染基本对话框', () => {
      const wrapper = mount(ChildrenManageDialog, {
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
      expect(wrapper.find('.children-manage').exists()).toBe(true)
      expect(wrapper.text()).toContain('孩子管理')
    })

    it('应该渲染家长信息', () => {
      const parent = {
        id: 1,
        name: '张三',
        phone: '13900139000'
      }
      const wrapper = mount(ChildrenManageDialog, {
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

    it('应该渲染孩子列表表格', () => {
      const children = [
        {
          id: 'child1',
          name: '小明',
          gender: 'MALE',
          age: 5,
          relationship: 'father',
          className: '小班A',
          status: 'active'
        }
      ]
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '张三',
            phone: '13900139000'
          },
          children
        }
      })

      expect(wrapper.find('.el-table').exists()).toBe(true)
      expect(wrapper.find('.children-section').exists()).toBe(true)
      expect(wrapper.text()).toContain('关联的孩子')
      expect(wrapper.text()).toContain('小明')
    })

    it('应该渲染添加孩子按钮', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '张三',
            phone: '13900139000'
          }
        }
      })

      const addButton = wrapper.find('button[type="primary"]')
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toContain('添加孩子')
    })

    it('当没有孩子数据时应该显示空状态', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '张三',
            phone: '13900139000'
          },
          children: []
        }
      })

      expect(wrapper.find('.el-table').exists()).toBe(true)
      // 表格应该存在但为空
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
        children: [
          {
            id: 'child1',
            name: '测试孩子',
            gender: 'MALE',
            age: 5,
            relationship: 'father',
            className: '小班',
            status: 'active'
          }
        ]
      }

      const wrapper = mount(ChildrenManageDialog, { props })
      expect(wrapper.props()).toEqual(props)
    })

    it('应该使用默认 props 值', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.props('parent')).toBe(null)
      expect(wrapper.props('children')).toEqual([])
    })

    it('应该正确计算 visible 计算属性', async () => {
      const wrapper = mount(ChildrenManageDialog, {
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
      const wrapper = mount(ChildrenManageDialog, {
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

    it('应该触发 save 事件', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.vm.handleSave()
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual([{
        parentId: 1,
        children: []
      }])
    })

    it('应该触发 add 事件', async () => {
      const wrapper = mount(ChildrenManageDialog, {
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

      await wrapper.vm.saveRecord()
      expect(wrapper.emitted('add')).toBeTruthy()
    })
  })

  describe('方法测试', () => {
    it('应该正确计算年龄', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const birthDate = '2020-01-01'
      const age = wrapper.vm.calculateAge(birthDate)
      expect(age).toBeGreaterThan(0)
      expect(typeof age).toBe('number')
    })

    it('应该正确获取关系文本', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.getRelationshipText('father')).toBe('父子')
      expect(wrapper.vm.getRelationshipText('mother')).toBe('母子')
      expect(wrapper.vm.getRelationshipText('other')).toBe('其他')
    })

    it('应该正确获取状态类型', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.getStatusType('active')).toBe('success')
      expect(wrapper.vm.getStatusType('inactive')).toBe('danger')
      expect(wrapper.vm.getStatusType('graduated')).toBe('info')
    })

    it('应该正确获取状态文本', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.getStatusText('active')).toBe('在读')
      expect(wrapper.vm.getStatusText('inactive')).toBe('暂停')
      expect(wrapper.vm.getStatusText('graduated')).toBe('毕业')
    })

    it('应该正确格式化日期', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const dateString = '2024-01-01T12:00:00.000Z'
      const formattedDate = wrapper.vm.formatDate(dateString)
      expect(formattedDate).toContain('2024')
    })
  })

  describe('交互测试', () => {
    it('应该打开添加孩子对话框', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.find('button[type="primary"]').trigger('click')
      expect(wrapper.vm.childDialogVisible).toBe(true)
      expect(wrapper.vm.editingChild).toBe(null)
    })

    it('应该打开编辑孩子对话框', async () => {
      const child = {
        id: 'child1',
        name: '小明',
        gender: 'MALE',
        age: 5,
        relationship: 'father',
        className: '小班',
        status: 'active'
      }
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          children: [child]
        }
      })

      await wrapper.find('button.link[type="primary"]').trigger('click')
      expect(wrapper.vm.childDialogVisible).toBe(true)
      expect(wrapper.vm.editingChild).toEqual(child)
    })

    it('应该成功保存孩子信息', async () => {
      vi.mocked(ElMessage.success).mockImplementation(() => {})
      
      const wrapper = mount(ChildrenManageDialog, {
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
        childForm: {
          name: '测试孩子',
          gender: 'MALE',
          birthDate: '2020-01-01',
          relationship: 'father'
        },
        childDialogVisible: true
      })

      // Mock form validation
      wrapper.vm.childFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.saveChild()
      
      expect(wrapper.vm.childDialogVisible).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('孩子添加成功')
    })

    it('应该移除孩子', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
      vi.mocked(ElMessage.success).mockImplementation(() => {})
      
      const child = {
        id: 'child1',
        name: '小明',
        gender: 'MALE',
        age: 5,
        relationship: 'father',
        className: '小班',
        status: 'active'
      }
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          children: [child]
        }
      })

      await wrapper.vm.removeChild(child)
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要移除孩子 小明 吗？',
        '确认移除',
        expect.any(Object)
      )
      expect(ElMessage.success).toHaveBeenCalledWith('孩子移除成功')
    })

    it('应该取消移除孩子操作', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValue(new Error('cancel'))
      
      const child = {
        id: 'child1',
        name: '小明',
        gender: 'MALE',
        age: 5,
        relationship: 'father',
        className: '小班',
        status: 'active'
      }
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          children: [child]
        }
      })

      const initialLength = wrapper.vm.childrenList.length
      await wrapper.vm.removeChild(child)
      
      expect(wrapper.vm.childrenList.length).toBe(initialLength)
    })
  })

  describe('生命周期测试', () => {
    it('应该正确监听 children 变化', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          children: []
        }
      })

      expect(wrapper.vm.childrenList).toEqual([])

      const newChildren = [
        {
          id: 'child1',
          name: '小明',
          gender: 'MALE',
          age: 5,
          relationship: 'father',
          className: '小班',
          status: 'active'
        }
      ]

      await wrapper.setProps({ children: newChildren })
      expect(wrapper.vm.childrenList).toEqual(newChildren)
    })

    it('应该在对话框关闭时重置表单', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      await wrapper.setData({
        childForm: {
          name: '测试孩子',
          gender: 'MALE',
          birthDate: '2020-01-01',
          relationship: 'father'
        }
      })

      await wrapper.setProps({ modelValue: false })
      // 表单应该在对话框关闭时重置
    })
  })

  describe('表单验证测试', () => {
    it('应该验证必填字段', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const rules = wrapper.vm.childRules
      expect(rules.name).toHaveLength(1)
      expect(rules.name[0].required).toBe(true)
      expect(rules.gender).toHaveLength(1)
      expect(rules.gender[0].required).toBe(true)
      expect(rules.birthDate).toHaveLength(1)
      expect(rules.birthDate[0].required).toBe(true)
      expect(rules.relationship).toHaveLength(1)
      expect(rules.relationship[0].required).toBe(true)
    })

    it('应该处理表单验证失败', async () => {
      vi.mocked(ElMessage.success).mockImplementation(() => {})
      
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      // Mock form validation failure
      wrapper.vm.childFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('validation error'))
      }

      await wrapper.setData({
        childDialogVisible: true
      })

      await wrapper.vm.saveChild()
      
      expect(wrapper.vm.childDialogVisible).toBe(true)
      expect(ElMessage.success).not.toHaveBeenCalled()
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的 parent 数据', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: null
        }
      })

      expect(wrapper.find('.parent-info').exists()).toBe(false)
    })

    it('应该处理未定义的 children 数据', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      expect(wrapper.vm.childrenList).toEqual([])
    })

    it('应该处理无效的出生日期', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const age = wrapper.vm.calculateAge('')
      expect(age).toBe(0)
    })

    it('应该处理未知的关系类型', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const relationshipText = wrapper.vm.getRelationshipText('unknown')
      expect(relationshipText).toBe('unknown')
    })

    it('应该处理未知的状态类型', () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const statusType = wrapper.vm.getStatusType('unknown')
      expect(statusType).toBe('info')
    })
  })

  describe('性能测试', () => {
    it('应该快速渲染大量孩子数据', () => {
      const children = Array.from({ length: 100 }, (_, i) => ({
        id: `child${i}`,
        name: `孩子${i}`,
        gender: 'MALE',
        age: 5,
        relationship: 'father',
        className: '小班',
        status: 'active'
      }))

      const start = performance.now()
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          },
          children
        }
      })
      const end = performance.now()

      expect(wrapper.vm.childrenList.length).toBe(100)
      expect(end - start).toBeLessThan(1000) // 应该在1秒内完成渲染
    })
  })

  describe('可访问性测试', () => {
    it('应该有适当的语义化结构', () => {
      const wrapper = mount(ChildrenManageDialog, {
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
      expect(wrapper.find('.parent-info').exists()).toBe(true)
      expect(wrapper.find('.children-section').exists()).toBe(true)
    })

    it('应该支持键盘导航', async () => {
      const wrapper = mount(ChildrenManageDialog, {
        props: {
          modelValue: true,
          parent: {
            id: 1,
            name: '测试家长',
            phone: '13800138000'
          }
        }
      })

      const button = wrapper.find('button[type="primary"]')
      await button.trigger('keydown', { key: 'Enter' })
      expect(wrapper.vm.childDialogVisible).toBe(true)
    })
  })
})