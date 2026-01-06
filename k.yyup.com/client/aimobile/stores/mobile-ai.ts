/**
 * 🤖 移动端AI助手状态管理
 * 
 * 单页面AI交互状态管理，处理对话、Function Tools调用等
 * 支持各角色的个性化AI交互体验
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: boolean
  toolResults?: ToolResult[]
  metadata?: {
    role: string
    userId: string
    conversationId: string
  }
}

export interface ToolResult {
  id: string
  tool: string
  data: any
  metadata?: {
    title?: string
    description?: string
    type?: 'table' | 'chart' | 'card' | 'list'
    actions?: Array<{
      label: string
      action: string
      params?: any
    }>
  }
}

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
  toolResults?: ToolResult[]
  conversationId?: string
  messageId?: string
  actions?: any[]
  suggestions?: string[]
}

export const useMobileAIStore = defineStore('mobile-ai', () => {
  // 状态
  const conversationId = ref<string>('')
  const messages = ref<AIMessage[]>([])
  const isLoading = ref(false)
  const aiOnline = ref(true)
  const currentRole = ref<string>('')
  const userId = ref<string>('')
  
  // AI服务配置
  const aiConfig = ref({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: ''
  })

  // 计算属性
  const messageCount = computed(() => messages.value.length)
  
  const hasConversation = computed(() => messages.value.length > 0)
  
  const lastMessage = computed(() => 
    messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
  )

  const roleSystemPrompt = computed(() => {
    const prompts = {
      admin: `你是幼儿园管理系统的AI助手，当前用户是系统管理员。你可以：
- 查询和分析所有系统数据
- 执行系统管理操作
- 生成各类管理报告
- 提供技术支持和数据洞察
请用专业、准确的语言回应用户需求。`,

      principal: `你是幼儿园管理系统的AI助手，当前用户是园长。你可以：
- 查询招生数据和财务报表
- 分析教学质量和班级情况
- 生成经营决策报告
- 协助制定发展战略
请用专业、有见解的语言为园长提供决策支持。`,

      teacher: `你是幼儿园管理系统的AI助手，当前用户是教师。你可以：
- 查询班级学生信息
- 协助教学活动安排
- 生成教学报告
- 支持家园沟通
请用亲切、专业的语言帮助教师完成日常工作。`,

      parent: `你是幼儿园管理系统的AI助手，当前用户是家长。你可以：
- 查询孩子在校情况
- 获取最新通知消息
- 查看费用缴费记录
- 了解孩子成长情况
请用温暖、耐心的语言为家长提供服务。`
    }
    
    return prompts[currentRole.value as keyof typeof prompts] || prompts.parent
  })

  // 方法
  const initializeConversation = (role: string = 'parent', uid: string = '') => {
    currentRole.value = role
    userId.value = uid
    conversationId.value = `mobile_${role}_${Date.now()}`
    
    // 更新AI配置
    aiConfig.value.systemPrompt = roleSystemPrompt.value
    
    console.log('🤖 移动端AI会话初始化:', {
      conversationId: conversationId.value,
      role: currentRole.value,
      userId: userId.value
    })
  }

  const sendMessage = async (content: string, role: string = currentRole.value): Promise<AIResponse> => {
    if (!content.trim()) {
      throw new Error('消息内容不能为空')
    }

    try {
      isLoading.value = true
      
      // 构建消息上下文
      const messageContext = {
        conversationId: conversationId.value,
        role: role,
        userId: userId.value,
        message: content,
        history: messages.value.slice(-5), // 只传最近5条消息作为上下文
        systemPrompt: roleSystemPrompt.value
      }

      console.log('📤 发送AI消息:', messageContext)

      // 构建符合后端期望的消息格式
      const chatMessages = [
        {
          role: 'system',
          content: roleSystemPrompt.value
        },
        // 添加历史消息作为上下文
        ...messages.value.slice(-5).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        // 添加当前用户消息
        {
          role: 'user',
          content: content
        }
      ]

      // 调用统一智能系统 - 替代旧的AI chat和Function Tools调用
      const response = await fetch('http://localhost:3000/api/ai/unified/unified-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'MOCK_JWT_TOKEN'  // 使用开发环境的模拟token
        },
        body: JSON.stringify({
          message: content,
          userId: userId.value,
          conversationId: conversationId.value,
          context: {
            role: role,
            systemPrompt: roleSystemPrompt.value,
            history: messages.value.slice(-5)
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const data = await response.json()
      console.log('📥 统一智能系统响应:', data)

      // 检查响应格式并处理
      if (!data.success) {
        throw new Error(data.error || data.message || '统一智能系统响应失败')
      }

      // 提取AI回复内容
      const aiContent = data.data?.message || data.content || '抱歉，我无法理解您的问题。'
      const isFallback = data.metadata?.fallback || false

      // 处理统一智能系统的工具执行结果
      let toolResults: ToolResult[] = []

      if (data.data?.tool_executions && data.data.tool_executions.length > 0) {
        console.log('🔧 处理统一智能系统工具执行结果:', data.data.tool_executions)
        
        for (const execution of data.data.tool_executions) {
          toolResults.push({
            id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tool: execution.toolName || execution.tool,
            data: execution.result || execution.data,
            metadata: {
              title: execution.result?.title || execution.toolName,
              description: execution.result?.message || execution.result?.description,
              type: execution.result?.type || 'card',
              actions: execution.result?.actions || []
            }
          })
        }
      }

      // 处理UI组件
      if (data.data?.ui_components && data.data.ui_components.length > 0) {
        console.log('🎨 处理UI组件:', data.data.ui_components)
        
        for (const component of data.data.ui_components) {
          toolResults.push({
            id: `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tool: `ui_${component.type}`,
            data: component.data,
            metadata: {
              title: component.props?.title || `${component.type}组件`,
              description: component.props?.description,
              type: component.type,
              actions: component.props?.actions || []
            }
          })
        }
      }

      const aiResponse: AIResponse = {
        success: true,
        content: aiContent,
        toolResults: toolResults,
        conversationId: conversationId.value,
        messageId: data.data?.messageId || `msg_${Date.now()}`,
        metadata: {
          fallback: isFallback,
          model: isFallback ? 'fallback' : 'Doubao-pro-128k',
          timestamp: data.data?.timestamp || new Date().toISOString()
        }
      }

      return aiResponse
      
    } catch (error) {
      console.error('❌ AI消息发送失败:', error)
      
      // 返回错误响应
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        content: '抱歉，我暂时无法处理您的请求。请检查网络连接或稍后重试。',
        toolResults: [],
        conversationId: conversationId.value
      }
    } finally {
      isLoading.value = false
    }
  }

  const clearConversation = () => {
    messages.value = []
    console.log('🗑️ 清空移动端AI会话:', conversationId.value)
  }

  const exportConversation = () => {
    const conversationData = {
      conversationId: conversationId.value,
      role: currentRole.value,
      userId: userId.value,
      messages: messages.value,
      timestamp: new Date().toISOString()
    }
    
    return conversationData
  }

  const addMessage = (message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AIMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      metadata: {
        role: currentRole.value,
        userId: userId.value,
        conversationId: conversationId.value
      }
    }
    
    messages.value.push(newMessage)
    return newMessage
  }

  const updateMessage = (messageId: string, updates: Partial<AIMessage>) => {
    const index = messages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  const removeMessage = (messageId: string) => {
    const index = messages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  // 检查AI服务状态
  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kindergarten_token')}`
        }
      })
      
      if (response.ok) {
        const status = await response.json()
        aiOnline.value = status.online
        return status
      } else {
        throw new Error('状态检查失败')
      }
    } catch (error) {
      console.error('❌ AI状态检查失败:', error)
      aiOnline.value = false
      return { online: false, error: error.message }
    }
  }

  // 获取角色对应的快捷问题建议
  const getRoleQuickQuestions = (role: string) => {
    const questionMap = {
      admin: [
        '显示系统概况和用户统计',
        '查看最近的系统日志',
        '生成用户活跃度报告',
        '检查系统性能状态',
        '分析数据库使用情况',
        '查看权限配置状态'
      ],
      principal: [
        '显示招生数据和趋势',
        '查看本月财务报表',
        '班级情况总览分析',
        '教师绩效统计报告',
        '生成经营决策建议',
        '分析竞争对手情况'
      ],
      teacher: [
        '我的班级学生信息',
        '今日课程安排详情',
        '学生出勤情况统计',
        '生成班级周报告',
        '查看家长反馈',
        '教学资源推荐'
      ],
      parent: [
        '孩子在校情况查询',
        '查看最新通知消息',
        '费用缴费记录查询',
        '孩子成长报告生成',
        '预约家长会时间',
        '查看活动报名情况'
      ]
    }
    
    return questionMap[role as keyof typeof questionMap] || questionMap.parent
  }

  // 获取统一智能系统的可用能力
  const getAvailableTools = async (role: string) => {
    try {
      const response = await fetch('/api/ai/unified/capabilities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kindergarten_token')}`
        }
      })
      
      if (response.ok) {
        const capabilities = await response.json()
        console.log('📋 统一智能系统能力:', capabilities)
        
        // 根据角色过滤可用能力
        if (capabilities.success && capabilities.data?.capabilities) {
          const allCapabilities = Object.values(capabilities.data.capabilities)
          
          // 根据角色过滤相关能力
          const roleFilterMap = {
            admin: ['database_query', 'page_operation', 'business_operation', 'system_management'],
            principal: ['database_query', 'business_operation', 'data_analysis'],
            teacher: ['database_query', 'page_operation', 'student_management'],
            parent: ['information_query', 'communication']
          }
          
          const allowedCategories = roleFilterMap[role as keyof typeof roleFilterMap] || []
          
          return allCapabilities.filter((capability: any) => 
            allowedCategories.some(category => 
              capability.tools?.some((tool: any) => 
                tool.category?.includes(category) || tool.name?.includes(category)
              )
            )
          )
        }
        
        return capabilities.data?.capabilities || []
      } else {
        throw new Error('获取系统能力失败')
      }
    } catch (error) {
      console.error('❌ 获取统一智能系统能力失败:', error)
      return []
    }
  }

  return {
    // 状态
    conversationId: readonly(conversationId),
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    aiOnline: readonly(aiOnline),
    currentRole: readonly(currentRole),
    userId: readonly(userId),
    aiConfig: readonly(aiConfig),
    
    // 计算属性
    messageCount,
    hasConversation,
    lastMessage,
    roleSystemPrompt,
    
    // 方法
    initializeConversation,
    sendMessage,
    clearConversation,
    exportConversation,
    addMessage,
    updateMessage,
    removeMessage,
    checkAIStatus,
    getRoleQuickQuestions,
    getAvailableTools
  }
})