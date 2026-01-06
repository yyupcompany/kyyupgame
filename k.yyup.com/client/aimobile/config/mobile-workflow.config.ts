/**
 * 🤖 移动端AI工作流配置
 * 
 * 专门为移动端优化的工作流配置
 * 包含性能优化、电池管理、网络优化等移动端特性
 */

import type { 
  WorkflowConfig, 
  MobileWorkflowConfig, 
  PerformanceConfig,
  RetryPolicy,
  ErrorHandlingConfig 
} from '../types/mobile-workflow'

// ==================== 移动端工作流基础配置 ====================

export const MOBILE_WORKFLOW_CONFIG: MobileWorkflowConfig = {
  // 移动端交互特性
  enableHapticFeedback: true,
  enableVoiceInput: true,
  enableOfflineMode: true,
  
  // 性能优化
  batteryOptimization: true,
  networkOptimization: true,
  memoryOptimization: true,
  
  // 后台执行
  backgroundExecution: false, // 移动端默认关闭后台执行
  progressNotifications: true
}

// ==================== 性能配置 ====================

export const MOBILE_PERFORMANCE_CONFIG: PerformanceConfig = {
  // 移动端并发限制
  maxConcurrentSteps: 2, // 移动端限制并发数以节省资源
  
  // 内存限制 (MB)
  memoryLimit: 128, // 移动端内存限制
  
  // CPU阈值 (%)
  cpuThreshold: 70, // 移动端CPU使用阈值
  
  // 网络优化
  networkOptimization: true,
  
  // 缓存策略
  cacheStrategy: 'hybrid' // 混合缓存策略，内存+本地存储
}

// ==================== 重试策略配置 ====================

export const MOBILE_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3, // 移动端减少重试次数
  backoffStrategy: 'exponential',
  baseDelay: 1000, // 1秒基础延迟
  maxDelay: 10000, // 最大10秒延迟
  retryConditions: [
    'network_error',
    'timeout',
    'server_error',
    'rate_limit'
  ]
}

// ==================== 错误处理配置 ====================

export const MOBILE_ERROR_HANDLING: ErrorHandlingConfig = {
  strategy: 'continue', // 移动端倾向于继续执行
  fallbackStep: 'mobile_fallback',
  notificationLevel: 'warning',
  logLevel: 'info' // 移动端减少日志级别
}

// ==================== 默认工作流配置 ====================

export const DEFAULT_MOBILE_WORKFLOW_CONFIG: WorkflowConfig = {
  timeout: 300000, // 5分钟超时
  retryPolicy: MOBILE_RETRY_POLICY,
  errorHandling: MOBILE_ERROR_HANDLING,
  performance: MOBILE_PERFORMANCE_CONFIG,
  mobile: MOBILE_WORKFLOW_CONFIG
}

// ==================== 智能体配置（与后端API对应） ====================

// Smart Expert系统的专家配置
export const MOBILE_SMART_EXPERT_CONFIGS = {
  activity_planner: {
    model: 'doubao-pro-128k',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  marketing_expert: {
    model: 'doubao-pro-128k',
    temperature: 0.6,
    maxTokens: 2500,
    timeout: 35000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  education_expert: {
    model: 'doubao-pro-128k',
    temperature: 0.4,
    maxTokens: 2000,
    timeout: 40000,
    mobile: {
      enableVoiceInput: false,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  cost_analyst: {
    model: 'doubao-pro-128k',
    temperature: 0.3,
    maxTokens: 1800,
    timeout: 35000,
    mobile: {
      enableVoiceInput: false,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  risk_assessor: {
    model: 'doubao-pro-128k',
    temperature: 0.2,
    maxTokens: 2000,
    timeout: 30000,
    mobile: {
      enableVoiceInput: false,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  creative_designer: {
    model: 'doubao-pro-128k',
    temperature: 0.8,
    maxTokens: 2500,
    timeout: 45000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: false,
      compressResponses: false,
      offlineMode: false
    }
  },

  curriculum_expert: {
    model: 'doubao-pro-128k',
    temperature: 0.4, // 教学指导需要结构化和准确性
    maxTokens: 2800,
    timeout: 40000,
    mobile: {
      enableVoiceInput: true, // 新老师可能需要语音咨询
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: false, // 教学内容不压缩
      offlineMode: false
    }
  }
}

// Expert Consultation系统的专家配置
export const MOBILE_CONSULTATION_EXPERT_CONFIGS = {
  planner: {
    model: 'doubao-pro-128k',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  psychologist: {
    model: 'doubao-pro-128k',
    temperature: 0.5,
    maxTokens: 2200,
    timeout: 35000,
    mobile: {
      enableVoiceInput: false,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  investor: {
    model: 'doubao-pro-128k',
    temperature: 0.3,
    maxTokens: 1800,
    timeout: 30000,
    mobile: {
      enableVoiceInput: false,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  director: {
    model: 'doubao-pro-128k',
    temperature: 0.6,
    maxTokens: 2000,
    timeout: 35000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  teacher: {
    model: 'doubao-pro-128k',
    temperature: 0.5,
    maxTokens: 2000,
    timeout: 30000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  },

  parent: {
    model: 'doubao-pro-128k',
    temperature: 0.6,
    maxTokens: 1800,
    timeout: 25000,
    mobile: {
      enableVoiceInput: true,
      enableHapticFeedback: true,
      optimizeForBattery: true,
      compressResponses: true,
      offlineMode: false
    }
  }
}

// ==================== 工具配置 ====================

export const MOBILE_TOOL_CONFIGS = {
  database_query: {
    timeout: 15000,
    retryCount: 2,
    mobile: {
      enableOfflineCache: true,
      compressData: true,
      backgroundExecution: false,
      progressTracking: true
    }
  },
  
  image_generation: {
    timeout: 45000,
    retryCount: 1, // 图片生成重试次数少
    mobile: {
      enableOfflineCache: false,
      compressData: true,
      backgroundExecution: true, // 图片生成可以后台执行
      progressTracking: true
    }
  },
  
  document_generation: {
    timeout: 30000,
    retryCount: 2,
    mobile: {
      enableOfflineCache: true,
      compressData: true,
      backgroundExecution: false,
      progressTracking: true
    }
  },
  
  email_sender: {
    timeout: 10000,
    retryCount: 3,
    mobile: {
      enableOfflineCache: false,
      compressData: false,
      backgroundExecution: true,
      progressTracking: false
    }
  },
  
  calendar_tool: {
    timeout: 8000,
    retryCount: 2,
    mobile: {
      enableOfflineCache: true,
      compressData: false,
      backgroundExecution: false,
      progressTracking: false
    }
  },
  
  budget_calculator: {
    timeout: 5000,
    retryCount: 1,
    mobile: {
      enableOfflineCache: true,
      compressData: false,
      backgroundExecution: false,
      progressTracking: false
    }
  }
}

// ==================== 移动端特定配置 ====================

export const MOBILE_DEVICE_CONFIGS = {
  // 触觉反馈配置
  hapticFeedback: {
    onStart: 'medium' as const,
    onComplete: 'light' as const,
    onError: 'heavy' as const,
    patterns: {
      success: [100, 50, 100],
      error: [200, 100, 200, 100, 200],
      warning: [150, 75, 150],
      info: [50]
    }
  },
  
  // 手势配置
  gestures: {
    swipeThreshold: 50,
    tapDelay: 300,
    longPressDelay: 500,
    doubleTapDelay: 300
  },
  
  // 性能阈值
  performanceThresholds: {
    batteryLow: 0.2, // 20%以下为低电量
    memoryHigh: 0.8, // 80%以上为高内存使用
    cpuHigh: 0.7, // 70%以上为高CPU使用
    networkSlow: 1000 // 1秒以上为慢网络
  },
  
  // 优化策略
  optimizationStrategies: {
    lowBattery: {
      reduceAnimations: true,
      disableHapticFeedback: true,
      limitConcurrency: 1,
      enablePowerSaveMode: true
    },
    highMemory: {
      clearCache: true,
      limitStepHistory: 5,
      compressData: true,
      forceGarbageCollection: true
    },
    slowNetwork: {
      enableCompression: true,
      reducePollFrequency: true,
      enableOfflineMode: true,
      prioritizeEssentialRequests: true
    }
  }
}

// ==================== 工作流模板配置 ====================

export const MOBILE_WORKFLOW_TEMPLATES = {
  activity_planning: {
    name: '活动策划工作流',
    description: '完整的活动策划流程，从需求分析到方案生成',
    estimatedDuration: 300000, // 5分钟
    complexity: 'medium' as const,
    steps: [
      'requirements_analysis',
      'historical_data_query',
      'budget_analysis',
      'content_generation',
      'risk_assessment',
      'final_report'
    ]
  },
  
  report_generation: {
    name: '报告生成工作流',
    description: '智能数据分析和报告生成',
    estimatedDuration: 240000, // 4分钟
    complexity: 'low' as const,
    steps: [
      'data_collection',
      'data_analysis',
      'insight_generation',
      'report_formatting',
      'quality_check'
    ]
  },
  
  content_creation: {
    name: '内容创作工作流',
    description: '多媒体内容创作和优化',
    estimatedDuration: 420000, // 7分钟
    complexity: 'high' as const,
    steps: [
      'content_planning',
      'text_generation',
      'image_creation',
      'layout_design',
      'optimization',
      'final_review'
    ]
  }
}

// ==================== API配置 ====================

export const MOBILE_API_CONFIG = {
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
  
  endpoints: {
    chat: '/ai/chat',
    functionTools: '/ai/function-tools/execute',
    expertConsult: '/ai/expert/smart-chat',
    workflow: '/ai/workflow',
    agents: '/ai/agents'
  },
  
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': 'mobile',
    'X-Client-Version': '1.0.0'
  },
  
  // 移动端特定配置
  mobile: {
    enableCompression: true,
    enableCaching: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
    enableOfflineQueue: true,
    maxOfflineQueueSize: 100
  }
}

// ==================== 导出配置 ====================

export default {
  workflow: DEFAULT_MOBILE_WORKFLOW_CONFIG,
  performance: MOBILE_PERFORMANCE_CONFIG,
  agents: MOBILE_AGENT_CONFIGS,
  tools: MOBILE_TOOL_CONFIGS,
  device: MOBILE_DEVICE_CONFIGS,
  templates: MOBILE_WORKFLOW_TEMPLATES,
  api: MOBILE_API_CONFIG
}
