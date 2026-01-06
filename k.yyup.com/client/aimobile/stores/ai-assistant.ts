/**
 * 🏫 移动端AI助手状态管理
 * 
 * 基于 05-API集成说明.md 的AI服务设计
 * 管理AI对话、语音识别、智能推荐等功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MobileAPIService } from '../services/mobile-api.service'

const mobileAPIService = new MobileAPIService()

export interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'delivered' | 'failed'
  actions?: MessageAction[]
  metadata?: Record<string, any>
}

export interface MessageAction {
  id: string
  title: string
  type: 'link' | 'action' | 'form'
  payload?: any
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  context?: Record<string, any>
}

export interface VoiceRecognition {
  isSupported: boolean
  isListening: boolean
  isProcessing: boolean
  error?: string
  transcript?: string
  confidence?: number
}

export interface AiCapabilities {
  chat: boolean
  voice: boolean
  imageRecognition: boolean
  documentAnalysis: boolean
  smartRecommendation: boolean
  contextAware: boolean
}

export const useAiAssistantStore = defineStore('ai-assistant', () => {
  // ==================== 状态数据 ====================

  // 聊天会话
  const currentSession = ref<ChatSession | null>(null)
  const chatSessions = ref<ChatSession[]>([])
  const isLoading = ref(false)
  const isTyping = ref(false)

  // 语音识别
  const voiceRecognition = ref<VoiceRecognition>({
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    isListening: false,
    isProcessing: false
  })

  // AI能力
  const capabilities = ref<AiCapabilities>({
    chat: true,
    voice: true,
    imageRecognition: true,
    documentAnalysis: true,
    smartRecommendation: true,
    contextAware: true
  })

  // 设置
  const settings = ref({
    autoSpeech: false,          // 自动语音播放
    voiceSpeed: 1.0,           // 语音播放速度
    voiceVolume: 0.8,          // 语音音量
    language: 'zh-CN',         // 语言设置
    theme: 'auto',             // 主题
    contextMemory: true,       // 上下文记忆
    smartSuggestions: true,    // 智能建议
    hapticFeedback: true       // 触觉反馈
  })

  // 智能建议
  const suggestions = ref<string[]>([])
  const quickReplies = ref<string[]>([])

  // 状态标记
  const isVisible = ref(false)
  const isMinimized = ref(false)
  const hasUnreadMessages = ref(false)

  // 语音相关
  const speechRecognition = ref<any>(null)
  const speechSynthesis = ref<any>(null)

  // ==================== 计算属性 ====================

  const hasActiveSessions = computed(() => chatSessions.value.length > 0)
  
  const currentSessionMessages = computed(() => 
    currentSession.value?.messages || []
  )

  const unreadCount = computed(() => {
    let count = 0
    chatSessions.value.forEach(session => {
      session.messages.forEach(message => {
        if (message.type === 'ai' && message.status !== 'delivered') {
          count++
        }
      })
    })
    return count
  })

  const canUseVoice = computed(() => 
    capabilities.value.voice && voiceRecognition.value.isSupported
  )

  const isVoiceActive = computed(() => 
    voiceRecognition.value.isListening || voiceRecognition.value.isProcessing
  )

  const lastUserMessage = computed(() => {
    const messages = currentSessionMessages.value
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        return messages[i]
      }
    }
    return null
  })

  const contextData = computed(() => {
    if (!settings.value.contextMemory) return {}
    
    return {
      sessionId: currentSession.value?.id,
      messageCount: currentSessionMessages.value.length,
      lastActivity: currentSession.value?.updatedAt,
      userPreferences: getUserPreferences()
    }
  })

  // ==================== 方法 ====================

  // 初始化AI助手
  const initialize = async () => {
    try {
      // 初始化语音识别
      await initializeSpeechRecognition()
      
      // 初始化语音合成
      initializeSpeechSynthesis()
      
      // 加载聊天历史
      await loadChatHistory()
      
      // 检查AI服务状态（简化版）
      await checkAiServiceStatus()
      
      console.log('AI助手初始化完成')
    } catch (error) {
      console.error('AI助手初始化失败:', error)
    }
  }

  // 初始化语音识别
  const initializeSpeechRecognition = async () => {
    if (!voiceRecognition.value.isSupported) return

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      speechRecognition.value = new SpeechRecognition()
      
      speechRecognition.value.continuous = false
      speechRecognition.value.interimResults = true
      speechRecognition.value.lang = settings.value.language

      speechRecognition.value.onstart = () => {
        voiceRecognition.value.isListening = true
        voiceRecognition.value.error = undefined
      }

      speechRecognition.value.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        
        voiceRecognition.value.transcript = transcript
        voiceRecognition.value.confidence = event.results[0]?.[0]?.confidence || 0
      }

      speechRecognition.value.onend = () => {
        voiceRecognition.value.isListening = false
        voiceRecognition.value.isProcessing = false
      }

      speechRecognition.value.onerror = (event: any) => {
        voiceRecognition.value.error = event.error
        voiceRecognition.value.isListening = false
        voiceRecognition.value.isProcessing = false
      }

    } catch (error) {
      console.error('语音识别初始化失败:', error)
      voiceRecognition.value.isSupported = false
    }
  }

  // 初始化语音合成
  const initializeSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.value = window.speechSynthesis
    }
  }

  // 检查AI服务状态（简化版）
  const checkAiServiceStatus = async () => {
    try {
      // 使用移动端API服务检查专家列表
      const expertList = await mobileAPIService.getSmartExpertList()
      
      capabilities.value = {
        ...capabilities.value,
        chat: true,
        smartRecommendation: true,
        contextAware: true
      }
      
      console.log('发现可用专家：', expertList.data?.total || 0, '个')
      return true
    } catch (error) {
      console.error('移动端AI服务状态检查失败:', error)
      return false
    }
  }

  // 创建新会话
  const createSession = () => {
    const session: ChatSession = {
      id: generateSessionId(),
      title: `对话 ${chatSessions.value.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    chatSessions.value.unshift(session)
    currentSession.value = session
    
    return session
  }

  // 发送消息
  const sendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return null

    // 确保有活动会话
    if (!currentSession.value) {
      createSession()
    }

    const session = currentSession.value!
    
    // 创建用户消息
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sending',
      metadata: { inputType: type }
    }

    // 添加到消息列表
    session.messages.push(userMessage)
    session.updatedAt = new Date()

    try {
      isLoading.value = true
      isTyping.value = true
      
      // 标记消息为已发送
      userMessage.status = 'sent'

      // 调用移动端AI服务，使用Smart Chat接口
      const response = await mobileAPIService.callSmartExpert({
        expert_id: 'activity_planner', // 默认使用活动策划专家，可根据内容智能选择
        task: content,
        context: `会话ID: ${session.id}, 用户需求: ${content}`
      })

      // 创建AI回复消息
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'ai',
        content: response.advice || '抱歉，我现在无法回复您的问题，请稍后再试。',
        timestamp: new Date(),
        status: 'delivered',
        actions: [], // 目前专家系统不返回actions
        metadata: {
          expert_id: response.expert_id,
          expert_name: response.expert_name,
          timestamp: response.timestamp,
          error: response.error
        }
      }

      // 添加AI回复
      session.messages.push(aiMessage)
      session.updatedAt = new Date()

      // 更新建议
      if (response.suggestions) {
        suggestions.value = response.suggestions
      }

      // 更新快捷回复
      if (response.quickReplies) {
        quickReplies.value = response.quickReplies
      }

      // 自动语音播放
      if (settings.value.autoSpeech && type === 'voice') {
        await speakText(response.content)
      }

      // 保存会话
      await saveChatHistory()

      return {
        success: true,
        content: response.content,
        actions: response.actions,
        suggestions: response.suggestions
      }

    } catch (error) {
      console.error('发送消息失败:', error)
      
      userMessage.status = 'failed'
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'system',
        content: '抱歉，消息发送失败，请稍后重试。',
        timestamp: new Date()
      }
      
      session.messages.push(errorMessage)

      return {
        success: false,
        error: error.message
      }

    } finally {
      isLoading.value = false
      isTyping.value = false
    }
  }

  // 开始语音识别
  const startVoiceRecognition = async () => {
    if (!canUseVoice.value || voiceRecognition.value.isListening) return

    try {
      voiceRecognition.value.isProcessing = true
      await speechRecognition.value.start()
    } catch (error) {
      console.error('语音识别启动失败:', error)
      voiceRecognition.value.error = error.message
      voiceRecognition.value.isProcessing = false
    }
  }

  // 停止语音识别
  const stopVoiceRecognition = () => {
    if (speechRecognition.value && voiceRecognition.value.isListening) {
      speechRecognition.value.stop()
    }
  }

  // 语音转文字并发送
  const processVoiceInput = async () => {
    if (!voiceRecognition.value.transcript) return

    const transcript = voiceRecognition.value.transcript
    voiceRecognition.value.transcript = undefined

    return await sendMessage(transcript, 'voice')
  }

  // 文字转语音
  const speakText = async (text: string) => {
    if (!speechSynthesis.value || !text) return

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.lang = settings.value.language
      utterance.rate = settings.value.voiceSpeed
      utterance.volume = settings.value.voiceVolume

      utterance.onend = () => resolve(true)
      utterance.onerror = (error) => reject(error)

      speechSynthesis.value.speak(utterance)
    })
  }

  // 获取智能建议
  const getSmartSuggestions = async (context?: string) => {
    if (!settings.value.smartSuggestions) return []

    try {
      const response = await aiApi.getSuggestions({
        context: context || getCurrentContext(),
        sessionId: currentSession.value?.id,
        userPreferences: getUserPreferences()
      })

      suggestions.value = response.suggestions
      return response.suggestions

    } catch (error) {
      console.error('获取智能建议失败:', error)
      return []
    }
  }

  // 获取当前上下文
  const getCurrentContext = () => {
    const recentMessages = currentSessionMessages.value.slice(-5)
    return recentMessages.map(msg => ({
      type: msg.type,
      content: msg.content.slice(0, 100)
    }))
  }

  // 获取用户偏好
  const getUserPreferences = () => {
    return {
      language: settings.value.language,
      preferredResponseLength: 'medium',
      topics: extractUserTopics(),
      interactionStyle: 'friendly'
    }
  }

  // 提取用户话题
  const extractUserTopics = () => {
    const topics = new Set<string>()
    
    chatSessions.value.forEach(session => {
      session.messages.forEach(message => {
        if (message.type === 'user') {
          // 简单的关键词提取
          const keywords = message.content
            .toLowerCase()
            .match(/[^\s\.,!?;:]+/g) || []
          
          keywords.forEach(keyword => {
            if (keyword.length > 3) {
              topics.add(keyword)
            }
          })
        }
      })
    })

    return Array.from(topics).slice(0, 10)
  }

  // 清空当前会话
  const clearCurrentSession = () => {
    if (currentSession.value) {
      currentSession.value.messages = []
      currentSession.value.updatedAt = new Date()
    }
    suggestions.value = []
    quickReplies.value = []
  }

  // 删除会话
  const deleteSession = (sessionId: string) => {
    const index = chatSessions.value.findIndex(s => s.id === sessionId)
    if (index > -1) {
      chatSessions.value.splice(index, 1)
      
      if (currentSession.value?.id === sessionId) {
        currentSession.value = chatSessions.value[0] || null
      }
      
      saveChatHistory()
    }
  }

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      const stored = localStorage.getItem('ai-chat-history')
      if (stored) {
        const data = JSON.parse(stored)
        chatSessions.value = data.sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp)
          }))
        }))

        if (chatSessions.value.length > 0) {
          currentSession.value = chatSessions.value[0]
        }
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }
  }

  // 保存聊天历史
  const saveChatHistory = async () => {
    try {
      const data = {
        sessions: chatSessions.value,
        settings: settings.value,
        lastSaved: new Date()
      }
      
      localStorage.setItem('ai-chat-history', JSON.stringify(data))
    } catch (error) {
      console.error('保存聊天历史失败:', error)
    }
  }

  // 生成会话ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 生成消息ID
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<typeof settings.value>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveChatHistory()
  }

  // 显示/隐藏助手
  const showAssistant = () => {
    isVisible.value = true
    hasUnreadMessages.value = false
  }

  const hideAssistant = () => {
    isVisible.value = false
  }

  // 最小化/最大化
  const minimizeAssistant = () => {
    isMinimized.value = true
  }

  const maximizeAssistant = () => {
    isMinimized.value = false
  }

  // 清理资源
  const cleanup = () => {
    if (speechRecognition.value) {
      speechRecognition.value.stop()
    }
    
    if (speechSynthesis.value) {
      speechSynthesis.value.cancel()
    }
  }

  // ==================== 返回 ====================

  return {
    // 状态
    currentSession,
    chatSessions,
    isLoading,
    isTyping,
    voiceRecognition,
    capabilities,
    settings,
    suggestions,
    quickReplies,
    isVisible,
    isMinimized,
    hasUnreadMessages,

    // 计算属性
    hasActiveSessions,
    currentSessionMessages,
    unreadCount,
    canUseVoice,
    isVoiceActive,
    lastUserMessage,
    contextData,

    // 方法
    initialize,
    createSession,
    sendMessage,
    startVoiceRecognition,
    stopVoiceRecognition,
    processVoiceInput,
    speakText,
    getSmartSuggestions,
    clearCurrentSession,
    deleteSession,
    loadChatHistory,
    saveChatHistory,
    updateSettings,
    showAssistant,
    hideAssistant,
    minimizeAssistant,
    maximizeAssistant,
    cleanup
  }
})

export default useAiAssistantStore