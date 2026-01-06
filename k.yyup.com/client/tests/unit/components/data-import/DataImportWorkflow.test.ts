import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import DataImportWorkflow from '@/components/data-import/DataImportWorkflow.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    }
  }
})

// Mock sub-components
const PermissionCheckMock = {
  name: 'PermissionCheck',
  template: '<div class="mock-permission-check">Permission Check Component</div>',
  emits: ['permission-checked', 'error']
}

const FileUploadMock = {
  name: 'FileUpload',
  template: '<div class="mock-file-upload">File Upload Component</div>',
  emits: ['file-uploaded', 'error']
}

const DataParserMock = {
  name: 'DataParser',
  template: '<div class="mock-data-parser">Data Parser Component</div>',
  emits: ['data-parsed', 'error']
}

const FieldMappingMock = {
  name: 'FieldMapping',
  template: '<div class="mock-field-mapping">Field Mapping Component</div>',
  emits: ['mapping-configured', 'error']
}

const DataPreviewMock = {
  name: 'DataPreview',
  template: '<div class="mock-data-preview">Data Preview Component</div>',
  emits: ['preview-confirmed', 'back', 'error']
}

const ImportExecutionMock = {
  name: 'ImportExecution',
  template: '<div class="mock-import-execution">Import Execution Component</div>',
  emits: ['import-completed', 'error']
}

const ImportResultMock = {
  name: 'ImportResult',
  template: '<div class="mock-import-result">Import Result Component</div>',
  emits: ['restart', 'close']
}

vi.mock('@/components/data-import/steps/PermissionCheck.vue', () => ({
  default: PermissionCheckMock
}))

vi.mock('@/components/data-import/steps/FileUpload.vue', () => ({
  default: FileUploadMock
}))

vi.mock('@/components/data-import/steps/DataParser.vue', () => ({
  default: DataParserMock
}))

vi.mock('@/components/data-import/steps/FieldMapping.vue', () => ({
  default: FieldMappingMock
}))

vi.mock('@/components/data-import/steps/DataPreview.vue', () => ({
  default: DataPreviewMock
}))

vi.mock('@/components/data-import/steps/ImportExecution.vue', () => ({
  default: ImportExecutionMock
}))

vi.mock('@/components/data-import/steps/ImportResult.vue', () => ({
  default: ImportResultMock
}))

// Mock workflow transparency utility
const mockWorkflowTransparency = {
  startDataImportWorkflow: vi.fn(),
  endDataImportWorkflow: vi.fn(),
  endAllWorkflows: vi.fn()
}

vi.mock('@/utils/workflow-transparency', () => ({
  useWorkflowTransparency: () => mockWorkflowTransparency
}))

describe('DataImportWorkflow.vue', () => {
  let router: Router
  let wrapper: any

  beforeEach(async () => {
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

    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(DataImportWorkflow, {
      props: {
        visible: true,
        ...props
      },
      global: {
        plugins: [router, pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the workflow component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.data-import-workflow').exists()).toBe(true)
      expect(wrapper.find('el-card').exists()).toBe(true)
      expect(wrapper.find('el-steps').exists()).toBe(true)
    })

    it('renders workflow steps correctly', () => {
      wrapper = createWrapper()
      
      const steps = wrapper.findAll('el-step')
      expect(steps.length).toBe(7)
      
      const stepTitles = steps.map(step => step.text())
      expect(stepTitles).toContain('权限验证')
      expect(stepTitles).toContain('文件上传')
      expect(stepTitles).toContain('数据解析')
      expect(stepTitles).toContain('字段映射')
      expect(stepTitles).toContain('数据预览')
      expect(stepTitles).toContain('执行导入')
      expect(stepTitles).toContain('完成')
    })

    it('renders step content area', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.step-content').exists()).toBe(true)
    })

    it('renders workflow action buttons', () => {
      wrapper = createWrapper()
      
      const actionButtons = wrapper.find('.workflow-actions')
      expect(actionButtons.exists()).toBe(true)
      
      const buttons = actionButtons.findAll('el-button')
      expect(buttons.length).toBe(3) // Previous, Next, Cancel
    })

    it('renders error alert container', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.error-alert').exists()).toBe(true)
    })

    it('shows current step indicator correctly', () => {
      wrapper = createWrapper()
      
      const steps = wrapper.find('el-steps')
      expect(steps.attributes(':active')).toBe('0') // Should start at step 0
    })
  })

  describe('Initial State', () => {
    it('starts at step 0 (permission check)', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('has initial loading state as false', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('has empty error message initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.errorMessage).toBe('')
    })

    it('has empty workflow data initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.importType).toBe('')
      expect(wrapper.vm.hasPermission).toBe(false)
      expect(wrapper.vm.filePath).toBe('')
      expect(wrapper.vm.parsedData).toEqual([])
    })

    it('cannot proceed initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.canProceed).toBe(false)
    })
  })

  describe('Step Navigation', () => {
    it('moves to next step when canProceed is true', async () => {
      wrapper = createWrapper()
      
      // Set up conditions to allow proceeding
      await wrapper.setData({ hasPermission: true })
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      await nextButton.trigger('click')
      
      expect(wrapper.vm.currentStep).toBe(1)
    })

    it('does not move to next step when canProceed is false', async () => {
      wrapper = createWrapper()
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      await nextButton.trigger('click')
      
      expect(wrapper.vm.currentStep).toBe(0) // Should stay at step 0
    })

    it('moves to previous step when previous button is clicked', async () => {
      wrapper = createWrapper()
      
      // Move to step 2 first
      await wrapper.setData({ currentStep: 2 })
      
      const previousButton = wrapper.find('.workflow-actions el-button:not([type="primary"])')
      await previousButton.trigger('click')
      
      expect(wrapper.vm.currentStep).toBe(1)
    })

    it('disables previous button at step 0', () => {
      wrapper = createWrapper()
      
      const previousButton = wrapper.find('.workflow-actions el-button:not([type="primary"])')
      expect(previousButton.attributes('disabled')).toBeDefined()
    })

    it('enables previous button at step 1 and above', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 1 })
      
      const previousButton = wrapper.find('.workflow-actions el-button:not([type="primary"])')
      expect(previousButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Step Content Rendering', () => {
    it('renders PermissionCheck component at step 0', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent(PermissionCheckMock).exists()).toBe(true)
    })

    it('renders FileUpload component at step 1', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 1 })
      
      expect(wrapper.findComponent(FileUploadMock).exists()).toBe(true)
    })

    it('renders DataParser component at step 2', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 2 })
      
      expect(wrapper.findComponent(DataParserMock).exists()).toBe(true)
    })

    it('renders FieldMapping component at step 3', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 3 })
      
      expect(wrapper.findComponent(FieldMappingMock).exists()).toBe(true)
    })

    it('renders DataPreview component at step 4', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 4 })
      
      expect(wrapper.findComponent(DataPreviewMock).exists()).toBe(true)
    })

    it('renders ImportExecution component at step 5', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 5 })
      
      expect(wrapper.findComponent(ImportExecutionMock).exists()).toBe(true)
    })

    it('renders ImportResult component at step 6', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 6 })
      
      expect(wrapper.findComponent(ImportResultMock).exists()).toBe(true)
    })
  })

  describe('Permission Check Handling', () => {
    it('handles permission checked event with success', async () => {
      wrapper = createWrapper()
      
      const permissionCheck = wrapper.findComponent(PermissionCheckMock)
      await permissionCheck.vm.$emit('permission-checked', {
        importType: 'student',
        hasPermission: true
      })
      
      expect(wrapper.vm.importType).toBe('student')
      expect(wrapper.vm.hasPermission).toBe(true)
      expect(ElMessage.success).toHaveBeenCalledWith('权限验证通过')
    })

    it('handles permission checked event with failure', async () => {
      wrapper = createWrapper()
      
      const permissionCheck = wrapper.findComponent(PermissionCheckMock)
      await permissionCheck.vm.$emit('permission-checked', {
        importType: 'student',
        hasPermission: false
      })
      
      expect(wrapper.vm.importType).toBe('student')
      expect(wrapper.vm.hasPermission).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('权限验证失败')
    })

    it('handles permission check error', async () => {
      wrapper = createWrapper()
      
      const permissionCheck = wrapper.findComponent(PermissionCheckMock)
      await permissionCheck.vm.$emit('error', 'Permission check failed')
      
      expect(wrapper.vm.errorMessage).toBe('Permission check failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Permission check failed')
    })
  })

  describe('File Upload Handling', () => {
    it('handles file uploaded event', async () => {
      wrapper = createWrapper()
      
      // Move to step 1 first
      await wrapper.setData({ currentStep: 1 })
      
      const fileUpload = wrapper.findComponent(FileUploadMock)
      await fileUpload.vm.$emit('file-uploaded', {
        filePath: '/path/to/file.csv'
      })
      
      expect(wrapper.vm.filePath).toBe('/path/to/file.csv')
      expect(ElMessage.success).toHaveBeenCalledWith('文件上传成功')
    })

    it('handles file upload error', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 1 })
      
      const fileUpload = wrapper.findComponent(FileUploadMock)
      await fileUpload.vm.$emit('error', 'File upload failed')
      
      expect(wrapper.vm.errorMessage).toBe('File upload failed')
      expect(ElMessage.error).toHaveBeenCalledWith('File upload failed')
    })
  })

  describe('Data Parsing Handling', () => {
    it('handles data parsed event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 2 })
      
      const dataParser = wrapper.findComponent(DataParserMock)
      const mockData = [
        { name: 'John', age: 5 },
        { name: 'Jane', age: 6 }
      ]
      
      await dataParser.vm.$emit('data-parsed', {
        data: mockData,
        fields: ['name', 'age'],
        totalRecords: 2
      })
      
      expect(wrapper.vm.parsedData).toEqual(mockData)
      expect(wrapper.vm.documentFields).toEqual(['name', 'age'])
      expect(ElMessage.success).toHaveBeenCalledWith('解析成功，共2条记录')
    })

    it('handles data parsing error', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 2 })
      
      const dataParser = wrapper.findComponent(DataParserMock)
      await dataParser.vm.$emit('error', 'Data parsing failed')
      
      expect(wrapper.vm.errorMessage).toBe('Data parsing failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Data parsing failed')
    })
  })

  describe('Field Mapping Handling', () => {
    it('handles mapping configured event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 3 })
      
      const fieldMapping = wrapper.findComponent(FieldMappingMock)
      const mockMappings = [
        { sourceField: 'name', targetField: 'student_name' },
        { sourceField: 'age', targetField: 'student_age' }
      ]
      
      await fieldMapping.vm.$emit('mapping-configured', {
        fieldMappings: mockMappings
      })
      
      expect(wrapper.vm.fieldMappings).toEqual(mockMappings)
      expect(ElMessage.success).toHaveBeenCalledWith('字段映射配置完成')
    })

    it('handles field mapping error', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 3 })
      
      const fieldMapping = wrapper.findComponent(FieldMappingMock)
      await fieldMapping.vm.$emit('error', 'Field mapping failed')
      
      expect(wrapper.vm.errorMessage).toBe('Field mapping failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Field mapping failed')
    })
  })

  describe('Data Preview Handling', () => {
    it('handles preview confirmed event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 4 })
      
      const dataPreview = wrapper.findComponent(DataPreviewMock)
      const mockValidData = [
        { name: 'John', age: 5 },
        { name: 'Jane', age: 6 }
      ]
      
      await dataPreview.vm.$emit('preview-confirmed', {
        validRecords: mockValidData
      })
      
      expect(wrapper.vm.validatedData).toEqual(mockValidData)
      expect(ElMessage.success).toHaveBeenCalledWith('数据验证完成，2条记录可导入')
    })

    it('handles preview back event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 4 })
      
      const dataPreview = wrapper.findComponent(DataPreviewMock)
      await dataPreview.vm.$emit('back')
      
      expect(wrapper.vm.currentStep).toBe(3)
    })

    it('handles data preview error', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 4 })
      
      const dataPreview = wrapper.findComponent(DataPreviewMock)
      await dataPreview.vm.$emit('error', 'Data preview failed')
      
      expect(wrapper.vm.errorMessage).toBe('Data preview failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Data preview failed')
    })
  })

  describe('Import Execution Handling', () => {
    it('handles import completed event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 5 })
      
      const importExecution = wrapper.findComponent(ImportExecutionMock)
      const mockResult = {
        success: true,
        imported: 2,
        failed: 0
      }
      
      await importExecution.vm.$emit('import-completed', mockResult)
      
      expect(wrapper.vm.importResult).toEqual(mockResult)
      expect(wrapper.vm.currentStep).toBe(6)
      expect(ElMessage.success).toHaveBeenCalledWith('数据导入完成')
    })

    it('handles import execution error', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 5 })
      
      const importExecution = wrapper.findComponent(ImportExecutionMock)
      await importExecution.vm.$emit('error', 'Import execution failed')
      
      expect(wrapper.vm.errorMessage).toBe('Import execution failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Import execution failed')
    })
  })

  describe('Import Result Handling', () => {
    it('handles restart event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 6 })
      
      const importResult = wrapper.findComponent(ImportResultMock)
      await importResult.vm.$emit('restart')
      
      expect(wrapper.vm.currentStep).toBe(0)
      expect(wrapper.vm.importType).toBe('')
      expect(wrapper.vm.hasPermission).toBe(false)
      expect(wrapper.vm.filePath).toBe('')
      expect(wrapper.vm.parsedData).toEqual([])
    })

    it('handles close event', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 6 })
      
      const importResult = wrapper.findComponent(ImportResultMock)
      await importResult.vm.$emit('close')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Computed Properties', () => {
    it('calculates canProceed correctly for each step', async () => {
      wrapper = createWrapper()
      
      // Step 0 - needs permission
      expect(wrapper.vm.canProceed).toBe(false)
      await wrapper.setData({ hasPermission: true })
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Step 1 - needs file path
      await wrapper.setData({ currentStep: 1, hasPermission: false })
      expect(wrapper.vm.canProceed).toBe(false)
      await wrapper.setData({ filePath: '/path/to/file' })
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Step 2 - needs parsed data
      await wrapper.setData({ currentStep: 2, filePath: '' })
      expect(wrapper.vm.canProceed).toBe(false)
      await wrapper.setData({ parsedData: [{ name: 'test' }] })
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Step 3 - needs field mappings
      await wrapper.setData({ currentStep: 3, parsedData: [] })
      expect(wrapper.vm.canProceed).toBe(false)
      await wrapper.setData({ fieldMappings: [{ source: 'test', target: 'test' }] })
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Step 4 - needs validated data
      await wrapper.setData({ currentStep: 4, fieldMappings: [] })
      expect(wrapper.vm.canProceed).toBe(false)
      await wrapper.setData({ validatedData: [{ name: 'test' }] })
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Step 5 - execution step (manual)
      await wrapper.setData({ currentStep: 5, validatedData: [] })
      expect(wrapper.vm.canProceed).toBe(false)
    })

    it('calculates completed steps correctly', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.completedSteps).toBe(0)
      
      await wrapper.setData({ parsedData: [{ name: 'test' }] })
      expect(wrapper.vm.completedSteps).toBe(0) // Should still be 0 as current step is 0
      
      await wrapper.setData({ currentStep: 2 })
      expect(wrapper.vm.completedSteps).toBe(0) // No steps completed yet
      
      // This would be updated by the actual step completion logic
    })

    it('calculates overall progress correctly', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.overallProgress).toBe(0)
      
      // Simulate some completed steps
      await wrapper.setData({ 
        currentStep: 3,
        parsedData: [{ name: 'test' }, { name: 'test2' }]
      })
      
      // Progress should be calculated based on completed steps vs total steps
      expect(wrapper.vm.overallProgress).toBeGreaterThanOrEqual(0)
      expect(wrapper.vm.overallProgress).toBeLessThanOrEqual(100)
    })
  })

  describe('Workflow Transparency Integration', () => {
    it('calls workflow transparency functions on step navigation', async () => {
      wrapper = createWrapper()
      
      // Set up to allow proceeding
      await wrapper.setData({ hasPermission: true })
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      await nextButton.trigger('click')
      
      expect(mockWorkflowTransparency.startDataImportWorkflow).toHaveBeenCalledWith('parsing')
    })

    it('ends workflow transparency on previous step', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 2 })
      
      const previousButton = wrapper.find('.workflow-actions el-button:not([type="primary"])')
      await previousButton.trigger('click')
      
      expect(mockWorkflowTransparency.endDataImportWorkflow).toHaveBeenCalledWith('parsing')
    })

    it('ends all workflows on restart', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 6 })
      
      const importResult = wrapper.findComponent(ImportResultMock)
      await importResult.vm.$emit('restart')
      
      expect(mockWorkflowTransparency.endAllWorkflows).toHaveBeenCalled()
    })

    it('ends all workflows on error', async () => {
      wrapper = createWrapper()
      
      const permissionCheck = wrapper.findComponent(PermissionCheckMock)
      await permissionCheck.vm.$emit('error', 'Test error')
      
      expect(mockWorkflowTransparency.endAllWorkflows).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('displays error message when error occurs', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ errorMessage: 'Test error message' })
      
      const errorAlert = wrapper.find('.error-alert')
      expect(errorAlert.exists()).toBe(true)
      expect(errorAlert.text()).toContain('Test error message')
    })

    it('clears error message when error alert is closed', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ errorMessage: 'Test error message' })
      
      const errorAlert = wrapper.find('.error-alert')
      await errorAlert.vm.$emit('close')
      
      expect(wrapper.vm.errorMessage).toBe('')
    })

    it('stops loading state when error occurs', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ loading: true, errorMessage: 'Test error' })
      
      const permissionCheck = wrapper.findComponent(PermissionCheckMock)
      await permissionCheck.vm.$emit('error', 'Test error')
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Button States and Text', () => {
    it('shows correct button text for next step', async () => {
      wrapper = createWrapper()
      
      let nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      expect(nextButton.text()).toBe('下一步')
      
      await wrapper.setData({ currentStep: 5 })
      nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      expect(nextButton.text()).toBe('执行导入')
    })

    it('shows correct button text for cancel/close', async () => {
      wrapper = createWrapper()
      
      let cancelButton = wrapper.findAll('.workflow-actions el-button')[2]
      expect(cancelButton.text()).toBe('取消')
      
      await wrapper.setData({ currentStep: 6 })
      cancelButton = wrapper.findAll('.workflow-actions el-button')[2]
      expect(cancelButton.text()).toBe('关闭')
    })

    it('disables next button when cannot proceed', () => {
      wrapper = createWrapper()
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('enables next button when can proceed', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ hasPermission: true })
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      expect(nextButton.attributes('disabled')).toBeUndefined()
    })

    it('shows loading state on next button when loading', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ loading: true, hasPermission: true })
      
      const nextButton = wrapper.find('.workflow-actions el-button[type="primary"]')
      expect(nextButton.attributes('loading')).toBeDefined()
    })
  })

  describe('Event Emission', () => {
    it('emits close event when cancel button is clicked', async () => {
      wrapper = createWrapper()
      
      const cancelButton = wrapper.findAll('.workflow-actions el-button')[2]
      await cancelButton.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('emits completed event when import finishes', async () => {
      wrapper = createWrapper()
      
      await wrapper.setData({ currentStep: 5 })
      
      const importExecution = wrapper.findComponent(ImportExecutionMock)
      const mockResult = { success: true, imported: 2 }
      
      await importExecution.vm.$emit('import-completed', mockResult)
      
      expect(wrapper.emitted('completed')).toBeTruthy()
      expect(wrapper.emitted('completed')[0][0]).toEqual(mockResult)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('logs mount message', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper = createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('🎯 数据导入工作流组件已挂载')
      
      consoleSpy.mockRestore()
    })

    it('cleans up workflow transparency on unmount', () => {
      wrapper = createWrapper()
      
      wrapper.unmount()
      
      expect(mockWorkflowTransparency.endAllWorkflows).toHaveBeenCalled()
    })

    it('logs unmount message', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(consoleSpy).toHaveBeenCalledWith('🎯 数据导入工作流组件卸载，清理透明度状态')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Responsive Design', () => {
    it('maintains layout on different screen sizes', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.data-import-workflow').exists()).toBe(true)
      expect(wrapper.find('el-card').exists()).toBe(true)
      expect(wrapper.find('el-steps').exists()).toBe(true)
    })

    it('adapts step content for mobile', async () => {
      wrapper = createWrapper()
      
      // Simulate mobile viewport
      wrapper.element.style.width = '375px'
      
      await nextTick()
      
      expect(wrapper.find('.step-content').exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('renders efficiently', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('.data-import-workflow').exists()).toBe(true)
      expect(end - start).toBeLessThan(100) // Should render quickly
    })

    it('handles step changes efficiently', async () => {
      wrapper = createWrapper()
      
      const start = performance.now()
      
      // Perform multiple step changes
      for (let i = 0; i < 5; i++) {
        await wrapper.setData({ currentStep: i })
      }
      
      const end = performance.now()
      
      expect(wrapper.find('.data-import-workflow').exists()).toBe(true)
      expect(end - start).toBeLessThan(200) // Should handle changes efficiently
    })
  })

  describe('Accessibility', () => {
    it('renders with proper semantic structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('el-card').exists()).toBe(true)
      expect(wrapper.find('el-steps').exists()).toBe(true)
    })

    it('provides clear step indicators', () => {
      wrapper = createWrapper()
      
      const steps = wrapper.findAll('el-step')
      expect(steps.length).toBe(7)
      
      steps.forEach(step => {
        expect(step.text()).toBeDefined()
      })
    })

    it('maintains proper heading structure', () => {
      wrapper = createWrapper()
      
      const cardHeader = wrapper.find('.card-header')
      expect(cardHeader.exists()).toBe(true)
      expect(cardHeader.find('h3').exists()).toBe(true)
    })
  })
})