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
import TaskEditor from '@/components/ai/website/TaskEditor.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock ElementSelector component
vi.mock('./ElementSelector.vue', () => ({
  default: {
    name: 'ElementSelector',
    template: '<div class="mock-element-selector"></div>'
  }
}))

// Mock draggable
vi.mock('vuedraggable', () => ({
  default: {
    name: 'Draggable',
    template: '<div class="mock-draggable"><slot /></div>'
  }
}))

describe('TaskEditor.vue', () => {
  let wrapper: any

  const mockSelectedElements = [
    { tagName: 'BUTTON', selector: '#submit-btn' },
    { tagName: 'INPUT', selector: '#username-input' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(TaskEditor, {
      props: {
        selectedElements: mockSelectedElements
      }
    })
  })

  it('renders properly with default state', () => {
    expect(wrapper.find('.task-editor').exists()).toBe(true)
    expect(wrapper.find('.task-basic-info').exists()).toBe(true)
    expect(wrapper.find('.task-configuration').exists()).toBe(true)
    expect(wrapper.find('.task-steps-editor').exists()).toBe(true)
    expect(wrapper.find('.task-preview').exists()).toBe(true)
  })

  it('displays task basic information form', () => {
    expect(wrapper.find('.task-basic-info .el-form').exists()).toBe(true)
    
    const nameInput = wrapper.find('.task-basic-info input[placeholder="请输入任务名称"]')
    expect(nameInput.exists()).toBe(true)
    
    const typeSelect = wrapper.find('.task-basic-info .el-select')
    expect(typeSelect.exists()).toBe(true)
  })

  it('displays task configuration form', () => {
    expect(wrapper.find('.task-configuration .el-form').exists()).toBe(true)
    
    // Check timeout configuration
    const timeoutInput = wrapper.find('.task-configuration .el-input-number')
    expect(timeoutInput.exists()).toBe(true)
  })

  it('displays steps editor with header actions', () => {
    const stepsHeader = wrapper.find('.steps-header')
    expect(stepsHeader.exists()).toBe(true)
    expect(stepsHeader.find('h4').text()).toBe('任务步骤')
    
    const addButton = stepsHeader.find('.el-button[type="primary"]')
    expect(addButton.exists()).toBe(true)
    expect(addButton.text()).toContain('添加步骤')
  })

  it('displays empty state when no steps are present', () => {
    expect(wrapper.find('.empty-steps').exists()).toBe(true)
    expect(wrapper.find('.el-empty').exists()).toBe(true)
  })

  it('adds a new step when add button is clicked', async () => {
    const addButton = wrapper.find('.steps-header .el-button[type="primary"]')
    await addButton.trigger('click')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(1)
    expect(wrapper.vm.editingStepIndex).toBe(0) // Should open editor for new step
    expect(wrapper.find('.step-editor').exists()).toBe(true)
  })

  it('adds step from selected elements', async () => {
    const addFromElementButton = wrapper.find('.steps-header .el-button:nth-child(2)')
    await addFromElementButton.trigger('click')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(1)
    expect(wrapper.vm.taskForm.steps[0].action).toBe('click') // Default action for button
    expect(wrapper.vm.taskForm.steps[0].selector).toBe('#submit-btn')
  })

  it('determines correct default action for different element types', () => {
    // Test button element
    const buttonAction = wrapper.vm.getDefaultActionForElement({ tagName: 'button' })
    expect(buttonAction).toBe('click')
    
    // Test input element
    const inputAction = wrapper.vm.getDefaultActionForElement({ tagName: 'input' })
    expect(inputAction).toBe('input')
    
    // Test div element
    const divAction = wrapper.vm.getDefaultActionForElement({ tagName: 'div' })
    expect(divAction).toBe('click')
  })

  it('edits existing step correctly', async () => {
    // Add a step first
    await wrapper.vm.addStep()
    
    // Close the editor
    await wrapper.vm.cancelEditStep()
    
    // Edit the step
    const editButton = wrapper.find('.step-controls .el-button[text]')
    await editButton.trigger('click')
    
    expect(wrapper.vm.editingStepIndex).toBe(0)
    expect(wrapper.find('.step-editor').exists()).toBe(true)
  })

  it('saves step correctly', async () => {
    // Add and edit a step
    await wrapper.vm.addStep()
    
    const saveButton = wrapper.find('.step-editor-actions .el-button[type="primary"]')
    await saveButton.trigger('click')
    
    expect(wrapper.vm.editingStepIndex).toBe(-1)
    expect(ElMessage.success).toHaveBeenCalledWith('步骤已保存')
  })

  it('duplicates step correctly', async () => {
    // Add a step first
    await wrapper.vm.addStep()
    await wrapper.vm.cancelEditStep()
    
    const duplicateButton = wrapper.find('.step-controls .el-button:nth-child(2)')
    await duplicateButton.trigger('click')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(2)
    expect(wrapper.vm.taskForm.steps[1].description).toContain('副本')
  })

  it('deletes step correctly', async () => {
    // Add a step first
    await wrapper.vm.addStep()
    await wrapper.vm.cancelEditStep()
    
    const deleteButton = wrapper.find('.step-controls .el-button[type="danger"]')
    await deleteButton.trigger('click')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(0)
    expect(ElMessage.success).toHaveBeenCalledWith('步骤已删除')
  })

  it('handles step action change correctly', async () => {
    // Add and edit a step
    await wrapper.vm.addStep()
    const step = wrapper.vm.taskForm.steps[0]
    
    // Change action to input
    await wrapper.vm.handleStepActionChange(step)
    
    expect(step.selector).toBe('')
    expect(step.text).toBe('')
    expect(step.url).toBe('')
  })

  it('opens element selector for step', async () => {
    // Add and edit a step
    await wrapper.vm.addStep()
    
    const selectElementButton = wrapper.find('.step-editor .el-button[icon="Aim"]')
    await selectElementButton.trigger('click')
    
    expect(wrapper.vm.currentEditingStep).toBeTruthy()
    expect(wrapper.vm.elementSelectorVisible).toBe(true)
  })

  it('handles element selection correctly', async () => {
    // Add and edit a step
    await wrapper.vm.addStep()
    
    const mockElement = { selector: '#selected-element' }
    await wrapper.vm.handleElementSelected(mockElement)
    
    expect(wrapper.vm.currentEditingStep.selector).toBe('#selected-element')
    expect(wrapper.vm.elementSelectorVisible).toBe(false)
    expect(ElMessage.success).toHaveBeenCalledWith('元素已选择')
  })

  it('calculates estimated time correctly', async () => {
    // Add steps with different configurations
    await wrapper.vm.addStep({ action: 'click', delay: 1000 })
    await wrapper.vm.addStep({ action: 'wait', waitTime: 2000, delay: 500 })
    await wrapper.vm.addStep({ action: 'input' })
    
    const estimatedTime = wrapper.vm.estimatedTime
    // Expected: (1000ms + 2000ms + 500ms) / 1000 + 3 seconds (default for other steps) = 6.5 -> 7
    expect(estimatedTime).toBe(7)
  })

  it('validates task form correctly', async () => {
    // Try to validate with empty form
    await wrapper.vm.validateTask()
    
    expect(ElMessage.error).toHaveBeenCalledWith('任务验证失败：任务至少需要一个步骤')
  })

  it('validates step requirements correctly', async () => {
    // Add a step without required selector
    await wrapper.vm.addStep({ action: 'click', selector: '' })
    await wrapper.vm.cancelEditStep()
    
    try {
      await wrapper.vm.validateTask()
    } catch (error) {
      expect(error.message).toBe('第 1 步缺少选择器')
    }
  })

  it('validates input step requirements correctly', async () => {
    // Add an input step without text
    await wrapper.vm.addStep({ action: 'input', selector: '#input', text: '' })
    await wrapper.vm.cancelEditStep()
    
    try {
      await wrapper.vm.validateTask()
    } catch (error) {
      expect(error.message).toBe('第 1 步缺少输入内容')
    }
  })

  it('validates navigate step requirements correctly', async () => {
    // Add a navigate step without URL
    await wrapper.vm.addStep({ action: 'navigate', url: '' })
    await wrapper.vm.cancelEditStep()
    
    try {
      await wrapper.vm.validateTask()
    } catch (error) {
      expect(error.message).toBe('第 1 步缺少目标URL')
    }
  })

  it('tests task execution correctly', async () => {
    // Add a valid step
    await wrapper.vm.addStep({ action: 'click', selector: '#button' })
    await wrapper.vm.cancelEditStep()
    
    await wrapper.vm.testTask()
    
    expect(wrapper.vm.testing).toBe(true)
    expect(ElMessage.info).toHaveBeenCalledWith('开始测试执行任务...')
  })

  it('saves task correctly', async () => {
    // Set basic task info
    await wrapper.setData({
      'taskForm.name': 'Test Task',
      'taskForm.type': 'click'
    })
    
    // Add a valid step
    await wrapper.vm.addStep({ action: 'click', selector: '#button' })
    await wrapper.vm.cancelEditStep()
    
    await wrapper.vm.handleSave()
    
    expect(wrapper.emitted('task-saved')).toBeTruthy()
    const savedTask = wrapper.emitted('task-saved')[0][0]
    expect(savedTask.name).toBe('Test Task')
    expect(savedTask.type).toBe('click')
    expect(savedTask.steps.length).toBe(1)
  })

  it('saves task as draft correctly', async () => {
    await wrapper.vm.saveAsDraft()
    
    expect(wrapper.emitted('task-saved')).toBeTruthy()
    const savedTask = wrapper.emitted('task-saved')[0][0]
    expect(savedTask.status).toBe('draft')
  })

  it('emits cancel event correctly', async () => {
    await wrapper.vm.handleCancel()
    
    expect(wrapper.emitted('task-cancelled')).toBeTruthy()
  })

  it('handles task type change by initializing default steps', async () => {
    // Set empty steps
    await wrapper.setData({ 'taskForm.steps': [] })
    
    // Change to click type
    await wrapper.vm.handleTypeChange('click')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(1)
    expect(wrapper.vm.taskForm.steps[0].action).toBe('click')
    
    // Clear steps and change to input type
    await wrapper.setData({ 'taskForm.steps': [] })
    await wrapper.vm.handleTypeChange('input')
    
    expect(wrapper.vm.taskForm.steps.length).toBe(1)
    expect(wrapper.vm.taskForm.steps[0].action).toBe('input')
  })

  it('displays task preview correctly', () => {
    // Set task data
    wrapper.setData({
      'taskForm.name': 'Test Task',
      'taskForm.type': 'click',
      'taskForm.steps': [
        { action: 'click', delay: 1000 },
        { action: 'wait', waitTime: 2000 }
      ]
    })
    
    const previewSummary = wrapper.find('.preview-summary')
    expect(previewSummary.exists()).toBe(true)
    
    const summaryItems = previewSummary.findAll('.summary-item')
    expect(summaryItems[0].find('span').text()).toBe('Test Task')
    expect(summaryItems[1].find('span').text()).toBe('点击操作')
    expect(summaryItems[2].find('span').text()).toBe('2')
  })

  it('handles step editor correctly for different action types', async () => {
    // Test click action
    await wrapper.vm.addStep({ action: 'click' })
    expect(wrapper.find('.step-editor .el-select').exists()).toBe(true)
    
    // Test input action
    await wrapper.vm.cancelEditStep()
    await wrapper.vm.addStep({ action: 'input' })
    expect(wrapper.find('.step-editor .el-input[placeholder="要输入的文本"]').exists()).toBe(true)
    
    // Test navigate action
    await wrapper.vm.cancelEditStep()
    await wrapper.vm.addStep({ action: 'navigate' })
    expect(wrapper.find('.step-editor .el-input[placeholder="目标URL"]').exists()).toBe(true)
  })

  it('provides correct target labels for different actions', () => {
    expect(wrapper.vm.getTargetLabel('click')).toBe('目标元素')
    expect(wrapper.vm.getTargetLabel('input')).toBe('输入框')
    expect(wrapper.vm.getTargetLabel('navigate')).toBe('目标URL')
    expect(wrapper.vm.getTargetLabel('wait')).toBe('等待时间(毫秒)')
  })

  it('provides correct action text for different actions', () => {
    expect(wrapper.vm.getStepActionText('click')).toBe('点击')
    expect(wrapper.vm.getStepActionText('input')).toBe('输入')
    expect(wrapper.vm.getStepActionText('navigate')).toBe('导航')
    expect(wrapper.vm.getStepActionText('wait')).toBe('等待')
  })

  it('provides correct target text for different steps', () => {
    const clickStep = { selector: '#button' }
    const inputStep = { text: 'test text' }
    const navigateStep = { url: 'https://example.com' }
    const waitStep = { waitTime: 1000 }
    
    expect(wrapper.vm.getStepTargetText(clickStep)).toBe('#button')
    expect(wrapper.vm.getStepTargetText(inputStep)).toBe('"test text"')
    expect(wrapper.vm.getStepTargetText(navigateStep)).toBe('https://example.com')
    expect(wrapper.vm.getStepTargetText(waitStep)).toBe('1000ms')
  })

  it('reacts to task prop changes correctly', async () => {
    const mockTask = {
      id: 'test-task',
      name: 'Existing Task',
      type: 'form',
      description: 'Test description',
      steps: [
        { action: 'click', selector: '#submit', description: 'Submit form' }
      ]
    }
    
    await wrapper.setProps({ task: mockTask })
    
    expect(wrapper.vm.taskForm.id).toBe('test-task')
    expect(wrapper.vm.taskForm.name).toBe('Existing Task')
    expect(wrapper.vm.taskForm.type).toBe('form')
    expect(wrapper.vm.taskForm.steps.length).toBe(1)
  })
})