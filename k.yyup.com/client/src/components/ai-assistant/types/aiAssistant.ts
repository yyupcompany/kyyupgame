/**
 * AI助手相关类型定义
 * 从 AIAssistant.vue 第822-835行提取
 */

// Props接口定义
export interface AIAssistantProps {
  visible: boolean
  isFullscreen?: boolean
  mode?: 'fullscreen' | 'sidebar'  // 显示模式：全屏或侧边栏
}

// Emits接口定义
export interface AIAssistantEmits {
  'update:visible': [value: boolean]
  'toggle': []
  'fullscreen-change': [isFullscreen: boolean]
  'width-change': [width: number]
  'show-html-preview': [data: { code: string; title: string; contentType: string }]
  'loading-complete': []  // 🆕 加载完成事件
  'scroll-to-bottom': []  // 🎯 滚动到底部事件
  'ai-response-complete': []  // 🎯 AI响应完成事件
  'missing-fields-detected': [data: any]  // 🆕 缺失字段检测事件
  'operation-confirmation-required': [data: any]  // 🔒 操作确认请求事件
}

// 工具调用状态
export interface ToolCallState {
  id: string
  name: string
  intent?: string // 工具意图描述（"我将要做什么"）
  description?: string // 工具调用的详细描述
  status: 'calling' | 'processing' | 'completed' | 'error'
  progress: number
}

// 渲染组件状态
export interface RenderedComponent {
  id: string
  name: string
  type: string
  icon: any
  component: any
  props: Record<string, any>
  active: boolean
}

// Token使用统计
export interface TokenUsage {
  total: number
  today: number
  remaining: number
  limit: number
  weeklyTrend: number[]
}

// 全屏状态
export interface FullscreenState {
  entering: boolean
  exiting: boolean
}

// 会话信息
export interface ConversationInfo {
  id: string
  title: string
  messageCount?: number
  updatedAt?: string
  lastMessageAt?: string
  isArchived?: boolean
  isPinned?: boolean
  summary?: string
  unreadCount?: number
}

// 函数调用状态（从第784-796行提取）
export interface FunctionCallState {
  callId?: string
  name: string
  description: string
  details: string
  status: 'running' | 'completed' | 'failed'
  params?: any
  result?: any
  executionSteps: string[]
  startTime: number
  duration?: number
  retrying?: boolean
  showVisualization?: boolean
  // 🎯 新增：工具意图相关字段
  intent?: string        // 工具调用意图（"我将要做什么"）
  friendlyName?: string  // 友好名称
  narration?: string     // 工具解说（AI生成的工具执行结果解说）
}

// 当前AI响应状态（从第798-813行提取）
export interface CurrentAIResponseState {
  visible: boolean
  thinking: {
    visible: boolean
    collapsed: boolean
    content: string
  }
  functionCalls: FunctionCallState[]
  answer: {
    visible: boolean
    content: string
    streaming: boolean
    hasComponent: boolean
    componentData: any
  }
}

// 扩展的聊天消息类型（从第816-820行提取）
export interface ExtendedChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string | Date
  pageContext?: string
  hasEnhancedData?: boolean
  thinkingProcess?: { content: string; collapsed: boolean } | null
  functionCalls?: FunctionCallState[] | null
  toolCalls?: FunctionCallState[] | null  // 🎯 兼容字段：同时支持 toolCalls 和 functionCalls

  // 🎯 新增：消息类型字段
  type?: 'thinking' | 'tool_intent' | 'tool_call' | 'tool_call_start' | 'tool_narration' | 'answer' | 'search'

  // 🎯 新增：工具调用相关字段
  toolName?: string
  toolIntent?: string
  toolDescription?: string
  toolStatus?: 'pending' | 'running' | 'completed' | 'failed'
  startTimestamp?: number
  duration?: number
  description?: string  // 兼容字段：工具描述
  intent?: string       // 兼容字段：工具意图

  // 🎯 新增：思考过程相关字段
  fullContent?: string      // 完整思考内容（用于循环显示）
  isCollapsed?: boolean     // 是否收缩

  // 🎯 新增：搜索相关字段
  searchStatus?: 'start' | 'progress' | 'complete'
  searchPercentage?: number
  searchQuery?: string
  searchResultCount?: number
  searchResults?: Array<{ title: string; snippet: string }>

  // 🎯 新增：其他字段
  sending?: boolean
  isThinking?: boolean
  componentData?: any
  conversationId?: string  // 🎯 新增：会话ID
  feedback?: 'like' | 'dislike' | null  // 🎯 新增：用户反馈
}

// AI快捷操作
export interface AIShortcut {
  id: string
  title: string
  content: string
  icon?: string
  category?: string
}

// 工作流步骤队列类型
export interface WorkflowStepQueueType {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: Array<{
    id: string
    name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    description?: string
  }>
}
