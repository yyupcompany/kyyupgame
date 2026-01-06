/**
 * 🎯 工作流步骤管理 - Vue 3 组合式API
 */

import { ref, computed, onUnmounted } from 'vue'
import { 
  workflowStepManager, 
  type WorkflowStep, 
  type WorkflowStepQueue,
  WORKFLOW_STEP_TEMPLATES 
} from '@/utils/workflow-steps'

export interface UseWorkflowStepsOptions {
  autoCleanup?: boolean; // 组件卸载时自动清理
  updateInterval?: number; // 更新间隔（毫秒）
}

export function useWorkflowSteps(options: UseWorkflowStepsOptions = {}) {
  const { autoCleanup = true, updateInterval = 1000 } = options;

  // 响应式数据
  const activeQueues = ref<WorkflowStepQueue[]>([])
  const currentQueue = ref<WorkflowStepQueue | null>(null)
  
  // 定时器
  let updateTimer: number | null = null
  let unsubscribers: (() => void)[] = []

  // 计算属性
  const hasActiveWorkflows = computed(() => activeQueues.value.length > 0)
  const totalProgress = computed(() => {
    if (!currentQueue.value || currentQueue.value.steps.length === 0) return 0
    const completed = currentQueue.value.steps.filter(s => s.status === 'completed').length
    return Math.round((completed / currentQueue.value.steps.length) * 100)
  })

  // 更新活跃队列
  const updateActiveQueues = () => {
    activeQueues.value = workflowStepManager.getActiveQueues()
  }

  // 创建工作流队列
  const createWorkflow = (
    queueId: string,
    title: string,
    description: string,
    steps: Omit<WorkflowStep, 'status'>[]
  ): WorkflowStepQueue => {
    const queue = workflowStepManager.createQueue(queueId, title, description, steps)
    
    // 监听队列变化
    const unsubscribe = workflowStepManager.onQueueChange(queueId, (updatedQueue) => {
      if (currentQueue.value?.id === queueId) {
        currentQueue.value = updatedQueue
      }
      updateActiveQueues()
    })
    unsubscribers.push(unsubscribe)
    
    currentQueue.value = queue
    updateActiveQueues()
    return queue
  }

  // 创建数据导入工作流
  const createDataImportWorkflow = (customSteps?: Omit<WorkflowStep, 'status'>[]): WorkflowStepQueue => {
    const steps = customSteps || WORKFLOW_STEP_TEMPLATES.DATA_IMPORT
    return createWorkflow(
      'data-import-' + Date.now(),
      '📊 数据导入工作流',
      '正在执行数据导入操作，请稍候...',
      steps
    )
  }

  // 开始工作流
  const startWorkflow = (queueId: string): boolean => {
    const result = workflowStepManager.startQueue(queueId)
    if (result) {
      updateActiveQueues()
    }
    return result
  }

  // 添加步骤到工作流
  const addStep = (
    queueId: string,
    step: Omit<WorkflowStep, 'status'> & Partial<{ name: string; action: string }>,
    insertIndex?: number
  ): boolean => {
    const result = workflowStepManager.addStep(queueId, step, insertIndex)
    updateActiveQueues()
    return result
  }

  // 开始下一个步骤
  const startNextStep = (queueId: string): WorkflowStep | null => {
    const step = workflowStepManager.startNextStep(queueId)
    updateActiveQueues()
    return step
  }

  // 更新当前步骤
  const updateCurrentStep = (
    queueId: string,
    updates: { progress?: number; details?: string; description?: string }
  ): boolean => {
    return workflowStepManager.updateCurrentStep(queueId, updates)
  }

  // 完成当前步骤
  const completeCurrentStep = (queueId: string): boolean => {
    const result = workflowStepManager.completeCurrentStep(queueId)
    updateActiveQueues()
    return result
  }

  // 步骤失败
  const failCurrentStep = (queueId: string, error: string): boolean => {
    const result = workflowStepManager.failCurrentStep(queueId, error)
    updateActiveQueues()
    return result
  }

  // 完成工作流
  const completeWorkflow = (queueId: string): boolean => {
    const result = workflowStepManager.completeQueue(queueId)
    updateActiveQueues()
    return result
  }

  // 取消工作流
  const cancelWorkflow = (queueId: string): boolean => {
    const result = workflowStepManager.cancelQueue(queueId)
    updateActiveQueues()
    return result
  }

  // 获取工作流队列
  const getWorkflow = (queueId: string): WorkflowStepQueue | undefined => {
    return workflowStepManager.getQueue(queueId)
  }

  // 获取预计剩余时间
  const getEstimatedRemainingTime = (queueId: string): number => {
    return workflowStepManager.getEstimatedRemainingTime(queueId)
  }

  // 监听工作流变化
  const watchWorkflow = (
    queueId: string, 
    callback: (queue: WorkflowStepQueue) => void
  ): (() => void) => {
    const unsubscribe = workflowStepManager.onQueueChange(queueId, callback)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 数据导入工作流的便捷方法
  const dataImportWorkflow = {
    // 创建并开始数据导入工作流
    start: (customSteps?: Omit<WorkflowStep, 'status'>[]): string => {
      const queue = createDataImportWorkflow(customSteps)
      startWorkflow(queue.id)
      return queue.id
    },

    // 权限验证步骤
    startPermissionCheck: (queueId: string) => {
      const step = startNextStep(queueId)
      if (step?.id === 'permission') {
        updateCurrentStep(queueId, { details: '正在验证用户权限...' })
      }
      return step
    },

    // 页面导航步骤
    startNavigation: (queueId: string, targetPage: string) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'navigation') {
        updateCurrentStep(queueId, { 
          details: `正在导航到${targetPage}页面...`,
          progress: 50
        })
      }
      return step
    },

    // 文件解析步骤
    startFileParsing: (queueId: string, fileName: string) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'file-parse') {
        updateCurrentStep(queueId, { 
          details: `正在解析文件: ${fileName}...`,
          progress: 10
        })
      }
      return step
    },

    // 字段映射步骤
    startFieldMapping: (queueId: string, fieldCount: number) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'field-mapping') {
        updateCurrentStep(queueId, { 
          details: `正在分析${fieldCount}个字段的映射关系...`,
          progress: 20
        })
      }
      return step
    },

    // 数据预览步骤
    startDataPreview: (queueId: string, recordCount: number) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'data-preview') {
        updateCurrentStep(queueId, { 
          details: `正在生成${recordCount}条记录的预览...`,
          progress: 30
        })
      }
      return step
    },

    // 数据校验步骤
    startDataValidation: (queueId: string) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'data-validation') {
        updateCurrentStep(queueId, { 
          details: '正在校验数据格式和完整性...',
          progress: 0
        })
      }
      return step
    },

    // 数据导入步骤
    startDataImport: (queueId: string, totalRecords: number) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'data-import') {
        updateCurrentStep(queueId, { 
          details: `正在导入${totalRecords}条记录到数据库...`,
          progress: 0
        })
      }
      return step
    },

    // 更新导入进度
    updateImportProgress: (queueId: string, imported: number, total: number) => {
      const progress = Math.round((imported / total) * 100)
      updateCurrentStep(queueId, { 
        details: `已导入${imported}/${total}条记录...`,
        progress
      })
    },

    // 完成导入
    completeImport: (queueId: string, successCount: number, failCount: number) => {
      completeCurrentStep(queueId)
      const step = startNextStep(queueId)
      if (step?.id === 'completion') {
        updateCurrentStep(queueId, { 
          details: `导入完成！成功${successCount}条，失败${failCount}条`,
          progress: 100
        })
        setTimeout(() => completeWorkflow(queueId), 2000)
      }
    }
  }

  // 启动定时更新
  if (updateInterval > 0) {
    updateTimer = window.setInterval(updateActiveQueues, updateInterval)
  }

  // 初始化
  updateActiveQueues()

  // 清理函数
  const cleanup = () => {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
    unsubscribers.forEach(unsubscribe => unsubscribe())
    unsubscribers = []
    
    if (autoCleanup) {
      workflowStepManager.cleanup()
    }
  }

  // 组件卸载时自动清理
  if (autoCleanup) {
    onUnmounted(cleanup)
  }

  return {
    // 响应式数据
    activeQueues,
    currentQueue,
    hasActiveWorkflows,
    totalProgress,

    // 基础方法
    createWorkflow,
    createDataImportWorkflow,
    addStep,
    startWorkflow,
    startNextStep,
    updateCurrentStep,
    completeCurrentStep,
    failCurrentStep,
    completeWorkflow,
    cancelWorkflow,
    getWorkflow,
    getEstimatedRemainingTime,
    watchWorkflow,

    // 数据导入专用方法
    dataImportWorkflow,

    // 工具方法
    cleanup,
    updateActiveQueues
  }
}
