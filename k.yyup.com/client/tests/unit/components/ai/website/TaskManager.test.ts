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
import TaskManager from '@/components/ai/website/TaskManager.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// Mock TaskTemplateEditor component
vi.mock('./TaskTemplateEditor.vue', () => ({
  default: {
    name: 'TaskTemplateEditor',
    template: '<div class="mock-task-template-editor"></div>'
  }
}))

// Mock useTaskTemplates composable
const mockUseTaskTemplates = {
  taskTemplates: [
    {
      id: '1',
      name: 'Login Task',
      description: 'Automated login process',
      category: 'web',
      complexity: 'simple',
      usageCount: 15,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Form Submission',
      description: 'Submit form data',
      category: 'form',
      complexity: 'medium',
      usageCount: 8,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-10'
    }
  ],
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  duplicateTemplate: vi.fn().mockResolvedValue({}),
  executeTemplate: vi.fn().mockResolvedValue({}),
  importTemplates: vi.fn().mockResolvedValue({}),
  exportTemplates: vi.fn().mockResolvedValue([
    { id: '1', name: 'Login Task' }
  ])
}

vi.mock('@/composables/useTaskTemplates', () => ({
  useTaskTemplates: () => mockUseTaskTemplates
}))

describe('TaskManager.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = mount(TaskManager)
  })

  it('renders properly with default state', () => {
    expect(wrapper.find('.task-manager').exists()).toBe(true)
    expect(wrapper.find('.manager-header').exists()).toBe(true)
    expect(wrapper.find('.search-filters').exists()).toBe(true)
    expect(wrapper.find('.tasks-grid').exists()).toBe(true)
  })

  it('displays header with title and actions', () => {
    const headerInfo = wrapper.find('.header-info')
    expect(headerInfo.find('h3').text()).toBe('任务管理器')
    expect(headerInfo.find('p').text()).toBe('创建、编辑和管理自动化任务模板')
    
    const headerActions = wrapper.find('.header-actions')
    expect(headerActions.findAll('.el-button').length).toBe(3)
  })

  it('displays search and filter controls', () => {
    const searchInput = wrapper.find('.search-filters input[placeholder="搜索任务名称或描述..."]')
    expect(searchInput.exists()).toBe(true)
    
    const filterSelects = wrapper.findAll('.search-filters .el-select')
    expect(filterSelects.length).toBe(3) // category, complexity, sort
  })

  it('displays tasks grid with controls', () => {
    const gridHeader = wrapper.find('.grid-header')
    expect(gridHeader.exists()).toBe(true)
    
    const selectAllCheckbox = gridHeader.find('.el-checkbox')
    expect(selectAllCheckbox.exists()).toBe(true)
    
    const viewControls = gridHeader.find('.view-controls')
    expect(viewControls.exists()).toBe(true)
  })

  it('displays tasks in grid view by default', () => {
    expect(wrapper.find('.grid-view').exists()).toBe(true)
    expect(wrapper.find('.list-view').exists()).toBe(false)
    expect(wrapper.vm.viewMode).toBe('grid')
  })

  it('switches to list view correctly', async () => {
    const listButton = wrapper.find('.view-controls .el-button:nth-child(2)')
    await listButton.trigger('click')
    
    expect(wrapper.vm.viewMode).toBe('list')
    expect(wrapper.find('.grid-view').exists()).toBe(false)
    expect(wrapper.find('.list-view').exists()).toBe(true)
  })

  it('displays task cards in grid view', () => {
    const taskCards = wrapper.findAll('.task-card')
    expect(taskCards.length).toBe(2) // Based on mock data
    
    const firstCard = taskCards[0]
    expect(firstCard.find('.task-name').text()).toBe('Login Task')
    expect(firstCard.find('.task-description').text()).toContain('Automated login process')
  })

  it('displays tasks in table view when switched', async () => {
    // Switch to list view
    const listButton = wrapper.find('.view-controls .el-button:nth-child(2)')
    await listButton.trigger('click')
    
    const table = wrapper.find('.list-view .el-table')
    expect(table.exists()).toBe(true)
  })

  it('filters tasks by search keyword', async () => {
    await wrapper.setData({ searchKeyword: 'login' })
    
    const filteredTasks = wrapper.vm.filteredTasks
    expect(filteredTasks.length).toBe(1)
    expect(filteredTasks[0].name).toBe('Login Task')
  })

  it('filters tasks by category', async () => {
    await wrapper.setData({ filterCategory: 'web' })
    
    const filteredTasks = wrapper.vm.filteredTasks
    expect(filteredTasks.length).toBe(1)
    expect(filteredTasks[0].category).toBe('web')
  })

  it('filters tasks by complexity', async () => {
    await wrapper.setData({ filterComplexity: 'simple' })
    
    const filteredTasks = wrapper.vm.filteredTasks
    expect(filteredTasks.length).toBe(1)
    expect(filteredTasks[0].complexity).toBe('simple')
  })

  it('sorts tasks correctly', async () => {
    // Test sort by name
    await wrapper.setData({ sortBy: 'name', sortOrder: 'asc' })
    
    const filteredTasks = wrapper.vm.filteredTasks
    expect(filteredTasks[0].name).toBe('Form Submission') // A comes before L
  })

  it('handles select all functionality', async () => {
    const selectAllCheckbox = wrapper.find('.grid-header .el-checkbox')
    await selectAllCheckbox.setValue(true)
    
    expect(wrapper.vm.selectedTasks.length).toBe(2)
    expect(wrapper.vm.selectedTasks).toEqual(['1', '2'])
  })

  it('handles indeterminate state correctly', async () => {
    // Select only one task
    await wrapper.setData({ selectedTasks: ['1'] })
    
    expect(wrapper.vm.isIndeterminate).toBe(true)
    expect(wrapper.vm.selectAll).toBe(false)
  })

  it('handles individual task selection', async () => {
    const firstCard = wrapper.find('.task-card')
    await firstCard.trigger('click')
    
    expect(wrapper.vm.selectedTasks).toContain('1')
  })

  it('creates new task correctly', async () => {
    const createButton = wrapper.find('.header-actions .el-button[type="primary"]')
    await createButton.trigger('click')
    
    expect(wrapper.vm.taskEditorVisible).toBe(true)
    expect(wrapper.vm.isEditMode).toBe(false)
    expect(wrapper.vm.currentTask).toEqual({
      name: '',
      description: '',
      category: 'web',
      complexity: 'simple',
      steps: []
    })
  })

  it('edits existing task correctly', async () => {
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click edit option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[0].trigger('click') // Edit option
    
    expect(wrapper.vm.taskEditorVisible).toBe(true)
    expect(wrapper.vm.isEditMode).toBe(true)
    expect(wrapper.vm.currentTask.id).toBe('1')
  })

  it('duplicates task correctly', async () => {
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click duplicate option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[1].trigger('click') // Duplicate option
    
    expect(mockUseTaskTemplates.duplicateTemplate).toHaveBeenCalledWith('1')
    expect(ElMessage.success).toHaveBeenCalledWith('任务已复制')
  })

  it('deletes task correctly', async () => {
    // Mock confirmation dialog
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
    
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click delete option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[3].trigger('click') // Delete option (divided)
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除这个任务模板吗？',
      '确认删除',
      { type: 'warning' }
    )
    expect(mockUseTaskTemplates.deleteTemplate).toHaveBeenCalledWith('1')
  })

  it('executes task correctly', async () => {
    const firstCard = wrapper.find('.task-card')
    const executeButton = firstCard.find('.task-actions .el-button:first-child')
    await executeButton.trigger('click')
    
    expect(mockUseTaskTemplates.executeTemplate).toHaveBeenCalledWith('1')
    expect(ElMessage.success).toHaveBeenCalledWith('任务开始执行')
  })

  it('exports single task correctly', async () => {
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click export option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[2].trigger('click') // Export option
    
    expect(mockUseTaskTemplates.exportTemplates).toHaveBeenCalledWith(['1'])
    expect(ElMessage.success).toHaveBeenCalledWith('任务已导出')
  })

  it('exports selected tasks correctly', async () => {
    // Select tasks
    await wrapper.setData({ selectedTasks: ['1', '2'] })
    
    const exportButton = wrapper.find('.header-actions .el-button:nth-child(3)')
    await exportButton.trigger('click')
    
    expect(mockUseTaskTemplates.exportTemplates).toHaveBeenCalledWith(['1', '2'])
    expect(ElMessage.success).toHaveBeenCalledWith('任务已导出')
  })

  it('imports tasks correctly', async () => {
    // Mock file input
    const mockFile = new File(['{"id": "3", "name": "Imported Task"}'], 'tasks.json', { type: 'application/json' })
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.files = [mockFile]
    
    // Mock createElement to return our file input
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(fileInput)
    
    const importButton = wrapper.find('.header-actions .el-button:nth-child(2)')
    await importButton.trigger('click')
    
    // Trigger file input change
    const event = new Event('change', { bubbles: true })
    Object.defineProperty(event, 'target', { value: { files: [mockFile] }, enumerable: true })
    fileInput.dispatchEvent(event)
    
    expect(mockUseTaskTemplates.importTemplates).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith('已导入 1 个任务模板')
    
    createElementSpy.mockRestore()
  })

  it('shows empty state when no tasks match filters', async () => {
    await wrapper.setData({ searchKeyword: 'nonexistent' })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.el-empty').exists()).toBe(true)
  })

  it('handles batch actions correctly', async () => {
    // Select tasks
    await wrapper.setData({ selectedTasks: ['1', '2'] })
    
    // Open batch action dialog (this would require clicking a batch action button)
    // For now, test the batch action methods directly
    
    await wrapper.vm.batchExecute()
    expect(mockUseTaskTemplates.executeTemplate).toHaveBeenCalledWith('1')
    expect(mockUseTaskTemplates.executeTemplate).toHaveBeenCalledWith('2')
    
    await wrapper.vm.batchExport()
    expect(mockUseTaskTemplates.exportTemplates).toHaveBeenCalledWith(['1', '2'])
  })

  it('handles batch delete correctly', async () => {
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(true)
    
    await wrapper.setData({ selectedTasks: ['1', '2'] })
    
    await wrapper.vm.batchDelete()
    
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除选中的 2 个任务吗？',
      '确认删除',
      { type: 'warning' }
    )
    expect(mockUseTaskTemplates.deleteTemplate).toHaveBeenCalledWith('1')
    expect(mockUseTaskTemplates.deleteTemplate).toHaveBeenCalledWith('2')
  })

  it('provides correct task icons', () => {
    expect(wrapper.vm.getTaskIcon('web')).toBeDefined()
    expect(wrapper.vm.getTaskIcon('form')).toBeDefined()
    expect(wrapper.vm.getTaskIcon('data')).toBeDefined()
    expect(wrapper.vm.getTaskIcon('test')).toBeDefined()
    expect(wrapper.vm.getTaskIcon('custom')).toBeDefined()
  })

  it('provides correct category types and labels', () => {
    expect(wrapper.vm.getCategoryType('web')).toBe('primary')
    expect(wrapper.vm.getCategoryText('web')).toBe('网页操作')
    
    expect(wrapper.vm.getCategoryType('form')).toBe('success')
    expect(wrapper.vm.getCategoryText('form')).toBe('表单处理')
    
    expect(wrapper.vm.getCategoryType('data')).toBe('warning')
    expect(wrapper.vm.getCategoryText('data')).toBe('数据提取')
  })

  it('provides correct complexity types and labels', () => {
    expect(wrapper.vm.getComplexityType('simple')).toBe('success')
    expect(wrapper.vm.getComplexityText('simple')).toBe('简单')
    
    expect(wrapper.vm.getComplexityType('medium')).toBe('warning')
    expect(wrapper.vm.getComplexityText('medium')).toBe('中等')
    
    expect(wrapper.vm.getComplexityType('complex')).toBe('danger')
    expect(wrapper.vm.getComplexityText('complex')).toBe('复杂')
  })

  it('truncates text correctly', () => {
    const longText = 'This is a very long text that should be truncated'
    const truncated = wrapper.vm.truncateText(longText, 20)
    expect(truncated).toBe('This is a very long...')
    
    const shortText = 'Short text'
    const notTruncated = wrapper.vm.truncateText(shortText, 20)
    expect(notTruncated).toBe(shortText)
  })

  it('formats time correctly', () => {
    const timeStr = '2024-01-15T10:30:00Z'
    const formatted = wrapper.vm.formatTime(timeStr)
    expect(formatted).toBeDefined()
  })

  it('handles task saved event correctly', async () => {
    // Open editor for new task
    await wrapper.vm.createNewTask()
    
    const mockTask = {
      id: '3',
      name: 'New Task',
      category: 'web',
      complexity: 'simple'
    }
    
    // Simulate task saved event
    await wrapper.vm.handleTaskSaved(mockTask)
    
    expect(wrapper.vm.taskEditorVisible).toBe(false)
    expect(mockUseTaskTemplates.createTemplate).toHaveBeenCalledWith(mockTask)
    expect(wrapper.emitted('task-created')).toBeTruthy()
  })

  it('handles task cancelled event correctly', async () => {
    // Open editor
    await wrapper.vm.createNewTask()
    
    // Simulate task cancelled event
    await wrapper.vm.handleTaskCancelled()
    
    expect(wrapper.vm.taskEditorVisible).toBe(false)
  })

  it('handles errors gracefully', async () => {
    // Mock duplicate template error
    mockUseTaskTemplates.duplicateTemplate.mockRejectedValue(new Error('Duplicate error'))
    
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click duplicate option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[1].trigger('click') // Duplicate option
    
    expect(ElMessage.error).toHaveBeenCalledWith('复制任务失败：Duplicate error')
  })

  it('handles user cancellation in delete dialog', async () => {
    // Mock cancellation
    vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')
    
    const firstCard = wrapper.find('.task-card')
    const editButton = firstCard.find('.card-actions .el-dropdown .el-button')
    await editButton.trigger('click')
    
    // Find and click delete option in dropdown
    const dropdownItems = wrapper.findAll('.el-dropdown-menu .el-dropdown-item')
    await dropdownItems[3].trigger('click') // Delete option
    
    expect(ElMessageBox.confirm).toHaveBeenCalled()
    expect(mockUseTaskTemplates.deleteTemplate).not.toHaveBeenCalled()
  })
})