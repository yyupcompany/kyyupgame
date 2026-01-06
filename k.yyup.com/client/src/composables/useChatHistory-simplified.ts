import { ref, computed } from 'vue'

/**
 * 聊天消息类型
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  shortcutId?: number
  sessionId?: string
  pageContext?: string
  // 添加metadata属性以支持交互元数据
  metadata?: {
    interaction?: {
      type: string
      [key: string]: any
    }
    [key: string]: any
  }
  // 添加componentData属性以支持UI组件渲染
  componentData?: {
    id: string
    type: string
    title?: string
    data?: any
    chartType?: string
    options?: any
    timestamp?: number
  }
}

/**
 * 简化的聊天历史管理组合式函数
 * 移除了localStorage存储，只保留当前会话的消息管理
 * 历史记忆功能由六维记忆系统处理
 */
export function useChatHistory() {
  // 当前会话消息（仅用于UI显示）
  const currentMessages = ref<ChatMessage[]>([])
  
  // 配置
  const MAX_VISIBLE_MESSAGES = 50 // 对话框最多显示的消息数

  // 可见消息（对话框中显示的消息）
  const visibleMessages = computed(() =>
    currentMessages.value.slice(-MAX_VISIBLE_MESSAGES)
  )
  
  /**
   * 生成消息ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }
  
  /**
   * 添加消息到当前会话
   */
  const addMessage = (
    role: 'user' | 'assistant',
    content: string,
    options?: {
      shortcutId?: number
      sessionId?: string
      pageContext?: string
      metadata?: any
      componentData?: any
    }
  ): ChatMessage => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      shortcutId: options?.shortcutId,
      sessionId: options?.sessionId,
      pageContext: options?.pageContext,
      metadata: options?.metadata,
      componentData: options?.componentData
    }
    
    currentMessages.value.push(message)
    
    // 限制消息数量，避免内存过度使用
    if (currentMessages.value.length > MAX_VISIBLE_MESSAGES * 2) {
      currentMessages.value = currentMessages.value.slice(-MAX_VISIBLE_MESSAGES)
    }
    
    return message
  }
  
  /**
   * 清空当前会话消息
   */
  const clearMessages = () => {
    currentMessages.value = []
  }
  
  /**
   * 删除指定消息
   */
  const deleteMessage = (messageId: string) => {
    const index = currentMessages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      currentMessages.value.splice(index, 1)
    }
  }
  
  /**
   * 更新消息内容
   */
  const updateMessage = (messageId: string, content: string) => {
    const message = currentMessages.value.find(msg => msg.id === messageId)
    if (message) {
      message.content = content
      message.timestamp = new Date().toISOString()
    }
  }
  
  /**
   * 获取最后一条消息
   */
  const getLastMessage = (): ChatMessage | null => {
    return currentMessages.value.length > 0 
      ? currentMessages.value[currentMessages.value.length - 1] 
      : null
  }
  
  /**
   * 获取用户消息数量
   */
  const getUserMessageCount = (): number => {
    return currentMessages.value.filter(msg => msg.role === 'user').length
  }
  
  /**
   * 获取助手消息数量
   */
  const getAssistantMessageCount = (): number => {
    return currentMessages.value.filter(msg => msg.role === 'assistant').length
  }

  return {
    // 状态
    currentMessages,
    visibleMessages,
    
    // 方法
    addMessage,
    clearMessages,
    deleteMessage,
    updateMessage,
    getLastMessage,
    getUserMessageCount,
    getAssistantMessageCount,
    
    // 工具方法
    generateMessageId
  }
}
