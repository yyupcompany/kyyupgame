/**
 * AI助手会话管理 Composable
 *
 * 功能：
 * - 创建和管理多个会话
 * - 每个会话保存最多20条消息
 * - 会话切换和上下文管理
 * - 数据库持久化
 */

import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AIConversationService from '@/api/modules/ai-conversation'
import type { Conversation as DBConversation, Message as DBMessage } from '@/api/modules/ai-conversation'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  toolCalls?: any[]
  metadata?: any
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive?: boolean
}

/**
 * 智能生成会话标题
 * 根据用户消息内容提取关键主题，生成简洁的标题
 */
const generateSmartTitle = (userMessage: string): string => {
  const message = userMessage.trim()

  // 消息太短，返回默认标题
  if (message.length < 3) {
    return '新会话'
  }

  // 定义关键词匹配规则 (幼儿园管理领域)
  const keywordPatterns = [
    // 招生相关
    { keywords: ['招生', '报名', '申请', '入园'], title: '招生咨询' },
    { keywords: ['面试', '测评', '评估', '测试'], title: '面试测评' },
    { keywords: ['录取', '通知', '录取通知'], title: '录取通知' },

    // 活动相关
    { keywords: ['活动', '亲子', '游戏', '运动会', '节日'], title: '活动策划' },
    { keywords: ['方案', '计划', '安排'], title: '方案制定' },
    { keywords: ['推文', '宣传', '文案', '推广'], title: '文案生成' },

    // 学生管理
    { keywords: ['学生', '幼儿', '宝宝', '小孩'], title: '学生管理' },
    { keywords: ['考勤', '签到', '缺勤', '请假'], title: '考勤管理' },
    { keywords: ['档案', '信息', '资料'], title: '档案管理' },

    // 教师管理
    { keywords: ['教师', '老师', '师资'], title: '教师管理' },
    { keywords: ['课程', '教学', '上课'], title: '课程教学' },
    { keywords: ['班级', '班级管理'], title: '班级管理' },

    // 家长管理
    { keywords: ['家长', '父母', '家庭'], title: '家长沟通' },
    { keywords: ['通知', '提醒', '消息'], title: '消息通知' },

    // 财务相关
    { keywords: ['费用', '缴费', '收费', '账单'], title: '财务收费' },
    { keywords: ['退费', '退款'], title: '退费处理' },

    // 数据分析
    { keywords: ['统计', '分析', '报表', '数据'], title: '数据分析' },
    { keywords: ['汇总', '总结', '周报', '月报'], title: '工作总结' },

    // AI助手
    { keywords: ['生成', '创建', '制作'], title: '内容生成' },
    { keywords: ['检查', '查看', '查询', '搜索'], title: '信息查询' },
    { keywords: ['帮助', '怎么', '如何', '怎样'], title: '操作指导' },
  ]

  // 优先匹配关键词
  for (const pattern of keywordPatterns) {
    if (pattern.keywords.some(keyword => message.includes(keyword))) {
      return pattern.title
    }
  }

  // 如果没有匹配到关键词，提取前8个字符作为标题
  const cleanTitle = message
    .replace(/[？?！!。.,，、；;：:]/g, '') // 移除标点符号
    .replace(/\s+/g, '') // 移除空格
    .substring(0, 8) // 取前8个字符

  return cleanTitle || '新会话'
}

export function useConversationManager() {
  // 会话列表
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 🔧 防止重复加载的机制
  const loadingMessages = ref<Set<string>>(new Set())
  const isLoadingConversations = ref(false)

  // 当前激活的会话
  const currentConversation = computed(() => {
    return conversations.value.find(c => c.id === currentConversationId.value)
  })

  // 获取所有消息用于发送到AI
  const getConversationContext = (conversationId: string): Message[] => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    return conversation?.messages || []
  }

  // 数据库消息转换为前端消息格式
  const convertDBMessageToMessage = (dbMessage: DBMessage): Message => {
    return {
      id: dbMessage.id.toString(),
      content: dbMessage.content,
      role: dbMessage.role as 'user' | 'assistant',
      timestamp: new Date(dbMessage.createdAt),
      toolCalls: dbMessage.metadata?.toolCalls,
      metadata: dbMessage.metadata
    }
  }

  // 前端消息转换为数据库消息格式
  const convertMessageToDBMessage = (message: Message, conversationId: string): Partial<DBMessage> => {
    // 安全处理content，确保不为undefined或null
    const safeContent = message.content || ''

    return {
      conversationId,
      role: message.role as 'user' | 'assistant' | 'system' | 'tool',
      content: safeContent,
      messageType: 'text',
      metadata: {
        toolCalls: message.toolCalls,
        ...(message.metadata || {})
      },
      tokens: safeContent.length // 安全的token计算
    }
  }

  // 数据库会话转换为前端会话格式
  const convertDBConversationToConversation = async (dbConv: DBConversation): Promise<Conversation> => {
    // 获取会话消息
    const messagesResponse = await AIConversationService.getConversationMessages(dbConv.id, { pageSize: 20 })
    const messages = messagesResponse.data?.messages.map(convertDBMessageToMessage) || []

    return {
      id: dbConv.id,
      title: dbConv.title || '新会话',
      messages,
      createdAt: new Date(dbConv.createdAt),
      updatedAt: new Date(dbConv.updatedAt),
      isActive: false
    }
  }

  // 从数据库加载会话列表（优化：只加载会话列表，不加载消息）
  const loadConversationsFromDB = async () => {
    // 🔧 防止重复加载
    if (isLoadingConversations.value) {
      console.log('⚠️ [ConversationManager] 正在加载会话列表，跳过重复请求')
      return
    }

    try {
      isLoadingConversations.value = true
      isLoading.value = true
      error.value = null
      console.log('🔄 [ConversationManager] 开始加载会话列表')
      const response = await AIConversationService.getConversations()

      if (response.success && response.data) {
        const dbConversations = response.data
        const loadedConversations: Conversation[] = []

        // 🔧 优化：只转换会话基本信息，不加载消息
        for (const dbConv of dbConversations) {
          const conversation: Conversation = {
            id: dbConv.id,
            title: dbConv.title || '新会话',
            messages: [], // 🔧 不预加载消息，按需加载
            createdAt: new Date(dbConv.createdAt),
            updatedAt: new Date(dbConv.updatedAt),
            isActive: false
          }
          loadedConversations.push(conversation)
        }

        conversations.value = loadedConversations
        console.log(`✅ [ConversationManager] 已加载 ${loadedConversations.length} 个会话`)

        // 如果没有当前会话，激活第一个
        if (!currentConversationId.value && loadedConversations.length > 0) {
          currentConversationId.value = loadedConversations[0].id
          loadedConversations[0].isActive = true
          // 🔧 只为当前激活的会话加载消息
          await loadConversationMessages(currentConversationId.value)
        }
      }
    } catch (err) {
      console.error('加载会话列表失败:', err)
      error.value = '加载会话列表失败'
      ElMessage.error('加载会话列表失败')
    } finally {
      isLoading.value = false
      isLoadingConversations.value = false
    }
  }

  // 🔧 新增：按需加载单个会话的消息
  const loadConversationMessages = async (conversationId: string) => {
    // 🔧 防止重复加载同一个会话的消息
    if (loadingMessages.value.has(conversationId)) {
      console.log(`⚠️ [ConversationManager] 正在加载会话消息: ${conversationId}，跳过重复请求`)
      return
    }

    // 🔧 防止加载空会话ID
    if (!conversationId || conversationId.trim() === '') {
      console.warn(`⚠️ [ConversationManager] 无效的会话ID: ${conversationId}`)
      return
    }

    try {
      loadingMessages.value.add(conversationId)
      console.log(`🔄 [ConversationManager] 开始加载会话消息: ${conversationId}`)

      // 🔧 添加请求超时和错误处理
      const messagesResponse = await Promise.race([
        AIConversationService.getConversationMessages(conversationId, { pageSize: 20 }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), 10000)
        )
      ]) as any

      if (messagesResponse.success && messagesResponse.data?.messages) {
        const messages = messagesResponse.data.messages.map(convertDBMessageToMessage)

        // 更新对应会话的消息
        const conversation = conversations.value.find(c => c.id === conversationId)
        if (conversation) {
          conversation.messages = messages
          console.log(`✅ [ConversationManager] 已加载 ${messages.length} 条消息到会话: ${conversationId}`)
        }
      }
    } catch (err) {
      console.error(`加载会话消息失败 (${conversationId}):`, err)
    } finally {
      loadingMessages.value.delete(conversationId)
    }
  }

  // 创建新会话
  const createConversation = async (): Promise<string> => {
    try {
      isLoading.value = true

      // 在数据库中创建会话
      const response = await AIConversationService.createConversation({
        title: `新会话 ${conversations.value.length + 1}`
      })

      if (response.success && response.data) {
        const newConversation: Conversation = {
          id: response.data.id,
          title: response.data.title || '新会话',
          messages: [],
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          isActive: true
        }

        conversations.value.unshift(newConversation) // 添加到列表开头
        currentConversationId.value = newConversation.id

        console.log(`🆕 [会话管理] 创建新会话: ${newConversation.id}`)
        ElMessage.success('创建新会话成功')
        return newConversation.id
      } else {
        throw new Error(response.error || '创建会话失败')
      }
    } catch (err) {
      console.error('创建会话失败:', err)
      error.value = '创建会话失败'
      ElMessage.error('创建会话失败')

      // 降级到本地创建
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newConversation: Conversation = {
        id: conversationId,
        title: `新会话 ${conversations.value.length + 1}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }

      conversations.value.unshift(newConversation)
      currentConversationId.value = conversationId
      return conversationId
    } finally {
      isLoading.value = false
    }
  }

  // 删除会话
  const deleteConversation = async (conversationId: string) => {
    try {
      // 从数据库删除
      const response = await AIConversationService.deleteConversation(conversationId)

      if (response.success) {
        // 从本地列表移除
        conversations.value = conversations.value.filter(c => c.id !== conversationId)

        // 如果删除的是当前会话，切换到其他会话
        if (currentConversationId.value === conversationId) {
          if (conversations.value.length > 0) {
            currentConversationId.value = conversations.value[0].id
            conversations.value[0].isActive = true
          } else {
            // 如果没有会话了，创建一个新的
            await createConversation()
          }
        }

        console.log(`🗑️ [会话管理] 删除会话成功: ${conversationId}`)
        ElMessage.success('删除会话成功')
      } else {
        throw new Error(response.error || '删除会话失败')
      }
    } catch (err) {
      console.error('删除会话失败:', err)
      error.value = '删除会话失败'
      ElMessage.error('删除会话失败')

      // 降级到本地删除
      conversations.value = conversations.value.filter(c => c.id !== conversationId)

      if (currentConversationId.value === conversationId) {
        if (conversations.value.length > 0) {
          currentConversationId.value = conversations.value[0].id
        }
      }
    }
  }

  // 切换会话
  const switchConversation = async (conversationId: string) => {
    currentConversationId.value = conversationId

    // 更新会话的激活状态
    conversations.value.forEach(conv => {
      conv.isActive = conv.id === conversationId
    })

    // 更新切换会话的更新时间
    const targetConversation = conversations.value.find(c => c.id === conversationId)
    if (targetConversation) {
      targetConversation.updatedAt = new Date()

      // 🔧 按需加载消息：如果目标会话没有消息，则加载
      if (!targetConversation.messages || targetConversation.messages.length === 0) {
        console.log(`🔄 [ConversationManager] 切换到会话 ${conversationId}，开始加载消息`)
        await loadConversationMessages(conversationId)
      }
    }

    saveToStorage()
    console.log(`🔄 [会话管理] 切换到会话: ${conversationId}`)
  }

  // 更新会话标题 (本地版本)
  const updateConversationTitleLocal = (conversationId: string, title: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.title = title
      conversation.updatedAt = new Date()
      saveToStorage()
    }
  }

  // 添加消息到会话
  const addMessage = async (conversationId: string, message: Omit<Message, 'id'>): Promise<Message | null> => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) {
      console.warn(`⚠️ [会话管理] 会话不存在: ${conversationId}`)
      return null
    }

    try {
      // 验证和标准化消息对象
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const safeRole = message.role || 'user'
      
      const fullMessage: Message = {
        id: messageId,
        content: message.content || '',
        role: safeRole,
        timestamp: message.timestamp || new Date(),
        toolCalls: message.toolCalls,
        metadata: message.metadata
      }

      // 尝试保存到数据库
      const dbMessage = convertMessageToDBMessage(fullMessage, conversationId)
      const response = await AIConversationService.addMessage(conversationId, dbMessage as any)

      if (response.success && response.data) {
        // 使用数据库返回的ID
        fullMessage.id = response.data.id.toString()
        console.log(`💾 [会话管理] 消息已保存到数据库: ${fullMessage.id}`)
      } else {
        console.warn(`⚠️ [会话管理] 保存消息到数据库失败: ${response.error}`)
      }

      // 更新本地状态
      conversation.messages.push(fullMessage)
      conversation.updatedAt = new Date()

      // ✨ 智能命名：如果这是第一条用户消息，自动生成会话标题
      const isFirstUserMessage = conversation.messages.length === 1 && message.role === 'user'
      const hasDefaultTitle = conversation.title.startsWith('新会话')

      if (isFirstUserMessage && hasDefaultTitle && message.content) {
        const smartTitle = generateSmartTitle(message.content)
        if (smartTitle && smartTitle !== '新会话') {
          // 异步更新标题到数据库（不阻塞消息添加流程）
          updateConversationTitle(conversationId, smartTitle).catch(err => {
            console.warn('⚠️ [会话管理] 自动更新标题失败:', err)
          })
          console.log(`✨ [会话管理] 自动生成标题: ${smartTitle}`)
        }
      }

      // 如果消息超过20条，移除最早的消息
      if (conversation.messages.length > 20) {
        const removedMessage = conversation.messages.shift()
        console.log(`✂️ [会话管理] 会话 ${conversationId} 超过20条，移除最早消息: ${removedMessage?.id}`)
      }

      return fullMessage
    } catch (err) {
      console.error('添加消息失败:', err)

      // 降级到本地处理
      const fallbackId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fullMessage: Message = {
        id: fallbackId,
        content: message.content || '',
        role: message.role || 'user',
        timestamp: message.timestamp || new Date(),
        toolCalls: message.toolCalls,
        metadata: message.metadata
      }

      conversation.messages.push(fullMessage)
      conversation.updatedAt = new Date()

      // ✨ 智能命名：降级模式下也要自动生成标题
      const isFirstUserMessage = conversation.messages.length === 1 && message.role === 'user'
      const hasDefaultTitle = conversation.title.startsWith('新会话')

      if (isFirstUserMessage && hasDefaultTitle && message.content) {
        const smartTitle = generateSmartTitle(message.content)
        if (smartTitle && smartTitle !== '新会话') {
          // 本地更新标题
          conversation.title = smartTitle
          console.log(`✨ [会话管理] 自动生成标题 (本地): ${smartTitle}`)
        }
      }

      if (conversation.messages.length > 20) {
        conversation.messages.shift()
      }

      return fullMessage
    }
  }

  // 更新会话标题（支持数据库）
  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (!conversation) {
        console.warn(`⚠️ [会话管理] 会话不存在: ${conversationId}`)
        return
      }

      // 更新数据库
      const response = await AIConversationService.updateConversationTitle(conversationId, { title })

      if (response.success) {
        conversation.title = title
        conversation.updatedAt = new Date()
        console.log(`✏️ [会话管理] 会话标题已更新: ${conversationId} -> ${title}`)
        ElMessage.success('会话标题更新成功')
      } else {
        throw new Error(response.error || '更新会话标题失败')
      }
    } catch (err) {
      console.error('更新会话标题失败:', err)
      error.value = '更新会话标题失败'

      // 降级到本地更新
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        conversation.title = title
        conversation.updatedAt = new Date()
      }
    }
  }

  // 更新消息（例如添加工具调用结果）
  const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return
    
    const message = conversation.messages.find(m => m.id === messageId)
    if (message) {
      Object.assign(message, updates)
      conversation.updatedAt = new Date()
      saveToStorage()
    }
  }

  // 获取会话统计信息
  const getConversationStats = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return null

    const userMessages = conversation.messages.filter(m => m.role === 'user').length
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant').length
    const toolCallCount = conversation.messages.reduce((count, msg) => count + (msg.toolCalls?.length || 0), 0)

    return {
      totalMessages: conversation.messages.length,
      userMessages,
      assistantMessages,
      toolCallCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    }
  }

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      const data = {
        conversations: conversations.value,
        currentConversationId: currentConversationId.value
      }
      localStorage.setItem('ai_conversations', JSON.stringify(data))
    } catch (error) {
      console.error('❌ [会话管理] 保存到本地存储失败:', error)
    }
  }

  // 从本地存储加载
  const loadFromStorage = () => {
    try {
      const data = localStorage.getItem('ai_conversations')
      if (data) {
        const parsed = JSON.parse(data)
        conversations.value = parsed.conversations?.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        })) || []
        currentConversationId.value = parsed.currentConversationId || ''

        // 如果没有会话或当前会话不存在，创建一个新会话
        if (conversations.value.length === 0 || !conversations.value.find(c => c.id === currentConversationId.value)) {
          createConversation()
        }

        console.log(`📂 [会话管理] 从本地存储加载了 ${conversations.value.length} 个会话`)
      } else {
        // 如果没有本地数据，创建一个新会话
        createConversation()
      }
    } catch (error) {
      console.error('❌ [会话管理] 从本地存储加载失败:', error)
      createConversation()
    }
  }

  // 清理过期会话（可选）
  const cleanupOldConversations = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const initialLength = conversations.value.length
    conversations.value = conversations.value.filter(conv => {
      return conv.updatedAt > oneWeekAgo
    })

    if (conversations.value.length < initialLength) {
      console.log(`🧹 [会话管理] 清理了 ${initialLength - conversations.value.length} 个过期会话`)
      saveToStorage()
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadConversationsFromDB()
  })

  // 监听会话变化，自动保存到数据库（可选）
  // watch(conversations, saveToStorage, { deep: true })
  // watch(currentConversationId, saveToStorage)

  return {
    // 状态
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    error,

    // 方法
    createConversation,
    deleteConversation,
    switchConversation,
    updateConversationTitle,
    addMessage,
    updateMessage,
    getConversationContext,
    getConversationStats,
    cleanupOldConversations,
    loadFromStorage,
    loadConversationsFromDB,
    loadConversationMessages
  }
}