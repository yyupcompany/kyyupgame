import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import PromptPreview from '@/components/ai-assistant/PromptPreview.vue'
import { executeShortcut } from '@/services/ai-router'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    }
  }
})

// Mock executeShortcut
vi.mock('@/services/ai-router', () => ({
  executeShortcut: vi.fn()
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// 控制台错误检测变量
let consoleSpy: any

describe('PromptPreview.vue', () => {
  let wrapper: any

  const mockPromptData = {
    id: 1,
    shortcut_name: '招生规划助手',
    prompt_name: 'enrollment_planning_prompt',
    category: 'enrollment_planning',
    role: 'principal',
    api_endpoint: 'ai_chat',
    sort_order: 1,
    is_active: true,
    system_prompt: `**招生规划助手**

你是一个专业的幼儿园招生规划助手，需要帮助园长制定招生计划。

**主要职责：**
1. 分析市场环境
2. 制定招生目标
3. 规划招生策略

**工作流程：**
├─ 市场分析
│  ├─ 竞争对手分析
│  └─ 目标客户分析
└─ 策略制定
   ├─ 定价策略
   └─ 推广策略

请根据用户的具体需求，提供专业的招生规划建议。`
  }

  beforeEach(() => {
    vi.mocked(executeShortcut).mockResolvedValue({
      success: true,
      data: {
        message: '测试回复：根据您的需求，我建议制定以下招生计划...'
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wrapper = mount(PromptPreview, {
      props: {
        modelValue: true,
        data: mockPromptData
      },
      global: {
        stubs: {
          'el-icon': true,
          'el-dialog': true,
          'el-button': true,
          'el-tag': true,
          'el-collapse': true,
          'el-collapse-item': true
        }
      }
    })
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

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.prompt-preview-dialog').exists()).toBe(true)
    })

    it('应该显示基本信息', () => {
      expect(wrapper.text()).toContain('招生规划助手')
      expect(wrapper.text()).toContain('enrollment_planning_prompt')
      expect(wrapper.text()).toContain('1')
    })

    it('应该显示提示词内容', () => {
      expect(wrapper.text()).toContain('招生规划助手')
      expect(wrapper.text()).toContain('市场环境')
      expect(wrapper.text()).toContain('招生目标')
    })

    it('应该显示操作按钮', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('复制')
      expect(wrapper.text()).toContain('格式化')
      expect(wrapper.text()).toContain('测试')
    })

    it('应该显示对话框底部按钮', () => {
      const footerButtons = wrapper.findAll('.dialog-footer button')
      expect(footerButtons.length).toBe(2)
      expect(wrapper.text()).toContain('关闭')
      expect(wrapper.text()).toContain('编辑')
    })
  })

  describe('标签显示', () => {
    it('应该显示分类标签', () => {
      const categoryTag = wrapper.findAll('el-tag-stub').find(tag => 
        tag.text() === '招生规划'
      )
      expect(categoryTag.exists()).toBe(true)
      expect(categoryTag.attributes('type')).toBe('primary')
    })

    it('应该显示角色标签', () => {
      const roleTag = wrapper.findAll('el-tag-stub').find(tag => 
        tag.text() === '园长'
      )
      expect(roleTag.exists()).toBe(true)
      expect(roleTag.attributes('type')).toBe('danger')
    })

    it('应该显示API端点标签', () => {
      const apiTag = wrapper.findAll('el-tag-stub').find(tag => 
        tag.text() === 'AI聊天'
      )
      expect(apiTag.exists()).toBe(true)
      expect(apiTag.attributes('type')).toBe('primary')
    })

    it('应该显示状态标签', () => {
      const statusTag = wrapper.findAll('el-tag-stub').find(tag => 
        tag.text() === '启用'
      )
      expect(statusTag.exists()).toBe(true)
      expect(statusTag.attributes('type')).toBe('success')
    })
  })

  describe('格式化内容', () => {
    it('应该默认显示格式化内容', () => {
      expect(wrapper.vm.showFormatted).toBe(true)
      expect(wrapper.find('.formatted-content').exists()).toBe(true)
    })

    it('应该正确格式化Markdown内容', () => {
      const formattedContent = wrapper.vm.formattedPrompt
      expect(formattedContent).toContain('<strong>招生规划助手</strong>')
      expect(formattedContent).toContain('<strong>主要职责：</strong>')
      expect(formattedContent).toContain('<em>市场环境</em>')
      expect(formattedContent).toContain('<code>招生规划</code>')
      expect(formattedContent).toContain('<br>')
    })

    it('应该正确格式化树形结构', () => {
      const formattedContent = wrapper.vm.formattedPrompt
      expect(formattedContent).toContain('<span class="tree-symbol">├─</span>')
      expect(formattedContent).toContain('<span class="tree-symbol">│</span>')
      expect(formattedContent).toContain('<span class="tree-symbol">└─</span>')
    })

    it('应该切换到原始内容', async () => {
      const formatButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('格式化')
      )
      await formatButton.trigger('click')
      
      expect(wrapper.vm.showFormatted).toBe(false)
      expect(wrapper.find('.raw-content').exists()).toBe(true)
      expect(wrapper.find('.formatted-content').exists()).toBe(false)
    })

    it('应该切换回格式化内容', async () => {
      await wrapper.setData({
        showFormatted: false
      })
      
      const formatButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('原始')
      )
      await formatButton.trigger('click')
      
      expect(wrapper.vm.showFormatted).toBe(true)
      expect(wrapper.find('.formatted-content').exists()).toBe(true)
      expect(wrapper.find('.raw-content').exists()).toBe(false)
    })
  })

  describe('使用示例', () => {
    it('应该显示招生规划示例', () => {
      expect(wrapper.vm.examples).toHaveLength(2)
      expect(wrapper.vm.examples[0].title).toBe('制定招生目标')
      expect(wrapper.vm.examples[0].content).toBe('我们幼儿园今年应该设定多少招生目标？')
      expect(wrapper.vm.examples[1].title).toBe('分析市场环境')
      expect(wrapper.vm.examples[1].content).toBe('分析一下当前的招生市场环境和竞争情况')
    })

    it('应该显示示例列表', () => {
      expect(wrapper.find('.usage-examples').exists()).toBe(true)
      expect(wrapper.text()).toContain('使用示例')
      expect(wrapper.text()).toContain('制定招生目标')
      expect(wrapper.text()).toContain('分析市场环境')
    })

    it('应该正确显示不同分类的示例', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          category: 'activity_planning'
        }
      })
      
      expect(wrapper.vm.examples).toHaveLength(2)
      expect(wrapper.vm.examples[0].title).toBe('春季招生活动')
      expect(wrapper.vm.examples[0].content).toBe('帮我规划一下春季的招生活动方案')
    })

    it('应该处理无示例的情况', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          category: 'unknown_category'
        }
      })
      
      expect(wrapper.vm.examples).toHaveLength(0)
      expect(wrapper.find('.usage-examples').exists()).toBe(false)
    })
  })

  describe('用户交互', () => {
    it('应该复制提示词内容', async () => {
      const copyButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('复制')
      )
      await copyButton.trigger('click')
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPromptData.system_prompt)
      expect(ElMessage.success).toHaveBeenCalledWith('提示词已复制到剪贴板')
    })

    it('应该处理复制失败', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('复制失败'))
      
      const copyButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('复制')
      )
      await copyButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('复制失败')
    })

    it('应该测试提示词', async () => {
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      expect(wrapper.vm.testing).toBe(true)
      expect(executeShortcut).toHaveBeenCalledWith(1, '测试提示词功能')
    })

    it('应该显示测试结果', async () => {
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult).toBeTruthy()
      expect(wrapper.vm.testResult.success).toBe(true)
      expect(wrapper.vm.testResult.content).toBe('测试回复：根据您的需求，我建议制定以下招生计划...')
      expect(wrapper.find('.test-result').exists()).toBe(true)
    })

    it('应该处理测试失败', async () => {
      vi.mocked(executeShortcut).mockRejectedValue(new Error('测试失败'))
      
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult).toBeTruthy()
      expect(wrapper.vm.testResult.success).toBe(false)
      expect(wrapper.vm.testResult.content).toBe('测试失败：测试失败')
      expect(ElMessage.error).toHaveBeenCalledWith('测试失败')
    })

    it('应该运行示例', async () => {
      const exampleItem = wrapper.find('.example-item')
      await exampleItem.trigger('click')
      
      expect(wrapper.vm.testing).toBe(true)
      expect(executeShortcut).toHaveBeenCalledWith(1, '我们幼儿园今年应该设定多少招生目标？')
    })

    it('应该显示示例执行结果', async () => {
      const exampleItem = wrapper.find('.example-item')
      await exampleItem.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult).toBeTruthy()
      expect(wrapper.vm.testResult.success).toBe(true)
      expect(wrapper.vm.testResult.example).toBe('制定招生目标')
      expect(ElMessage.success).toHaveBeenCalledWith('示例"制定招生目标"执行完成')
    })

    it('应该编辑提示词', async () => {
      const editButton = wrapper.findAll('.dialog-footer button').find(btn => 
        btn.text().includes('编辑')
      )
      await editButton.trigger('click')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')[0][0]).toEqual(mockPromptData)
    })

    it('应该关闭对话框', async () => {
      const closeButton = wrapper.findAll('.dialog-footer button').find(btn => 
        btn.text().includes('关闭')
      )
      await closeButton.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
    })
  })

  describe('工具函数', () => {
    it('应该获取正确的分类标签', () => {
      expect(wrapper.vm.getCategoryLabel('enrollment_planning')).toBe('招生规划')
      expect(wrapper.vm.getCategoryLabel('activity_planning')).toBe('活动策划')
      expect(wrapper.vm.getCategoryLabel('progress_analysis')).toBe('进展分析')
      expect(wrapper.vm.getCategoryLabel('unknown')).toBe('unknown')
    })

    it('应该获取正确的角色标签', () => {
      expect(wrapper.vm.getRoleLabel('principal')).toBe('园长')
      expect(wrapper.vm.getRoleLabel('admin')).toBe('管理员')
      expect(wrapper.vm.getRoleLabel('teacher')).toBe('教师')
      expect(wrapper.vm.getRoleLabel('all')).toBe('通用')
      expect(wrapper.vm.getRoleLabel('unknown')).toBe('unknown')
    })

    it('应该获取正确的分类标签类型', () => {
      expect(wrapper.vm.getCategoryTagType('enrollment_planning')).toBe('primary')
      expect(wrapper.vm.getCategoryTagType('activity_planning')).toBe('success')
      expect(wrapper.vm.getCategoryTagType('progress_analysis')).toBe('info')
      expect(wrapper.vm.getCategoryTagType('unknown')).toBe('')
    })

    it('应该获取正确的角色标签类型', () => {
      expect(wrapper.vm.getRoleTagType('principal')).toBe('danger')
      expect(wrapper.vm.getRoleTagType('admin')).toBe('warning')
      expect(wrapper.vm.getRoleTagType('teacher')).toBe('success')
      expect(wrapper.vm.getRoleTagType('all')).toBe('info')
      expect(wrapper.vm.getRoleTagType('unknown')).toBe('')
    })

    it('应该格式化测试结果', () => {
      const testContent = '这是测试结果\n包含**粗体**和*斜体*\n📊 统计数据\n🎯 目标设定'
      const formatted = wrapper.vm.formatTestResult(testContent)
      
      expect(formatted).toContain('<strong>粗体</strong>')
      expect(formatted).toContain('<em>斜体</em>')
      expect(formatted).toContain('<br>')
      expect(formatted).toContain('<span class="emoji">📊</span>')
      expect(formatted).toContain('<span class="emoji">🎯</span>')
    })
  })

  describe('数据监听', () => {
    it('应该在数据变化时重置状态', async () => {
      await wrapper.setData({
        testResult: {
          success: true,
          content: '测试结果'
        },
        showFormatted: false
      })
      
      const newData = {
        ...mockPromptData,
        id: 2
      }
      
      await wrapper.setProps({
        data: newData
      })
      
      expect(wrapper.vm.testResult).toBe(null)
      expect(wrapper.vm.showFormatted).toBe(true)
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕下正确显示', () => {
      // 模拟小屏幕
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.exists()).toBe(true)
      // 检查响应式样式类
      expect(wrapper.html()).toContain('@media')
    })
  })

  describe('错误处理', () => {
    it('应该处理executeShortcut错误', async () => {
      vi.mocked(executeShortcut).mockRejectedValue(new Error('API错误'))
      
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult.success).toBe(false)
      expect(wrapper.vm.testResult.content).toBe('测试失败：API错误')
    })

    it('应该处理executeShortcut返回null', async () => {
      vi.mocked(executeShortcut).mockResolvedValue(null)
      
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult.success).toBe(false)
      expect(wrapper.vm.testResult.content).toBe('测试失败：undefined')
    })

    it('应该处理executeShortcut返回格式错误', async () => {
      vi.mocked(executeShortcut).mockResolvedValue({
        invalid: 'format'
      })
      
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试')
      )
      await testButton.trigger('click')
      
      await nextTick()
      
      expect(wrapper.vm.testResult.success).toBe(false)
      expect(wrapper.vm.testResult.content).toBe('测试失败：undefined')
    })
  })

  describe('边界条件', () => {
    it('应该处理空的提示词内容', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          system_prompt: ''
        }
      })
      
      expect(wrapper.vm.formattedPrompt).toBe('')
    })

    it('应该处理null提示词内容', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          system_prompt: null
        }
      })
      
      expect(wrapper.vm.formattedPrompt).toBe('')
    })

    it('应该处理undefined提示词内容', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          system_prompt: undefined
        }
      })
      
      expect(wrapper.vm.formattedPrompt).toBe('')
    })

    it('应该处理超长提示词内容', async () => {
      const longContent = 'a'.repeat(10000)
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          system_prompt: longContent
        }
      })
      
      expect(wrapper.vm.formattedPrompt).toContain(longContent)
    })

    it('应该处理特殊字符提示词内容', async () => {
      const specialContent = '特殊字符：\n\t\r"\'<>{}[]|\\/~!@#$%^&*()_+-='
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          system_prompt: specialContent
        }
      })
      
      expect(wrapper.vm.formattedPrompt).toContain(specialContent)
    })

    it('应该处理无效的分类和角色', async () => {
      await wrapper.setProps({
        data: {
          ...mockPromptData,
          category: 'invalid_category',
          role: 'invalid_role'
        }
      })
      
      expect(wrapper.vm.getCategoryLabel('invalid_category')).toBe('invalid_category')
      expect(wrapper.vm.getRoleLabel('invalid_role')).toBe('invalid_role')
      expect(wrapper.vm.getCategoryTagType('invalid_category')).toBe('')
      expect(wrapper.vm.getRoleTagType('invalid_role')).toBe('')
    })
  })

  describe('计算属性', () => {
    it('应该正确计算visible属性', () => {
      expect(wrapper.vm.visible).toBe(true)
      
      wrapper.setProps({ modelValue: false })
      expect(wrapper.vm.visible).toBe(false)
    })

    it('应该正确更新modelValue', async () => {
      await wrapper.setData({
        visible: false
      })
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
    })
  })
})