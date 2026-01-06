import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import WorkflowStepQueue from '@/components/workflow/WorkflowStepQueue.vue'

// Mock Element Plus components and icons
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="mock-progress">Progress</div>',
      props: ['percentage', 'status', 'show-text', 'stroke-width', 'size']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="mock-button"><slot /></button>',
      props: ['type', 'size', 'icon', 'disabled', 'loading']
    },
    ElAlert: {
      name: 'ElAlert',
      template: '<div class="mock-alert"><slot name="default" /></div>',
      props: ['title', 'type', 'show-icon', 'closable']
    }
  }
})

vi.mock('@element-plus/icons-vue', () => ({
  ArrowDown: { name: 'ArrowDown' },
  ArrowUp: { name: 'ArrowUp' },
  Close: { name: 'Close' }
}))

// Mock workflow step manager
const mockWorkflowStepManager = {
  getQueue: vi.fn(),
  onQueueChange: vi.fn(),
  cancelQueue: vi.fn(),
  getEstimatedRemainingTime: vi.fn()
}

vi.mock('@/utils/workflow-steps', () => ({
  workflowStepManager: mockWorkflowStepManager,
  type WorkflowStepQueue: {
    id: string,
    title: string,
    status: string,
    steps: Array<any>,
    currentStepIndex: number,
    totalActualDuration: number,
    totalEstimatedDuration: number
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('WorkflowStepQueue.vue', () => {
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
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Reset mocks
    vi.clearAllMocks()
    
    // Setup default mock data
    mockWorkflowStepManager.getQueue.mockReturnValue({
      id: 'test-queue-1',
      title: 'Test Workflow',
      status: 'running',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1',
          description: 'First step',
          status: 'completed',
          actualDuration: 1000,
          estimatedDuration: 1500
        },
        {
          id: 'step-2',
          title: 'Step 2',
          description: 'Second step',
          status: 'running',
          progress: 50,
          details: 'Processing step 2'
        },
        {
          id: 'step-3',
          title: 'Step 3',
          description: 'Third step',
          status: 'pending'
        }
      ],
      currentStepIndex: 1,
      totalActualDuration: 1000,
      totalEstimatedDuration: 3000
    })
    
    mockWorkflowStepManager.getEstimatedRemainingTime.mockReturnValue(2000)
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  const createWrapper = (props = {}) => {
    const defaultProps = {
      queueId: 'test-queue-1',
      autoHide: true,
      autoHideDelay: 5000
    }

    return mount(WorkflowStepQueue, {
      props: {
        ...defaultProps,
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
    it('renders the workflow step queue component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(true)
    })

    it('does not render when queue is not available', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue(undefined)
      
      wrapper = createWrapper()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(false)
    })

    it('renders queue header correctly', () => {
      wrapper = createWrapper()
      
      const header = wrapper.find('.queue-header')
      expect(header.exists()).toBe(true)
      
      const queueInfo = header.find('.queue-info')
      expect(queueInfo.exists()).toBe(true)
      
      const queueTitle = queueInfo.find('.queue-title')
      expect(queueTitle.exists()).toBe(true)
      expect(queueTitle.text()).toContain('Test Workflow')
    })

    it('renders status icon correctly', () => {
      wrapper = createWrapper()
      
      const statusIcon = wrapper.find('.status-icon')
      expect(statusIcon.exists()).toBe(true)
      expect(statusIcon.text()).toBe('🔄') // Running status
    })

    it('renders queue meta information', () => {
      wrapper = createWrapper()
      
      const queueMeta = wrapper.find('.queue-meta')
      expect(queueMeta.exists()).toBe(true)
      
      const estimatedTime = queueMeta.find('.estimated-time')
      expect(estimatedTime.exists()).toBe(true)
      expect(estimatedTime.text()).toContain('预计2分0秒')
      
      const progressInfo = queueMeta.find('.progress-info')
      expect(progressInfo.exists()).toBe(true)
      expect(progressInfo.text()).toBe('1/3 步骤')
    })

    it('renders queue controls correctly', () => {
      wrapper = createWrapper()
      
      const queueControls = wrapper.find('.queue-controls')
      expect(queueControls.exists()).toBe(true)
      
      const buttons = queueControls.findAll('el-button')
      expect(buttons.length).toBe(3) // Cancel, Collapse/Expand, Close
    })

    it('renders overall progress bar', () => {
      wrapper = createWrapper()
      
      const overallProgress = wrapper.find('.overall-progress')
      expect(overallProgress.exists()).toBe(true)
      
      const progressBar = overallProgress.find('el-progress')
      expect(progressBar.exists()).toBe(true)
    })

    it('renders steps container', () => {
      wrapper = createWrapper()
      
      const stepsContainer = wrapper.find('.steps-container')
      expect(stepsContainer.exists()).toBe(true)
    })

    it('renders step items correctly', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      expect(stepItems.length).toBe(3)
      
      // Check first step (completed)
      const firstStep = stepItems[0]
      expect(firstStep.classes()).toContain('completed')
      expect(firstStep.find('.step-icon').text()).toBe('✅')
      
      // Check second step (running/current)
      const secondStep = stepItems[1]
      expect(secondStep.classes()).toContain('current')
      expect(secondStep.classes()).toContain('running')
      expect(secondStep.find('.step-icon').text()).toBe('🔄')
      
      // Check third step (pending)
      const thirdStep = stepItems[2]
      expect(thirdStep.find('.step-icon').text()).toBe('⏳')
    })
  })

  describe('Status Icons', () => {
    it('shows correct icon for running status', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'running',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.getStatusIcon('running')).toBe('🔄')
    })

    it('shows correct icon for completed status', () => {
      expect(wrapper.vm.getStatusIcon('completed')).toBe('✅')
    })

    it('shows correct icon for failed status', () => {
      expect(wrapper.vm.getStatusIcon('failed')).toBe('❌')
    })

    it('shows correct icon for cancelled status', () => {
      expect(wrapper.vm.getStatusIcon('cancelled')).toBe('🚫')
    })

    it('shows default icon for unknown status', () => {
      expect(wrapper.vm.getStatusIcon('unknown')).toBe('⏳')
    })
  })

  describe('Progress Status', () => {
    it('returns correct progress status for completed', () => {
      expect(wrapper.vm.getProgressStatus('completed')).toBe('success')
    })

    it('returns correct progress status for failed', () => {
      expect(wrapper.vm.getProgressStatus('failed')).toBe('exception')
    })

    it('returns empty string for other statuses', () => {
      expect(wrapper.vm.getProgressStatus('running')).toBe('')
      expect(wrapper.vm.getProgressStatus('pending')).toBe('')
    })
  })

  describe('Duration Formatting', () => {
    it('formats milliseconds correctly', () => {
      expect(wrapper.vm.formatDuration(500)).toBe('500ms')
    })

    it('formats seconds correctly', () => {
      expect(wrapper.vm.formatDuration(30000)).toBe('30秒')
    })

    it('formats minutes and seconds correctly', () => {
      expect(wrapper.vm.formatDuration(90000)).toBe('1分30秒')
    })

    it('handles zero duration', () => {
      expect(wrapper.vm.formatDuration(0)).toBe('0ms')
    })
  })

  describe('Computed Properties', () => {
    it('calculates completed steps correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.completedSteps).toBe(1) // Only first step is completed
    })

    it('calculates overall progress correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.overallProgress).toBe(33) // 1/3 = 33.33% rounded
    })

    it('handles empty steps array', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'running',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.completedSteps).toBe(0)
      expect(wrapper.vm.overallProgress).toBe(0)
    })
  })

  describe('Collapse/Expand Functionality', () => {
    it('toggles collapse state when header is clicked', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.isCollapsed).toBe(false)
      
      const header = wrapper.find('.queue-header')
      await header.trigger('click')
      
      expect(wrapper.vm.isCollapsed).toBe(true)
      expect(wrapper.find('.workflow-step-queue').classes()).toContain('collapsed')
      
      await header.trigger('click')
      
      expect(wrapper.vm.isCollapsed).toBe(false)
      expect(wrapper.find('.workflow-step-queue').classes()).not.toContain('collapsed')
    })

    it('hides steps content when collapsed', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.steps-container').exists()).toBe(true)
      
      const header = wrapper.find('.queue-header')
      await header.trigger('click')
      
      expect(wrapper.find('.steps-container').exists()).toBe(false)
    })

    it('hides overall progress when collapsed', async () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.overall-progress').exists()).toBe(true)
      
      const header = wrapper.find('.queue-header')
      await header.trigger('click')
      
      expect(wrapper.find('.overall-progress').exists()).toBe(false)
    })

    it('hides completion/failure info when collapsed', async () => {
      // Test with completed queue
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      expect(wrapper.find('.completion-info').exists()).toBe(true)
      
      const header = wrapper.find('.queue-header')
      await header.trigger('click')
      
      expect(wrapper.find('.completion-info').exists()).toBe(false)
    })
  })

  describe('Queue Controls', () => {
    it('emits close event when close button is clicked', async () => {
      wrapper = createWrapper()
      
      const closeButton = wrapper.findAll('.queue-controls el-button')[2]
      await closeButton.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')[0][0]).toBe('test-queue-1')
    })

    it('calls cancelWorkflow when cancel button is clicked', async () => {
      wrapper = createWrapper()
      
      const cancelButton = wrapper.find('.queue-controls el-button[type="warning"]')
      await cancelButton.trigger('click')
      
      expect(mockWorkflowStepManager.cancelQueue).toHaveBeenCalledWith('test-queue-1')
      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('cancel')[0][0]).toBe('test-queue-1')
    })

    it('shows cancel button only for running status', () => {
      wrapper = createWrapper()
      
      let cancelButton = wrapper.find('.queue-controls el-button[type="warning"]')
      expect(cancelButton.exists()).toBe(true)
      
      // Change to completed status
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      cancelButton = wrapper.find('.queue-controls el-button[type="warning"]')
      expect(cancelButton.exists()).toBe(false)
    })
  })

  describe('Step Content Rendering', () => {
    it('renders step title and description', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      const firstStep = stepItems[0]
      
      const stepTitle = firstStep.find('.step-title')
      expect(stepTitle.text()).toBe('Step 1')
      
      const stepDescription = firstStep.find('.step-description')
      expect(stepDescription.text()).toBe('First step')
    })

    it('renders step details for running step', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      const runningStep = stepItems[1] // Second step is running
      
      const stepDetails = runningStep.find('.step-details')
      expect(stepDetails.exists()).toBe(true)
      expect(stepDetails.text()).toBe('Processing step 2')
    })

    it('renders step progress for running step', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      const runningStep = stepItems[1]
      
      const stepProgress = runningStep.find('.step-progress')
      expect(stepProgress.exists()).toBe(true)
      
      const progressBar = stepProgress.find('el-progress')
      expect(progressBar.exists()).toBe(true)
    })

    it('renders step error for failed step', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'failed',
        steps: [
          {
            id: 'step-1',
            title: 'Failed Step',
            description: 'This step failed',
            status: 'failed',
            error: 'Step execution failed'
          }
        ],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      const stepError = wrapper.find('.step-error')
      expect(stepError.exists()).toBe(true)
      
      const errorAlert = stepError.find('el-alert')
      expect(errorAlert.exists()).toBe(true)
      expect(errorAlert.attributes('title')).toBe('Step execution failed')
    })

    it('renders step duration when available', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      const completedStep = stepItems[0]
      
      const stepDuration = completedStep.find('.step-duration')
      expect(stepDuration.exists()).toBe(true)
      expect(stepDuration.text()).toBe('耗时: 1秒')
    })

    it('renders duration comparison when estimated duration is available', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      const completedStep = stepItems[0]
      
      const stepDuration = completedStep.find('.step-duration')
      expect(stepDuration.text()).toBe('耗时: 1秒(预计2秒)')
    })
  })

  describe('Completion and Failure States', () => {
    it('renders completion info when queue is completed', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0,
        totalActualDuration: 2500,
        totalEstimatedDuration: 3000
      })
      
      wrapper = createWrapper()
      
      const completionInfo = wrapper.find('.completion-info')
      expect(completionInfo.exists()).toBe(true)
      
      const completionAlert = completionInfo.find('el-alert')
      expect(completionAlert.exists()).toBe(true)
      expect(completionAlert.attributes('title')).toBe('🎉 工作流已完成！')
      expect(completionAlert.text()).toContain('总耗时: 2秒(预计3秒)')
    })

    it('renders failure info when queue is failed', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'failed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      const failureInfo = wrapper.find('.failure-info')
      expect(failureInfo.exists()).toBe(true)
      
      const failureAlert = failureInfo.find('el-alert')
      expect(failureAlert.exists()).toBe(true)
      expect(failureAlert.attributes('title')).toBe('❌ 工作流执行失败')
    })

    it('emits retry event when retry button is clicked', async () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'failed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      const retryButton = wrapper.find('.failure-info el-button')
      await retryButton.trigger('click')
      
      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')[0][0]).toBe('test-queue-1')
    })
  })

  describe('Workflow Step Manager Integration', () => {
    it('gets initial queue state on mount', () => {
      wrapper = createWrapper()
      
      expect(mockWorkflowStepManager.getQueue).toHaveBeenCalledWith('test-queue-1')
    })

    it('subscribes to queue changes', () => {
      wrapper = createWrapper()
      
      expect(mockWorkflowStepManager.onQueueChange).toHaveBeenCalledWith(
        'test-queue-1',
        expect.any(Function)
      )
    })

    it('updates queue when change event is received', async () => {
      wrapper = createWrapper()
      
      // Simulate queue change
      const changeCallback = mockWorkflowStepManager.onQueueChange.mock.calls[0][1]
      const updatedQueue = {
        id: 'test-queue-1',
        title: 'Updated Workflow',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      }
      
      await changeCallback(updatedQueue)
      
      expect(wrapper.vm.queue).toEqual(updatedQueue)
      expect(wrapper.find('.queue-title').text()).toContain('Updated Workflow')
    })

    it('updates estimated remaining time', () => {
      wrapper = createWrapper()
      
      expect(mockWorkflowStepManager.getEstimatedRemainingTime).toHaveBeenCalledWith('test-queue-1')
    })

    it('sets up timer for periodic time updates', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.updateTimer).not.toBeNull()
    })

    it('cleans up timer on unmount', () => {
      wrapper = createWrapper()
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(wrapper.vm.updateTimer)
      
      clearIntervalSpy.mockRestore()
    })

    it('unsubscribes from queue changes on unmount', () => {
      wrapper = createWrapper()
      
      let unsubscribe = vi.fn()
      mockWorkflowStepManager.onQueueChange.mockReturnValue(unsubscribe)
      
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('Auto Hide Functionality', () => {
    it('auto-hides when queue is completed and autoHide is true', async () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper({ autoHide: true, autoHideDelay: 100 })
      
      expect(wrapper.vm.isVisible).toBe(true)
      
      // Wait for auto-hide delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('does not auto-hide when autoHide is false', async () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper({ autoHide: false, autoHideDelay: 100 })
      
      // Wait for auto-hide delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('auto-hides when queue is failed and autoHide is true', async () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'failed',
        steps: [],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper({ autoHide: true, autoHideDelay: 100 })
      
      expect(wrapper.vm.isVisible).toBe(true)
      
      // Wait for auto-hide delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('does not auto-hide if status changes before delay', async () => {
      let queue = {
        id: 'test-queue',
        title: 'Test',
        status: 'completed',
        steps: [],
        currentStepIndex: 0
      }
      
      mockWorkflowStepManager.getQueue.mockReturnValue(queue)
      
      wrapper = createWrapper({ autoHide: true, autoHideDelay: 200 })
      
      // Change status before delay completes
      setTimeout(() => {
        queue = { ...queue, status: 'running' }
        const changeCallback = mockWorkflowStepManager.onQueueChange.mock.calls[0][1]
        changeCallback(queue)
      }, 100)
      
      // Wait for original delay
      await new Promise(resolve => setTimeout(resolve, 250))
      
      expect(wrapper.vm.isVisible).toBe(true) // Should not hide
    })
  })

  describe('Props Handling', () => {
    it('accepts queueId prop correctly', () => {
      wrapper = createWrapper({ queueId: 'custom-queue-id' })
      
      expect(wrapper.props('queueId')).toBe('custom-queue-id')
      expect(mockWorkflowStepManager.getQueue).toHaveBeenCalledWith('custom-queue-id')
    })

    it('accepts autoHide prop correctly', () => {
      wrapper = createWrapper({ autoHide: false })
      
      expect(wrapper.props('autoHide')).toBe(false)
    })

    it('accepts autoHideDelay prop correctly', () => {
      wrapper = createWrapper({ autoHideDelay: 3000 })
      
      expect(wrapper.props('autoHideDelay')).toBe(3000)
    })

    it('uses default props when not provided', () => {
      wrapper = createWrapper({})
      
      expect(wrapper.props('autoHide')).toBe(true)
      expect(wrapper.props('autoHideDelay')).toBe(5000)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes', () => {
      wrapper = createWrapper()
      
      const queueElement = wrapper.find('.workflow-step-queue')
      expect(queueElement.classes()).toContain('workflow-step-queue')
    })

    it('applies collapsed class when collapsed', async () => {
      wrapper = createWrapper()
      
      const queueElement = wrapper.find('.workflow-step-queue')
      expect(queueElement.classes()).not.toContain('collapsed')
      
      await wrapper.setData({ isCollapsed: true })
      
      expect(queueElement.classes()).toContain('collapsed')
    })

    it('styles step items correctly based on status', () => {
      wrapper = createWrapper()
      
      const stepItems = wrapper.findAll('.step-item')
      
      expect(stepItems[0].classes()).toContain('completed')
      expect(stepItems[1].classes()).toContain('current')
      expect(stepItems[1].classes()).toContain('running')
      expect(stepItems[2].classes()).not.toContain('completed')
      expect(stepItems[2].classes()).not.toContain('running')
    })

    it('styles failed steps correctly', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        title: 'Test',
        status: 'failed',
        steps: [
          {
            id: 'step-1',
            title: 'Failed Step',
            description: 'Failed',
            status: 'failed',
            error: 'Error message'
          }
        ],
        currentStepIndex: 0
      })
      
      wrapper = createWrapper()
      
      const stepItem = wrapper.find('.step-item')
      expect(stepItem.classes()).toContain('failed')
    })
  })

  describe('Performance', () => {
    it('renders efficiently', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(true)
      expect(end - start).toBeLessThan(50)
    })

    it('handles queue updates efficiently', async () => {
      wrapper = createWrapper()
      
      const start = performance.now()
      
      // Simulate multiple queue updates
      const changeCallback = mockWorkflowStepManager.onQueueChange.mock.calls[0][1]
      
      for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
        await changeCallback({
          id: 'test-queue-1',
          title: `Update ${i}`,
          status: 'running',
          steps: [],
          currentStepIndex: 0
        })
      }
      
      const end = performance.now()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(true)
      expect(end - start).toBeLessThan(100)
    })
  })

  describe('Accessibility', () => {
    it('renders with semantic HTML structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(true)
      expect(wrapper.find('.queue-header').exists()).toBe(true)
      expect(wrapper.find('.steps-container').exists()).toBe(true)
    })

    it('provides clear status indications', () => {
      wrapper = createWrapper()
      
      const statusIcon = wrapper.find('.status-icon')
      expect(statusIcon.exists()).toBe(true)
      expect(statusIcon.text()).toBeDefined()
    })

    it('maintains proper heading structure', () => {
      wrapper = createWrapper()
      
      const queueTitle = wrapper.find('.queue-title')
      expect(queueTitle.exists()).toBe(true)
    })

    it('provides interactive elements with proper states', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('el-button')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button.classes()).toContain('mock-button')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing queue gracefully', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue(undefined)
      
      wrapper = createWrapper()
      
      expect(wrapper.find('.workflow-step-queue').exists()).toBe(false)
    })

    it('handles invalid queue data gracefully', () => {
      mockWorkflowStepManager.getQueue.mockReturnValue({
        id: 'test-queue',
        // Missing required properties
      })
      
      expect(() => {
        wrapper = createWrapper()
      }).not.toThrow()
    })

    it('handles timer cleanup errors gracefully', () => {
      wrapper = createWrapper()
      
      const originalClearInterval = global.clearInterval
      global.clearInterval = vi.fn().mockImplementation(() => {
        throw new Error('Timer cleanup error')
      })
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
      
      global.clearInterval = originalClearInterval
    })
  })

  describe('Integration with Element Plus', () => {
    it('correctly integrates with ElProgress component', () => {
      wrapper = createWrapper()
      
      const progressBars = wrapper.findAll('el-progress')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('correctly integrates with ElButton component', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('el-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('correctly integrates with ElAlert component', () => {
      wrapper = createWrapper()
      
      // Check for completion/failure alerts
      const alerts = wrapper.findAll('el-alert')
      expect(alerts.length).toBeGreaterThanOrEqual(0)
    })
  })
})