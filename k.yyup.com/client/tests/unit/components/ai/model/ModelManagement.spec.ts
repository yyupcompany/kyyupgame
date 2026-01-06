import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModelManagement from '@/components/ai/model/ModelManagement.vue'
import * as aiModelApi from '@/api/ai-model'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock AI model API
vi.mock('@/api/ai-model', () => ({
  getModels: vi.fn(),
  getModelBilling: vi.fn(),
  createModel: vi.fn(),
  updateModel: vi.fn(),
  deleteModel: vi.fn(),
  setDefaultModel: vi.fn(),
  toggleModelStatus: vi.fn()
}))

// Mock models data
const mockModels = [
  {
    id: 1,
    name: 'gpt-4',
    displayName: 'GPT-4',
    provider: 'openai',
    modelType: 'text',
    apiVersion: 'v1',
    endpointUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-xxx',
    modelParameters: {},
    isActive: true,
    isDefault: true,
    stats: {
      callCount: 100,
      totalTokens: 50000
    }
  },
  {
    id: 2,
    name: 'claude-3',
    displayName: 'Claude-3',
    provider: 'anthropic',
    modelType: 'text',
    apiVersion: 'v1',
    endpointUrl: 'https://api.anthropic.com/v1/messages',
    apiKey: 'sk-xxx',
    modelParameters: {},
    isActive: false,
    isDefault: false,
    stats: {
      callCount: 50,
      totalTokens: 25000
    }
  }
]

// 控制台错误检测变量
let consoleSpy: any

describe('ModelManagement.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // Mock successful API responses
    vi.mocked(aiModelApi.getModels).mockResolvedValue(mockModels)
    vi.mocked(aiModelApi.getModelBilling).mockResolvedValue({
      callCount: 100,
      totalTokens: 50000,
      inputTokens: 25000,
      outputTokens: 25000,
      totalCost: 10.0,
      inputTokenPrice: 0.0001,
      outputTokenPrice: 0.0002,
      pricePerMillionTokens: 100,
      currency: 'USD',
      hasCustomPricing: false
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(aiModelApi.createModel).mockResolvedValue({ id: 3, ...mockModels[0] })
    vi.mocked(aiModelApi.updateModel).mockResolvedValue({ success: true })
    vi.mocked(aiModelApi.deleteModel).mockResolvedValue({ success: true })
    vi.mocked(aiModelApi.setDefaultModel).mockResolvedValue({ success: true })
    vi.mocked(aiModelApi.toggleModelStatus).mockResolvedValue({ success: true })
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)

    wrapper = mount(ModelManagement, {
      global: {
        stubs: {
          'el-icon': true,
          'el-row': true,
          'el-col': true,
          'el-button': true,
          'el-card': true,
          'el-table': true,
          'el-table-column': true,
          'el-switch': true,
          'el-tag': true,
          'el-drawer': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
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
      expect(wrapper.find('.model-management').exists()).toBe(true)
    })

    it('应该显示页面标题', () => {
      expect(wrapper.text()).toContain('AI模型管理')
    })

    it('应该显示添加模型和刷新按钮', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('添加模型')
      expect(wrapper.text()).toContain('刷新')
    })

    it('应该显示模型列表', async () => {
      await nextTick()
      expect(wrapper.vm.models).toHaveLength(2)
      expect(wrapper.vm.models[0].name).toBe('gpt-4')
      expect(wrapper.vm.models[1].name).toBe('claude-3')
    })
  })

  describe('数据加载', () => {
    it('应该在组件挂载时获取模型列表', async () => {
      await nextTick()
      expect(aiModelApi.getModels).toHaveBeenCalled()
    })

    it('应该获取每个模型的计费信息', async () => {
      await nextTick()
      expect(aiModelApi.getModelBilling).toHaveBeenCalledTimes(2)
      expect(aiModelApi.getModelBilling).toHaveBeenCalledWith(1)
      expect(aiModelApi.getModelBilling).toHaveBeenCalledWith(2)
    })

    it('应该处理API错误', async () => {
      vi.mocked(aiModelApi.getModels).mockRejectedValue(new Error('API错误'))
      
      const errorWrapper = mount(ModelManagement, {
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true,
            'el-table': true,
            'el-table-column': true,
            'el-switch': true,
            'el-tag': true,
            'el-drawer': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-collapse': true,
            'el-collapse-item': true
          }
        }
      })
      
      await nextTick()
      expect(ElMessage.error).toHaveBeenCalledWith('获取模型列表失败')
      errorWrapper.unmount()
    })

    it('应该处理计费信息获取失败', async () => {
      vi.mocked(aiModelApi.getModelBilling).mockRejectedValue(new Error('获取计费信息失败'))
      
      const billingErrorWrapper = mount(ModelManagement, {
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true,
            'el-table': true,
            'el-table-column': true,
            'el-switch': true,
            'el-tag': true,
            'el-drawer': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-collapse': true,
            'el-collapse-item': true
          }
        }
      })
      
      await nextTick()
      expect(billingErrorWrapper.vm.models[0].stats).toEqual({
        callCount: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        inputTokenPrice: 0,
        outputTokenPrice: 0,
        pricePerMillionTokens: 0,
        currency: 'USD',
        hasCustomPricing: false
      })
      billingErrorWrapper.unmount()
    })
  })

  describe('用户交互', () => {
    it('应该刷新模型列表', async () => {
      await nextTick()
      
      const refreshButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('刷新')
      )
      await refreshButton.trigger('click')
      
      expect(aiModelApi.getModels).toHaveBeenCalledTimes(2)
    })

    it('应该显示添加模型对话框', async () => {
      await nextTick()
      
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      expect(wrapper.vm.isNewModel).toBe(true)
      expect(wrapper.vm.drawerVisible).toBe(true)
      expect(wrapper.vm.currentModel).toEqual({
        id: 0,
        name: '',
        displayName: '',
        provider: 'openai',
        modelType: 'text',
        apiVersion: '',
        endpointUrl: '',
        apiKey: '',
        modelParameters: {},
        isActive: true,
        isDefault: false
      })
    })

    it('应该显示编辑模型对话框', async () => {
      await nextTick()
      
      const editButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('编辑')
      )
      await editButton.trigger('click')
      
      expect(wrapper.vm.isNewModel).toBe(false)
      expect(wrapper.vm.drawerVisible).toBe(true)
      expect(wrapper.vm.currentModel).toEqual(mockModels[0])
    })

    it('应该处理模型状态切换', async () => {
      await nextTick()
      
      const switchComponent = wrapper.find('el-switch-stub')
      await switchComponent.vm.$emit('change', false)
      
      expect(aiModelApi.toggleModelStatus).toHaveBeenCalledWith(1, false)
      expect(ElMessage.success).toHaveBeenCalledWith('已禁用模型')
    })

    it('应该处理状态切换失败', async () => {
      vi.mocked(aiModelApi.toggleModelStatus).mockRejectedValue(new Error('状态切换失败'))
      
      await nextTick()
      
      const switchComponent = wrapper.find('el-switch-stub')
      await switchComponent.vm.$emit('change', false)
      
      expect(ElMessage.error).toHaveBeenCalledWith('更改模型状态失败')
      // 应该恢复状态
      expect(wrapper.vm.models[0].isActive).toBe(true)
    })
  })

  describe('模型操作', () => {
    it('应该设置默认模型', async () => {
      await nextTick()
      
      const setDefaultButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('设为默认')
      )
      await setDefaultButton.trigger('click')
      
      expect(aiModelApi.setDefaultModel).toHaveBeenCalledWith(2)
      expect(ElMessage.success).toHaveBeenCalledWith('已将 "Claude-3" 设为默认模型')
    })

    it('应该删除模型', async () => {
      await nextTick()
      
      const deleteButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('删除')
      )
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要删除模型 "Claude-3" 吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      expect(aiModelApi.deleteModel).toHaveBeenCalledWith(2)
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })

    it('应该禁止删除默认模型', async () => {
      await nextTick()
      
      // 尝试删除第一个模型（默认模型）
      const deleteButtons = wrapper.findAll('button').filter(btn => 
        btn.text().includes('删除')
      )
      await deleteButtons[0].trigger('click')
      
      expect(ElMessage.warning).toHaveBeenCalledWith('不能删除默认模型')
      expect(aiModelApi.deleteModel).not.toHaveBeenCalled()
    })

    it('应该处理删除取消', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue(false)
      
      await nextTick()
      
      const deleteButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('删除')
      )
      await deleteButton.trigger('click')
      
      expect(aiModelApi.deleteModel).not.toHaveBeenCalled()
    })
  })

  describe('表单处理', () => {
    it('应该创建新模型', async () => {
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 设置表单数据
      await wrapper.setData({
        currentModel: {
          ...wrapper.vm.currentModel,
          name: 'test-model',
          displayName: 'Test Model',
          provider: 'openai',
          modelType: 'text',
          apiVersion: 'v1',
          endpointUrl: 'https://api.test.com/v1',
          apiKey: 'sk-test'
        }
      })
      
      // 提交表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      expect(aiModelApi.createModel).toHaveBeenCalledWith({
        name: 'test-model',
        displayName: 'Test Model',
        provider: 'openai',
        modelType: 'text',
        apiVersion: 'v1',
        endpointUrl: 'https://api.test.com/v1',
        apiKey: 'sk-test',
        modelParameters: {},
        isActive: true,
        isDefault: false
      })
      
      expect(ElMessage.success).toHaveBeenCalledWith('添加模型成功')
    })

    it('应该更新现有模型', async () => {
      await nextTick()
      
      // 打开编辑对话框
      const editButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('编辑')
      )
      await editButton.trigger('click')
      
      // 修改表单数据
      await wrapper.setData({
        currentModel: {
          ...wrapper.vm.currentModel,
          displayName: 'Updated GPT-4'
        }
      })
      
      // 提交表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      expect(aiModelApi.updateModel).toHaveBeenCalledWith(1, {
        name: 'gpt-4',
        displayName: 'Updated GPT-4',
        provider: 'openai',
        modelType: 'text',
        apiVersion: 'v1',
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'sk-xxx',
        modelParameters: {},
        isActive: true,
        isDefault: true
      })
      
      expect(ElMessage.success).toHaveBeenCalledWith('更新模型成功')
    })

    it('应该测试连接', async () => {
      await nextTick()
      
      // 打开编辑对话框
      const editButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('编辑')
      )
      await editButton.trigger('click')
      
      // 点击测试连接按钮
      const testButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('测试连接')
      )
      await testButton.trigger('click')
      
      expect(ElMessage.info).toHaveBeenCalledWith('测试连接中...')
      
      // 等待测试完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      expect(ElMessage.success).toHaveBeenCalledWith('连接成功')
    })

    it('应该处理JSON参数解析', async () => {
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 设置JSON参数
      await wrapper.setData({
        modelParamsJson: '{"temperature": 0.7, "max_tokens": 1000}'
      })
      
      // 触发JSON解析
      await wrapper.vm.watchModelParamsJson()
      
      expect(wrapper.vm.currentModel.modelParameters).toEqual({
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    it('应该处理JSON参数解析错误', async () => {
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 设置无效JSON
      await wrapper.setData({
        modelParamsJson: '{invalid json}'
      })
      
      // 触发JSON解析
      await wrapper.vm.watchModelParamsJson()
      
      expect(ElMessage.error).toHaveBeenCalledWith('JSON格式错误')
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 尝试提交空表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      // 应该显示验证错误
      expect(aiModelApi.createModel).not.toHaveBeenCalled()
    })

    it('应该验证字段长度', async () => {
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 设置过长的名称
      await wrapper.setData({
        currentModel: {
          ...wrapper.vm.currentModel,
          name: 'a'.repeat(51) // 超过50个字符
        }
      })
      
      // 提交表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      // 应该显示验证错误
      expect(aiModelApi.createModel).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理创建模型失败', async () => {
      vi.mocked(aiModelApi.createModel).mockRejectedValue(new Error('创建失败'))
      
      await nextTick()
      
      // 打开添加对话框
      const addButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('添加模型')
      )
      await addButton.trigger('click')
      
      // 设置表单数据
      await wrapper.setData({
        currentModel: {
          ...wrapper.vm.currentModel,
          name: 'test-model',
          displayName: 'Test Model',
          provider: 'openai',
          modelType: 'text',
          apiVersion: 'v1',
          endpointUrl: 'https://api.test.com/v1',
          apiKey: 'sk-test'
        }
      })
      
      // 提交表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('保存模型失败')
    })

    it('应该处理更新模型失败', async () => {
      vi.mocked(aiModelApi.updateModel).mockRejectedValue(new Error('更新失败'))
      
      await nextTick()
      
      // 打开编辑对话框
      const editButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('编辑')
      )
      await editButton.trigger('click')
      
      // 提交表单
      const submitButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('保存')
      )
      await submitButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('保存模型失败')
    })

    it('应该处理设置默认模型失败', async () => {
      vi.mocked(aiModelApi.setDefaultModel).mockRejectedValue(new Error('设置失败'))
      
      await nextTick()
      
      const setDefaultButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('设为默认')
      )
      await setDefaultButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('设置默认模型失败')
    })

    it('应该处理删除模型失败', async () => {
      vi.mocked(aiModelApi.deleteModel).mockRejectedValue(new Error('删除失败'))
      
      await nextTick()
      
      const deleteButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('删除')
      )
      await deleteButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('删除模型失败')
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

  describe('边界条件', () => {
    it('应该处理空模型列表', async () => {
      vi.mocked(aiModelApi.getModels).mockResolvedValue([])
      
      const emptyWrapper = mount(ModelManagement, {
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true,
            'el-table': true,
            'el-table-column': true,
            'el-switch': true,
            'el-tag': true,
            'el-drawer': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-collapse': true,
            'el-collapse-item': true
          }
        }
      })
      
      await nextTick()
      expect(emptyWrapper.vm.models).toHaveLength(0)
      emptyWrapper.unmount()
    })

    it('应该处理模型数据缺失', async () => {
      vi.mocked(aiModelApi.getModels).mockResolvedValue([
        {
          id: 1,
          name: 'test-model'
          // 缺少其他字段
        }
      ])
      
      const incompleteWrapper = mount(ModelManagement, {
        global: {
          stubs: {
            'el-icon': true,
            'el-row': true,
            'el-col': true,
            'el-button': true,
            'el-card': true,
            'el-table': true,
            'el-table-column': true,
            'el-switch': true,
            'el-tag': true,
            'el-drawer': true,
            'el-form': true,
            'el-form-item': true,
            'el-input': true,
            'el-select': true,
            'el-option': true,
            'el-collapse': true,
            'el-collapse-item': true
          }
        }
      })
      
      await nextTick()
      expect(incompleteWrapper.vm.models[0].name).toBe('test-model')
      incompleteWrapper.unmount()
    })
  })
})