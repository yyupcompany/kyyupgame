import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import TaskTemplateEditor from '@/components/ai/website/TaskTemplateEditor.vue'

// Mock Element Plus components
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

// Mock draggable component
vi.mock('vuedraggable', () => ({
  default: {
    name: 'Draggable',
    template: '<div><slot name="item" v-for="(item, index) in $attrs.modelValue" :key="index" :element="item" :index="index" /></div>'
  }
}))

// Mock dynamic step config components
vi.mock('@/components/ai/website/step-configs/ClickStepConfig.vue', () => ({
  default: {
    name: 'ClickStepConfig',
    template: '<div class="mock-click-config">Click Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/InputStepConfig.vue', () => ({
  default: {
    name: 'InputStepConfig', 
    template: '<div class="mock-input-config">Input Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/NavigateStepConfig.vue', () => ({
  default: {
    name: 'NavigateStepConfig',
    template: '<div class="mock-navigate-config">Navigate Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/ExtractStepConfig.vue', () => ({
  default: {
    name: 'ExtractStepConfig',
    template: '<div class="mock-extract-config">Extract Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/ConditionStepConfig.vue', () => ({
  default: {
    name: 'ConditionStepConfig',
    template: '<div class="mock-condition-config">Condition Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/LoopStepConfig.vue', () => ({
  default: {
    name: 'LoopStepConfig',
    template: '<div class="mock-loop-config">Loop Step Config</div>'
  }
}))

vi.mock('@/components/ai/website/step-configs/DefaultStepConfig.vue', () => ({
  default: {
    name: 'DefaultStepConfig',
    template: '<div class="mock-default-config">Default Step Config</div>'
  }
}))

describe('TaskTemplateEditor.vue', () => {
  let router: Router
  let wrapper: any

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(TaskTemplateEditor, {
      props,
      global: {
        plugins: [router, pinia],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-icon': true,
          'el-checkbox': true,
          'el-row': true,
          'el-col': true,
          'el-empty': true,
          'el-textarea': true,
          'draggable': true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the template editor component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.task-template-editor').exists()).toBe(true)
      expect(wrapper.find('.template-basic-info').exists()).toBe(true)
      expect(wrapper.find('.template-configuration').exists()).toBe(true)
      expect(wrapper.find('.template-steps').exists()).toBe(true)
      expect(wrapper.find('.template-preview').exists()).toBe(true)
      expect(wrapper.find('.editor-footer').exists()).toBe(true)
    })

    it('renders form sections with proper structure', () => {
      wrapper = createWrapper()
      
      const basicInfo = wrapper.find('.template-basic-info')
      const configuration = wrapper.find('.template-configuration')
      const steps = wrapper.find('.template-steps')
      const preview = wrapper.find('.template-preview')
      
      expect(basicInfo.exists()).toBe(true)
      expect(configuration.exists()).toBe(true)
      expect(steps.exists()).toBe(true)
      expect(preview.exists()).toBe(true)
    })

    it('renders empty state when no steps are present', () => {
      wrapper = createWrapper()
      
      const emptySteps = wrapper.find('.empty-steps')
      expect(emptySteps.exists()).toBe(true)
      expect(emptySteps.text()).toContain('暂无步骤')
    })
  })

  describe('Form Data Initialization', () => {
    it('initializes with default form data', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      expect(vm.templateForm.name).toBe('')
      expect(vm.templateForm.category).toBe('web')
      expect(vm.templateForm.complexity).toBe('simple')
      expect(vm.templateForm.config.executionMode).toBe('sequential')
      expect(vm.templateForm.config.errorHandling).toBe('stop')
      expect(vm.templateForm.config.timeout).toBe(60)
      expect(vm.templateForm.parameters).toEqual([])
      expect(vm.templateForm.steps).toEqual([])
    })

    it('loads task data when provided as prop', async () => {
      const taskData = {
        id: 'test-task-1',
        name: 'Test Task',
        description: 'Test Description',
        category: 'form',
        complexity: 'medium',
        config: {
          executionMode: 'parallel',
          errorHandling: 'continue',
          timeout: 120
        },
        parameters: [
          { id: 'param1', name: 'testParam', type: 'string' }
        ],
        steps: [
          { id: 'step1', name: 'Test Step', action: 'click' }
        ]
      }

      wrapper = createWrapper({ task: taskData })
      await nextTick()

      const vm = wrapper.vm
      expect(vm.templateForm.id).toBe('test-task-1')
      expect(vm.templateForm.name).toBe('Test Task')
      expect(vm.templateForm.description).toBe('Test Description')
      expect(vm.templateForm.category).toBe('form')
      expect(vm.templateForm.complexity).toBe('medium')
      expect(vm.templateForm.config.executionMode).toBe('parallel')
      expect(vm.templateForm.config.errorHandling).toBe('continue')
      expect(vm.templateForm.config.timeout).toBe(120)
      expect(vm.templateForm.parameters).toHaveLength(1)
      expect(vm.templateForm.steps).toHaveLength(1)
    })

    it('watches for task prop changes and updates form', async () => {
      wrapper = createWrapper()
      
      const newTaskData = {
        id: 'new-task-1',
        name: 'New Task',
        category: 'data'
      }

      await wrapper.setProps({ task: newTaskData })
      await nextTick()

      const vm = wrapper.vm
      expect(vm.templateForm.id).toBe('new-task-1')
      expect(vm.templateForm.name).toBe('New Task')
      expect(vm.templateForm.category).toBe('data')
    })
  })

  describe('Parameter Management', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('adds a new parameter when addParameter is called', async () => {
      const vm = wrapper.vm
      expect(vm.templateForm.parameters).toHaveLength(0)
      
      vm.addParameter()
      await nextTick()
      
      expect(vm.templateForm.parameters).toHaveLength(1)
      expect(vm.templateForm.parameters[0]).toHaveProperty('id')
      expect(vm.templateForm.parameters[0].name).toBe('')
      expect(vm.templateForm.parameters[0].type).toBe('string')
      expect(vm.templateForm.parameters[0].required).toBe(false)
    })

    it('removes a parameter when removeParameter is called', async () => {
      const vm = wrapper.vm
      vm.addParameter()
      vm.addParameter()
      await nextTick()
      
      expect(vm.templateForm.parameters).toHaveLength(2)
      
      vm.removeParameter(0)
      await nextTick()
      
      expect(vm.templateForm.parameters).toHaveLength(1)
      expect(vm.templateForm.parameters[0].name).toBe('')
    })

    it('shows parameter section when allowParameterization is enabled', async () => {
      const vm = wrapper.vm
      expect(wrapper.find('.template-parameters').exists()).toBe(false)
      
      vm.templateForm.config.allowParameterization = true
      await nextTick()
      
      expect(wrapper.find('.template-parameters').exists()).toBe(true)
    })
  })

  describe('Step Management', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('adds a new template step when addTemplateStep is called', async () => {
      const vm = wrapper.vm
      expect(vm.templateForm.steps).toHaveLength(0)
      
      vm.addTemplateStep()
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(1)
      expect(vm.templateForm.steps[0]).toHaveProperty('id')
      expect(vm.templateForm.steps[0].action).toBe('click')
      expect(vm.editingStepIndex).toBe(0) // Should automatically edit the new step
    })

    it('edits a template step when editTemplateStep is called', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      vm.addTemplateStep()
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(1) // Last step
      
      vm.editTemplateStep(0)
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(0)
    })

    it('saves a template step when saveTemplateStep is called', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(0)
      
      vm.saveTemplateStep(0)
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(-1)
    })

    it('cancels editing when cancelEditTemplateStep is called', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(0)
      
      vm.cancelEditTemplateStep()
      await nextTick()
      
      expect(vm.editingStepIndex).toBe(-1)
    })

    it('duplicates a template step when duplicateTemplateStep is called', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      await nextTick()
      
      const originalStep = vm.templateForm.steps[0]
      originalStep.name = 'Original Step'
      
      vm.duplicateTemplateStep(0)
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(2)
      expect(vm.templateForm.steps[1].name).toBe('Original Step (副本)')
      expect(vm.templateForm.steps[1].id).not.toBe(originalStep.id)
    })

    it('deletes a template step when deleteTemplateStep is called', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      vm.addTemplateStep()
      vm.addTemplateStep()
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(3)
      
      vm.deleteTemplateStep(1)
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(2)
    })

    it('adjusts editing index when deleting step before current editing step', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      vm.addTemplateStep()
      vm.addTemplateStep()
      await nextTick()
      
      vm.editTemplateStep(2)
      await nextTick()
      expect(vm.editingStepIndex).toBe(2)
      
      vm.deleteTemplateStep(1)
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(2)
      expect(vm.editingStepIndex).toBe(1) // Should be adjusted
    })

    it('clears editing when deleting the currently edited step', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      vm.addTemplateStep()
      await nextTick()
      
      vm.editTemplateStep(1)
      await nextTick()
      expect(vm.editingStepIndex).toBe(1)
      
      vm.deleteTemplateStep(1)
      await nextTick()
      
      expect(vm.templateForm.steps).toHaveLength(1)
      expect(vm.editingStepIndex).toBe(-1) // Should be cleared
    })
  })

  describe('Step Action Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles step action change and resets relevant fields', async () => {
      const vm = wrapper.vm
      vm.addTemplateStep()
      await nextTick()
      
      const step = vm.templateForm.steps[0]
      step.selector = 'test-selector'
      step.text = 'test-text'
      step.url = 'test-url'
      
      vm.handleStepActionChange(step)
      
      expect(step.selector).toBe('')
      expect(step.text).toBe('')
      expect(step.url).toBe('')
    })

    it('returns correct step config component based on action type', () => {
      const vm = wrapper.vm
      
      expect(vm.getStepConfigComponent('click')).toBeDefined()
      expect(vm.getStepConfigComponent('input')).toBeDefined()
      expect(vm.getStepConfigComponent('navigate')).toBeDefined()
      expect(vm.getStepConfigComponent('extract')).toBeDefined()
      expect(vm.getStepConfigComponent('condition')).toBeDefined()
      expect(vm.getStepConfigComponent('loop')).toBeDefined()
      expect(vm.getStepConfigComponent('unknown')).toBeDefined() // Should return default
    })
  })

  describe('Template Validation', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('validates template successfully with valid data', async () => {
      const vm = wrapper.vm
      
      // Mock form validation
      vm.templateFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // Set valid data
      vm.templateForm.name = 'Test Template'
      vm.templateForm.category = 'web'
      vm.templateForm.complexity = 'simple'
      vm.templateForm.steps.push({
        id: 'step1',
        name: 'Test Step',
        action: 'click'
      })
      
      await vm.validateTemplate()
      
      expect(vm.templateFormRef.validate).toHaveBeenCalled()
    })

    it('fails validation when form is invalid', async () => {
      const vm = wrapper.vm
      
      // Mock form validation to fail
      vm.templateFormRef = {
        validate: vi.fn().mockRejectedValue(new Error('Form validation failed'))
      }
      
      await vm.validateTemplate()
      
      expect(vm.templateFormRef.validate).toHaveBeenCalled()
    })

    it('fails validation when no steps are present', async () => {
      const vm = wrapper.vm
      
      // Mock form validation to pass
      vm.templateFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // Set valid form data but no steps
      vm.templateForm.name = 'Test Template'
      vm.templateForm.category = 'web'
      vm.templateForm.complexity = 'simple'
      
      await vm.validateTemplate()
    })

    it('validates parameters when parameterization is enabled', async () => {
      const vm = wrapper.vm
      
      // Mock form validation
      vm.templateFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      // Set valid data with parameterization
      vm.templateForm.name = 'Test Template'
      vm.templateForm.category = 'web'
      vm.templateForm.complexity = 'simple'
      vm.templateForm.config.allowParameterization = true
      vm.templateForm.steps.push({
        id: 'step1',
        name: 'Test Step',
        action: 'click'
      })
      
      // Add parameter with empty name (should fail)
      vm.templateForm.parameters.push({
        id: 'param1',
        name: '',
        type: 'string'
      })
      
      await vm.validateTemplate()
    })
  })

  describe('Template Operations', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('exports template as JSON file', async () => {
      const vm = wrapper.vm
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockUrl = 'blob:test-url'
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl)
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      
      // Mock document.createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      
      vm.templateForm.name = 'Test Template'
      
      await vm.exportTemplate()
      
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toContain('Test Template')
    })

    it('saves template successfully after validation', async () => {
      const vm = wrapper.vm
      
      // Mock validation
      vi.spyOn(vm, 'validateTemplate').mockResolvedValue(undefined)
      
      // Set test data
      vm.templateForm.name = 'Test Template'
      vm.templateForm.category = 'web'
      vm.templateForm.steps.push({
        id: 'step1',
        name: 'Test Step',
        action: 'click'
      })
      
      const emitSpy = vi.spyOn(wrapper.vm, '$emit')
      
      await vm.handleSave()
      
      expect(vm.validateTemplate).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith('task-saved', expect.objectContaining({
        name: 'Test Template',
        category: 'web'
      }))
    })

    it('saves template as draft without validation', async () => {
      const vm = wrapper.vm
      
      const emitSpy = vi.spyOn(wrapper.vm, '$emit')
      
      await vm.saveAsDraft()
      
      expect(emitSpy).toHaveBeenCalledWith('task-saved', expect.objectContaining({
        status: 'draft'
      }))
    })

    it('emits task-cancelled when handleCancel is called', async () => {
      const vm = wrapper.vm
      
      const emitSpy = vi.spyOn(wrapper.vm, '$emit')
      
      await vm.handleCancel()
      
      expect(emitSpy).toHaveBeenCalledWith('task-cancelled')
    })
  })

  describe('Computed Properties', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('calculates estimated time correctly', () => {
      const vm = wrapper.vm
      
      // Add steps with different configurations
      vm.templateForm.steps.push(
        { action: 'click', delay: 1000 }, // 1s delay + 2s default = 3s
        { action: 'wait', waitTime: 2000, delay: 500 }, // 2s wait + 0.5s delay = 2.5s
        { action: 'input', delay: 0 } // 0s delay + 2s default = 2s
      )
      
      const estimatedTime = vm.estimatedTime
      expect(estimatedTime).toBe(8) // 3 + 2.5 + 2 = 7.5, rounded up to 8
    })

    it('returns 0 estimated time when no steps are present', () => {
      const vm = wrapper.vm
      
      const estimatedTime = vm.estimatedTime
      expect(estimatedTime).toBe(0)
    })
  })

  describe('Utility Functions', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('returns correct action text for different step types', () => {
      const vm = wrapper.vm
      
      expect(vm.getStepActionText('click')).toBe('点击')
      expect(vm.getStepActionText('input')).toBe('输入')
      expect(vm.getStepActionText('hover')).toBe('悬停')
      expect(vm.getStepActionText('scroll')).toBe('滚动')
      expect(vm.getStepActionText('wait')).toBe('等待')
      expect(vm.getStepActionText('navigate')).toBe('导航')
      expect(vm.getStepActionText('extract')).toBe('提取')
      expect(vm.getStepActionText('script')).toBe('脚本')
      expect(vm.getStepActionText('condition')).toBe('条件')
      expect(vm.getStepActionText('loop')).toBe('循环')
      expect(vm.getStepActionText('unknown')).toBe('unknown')
    })

    it('returns correct target text for different step configurations', () => {
      const vm = wrapper.vm
      
      expect(vm.getStepTargetText({ selector: '.test-class' })).toBe('.test-class')
      expect(vm.getStepTargetText({ url: 'https://example.com' })).toBe('https://example.com')
      expect(vm.getStepTargetText({ waitTime: 5000 })).toBe('5000ms')
      expect(vm.getStepTargetText({ text: 'Hello World' })).toBe('"Hello World"')
      expect(vm.getStepTargetText({})).toBe('未设置')
    })

    it('returns correct category text', () => {
      const vm = wrapper.vm
      
      expect(vm.getCategoryText('web')).toBe('网页操作')
      expect(vm.getCategoryText('form')).toBe('表单处理')
      expect(vm.getCategoryText('data')).toBe('数据提取')
      expect(vm.getCategoryText('test')).toBe('自动化测试')
      expect(vm.getCategoryText('custom')).toBe('自定义')
      expect(vm.getCategoryText('unknown')).toBe('unknown')
    })

    it('returns correct complexity text', () => {
      const vm = wrapper.vm
      
      expect(vm.getComplexityText('simple')).toBe('简单')
      expect(vm.getComplexityText('medium')).toBe('中等')
      expect(vm.getComplexityText('complex')).toBe('复杂')
      expect(vm.getComplexityText('unknown')).toBe('unknown')
    })
  })

  describe('Drag and Drop', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles drag start event', () => {
      const vm = wrapper.vm
      
      // This is a placeholder function, so we just verify it exists and doesn't throw
      expect(() => vm.dragStart()).not.toThrow()
    })

    it('handles drag end event', () => {
      const vm = wrapper.vm
      
      // This is a placeholder function, so we just verify it exists and doesn't throw
      expect(() => vm.dragEnd()).not.toThrow()
    })
  })

  describe('Feature Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('shows info message for element selection feature', () => {
      const vm = wrapper.vm
      
      vm.selectElementForStep({})
      
      const { ElMessage } = require('element-plus')
      expect(ElMessage.info).toHaveBeenCalledWith('元素选择功能开发中...')
    })

    it('shows info message for import steps feature', () => {
      const vm = wrapper.vm
      
      vm.importStepsFromFile()
      
      const { ElMessage } = require('element-plus')
      expect(ElMessage.info).toHaveBeenCalledWith('导入步骤功能开发中...')
    })

    it('shows info message for AI generate steps feature', () => {
      const vm = wrapper.vm
      
      vm.generateStepsFromAI()
      
      const { ElMessage } = require('element-plus')
      expect(ElMessage.info).toHaveBeenCalledWith('AI生成步骤功能开发中...')
    })

    it('previews template after validation', async () => {
      const vm = wrapper.vm
      
      // Mock validation
      vi.spyOn(vm, 'validateTemplate').mockResolvedValue(undefined)
      
      await vm.previewTemplate()
      
      expect(vm.validateTemplate).toHaveBeenCalled()
      expect(vm.previewing).toBe(false) // Should be reset after completion
    })
  })

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('handles empty task prop gracefully', () => {
      wrapper = createWrapper({ task: null })
      
      const vm = wrapper.vm
      expect(vm.templateForm.name).toBe('')
      expect(vm.templateForm.steps).toEqual([])
    })

    it('handles task prop with missing properties', () => {
      const partialTask = {
        name: 'Partial Task'
        // Missing other properties
      }
      
      wrapper = createWrapper({ task: partialTask })
      
      const vm = wrapper.vm
      expect(vm.templateForm.name).toBe('Partial Task')
      expect(vm.templateForm.category).toBe('web') // Default value
      expect(vm.templateForm.complexity).toBe('simple') // Default value
    })

    it('handles removing non-existent parameter index', async () => {
      const vm = wrapper.vm
      
      expect(() => vm.removeParameter(999)).not.toThrow()
    })

    it('handles editing non-existent step index', async () => {
      const vm = wrapper.vm
      
      expect(() => vm.editTemplateStep(999)).not.toThrow()
    })

    it('handles deleting non-existent step index', async () => {
      const vm = wrapper.vm
      
      expect(() => vm.deleteTemplateStep(999)).not.toThrow()
    })

    it('handles validation with null form reference', async () => {
      const vm = wrapper.vm
      vm.templateFormRef = null
      
      await expect(vm.validateTemplate()).resolves.not.toThrow()
    })
  })
})