/**
 * 🤖 移动端AI工作流类型定义
 * 
 * 完全独立的移动端工作流类型系统
 * 不依赖任何PC端类型定义
 */

// ==================== 基础类型 ====================

export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
// 与后端Smart Expert系统对应的专家类型
export type AgentType =
  | 'activity_planner'      // 活动策划专家
  | 'marketing_expert'      // 招生营销专家
  | 'education_expert'      // 教育评估专家
  | 'cost_analyst'          // 成本分析专家
  | 'risk_assessor'         // 风险评估专家
  | 'creative_designer'     // 创意设计专家
  | 'curriculum_expert'     // 课程教学专家

// 与后端Expert Consultation系统对应的专家类型
export type ExpertConsultationType =
  | 'planner'               // 招生策划专家
  | 'psychologist'          // 心理学专家
  | 'investor'              // 投资分析专家
  | 'director'              // 园长管理专家
  | 'teacher'               // 执行教师专家
  | 'parent'                // 家长体验专家
export type StepType = 'agent' | 'tool' | 'decision' | 'parallel' | 'condition'

// ==================== 工作流定义 ====================

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  category: 'activity_planning' | 'report_generation' | 'data_analysis' | 'content_creation' | 'custom'
  steps: WorkflowStep[]
  dependencies: StepDependency[]
  configuration: WorkflowConfig
  metadata: WorkflowMetadata
}

export interface WorkflowStep {
  id: string
  name: string
  description: string
  type: StepType
  order: number
  
  // 智能体配置
  agent?: AgentConfig
  
  // 工具配置
  tool?: ToolConfig
  
  // 条件配置
  condition?: ConditionConfig
  
  // 执行配置
  execution: StepExecutionConfig
  
  // 移动端特定配置
  mobile: MobileStepConfig
}

export interface StepDependency {
  from: string
  to: string
  condition?: string
  type: 'sequential' | 'conditional' | 'parallel'
}

export interface WorkflowConfig {
  timeout: number
  retryPolicy: RetryPolicy
  errorHandling: ErrorHandlingConfig
  performance: PerformanceConfig
  mobile: MobileWorkflowConfig
}

export interface WorkflowMetadata {
  author: string
  createdAt: string
  updatedAt: string
  tags: string[]
  estimatedDuration: number
  complexity: 'low' | 'medium' | 'high'
  platform: 'mobile' | 'desktop' | 'both'
}

// ==================== 智能体配置 ====================

export interface AgentConfig {
  type: AgentType
  name: string
  description: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  tools: string[]
  capabilities: AgentCapability[]
  mobile: MobileAgentConfig
}

export interface AgentCapability {
  name: string
  description: string
  enabled: boolean
  parameters?: Record<string, any>
}

export interface MobileAgentConfig {
  enableVoiceInput: boolean
  enableHapticFeedback: boolean
  optimizeForBattery: boolean
  compressResponses: boolean
  offlineMode: boolean
}

// ==================== 工具配置 ====================

export interface ToolConfig {
  name: string
  description: string
  parameters: Record<string, any>
  validation: ValidationSchema
  timeout: number
  retryCount: number
  mobile: MobileToolConfig
}

export interface MobileToolConfig {
  enableOfflineCache: boolean
  compressData: boolean
  backgroundExecution: boolean
  progressTracking: boolean
}

export interface ValidationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  properties?: Record<string, ValidationSchema>
  required?: string[]
  pattern?: string
  minimum?: number
  maximum?: number
}

// ==================== 执行配置 ====================

export interface StepExecutionConfig {
  timeout: number
  retryPolicy: RetryPolicy
  continueOnError: boolean
  parallel: boolean
  priority: 'low' | 'normal' | 'high'
  resources: ResourceRequirements
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  baseDelay: number
  maxDelay: number
  retryConditions: string[]
}

export interface ErrorHandlingConfig {
  strategy: 'fail_fast' | 'continue' | 'retry' | 'fallback'
  fallbackStep?: string
  notificationLevel: 'none' | 'error' | 'warning' | 'info'
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface PerformanceConfig {
  maxConcurrentSteps: number
  memoryLimit: number
  cpuThreshold: number
  networkOptimization: boolean
  cacheStrategy: 'none' | 'memory' | 'storage' | 'hybrid'
}

export interface ResourceRequirements {
  memory: number
  cpu: number
  network: boolean
  storage: number
  battery: number
}

// ==================== 移动端特定配置 ====================

export interface MobileWorkflowConfig {
  enableHapticFeedback: boolean
  enableVoiceInput: boolean
  enableOfflineMode: boolean
  batteryOptimization: boolean
  networkOptimization: boolean
  memoryOptimization: boolean
  backgroundExecution: boolean
  progressNotifications: boolean
}

export interface MobileStepConfig {
  showProgress: boolean
  enableSwipeGestures: boolean
  hapticFeedback: HapticFeedbackConfig
  voiceCommands: string[]
  shortcuts: MobileShortcut[]
}

export interface HapticFeedbackConfig {
  onStart: 'light' | 'medium' | 'heavy' | 'none'
  onComplete: 'light' | 'medium' | 'heavy' | 'none'
  onError: 'light' | 'medium' | 'heavy' | 'none'
  pattern?: number[]
}

export interface MobileShortcut {
  gesture: 'tap' | 'double_tap' | 'long_press' | 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down'
  action: string
  parameters?: Record<string, any>
}

// ==================== 条件配置 ====================

export interface ConditionConfig {
  expression: string
  variables: Record<string, any>
  trueStep: string
  falseStep: string
  operator: 'and' | 'or' | 'not' | 'equals' | 'greater' | 'less' | 'contains'
}

// ==================== 执行实例 ====================

export interface WorkflowInstance {
  id: string
  definitionId: string
  definition: WorkflowDefinition
  status: WorkflowStatus
  startTime: number
  endTime?: number
  currentStep?: string
  executionContext: ExecutionContext
  stepStates: Map<string, StepState>
  results: WorkflowResults
  metadata: ExecutionMetadata
}

export interface ExecutionContext {
  workflowId: string
  stepResults: Map<string, any>
  globalVariables: Map<string, any>
  userContext: UserContext
  deviceContext: DeviceContext
  metadata: ExecutionMetadata
}

export interface UserContext {
  userId: string
  role: string
  permissions: string[]
  preferences: UserPreferences
}

export interface DeviceContext {
  platform: 'mobile' | 'tablet' | 'desktop'
  os: string
  browser: string
  screenSize: { width: number; height: number }
  networkType: string
  batteryLevel: number
  memoryUsage: number
  isOnline: boolean
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  hapticFeedback: boolean
  voiceInput: boolean
  autoSave: boolean
}

export interface ExecutionMetadata {
  startTime: number
  endTime?: number
  duration?: number
  platform: 'mobile'
  version: string
  environment: 'development' | 'staging' | 'production'
  sessionId: string
  traceId: string
}

// ==================== 步骤状态 ====================

export interface StepState {
  id: string
  status: StepStatus
  startTime?: number
  endTime?: number
  duration?: number
  result?: StepResult
  error?: StepError
  progress: number
  logs: StepLog[]
  metadata: StepMetadata
}

export interface StepResult {
  success: boolean
  data?: any
  output?: string
  artifacts?: Artifact[]
  metrics?: StepMetrics
  nextStep?: string
}

export interface StepError {
  code: string
  message: string
  details?: any
  stack?: string
  recoverable: boolean
  retryCount: number
}

export interface StepLog {
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
}

export interface StepMetadata {
  executionTime: number
  memoryUsage: number
  networkCalls: number
  cacheHits: number
  retryCount: number
}

export interface StepMetrics {
  executionTime: number
  memoryPeak: number
  networkBytes: number
  cacheEfficiency: number
  errorRate: number
}

export interface Artifact {
  id: string
  type: 'file' | 'image' | 'document' | 'data' | 'report'
  name: string
  description: string
  url?: string
  data?: any
  metadata: ArtifactMetadata
}

export interface ArtifactMetadata {
  size: number
  format: string
  createdAt: string
  checksum?: string
  tags: string[]
}

// ==================== 工作流结果 ====================

export interface WorkflowResults {
  success: boolean
  completedSteps: number
  totalSteps: number
  artifacts: Artifact[]
  summary: ResultSummary
  metrics: WorkflowMetrics
  recommendations: Recommendation[]
}

export interface ResultSummary {
  title: string
  description: string
  keyFindings: string[]
  nextActions: string[]
  confidence: number
}

export interface WorkflowMetrics {
  totalExecutionTime: number
  averageStepTime: number
  memoryPeakUsage: number
  networkTotalBytes: number
  cacheHitRate: number
  errorRate: number
  successRate: number
}

export interface Recommendation {
  id: string
  type: 'optimization' | 'improvement' | 'warning' | 'suggestion'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: RecommendationAction
}

export interface RecommendationAction {
  type: 'workflow_modification' | 'parameter_adjustment' | 'resource_allocation' | 'user_action'
  description: string
  parameters: Record<string, any>
  estimatedImpact: string
}
