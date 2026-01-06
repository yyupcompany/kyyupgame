/**
 * 🤖 移动端AI工作流状态管理
 * 
 * 专门为移动端设计的工作流状态管理
 * 支持离线模式、性能优化、电池管理等移动端特性
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { 
  WorkflowDefinition, 
  WorkflowInstance, 
  WorkflowStatus,
  StepState,
  ExecutionContext,
  WorkflowResults,
  WorkflowMetrics
} from '../types/mobile-workflow'
import { useMobileStore } from './mobile'

export const useMobileWorkflowStore = defineStore('mobile-workflow', () => {
  // ==================== 基础状态 ====================
  
  const currentWorkflow = ref<WorkflowInstance | null>(null)
  const workflowHistory = ref<WorkflowInstance[]>([])
  const executionState = ref<WorkflowStatus>('idle')
  const stepStates = reactive<Map<string, StepState>>(new Map())
  const executionContext = reactive<ExecutionContext>({} as ExecutionContext)
  const workflowResults = ref<WorkflowResults | null>(null)
  const errors = ref<any[]>([])
  const metrics = reactive<WorkflowMetrics>({} as WorkflowMetrics)
  
  // ==================== 移动端特定状态 ====================
  
  const isOfflineMode = ref(false)
  const batteryLevel = ref(1.0)
  const networkQuality = ref<'excellent' | 'good' | 'poor' | 'offline'>('good')
  const memoryUsage = ref(0)
  const cpuUsage = ref(0)
  const hapticFeedbackEnabled = ref(true)
  const backgroundExecution = ref(false)
  const performanceMode = ref<'normal' | 'power_save' | 'high_performance'>('normal')
  
  // 执行队列和缓存
  const executionQueue = ref<WorkflowDefinition[]>([])
  const offlineQueue = ref<any[]>([])
  const resultCache = reactive<Map<string, any>>(new Map())
  
  // ==================== 计算属性 ====================
  
  const isExecuting = computed(() => executionState.value === 'running')
  const isPaused = computed(() => executionState.value === 'paused')
  const isCompleted = computed(() => executionState.value === 'completed')
  const isFailed = computed(() => executionState.value === 'failed')
  const canExecute = computed(() => !isExecuting.value && !isPaused.value)
  
  const currentStep = computed(() => {
    if (!currentWorkflow.value) return 0
    return Array.from(stepStates.values()).filter(s => s.status === 'completed').length + 1
  })
  
  const totalSteps = computed(() => {
    return currentWorkflow.value?.definition.steps.length || 0
  })
  
  const progressPercentage = computed(() => {
    if (totalSteps.value === 0) return 0
    return Math.round((currentStep.value / totalSteps.value) * 100)
  })
  
  const executionTime = computed(() => {
    if (!currentWorkflow.value?.startTime) return 0
    const endTime = currentWorkflow.value.endTime || Date.now()
    return endTime - currentWorkflow.value.startTime
  })
  
  // 移动端特定计算属性
  const canExecuteWorkflow = computed(() => {
    return canExecute.value && 
           networkQuality.value !== 'offline' && 
           batteryLevel.value > 0.1 &&
           memoryUsage.value < 0.8 &&
           cpuUsage.value < 0.7
  })
  
  const shouldOptimizePerformance = computed(() => {
    return batteryLevel.value < 0.3 || 
           memoryUsage.value > 0.7 || 
           cpuUsage.value > 0.6 ||
           networkQuality.value === 'poor'
  })
  
  const isLowPowerMode = computed(() => {
    return performanceMode.value === 'power_save' || batteryLevel.value < 0.2
  })
  
  // ==================== 核心Actions ====================
  
  const executeWorkflow = async (definition: WorkflowDefinition, options: {
    autoStart?: boolean
    enableOfflineMode?: boolean
    enableHapticFeedback?: boolean
    performanceMode?: 'normal' | 'power_save' | 'high_performance'
  } = {}) => {
    try {
      const {
        autoStart = true,
        enableOfflineMode = false,
        enableHapticFeedback = true,
        performanceMode: mode = 'normal'
      } = options
      
      // 检查执行条件
      if (!canExecuteWorkflow.value && !enableOfflineMode) {
        throw new Error('当前设备状态不适合执行工作流')
      }
      
      // 设置性能模式
      performanceMode.value = mode
      hapticFeedbackEnabled.value = enableHapticFeedback
      isOfflineMode.value = enableOfflineMode
      
      // 创建工作流实例
      const workflowInstance: WorkflowInstance = {
        id: `mobile_workflow_${Date.now()}`,
        definitionId: definition.id,
        definition,
        status: 'running',
        startTime: Date.now(),
        currentStep: definition.steps[0]?.id,
        executionContext: createMobileExecutionContext(definition),
        stepStates: new Map(),
        results: {} as WorkflowResults,
        metadata: {
          startTime: Date.now(),
          platform: 'mobile',
          version: '1.0.0',
          environment: 'production',
          sessionId: generateSessionId(),
          traceId: generateTraceId()
        }
      }
      
      currentWorkflow.value = workflowInstance
      executionState.value = 'running'
      
      // 初始化步骤状态
      definition.steps.forEach(step => {
        stepStates.set(step.id, {
          id: step.id,
          status: 'pending',
          progress: 0,
          logs: [],
          metadata: {
            executionTime: 0,
            memoryUsage: 0,
            networkCalls: 0,
            cacheHits: 0,
            retryCount: 0
          }
        })
      })
      
      // 移动端触觉反馈
      if (hapticFeedbackEnabled.value) {
        await triggerHapticFeedback('medium')
      }
      
      // 开始执行
      if (autoStart) {
        await startExecution()
      }
      
      return workflowInstance
      
    } catch (error) {
      executionState.value = 'failed'
      errors.value.push({
        type: 'workflow_execution',
        message: error.message,
        timestamp: Date.now(),
        context: 'executeWorkflow'
      })
      
      // 错误触觉反馈
      if (hapticFeedbackEnabled.value) {
        await triggerHapticFeedback('heavy')
      }
      
      throw error
    }
  }
  
  const pauseWorkflow = async () => {
    if (executionState.value === 'running') {
      executionState.value = 'paused'
      
      if (hapticFeedbackEnabled.value) {
        await triggerHapticFeedback('light')
      }
      
      console.log('🔄 移动端工作流已暂停')
    }
  }
  
  const resumeWorkflow = async () => {
    if (executionState.value === 'paused') {
      executionState.value = 'running'
      
      if (hapticFeedbackEnabled.value) {
        await triggerHapticFeedback('medium')
      }
      
      await continueExecution()
      console.log('▶️ 移动端工作流已恢复')
    }
  }
  
  const stopWorkflow = async () => {
    if (isExecuting.value || isPaused.value) {
      executionState.value = 'cancelled'
      
      if (currentWorkflow.value) {
        currentWorkflow.value.status = 'cancelled'
        currentWorkflow.value.endTime = Date.now()
      }
      
      if (hapticFeedbackEnabled.value) {
        await triggerHapticFeedback('heavy')
      }
      
      console.log('⏹️ 移动端工作流已停止')
    }
  }
  
  // ==================== 移动端特定Actions ====================
  
  const updateDeviceStatus = (status: {
    batteryLevel?: number
    networkQuality?: 'excellent' | 'good' | 'poor' | 'offline'
    memoryUsage?: number
    cpuUsage?: number
  }) => {
    if (status.batteryLevel !== undefined) {
      batteryLevel.value = status.batteryLevel
    }
    if (status.networkQuality !== undefined) {
      networkQuality.value = status.networkQuality
    }
    if (status.memoryUsage !== undefined) {
      memoryUsage.value = status.memoryUsage
    }
    if (status.cpuUsage !== undefined) {
      cpuUsage.value = status.cpuUsage
    }
    
    // 自动调整性能模式
    autoAdjustPerformanceMode()
  }
  
  const enableOfflineMode = () => {
    isOfflineMode.value = true
    console.log('📱 移动端离线模式已启用')
  }
  
  const disableOfflineMode = () => {
    isOfflineMode.value = false
    console.log('📱 移动端离线模式已禁用')
  }
  
  const addToOfflineQueue = (operation: any) => {
    offlineQueue.value.push({
      ...operation,
      timestamp: Date.now(),
      id: generateOperationId()
    })
  }
  
  const processOfflineQueue = async () => {
    if (networkQuality.value === 'offline' || offlineQueue.value.length === 0) {
      return
    }
    
    const operations = [...offlineQueue.value]
    offlineQueue.value = []
    
    for (const operation of operations) {
      try {
        await processOfflineOperation(operation)
      } catch (error) {
        // 重新加入队列
        offlineQueue.value.push(operation)
        console.error('离线操作处理失败:', error)
      }
    }
  }
  
  const optimizeForBattery = () => {
    performanceMode.value = 'power_save'
    hapticFeedbackEnabled.value = false
    backgroundExecution.value = false
    
    console.log('🔋 移动端电池优化模式已启用')
  }
  
  const clearCache = () => {
    resultCache.clear()
    
    // 清理步骤历史
    if (stepStates.size > 10) {
      const entries = Array.from(stepStates.entries())
      const toKeep = entries.slice(-5)
      stepStates.clear()
      toKeep.forEach(([key, value]) => stepStates.set(key, value))
    }
    
    console.log('🧹 移动端缓存已清理')
  }
  
  // ==================== 辅助方法 ====================
  
  const createMobileExecutionContext = (definition: WorkflowDefinition): ExecutionContext => {
    const mobileStore = useMobileStore()
    
    return {
      workflowId: definition.id,
      stepResults: new Map(),
      globalVariables: new Map(),
      userContext: {
        userId: 'mobile_user',
        role: 'mobile',
        permissions: [],
        preferences: {
          language: 'zh-CN',
          theme: 'auto',
          notifications: true,
          hapticFeedback: hapticFeedbackEnabled.value,
          voiceInput: true,
          autoSave: true
        }
      },
      deviceContext: {
        platform: 'mobile',
        os: mobileStore.deviceInfo.platform,
        browser: mobileStore.deviceInfo.browser,
        screenSize: {
          width: mobileStore.deviceInfo.screenWidth,
          height: mobileStore.deviceInfo.screenHeight
        },
        networkType: networkQuality.value,
        batteryLevel: batteryLevel.value,
        memoryUsage: memoryUsage.value,
        isOnline: networkQuality.value !== 'offline'
      },
      metadata: {
        startTime: Date.now(),
        platform: 'mobile',
        version: '1.0.0',
        environment: 'production',
        sessionId: generateSessionId(),
        traceId: generateTraceId()
      }
    }
  }
  
  const autoAdjustPerformanceMode = () => {
    if (batteryLevel.value < 0.2 || memoryUsage.value > 0.8) {
      performanceMode.value = 'power_save'
    } else if (batteryLevel.value > 0.8 && memoryUsage.value < 0.5 && networkQuality.value === 'excellent') {
      performanceMode.value = 'high_performance'
    } else {
      performanceMode.value = 'normal'
    }
  }
  
  const triggerHapticFeedback = async (intensity: 'light' | 'medium' | 'heavy') => {
    if (!hapticFeedbackEnabled.value || !navigator.vibrate) return
    
    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200]
    }
    
    navigator.vibrate(patterns[intensity])
  }
  
  const generateSessionId = () => `mobile_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const generateTraceId = () => `mobile_trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const generateOperationId = () => `mobile_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // ==================== 私有方法 ====================
  
  const startExecution = async () => {
    // 实际的工作流执行逻辑将在后续实现
    console.log('🚀 移动端工作流开始执行')
  }
  
  const continueExecution = async () => {
    // 继续执行逻辑
    console.log('▶️ 移动端工作流继续执行')
  }
  
  const processOfflineOperation = async (operation: any) => {
    // 处理离线操作
    console.log('📱 处理离线操作:', operation)
  }
  
  // ==================== 返回 ====================
  
  return {
    // 状态
    currentWorkflow: readonly(currentWorkflow),
    workflowHistory: readonly(workflowHistory),
    executionState: readonly(executionState),
    stepStates: readonly(stepStates),
    executionContext: readonly(executionContext),
    workflowResults: readonly(workflowResults),
    errors: readonly(errors),
    metrics: readonly(metrics),
    
    // 移动端特定状态
    isOfflineMode: readonly(isOfflineMode),
    batteryLevel: readonly(batteryLevel),
    networkQuality: readonly(networkQuality),
    memoryUsage: readonly(memoryUsage),
    cpuUsage: readonly(cpuUsage),
    hapticFeedbackEnabled: readonly(hapticFeedbackEnabled),
    backgroundExecution: readonly(backgroundExecution),
    performanceMode: readonly(performanceMode),
    executionQueue: readonly(executionQueue),
    offlineQueue: readonly(offlineQueue),
    
    // 计算属性
    isExecuting,
    isPaused,
    isCompleted,
    isFailed,
    canExecute,
    currentStep,
    totalSteps,
    progressPercentage,
    executionTime,
    canExecuteWorkflow,
    shouldOptimizePerformance,
    isLowPowerMode,
    
    // 方法
    executeWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    stopWorkflow,
    updateDeviceStatus,
    enableOfflineMode,
    disableOfflineMode,
    addToOfflineQueue,
    processOfflineQueue,
    optimizeForBattery,
    clearCache
  }
})

export default useMobileWorkflowStore
