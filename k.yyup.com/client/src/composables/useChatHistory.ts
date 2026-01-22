import { ref, computed } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  conversationId?: string
  // 🔧 新增：工具调用信息
  toolCalls?: any[]
  // 🔧 新增：组件数据
  componentData?: any
  // 🔧 新增：其他扩展字段
  [key: string]: any
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// 🔧 单例模式：确保所有组件共享同一个聊天历史实例
let chatHistoryInstance: ReturnType<typeof createChatHistory> | null = null

/**
 * 创建聊天历史管理实例
 */
function createChatHistory() {
  // 当前会话的消息
  const currentMessages = ref<ChatMessage[]>([])
  const currentSessionId = ref<string>('default')
  
  // 添加消息到当前会话
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    // 🔧 修复：确保消息 ID 唯一性，使用高精度时间戳
    const timestamp = new Date()
    const uniqueId = `${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`

    const newMessage: ChatMessage = {
      ...message,
      role: message.role,
      content: message.content,
      id: uniqueId,
      timestamp: timestamp,
      conversationId: currentSessionId.value
    }
    currentMessages.value.push(newMessage)
    console.log('📝 [ChatHistory] 添加消息:', {
      id: newMessage.id,
      type: (newMessage as any).type || 'unknown',
      role: newMessage.role,
      timestamp: timestamp.toISOString()
    })
    return newMessage
  }
  
  // 清空当前会话
  const clearCurrentSession = () => {
    currentMessages.value = []
  }
  
  // 创建新会话
  const createNewSession = () => {
    currentMessages.value = []
    currentSessionId.value = `session_${Date.now()}`
    return currentSessionId.value
  }
  
  // 获取当前会话消息
  const getCurrentMessages = computed(() => currentMessages.value)
  
  // 获取消息数量
  const messageCount = computed(() => currentMessages.value.length)
  
  // 获取最后一条消息
  const lastMessage = computed(() => {
    const messages = currentMessages.value
    return messages.length > 0 ? messages[messages.length - 1] : null
  })
  
  // 删除指定消息
  const removeMessage = (messageId: string) => {
    const index = currentMessages.value.findIndex(msg => msg.id === messageId)
    if (index > -1) {
      currentMessages.value.splice(index, 1)
    }
  }
  
  // 更新消息内容
  const updateMessage = (messageId: string, content: string) => {
    const message = currentMessages.value.find(msg => msg.id === messageId)
    if (message) {
      message.content = content
    }
  }
  
  // 兼容性方法 - 为了保持与原有代码的兼容性
  const loadHistory = () => {
    console.log('📝 聊天历史由六维记忆系统管理，无需本地加载')
  }

  // 🔧 新增：直接设置当前会话的消息（用于会话切换时同步消息）
  const setMessages = (messages: ChatMessage[]) => {
    currentMessages.value = messages
    console.log(`📝 [ChatHistory] 已设置 ${messages.length} 条消息到当前会话`)
  }
  
  const saveHistory = () => {
    console.log('📝 聊天历史由六维记忆系统管理，无需本地保存')
  }
  
  const exportSession = () => {
    console.log('📝 会话导出功能已迁移到六维记忆系统')
    return null
  }
  
  const searchHistory = () => {
    console.log('📝 历史搜索功能已迁移到六维记忆系统')
    return []
  }

  // 🔧 新增：获取统计信息
  const getStatistics = () => {
    const messages = currentMessages.value
    const userMessages = messages.filter(m => m.role === 'user').length
    const assistantMessages = messages.filter(m => m.role === 'assistant').length
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0)

    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      totalTokens,
      sessionId: currentSessionId.value,
      createdAt: messages.length > 0 ? messages[0].timestamp : new Date(),
      lastActiveAt: messages.length > 0 ? messages[messages.length - 1].timestamp : new Date()
    }
  }

  // 🔧 新增：获取会话列表（简化实现）
  const sessions = computed(() => {
    return [{
      id: currentSessionId.value,
      title: `会话 ${currentSessionId.value}`,
      messages: currentMessages.value,
      createdAt: currentMessages.value[0]?.timestamp || new Date(),
      updatedAt: currentMessages.value[currentMessages.value.length - 1]?.timestamp || new Date()
    }]
  })

  return {
    // 核心状态
    currentMessages: getCurrentMessages,
    currentSessionId,
    messageCount,
    lastMessage,
    sessions,

    // 核心方法
    addMessage,
    removeMessage,
    updateMessage,
    clearCurrentSession,
    createNewSession,
    setMessages, // 🔧 新增：设置当前会话消息

    // 兼容性方法
    loadHistory,
    saveHistory,
    exportSession,
    searchHistory,
    getStatistics,

    // 别名方法（为了兼容性）
    messages: getCurrentMessages,
    addMessageToHistory: addMessage,
    clearHistory: clearCurrentSession
  }
}

/**
 * 简化的聊天历史管理 - 只管理当前会话的消息
 * 六维记忆系统负责持久化存储
 *
 * 🔧 单例模式：确保所有组件共享同一个聊天历史实例
 */
export function useChatHistory() {
  if (!chatHistoryInstance) {
    console.log('🔧 [useChatHistory] 创建新的聊天历史实例（单例）')
    chatHistoryInstance = createChatHistory()
  } else {
    console.log('🔧 [useChatHistory] 返回现有聊天历史实例（单例）')
  }
  return chatHistoryInstance
}
