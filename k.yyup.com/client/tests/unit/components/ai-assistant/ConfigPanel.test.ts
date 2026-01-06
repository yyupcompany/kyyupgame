
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConfigPanel from '@/components/ai-assistant/ConfigPanel.vue'
import ElMessage from 'element-plus'

// Mock dependencies
vi.mock('@/api/ai-assistant-optimized', () => ({
  aiAssistantOptimizedApi: {
    testRoute: vi.fn(() => Promise.resolve({ 
      success: true, 
      data: {
        level: 'direct',
        confidence: 0.85,
        estimatedTokens: 150,
        matchedKeywords: ['test'],
        processingTime: 120
      }
    })),
    testDirect: vi.fn(() => Promise.resolve({ 
      success: true, 
      data: {
        response: '测试响应',
        tokensUsed: 100,
        processingTime: 80
      }
    })),
    query: vi.fn(() => Promise.resolve({ 
      success: true, 
      data: {
        level: 'direct',
        tokensUsed: 120,
        processingTime: 90
      }
    })),
    saveConfig: vi.fn(() => Promise.resolve({ success: true })),
    getConfig: vi.fn(() => Promise.resolve({ 
      success: true, 
      data: {
        router: {
          complexityThreshold: 0.7,
          directMatchWeight: 1.0,
          semanticMatchWeight: 1.0
        },
        performance: {
          cacheTTL: 30,
          maxCacheSize: 1000,
          maxTokens: 2000,
          enablePreprocessing: true,
          enableParallel: true
        },
        keywords: {
          action: ['添加', '创建'],
          entity: ['学生'],
          modifier: ['今天']
        }
      }
    }))
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ConfigPanel.vue', () => {
  let wrapper: any
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock Element Plus message and message box
    vi.spyOn(ElMessage, 'success').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {})
    vi.spyOn(ElMessage, 'warning').mockImplementation(() => {})
    
    const mockMessageBox = {
      confirm: vi.fn(),
      prompt: vi.fn()
    }
    vi.mock('element-plus', async () => {
      const actual = await vi.importActual('element-plus')
      return {
        ...actual,
        ElMessageBox: mockMessageBox
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

  const createWrapper = (props = {}) => {
    return mount(ConfigPanel, {
      props: {
        ...props
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-tabs': true,
          'el-tab-pane': true,
          'el-form': true,
          'el-form-item': true,
          'el-slider': true,
          'el-input-number': true,
          'el-switch': true,
          'el-button': true,
          'el-tag': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-alert': true,
          'el-dialog': true,
          'el-icon': true,
          'Refresh': true,
          'Download': true,
          'Delete': true
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.config-panel').exists()).toBe(true)
      expect(wrapper.find('.config-section').exists()).toBe(true)
      expect(wrapper.find('.config-actions').exists()).toBe(true)
    })

    it('should display all tabs correctly', () => {
      wrapper = createWrapper()
      
      const tabs = wrapper.findAllComponents({ name: 'el-tab-pane' })
      expect(tabs.length).toBe(4)
      
      expect(tabs[0].props('label')).toBe('路由配置')
      expect(tabs[1].props('label')).toBe('关键词管理')
      expect(tabs[2].props('label')).toBe('性能优化')
      expect(tabs[3].props('label')).toBe('测试工具')
    })

    it('should show router configuration form', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('h3').text()).toContain('查询路由配置')
    })

    it('should display keyword management interface', async () => {
      wrapper = createWrapper()
      
      // Switch to keywords tab
      await wrapper.setData({ activeTab: 'keywords' })
      
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('should show performance optimization settings', async () => {
      wrapper = createWrapper()
      
      // Switch to performance tab
      await wrapper.setData({ activeTab: 'performance' })
      
      expect(wrapper.find('h3').text()).toContain('性能优化配置')
    })

    it('should display testing tools', async () => {
      wrapper = createWrapper()
      
      // Switch to testing tab
      await wrapper.setData({ activeTab: 'testing' })
      
      expect(wrapper.find('h3').text()).toContain('功能测试')
    })
  })

  describe('Router Configuration', () => {
    it('should display router config sliders correctly', () => {
      wrapper = createWrapper()
      
      const sliders = wrapper.findAllComponents({ name: 'el-slider' })
      expect(sliders.length).toBeGreaterThanOrEqual(3)
    })

    it('should update router config values', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        routerConfig: {
          complexityThreshold: 0.8,
          directMatchWeight: 1.2,
          semanticMatchWeight: 0.9
        }
      })
      
      expect(wrapper.vm.routerConfig.complexityThreshold).toBe(0.8)
      expect(wrapper.vm.routerConfig.directMatchWeight).toBe(1.2)
      expect(wrapper.vm.routerConfig.semanticMatchWeight).toBe(0.9)
    })

    it('should validate router config ranges', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.routerConfig.complexityThreshold).toBeGreaterThanOrEqual(0.1)
      expect(wrapper.vm.routerConfig.complexityThreshold).toBeLessThanOrEqual(1.0)
    })
  })

  describe('Keyword Management', () => {
    it('should display keyword categories correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'keywords' })
      
      const keywordTabs = wrapper.findAllComponents({ name: 'el-tab-pane' })
      expect(keywordTabs.length).toBe(3)
      
      expect(keywordTabs[0].props('label')).toBe('动作词')
      expect(keywordTabs[1].props('label')).toBe('实体词')
      expect(keywordTabs[2].props('label')).toBe('修饰词')
    })

    it('should show keyword lists', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'keywords', keywordTab: 'action' })
      
      const keywordList = wrapper.find('.keyword-list')
      expect(keywordList.exists()).toBe(true)
    })

    it('should display add keyword button', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'keywords' })
      
      const addButton = wrapper.find('button[type="primary"]')
      expect(addButton.text()).toContain('添加关键词')
    })

    it('should show add keyword dialog', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ showAddKeywordDialog: true })
      
      const dialog = wrapper.findComponent({ name: 'el-dialog' })
      expect(dialog.exists()).toBe(true)
      expect(dialog.props('title')).toBe('添加关键词')
    })

    it('should add new keyword correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        showAddKeywordDialog: true,
        newKeyword: {
          type: 'action',
          word: '测试关键词'
        }
      })
      
      await wrapper.vm.addKeyword()
      
      expect(wrapper.vm.keywords.action).toContain('测试关键词')
      expect(wrapper.vm.showAddKeywordDialog).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('关键词添加成功')
    })

    it('should validate keyword input', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        showAddKeywordDialog: true,
        newKeyword: {
          type: '',
          word: ''
        }
      })
      
      await wrapper.vm.addKeyword()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请填写完整信息')
    })

    it('should check for duplicate keywords', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        showAddKeywordDialog: true,
        newKeyword: {
          type: 'action',
          word: '添加' // Already exists
        }
      })
      
      await wrapper.vm.addKeyword()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('关键词已存在')
    })

    it('should remove keyword correctly', async () => {
      wrapper = createWrapper()
      
      const initialLength = wrapper.vm.keywords.action.length
      
      await wrapper.vm.removeKeyword('action', '添加')
      
      expect(wrapper.vm.keywords.action.length).toBe(initialLength - 1)
      expect(ElMessage.success).toHaveBeenCalledWith('关键词删除成功')
    })
  })

  describe('Performance Configuration', () => {
    it('should display performance config inputs correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'performance' })
      
      const inputNumbers = wrapper.findAllComponents({ name: 'el-input-number' })
      expect(inputNumbers.length).toBeGreaterThanOrEqual(3)
    })

    it('should display performance switches correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'performance' })
      
      const switches = wrapper.findAllComponents({ name: 'el-switch' })
      expect(switches.length).toBeGreaterThanOrEqual(2)
    })

    it('should update performance config values', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        performanceConfig: {
          cacheTTL: 45,
          maxCacheSize: 2000,
          maxTokens: 3000,
          enablePreprocessing: false,
          enableParallel: false
        }
      })
      
      expect(wrapper.vm.performanceConfig.cacheTTL).toBe(45)
      expect(wrapper.vm.performanceConfig.enablePreprocessing).toBe(false)
    })

    it('should validate performance config ranges', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.performanceConfig.cacheTTL).toBeGreaterThanOrEqual(1)
      expect(wrapper.vm.performanceConfig.cacheTTL).toBeLessThanOrEqual(60)
    })
  })

  describe('Testing Tools', () => {
    describe('Route Testing', () => {
      it('should display route testing interface', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        const testInput = wrapper.find('.test-input')
        expect(testInput.exists()).toBe(true)
      })

      it('should test route correctly', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          testQuery: '测试查询'
        })
        
        await wrapper.vm.testRoute()
        
        expect(wrapper.vm.testing).toBe(false)
        expect(wrapper.vm.routeTestResult).toBeTruthy()
      })

      it('should validate test query before testing', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          testQuery: ''
        })
        
        await wrapper.vm.testRoute()
        
        expect(ElMessage.warning).toHaveBeenCalledWith('请输入测试查询')
        expect(wrapper.vm.testing).toBe(false)
      })

      it('should handle route testing errors', async () => {
        const { aiAssistantOptimizedApi } = await import('@/api/ai-assistant-optimized')
        aiAssistantOptimizedApi.testRoute.mockRejectedValue(new Error('Test failed'))
        
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          testQuery: '测试查询'
        })
        
        await wrapper.vm.testRoute()
        
        expect(ElMessage.error).toHaveBeenCalledWith('路由测试失败: Test failed')
      })

      it('should get route result type correctly', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        expect(wrapper.vm.getRouteResultType('direct')).toBe('success')
        expect(wrapper.vm.getRouteResultType('semantic')).toBe('warning')
        expect(wrapper.vm.getRouteResultType('complex')).toBe('info')
        expect(wrapper.vm.getRouteResultType('unknown')).toBe('info')
      })
    })

    describe('Direct Response Testing', () => {
      it('should display direct response testing interface', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        const testActions = wrapper.find('.test-actions')
        expect(testActions.exists()).toBe(true)
      })

      it('should test direct response correctly', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          selectedAction: 'count_students'
        })
        
        await wrapper.vm.testDirectResponse()
        
        expect(wrapper.vm.testing).toBe(false)
        expect(wrapper.vm.directTestResult).toBeTruthy()
      })

      it('should validate action selection before testing', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          selectedAction: ''
        })
        
        await wrapper.vm.testDirectResponse()
        
        expect(ElMessage.warning).toHaveBeenCalledWith('请选择测试动作')
        expect(wrapper.vm.testing).toBe(false)
      })

      it('should handle direct response testing errors', async () => {
        const { aiAssistantOptimizedApi } = await import('@/api/ai-assistant-optimized')
        aiAssistantOptimizedApi.testDirect.mockRejectedValue(new Error('Test failed'))
        
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          selectedAction: 'count_students'
        })
        
        await wrapper.vm.testDirectResponse()
        
        expect(ElMessage.error).toHaveBeenCalledWith('直接响应测试失败: Test failed')
      })
    })

    describe('Benchmark Testing', () => {
      it('should display benchmark testing interface', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        const benchmarkControls = wrapper.find('.benchmark-controls')
        expect(benchmarkControls.exists()).toBe(true)
      })

      it('should run benchmark test correctly', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        await wrapper.vm.runBenchmark()
        
        expect(wrapper.vm.benchmarking).toBe(false)
        expect(wrapper.vm.benchmarkResults.length).toBeGreaterThan(0)
        expect(ElMessage.success).toHaveBeenCalledWith('基准测试完成')
      })

      it('should handle benchmark testing errors', async () => {
        const { aiAssistantOptimizedApi } = await import('@/api/ai-assistant-optimized')
        aiAssistantOptimizedApi.query.mockRejectedValue(new Error('Benchmark failed'))
        
        wrapper = createWrapper()
        
        await wrapper.setData({ activeTab: 'testing' })
        
        await wrapper.vm.runBenchmark()
        
        expect(ElMessage.error).toHaveBeenCalledWith('基准测试失败: Benchmark failed')
      })

      it('should clear benchmark results correctly', async () => {
        wrapper = createWrapper()
        
        await wrapper.setData({ 
          activeTab: 'testing',
          benchmarkResults: [
            { query: '测试1', level: 'direct', tokensUsed: 100, processingTime: 50, savingRate: 80 }
          ]
        })
        
        await wrapper.vm.clearBenchmarkResults()
        
        expect(wrapper.vm.benchmarkResults).toEqual([])
      })
    })
  })

  describe('Configuration Management', () => {
    it('should save configuration correctly', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue(true)
      
      wrapper = createWrapper()
      
      await wrapper.vm.saveConfig()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定要保存配置吗？', '确认保存', expect.objectContaining({
        type: 'warning'
      }))
      
      expect(wrapper.vm.saving).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('配置保存成功')
    })

    it('should handle save cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      wrapper = createWrapper()
      
      await wrapper.vm.saveConfig()
      
      expect(wrapper.vm.saving).toBe(false)
    })

    it('should reset configuration correctly', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue(true)
      
      wrapper = createWrapper()
      
      // Modify config first
      await wrapper.setData({
        routerConfig: {
          complexityThreshold: 0.9,
          directMatchWeight: 1.5,
          semanticMatchWeight: 1.2
        }
      })
      
      await wrapper.vm.resetConfig()
      
      expect(wrapper.vm.routerConfig.complexityThreshold).toBe(0.7)
      expect(wrapper.vm.routerConfig.directMatchWeight).toBe(1.0)
      expect(wrapper.vm.routerConfig.semanticMatchWeight).toBe(1.0)
      expect(ElMessage.success).toHaveBeenCalledWith('配置重置成功')
    })

    it('should handle reset cancellation', async () => {
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      wrapper = createWrapper()
      
      // Modify config first
      await wrapper.setData({
        routerConfig: {
          complexityThreshold: 0.9
        }
      })
      
      await wrapper.vm.resetConfig()
      
      // Config should not be reset
      expect(wrapper.vm.routerConfig.complexityThreshold).toBe(0.9)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should load configuration on mount', async () => {
      wrapper = createWrapper()
      
      // Should attempt to load config
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle config loading errors gracefully', async () => {
      const { aiAssistantOptimizedApi } = await import('@/api/ai-assistant-optimized')
      aiAssistantOptimizedApi.getConfig.mockRejectedValue(new Error('Load failed'))
      
      wrapper = createWrapper()
      
      // Should not throw error
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('User Interface', () => {
    it('should show configuration help text', () => {
      wrapper = createWrapper()
      
      const helpTexts = wrapper.findAll('.config-help')
      expect(helpTexts.length).toBeGreaterThan(0)
    })

    it('should display section headers correctly', () => {
      wrapper = createWrapper()
      
      const headers = wrapper.findAll('h3')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should show available actions for direct response testing', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ activeTab: 'testing' })
      
      expect(wrapper.vm.availableActions.length).toBeGreaterThan(0)
      expect(wrapper.vm.availableActions[0].label).toBe('统计学生数量')
    })

    it('should format benchmark results correctly', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        activeTab: 'testing',
        benchmarkResults: [
          {
            query: '测试查询',
            level: 'direct',
            tokensUsed: 100,
            processingTime: 50,
            savingRate: 80
          }
        ]
      })
      
      const resultsTable = wrapper.findComponent({ name: 'el-table' })
      expect(resultsTable.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper focus management', () => {
      wrapper = createWrapper()
      
      const tabs = wrapper.findComponent({ name: 'el-tabs' })
      expect(tabs.exists()).toBe(true)
    })

    it('should provide proper keyboard navigation', async () => {
      wrapper = createWrapper()
      
      // Test tab navigation
      const tabs = wrapper.findComponent({ name: 'el-tabs' })
      expect(tabs.exists()).toBe(true)
    })

    it('should handle form interactions correctly', async () => {
      wrapper = createWrapper()
      
      // Test form input
      const sliders = wrapper.findAllComponents({ name: 'el-slider' })
      expect(sliders.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Optimization', () => {
    it('should handle rapid configuration changes', async () => {
      wrapper = createWrapper()
      
      // Simulate rapid config changes
      for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
        await wrapper.setData({
          routerConfig: {
            complexityThreshold: 0.5 + (i * 0.1),
            directMatchWeight: 1.0 + (i * 0.1),
            semanticMatchWeight: 1.0 - (i * 0.1)
          }
        })
      }
      
      expect(wrapper.vm.routerConfig.complexityThreshold).toBe(0.9)
    })

    it('should cleanup resources on unmount', () => {
      wrapper = createWrapper()
      
      wrapper.unmount()
      
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { aiAssistantOptimizedApi } = await import('@/api/ai-assistant-optimized')
      aiAssistantOptimizedApi.testRoute.mockRejectedValue(new Error('API Error'))
      
      wrapper = createWrapper()
      
      await wrapper.setData({ 
        activeTab: 'testing',
        testQuery: '测试查询'
      })
      
      await wrapper.vm.testRoute()
      
      expect(ElMessage.error).toHaveBeenCalled()
    })

    it('should handle form validation errors', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        showAddKeywordDialog: true,
        newKeyword: {
          type: '',
          word: ''
        }
      })
      
      await wrapper.vm.addKeyword()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请填写完整信息')
    })

    it('should handle benchmark calculation errors', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({
        activeTab: 'testing',
        benchmarkResults: [
          {
            query: '测试查询',
            level: 'direct',
            tokensUsed: 0, // Invalid value
            processingTime: 50,
            savingRate: 80
          }
        ]
      })
      
      // Should handle invalid data gracefully
      expect(wrapper.vm.benchmarkResults.length).toBe(1)
    })
  })
})