/**
 * AI 助手统一逻辑 Composable
 * 
 * 🎯 核心职责：
 * ├─ 提供独立的事件监听实例
 * ├─ 管理独立的状态
 * ├─ 处理所有业务逻辑
 * └─ 支持 sidebar 和 fullpage 两种模式
 * 
 * 📦 特点：
 * ├─ 每次调用都创建新的实例（不是单例）
 * ├─ 完全隔离不同模式的状态
 * ├─ 事件监听互不干扰
 * └─ 易于扩展新的模式
 * 
 * 💡 使用示例：
 * const { state, handleSendMessage } = useAIAssistantLogic('sidebar')
 * const { state, handleSendMessage } = useAIAssistantLogic('fullpage')
 */

import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useChatHistory } from '@/composables/useChatHistory'
import { callUnifiedIntelligenceStream } from '@/api/endpoints/function-tools'

export type AIAssistantMode = 'sidebar' | 'fullpage'

// ==================== 错误码定义 ====================
export enum AIErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',

  // 认证错误
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',

  // 业务错误
  QUERY_TOO_LONG = 'QUERY_TOO_LONG',
  RATE_LIMITED = 'RATE_LIMITED',
  TOOL_PERMISSION_DENIED = 'TOOL_PERMISSION_DENIED',

  // AI处理错误
  AI_PROCESSING_ERROR = 'AI_PROCESSING_ERROR',
  AI_MODEL_ERROR = 'AI_MODEL_ERROR',
  TOOL_EXECUTION_FAILED = 'TOOL_EXECUTION_FAILED',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误配置映射
const ERROR_CONFIG: Record<AIErrorCode, { title: string; message: string; action?: string; type: 'error' | 'warning' | 'info' }> = {
  [AIErrorCode.NETWORK_ERROR]: {
    title: '网络连接失败',
    message: '无法连接到AI服务，请检查您的网络连接',
    action: '请检查网络后重试，或联系管理员',
    type: 'error'
  },
  [AIErrorCode.TIMEOUT_ERROR]: {
    title: '请求超时',
    message: 'AI响应时间过长，可能是因为处理复杂任务',
    action: '建议简化问题或稍后重试',
    type: 'warning'
  },
  [AIErrorCode.SERVER_ERROR]: {
    title: '服务器错误',
    message: 'AI服务暂时不可用，请稍后再试',
    action: '我们已记录此问题，工程师正在处理',
    type: 'error'
  },
  [AIErrorCode.AUTH_REQUIRED]: {
    title: '需要登录',
    message: '请先登录后再使用AI助手',
    action: '点击确认跳转到登录页面',
    type: 'info'
  },
  [AIErrorCode.AUTH_EXPIRED]: {
    title: '登录已过期',
    message: '您的登录状态已过期，请重新登录',
    action: '点击确认重新登录',
    type: 'warning'
  },
  [AIErrorCode.QUERY_TOO_LONG]: {
    title: '问题过长',
    message: '您输入的问题超过了长度限制',
    action: '请缩短问题内容（最多1000字符）',
    type: 'warning'
  },
  [AIErrorCode.RATE_LIMITED]: {
    title: '请求过于频繁',
    message: '您发送请求的速度太快，请稍后再试',
    action: '建议等待几秒后再发送新问题',
    type: 'warning'
  },
  [AIErrorCode.TOOL_PERMISSION_DENIED]: {
    title: '权限不足',
    message: '您没有权限执行此操作',
    action: '请联系管理员申请相应权限',
    type: 'error'
  },
  [AIErrorCode.AI_PROCESSING_ERROR]: {
    title: 'AI处理失败',
    message: 'AI在处理您的问题时遇到问题',
    action: '请尝试重新表述问题',
    type: 'error'
  },
  [AIErrorCode.AI_MODEL_ERROR]: {
    title: 'AI模型错误',
    message: 'AI模型服务暂时不可用',
    action: '我们正在恢复服务，请稍后重试',
    type: 'error'
  },
  [AIErrorCode.TOOL_EXECUTION_FAILED]: {
    title: '工具执行失败',
    message: '无法完成您请求的操作',
    action: '请检查输入数据或尝试其他方式',
    type: 'error'
  },
  [AIErrorCode.UNKNOWN_ERROR]: {
    title: '未知错误',
    message: '发生了意外错误',
    action: '请刷新页面后重试',
    type: 'error'
  }
}

// 根据错误响应解析错误码
const parseErrorCode = (error: any): AIErrorCode => {
  if (!error) return AIErrorCode.UNKNOWN_ERROR

  // 检查是否有明确的错误码
  if (error.code) {
    const code = error.code.toUpperCase()
    if (Object.values(AIErrorCode).includes(code as AIErrorCode)) {
      return code as AIErrorCode
    }
  }

  // 根据错误消息推断错误类型
  const message = (error.message || error.toString()).toLowerCase()

  if (message.includes('network') || message.includes('fetch') || message.includes('网络')) {
    return AIErrorCode.NETWORK_ERROR
  }
  if (message.includes('timeout') || message.includes('超时')) {
    return AIErrorCode.TIMEOUT_ERROR
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('未授权')) {
    return AIErrorCode.AUTH_REQUIRED
  }
  if (message.includes('403') || message.includes('forbidden') || message.includes('权限')) {
    return AIErrorCode.TOOL_PERMISSION_DENIED
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('频繁')) {
    return AIErrorCode.RATE_LIMITED
  }
  if (message.includes('500') || message.includes('server') || message.includes('服务器')) {
    return AIErrorCode.SERVER_ERROR
  }

  return AIErrorCode.UNKNOWN_ERROR
}

// 显示错误提示
const showErrorTip = (error: any) => {
  const errorCode = parseErrorCode(error)
  const config = ERROR_CONFIG[errorCode]

  // 构建完整消息
  let fullMessage = config.message
  if (config.action) {
    fullMessage += `\n\n💡 ${config.action}`
  }

  // 显示消息
  ElMessage({
    message: fullMessage,
    title: config.title,
    type: config.type,
    duration: 5000,
    showClose: true,
    grouping: true
  })

  // 对于严重错误，显示详细对话框
  if (config.type === 'error' || errorCode === AIErrorCode.TIMEOUT_ERROR) {
    console.error(`[AI助手错误] ${config.title}:`, error)
  }
}

export function useAIAssistantLogic(mode: AIAssistantMode) {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const chatHistory = useChatHistory()

  // ==================== 独立的状态 ====================
  // 每个实例都有自己的状态,完全隔离
  const state = reactive({
    // 消息相关
    messages: chatHistory.currentMessages,  // 🔧 直接引用chatHistory的消息,保持同步
    inputMessage: '',
    sending: false,
    
    // AI响应相关
    currentAIResponse: {
      visible: false,
      answer: { visible: false, content: '', streaming: false },
      functionCalls: [] as any[],
      componentData: null
    },
    
    // 思考相关
    isThinking: false,
    thinkingSubtitle: '',
    showThinkingSubtitle: false,
    rightSidebarThinking: '',
    
    // 工具相关
    toolCalls: [] as any[],
    
    // 搜索相关
    isSearching: false,
    currentSearchMessageId: '',
    currentThinkingMessageId: '',
    
    // 其他状态
    webSearch: false,
    messageFontSize: 14,
    isRegistered: true,
    uploadingFile: false,
    uploadingImage: false,
    conversationId: '',
    
    // 模式特定状态
    ...(mode === 'sidebar' ? {
      rightSidebarVisible: false,
      rightSidebarLoading: false
    } : {
      leftSidebarCollapsed: false,
      tokenUsage: null,
      tokenLoading: false
    })
  })

  // ==================== 计算属性 ====================
  const isThinkingComputed = computed(() => state.rightSidebarThinking.length > 0)

  // ==================== 事件处理方法 ====================
  const handleSendMessage = async () => {
    if (!state.inputMessage.trim() || state.sending) return

    const message = state.inputMessage.trim()
    // ⚠️ 优化: 先设置发送状态，稍后再清空输入框，给用户视觉反馈
    state.sending = true
    
    // ✨ 延迟 150ms 清空输入框，让用户看到按钮变化
    setTimeout(() => {
      state.inputMessage = ''
    }, 150)

    console.log(`🚀 [${mode}模式] 开始发送消息:`, message)

    // 💾 备份消息，以便错误时恢复
    const backupMessage = message

    try {
      // 添加用户消息到历史
      chatHistory.addMessage({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      // 调用统一智能流式接口
      await callUnifiedIntelligenceStream(
        {
          message,
          userId: userStore.userInfo?.id?.toString(),
          conversationId: state.conversationId,
          context: {
            currentPage: route.path,
            pageTitle: route.meta?.title || 'AI助手',
            userRole: userStore.userInfo?.role || 'user',
            enableTools: true,
            enableWebSearch: state.webSearch,
            mode: mode  // 🆕 传递模式信息到后端，侧边栏模式下禁用render_component工具
          }
        },
        // 事件处理回调
        (event: any) => {
          handleStreamEvent(event)
        }
      )
    } catch (error) {
      console.error(`❌ [${mode}模式] 发送消息失败:`, error)

      // ✨ 使用新的错误提示系统
      const errorCode = parseErrorCode(error)
      const errorConfig = ERROR_CONFIG[errorCode]

      // 对于认证错误，跳转到登录页面
      if (errorCode === AIErrorCode.AUTH_REQUIRED || errorCode === AIErrorCode.AUTH_EXPIRED) {
        ElMessageBox.confirm(
          errorConfig.message,
          errorConfig.title,
          {
            confirmButtonText: '去登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          router.push('/login')
        })
        // 恢复输入框内容
        state.inputMessage = backupMessage
        state.sending = false
        return
      }

      // 恢复输入框内容
      state.inputMessage = backupMessage

      // 显示错误提示
      showErrorTip(error)

      // 对于超时错误，提供重试选项
      if (errorCode === AIErrorCode.TIMEOUT_ERROR) {
        ElMessageBox.confirm(
          `${errorConfig.message}\n\n是否要重新发送？`,
          errorConfig.title,
          {
            confirmButtonText: '重新发送',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          // 重新发送消息
          await handleSendMessage()
        }).catch(() => {
          // 用户取消，不做任何操作
        })
      }
    } finally {
      state.sending = false
    }
  }

  // ==================== 流式事件处理 ====================
  const handleStreamEvent = (event: any) => {
    console.log(`[${mode}模式] 事件:`, event.type)

    switch (event.type) {
      case 'thinking_start':
        state.isThinking = true
        state.showThinkingSubtitle = true
        state.thinkingSubtitle = event.data?.message || '🤔 AI 正在思考中...'
        state.messages.push({
          id: `thinking-${Date.now()}`,
          role: 'assistant',
          type: 'thinking',
          content: event.data?.message || '🤔 AI 正在思考中...',
          timestamp: new Date()
        } as any)
        break

      case 'thinking':
      case 'thinking_update':
        if (!state.isSearching) {
          // 🔧 修复：同时更新 thinkingSubtitle 和 rightSidebarThinking
          state.thinkingSubtitle = event.data?.content || event.message || ''
          state.showThinkingSubtitle = true
          state.rightSidebarThinking = event.data?.content || event.message || ''

          // 更新最后一条thinking消息的内容
          const lastMessage = state.messages[state.messages.length - 1]
          if (lastMessage && lastMessage.type === 'thinking') {
            lastMessage.content = event.data?.content || event.message || ''
          }
        }
        break

      case 'thinking_complete':
        console.log(`🤔 [${mode}模式] 思考完成`)
        state.isThinking = false
        state.showThinkingSubtitle = false
        state.thinkingSubtitle = ''
        state.rightSidebarThinking = ''
        // 🔧 修复：不再删除thinking消息，而是将其折叠保留在历史中
        const thinkingMessage = state.messages.find(m => m.type === 'thinking')
        if (thinkingMessage) {
          // 🆕 将thinking消息标记为折叠状态，而不是删除
          ;(thinkingMessage as any).collapsed = true
          console.log(`✅ [${mode}模式] thinking消息已折叠，保留在历史中`)
        }
        setTimeout(() => {
          if (state.sending) {
            console.log(`⚠️ [${mode}模式] 检测到发送状态未重置，强制重置`)
            state.sending = false
            state.currentAIResponse.answer.streaming = false
            state.isSearching = false
          }
        }, 2000)
        break

      case 'tool_call_start':
        state.currentAIResponse.visible = true
        if (event.data) {
          state.currentAIResponse.functionCalls.push({
            name: event.data.name || '未知工具',
            description: event.message || '',
            arguments: event.data.arguments || {},
            status: 'running'
          })
        }
        break

      // 🔒 新增：处理 tool_call_complete 事件，检测操作确认状态
      case 'tool_call_complete':
        // 更新工具调用状态
        const completedToolName = event.data?.name || '未知工具'
        const completedTool = state.currentAIResponse.functionCalls.find(
          fc => fc.name === completedToolName && fc.status === 'running'
        )
        if (completedTool) {
          completedTool.status = 'completed'
          completedTool.result = event.data?.result
        }

        // 🔒 检测是否需要用户确认（DELETE/PUT/PATCH 操作）
        if (event.data?.result?.status === 'wait_for_confirmation' || 
            event.data?.result?.confirmation_required) {
          console.log(`⚠️ [操作确认] [${mode}模式] 检测到需要用户确认的操作`)
          console.log('📝 [操作确认] 确认数据:', event.data.result.confirmation_data)

          // 🎯 使用 Element Plus 的确认对话框
          const confirmData = event.data.result.confirmation_data || {}
          
          // 🔧 区分工作流确认和CRUD确认
          const isWorkflowConfirm = !!confirmData.tool_name || !!confirmData.action || !!confirmData.plan
          
          let title: string
          let message: string
          let confirmMessage: string
          
          if (isWorkflowConfirm) {
            // 🔄 工作流确认（如 execute_activity_workflow）
            const toolName = confirmData.tool_name || '活动工作流'
            const actionName = confirmData.action || '创建活动'
            const planSummary = confirmData.plan?.name || confirmData.plan?.activity_name || '活动'
            
            title = confirmData.ui_instruction?.title || '工作流确认'
            message = confirmData.ui_instruction?.message || 
              `即将执行「${actionName}」工作流，创建「${planSummary}」，请确认是否继续？`
            
            // 确认消息包含工具名称和confirmed标记
            confirmMessage = `确认执行工作流: ${toolName}, action=${actionName}, confirmed=true`
          } else {
            // 🛡️ CRUD确认（如 http_request DELETE/PUT/PATCH）
            title = confirmData.ui_instruction?.title || '操作确认'
            message = confirmData.ui_instruction?.message || 
              `即将执行 ${confirmData.method || 'unknown'} 请求到 ${confirmData.endpoint || 'unknown'}，请确认是否继续`
            confirmMessage = `确认执行: ${confirmData.method || ''} ${confirmData.endpoint || ''}。confirmed=true`
          }

          // 重置发送状态，让用户可以操作
          state.sending = false

          // 弹出确认对话框
          ElMessageBox.confirm(message, title, {
            confirmButtonText: '确认执行',
            cancelButtonText: '取消',
            type: 'warning',
            distinguishCancelAndClose: true
          }).then(async () => {
            console.log('✅ [操作确认] 用户确认执行操作')
            console.log('📤 [操作确认] 发送确认消息:', confirmMessage)
            
            // 🔒 用户确认后，重新发送请求，这次带上 confirmed=true
            state.inputMessage = confirmMessage
            await handleSendMessage()
          }).catch((action) => {
            if (action === 'cancel') {
              console.log('❌ [操作确认] 用户取消操作')
              ElMessage.info('操作已取消')
            }
          })

          // 不继续处理工具完成逻辑
          return
        }

        console.log(`✅ [${mode}模式] 工具调用完成:`, completedToolName)
        break

      case 'search_start':
        console.log(`🔍 [${mode}模式] 搜索开始:`, event.data)
        state.isSearching = true
        // 添加搜索消息到聊天历史
        const searchStartMsg = {
          id: `search-${Date.now()}`,
          role: 'assistant' as const,
          type: 'search' as const,
          content: event.message || '🔍 正在搜索网络信息...',
          timestamp: new Date(),
          searchStatus: 'start' as const,
          searchQuery: event.data?.query || '',
          searchPercentage: 0,
          searchResultCount: 0,
          searchResults: []
        }
        chatHistory.addMessage(searchStartMsg)
        // 保存搜索消息ID，用于后续更新
        state.currentSearchMessageId = searchStartMsg.id
        break

      case 'search_progress':
        console.log(`📊 [${mode}模式] 搜索进度:`, event.data)
        // 更新搜索消息的进度
        const progressSearchMsg = state.messages.find(
          (m: any) => m.id === state.currentSearchMessageId
        )
        if (progressSearchMsg) {
          (progressSearchMsg as any).searchStatus = 'progress'
          ;(progressSearchMsg as any).searchPercentage = event.data?.percentage || 0
          ;(progressSearchMsg as any).content = event.message || `搜索进度: ${event.data?.percentage || 0}%`
        }
        break

      case 'search_complete':
        console.log(`✅ [${mode}模式] 搜索完成:`, event.data)
        state.isSearching = false
        // 更新搜索消息为完成状态
        const completeSearchMsg = state.messages.find(
          (m: any) => m.id === state.currentSearchMessageId
        )
        if (completeSearchMsg) {
          (completeSearchMsg as any).searchStatus = 'complete'
          ;(completeSearchMsg as any).searchPercentage = 100
          ;(completeSearchMsg as any).searchResultCount = event.data?.resultCount || 0
          ;(completeSearchMsg as any).searchResults = event.data?.results || []
          ;(completeSearchMsg as any).content = event.message || `✅ 搜索完成，找到 ${event.data?.resultCount || 0} 个结果`
          ;(completeSearchMsg as any).timestamp = new Date()
          console.log(`✅ [${mode}模式] 已更新搜索完成状态`)
        }
        state.currentSearchMessageId = ''
        break

      case 'answer_chunk':
        if (!state.currentAIResponse.answer.visible) {
          state.currentAIResponse.answer.visible = true
        }
        const chunkContent = event.data?.content || ''
        console.log(`📝 [${mode}模式] answer_chunk, chunk长度:`, chunkContent.length, '累积前长度:', state.currentAIResponse.answer.content.length)
        state.currentAIResponse.answer.content += chunkContent
        console.log(`📝 [${mode}模式] answer_chunk, 累积后长度:`, state.currentAIResponse.answer.content.length)
        state.currentAIResponse.answer.streaming = true
        break

      case 'answer_start':
        // 初始化答案状态
        console.log(`🎉 [${mode}模式] answer_start, 重置前长度:`, state.currentAIResponse.answer.content.length)
        state.currentAIResponse.answer.visible = true
        state.currentAIResponse.answer.streaming = true
        state.currentAIResponse.answer.content = ''
        console.log(`🎉 [${mode}模式] answer_start, 重置后长度:`, state.currentAIResponse.answer.content.length)
        break

      case 'answer_complete':
        // answer_complete 事件包含完整的Markdown内容
        // 但优先保留通过answer_chunk累积的内容,只在为空时才使用event.data.content作为fallback
        if (!state.currentAIResponse.answer.content && event.data?.content) {
          state.currentAIResponse.answer.content = event.data.content
        }
        state.currentAIResponse.answer.streaming = false
        console.log(`✅ [${mode}模式] answer_complete, 当前内容长度:`, state.currentAIResponse.answer.content.length)
        break
        
      case 'complete':
        console.log(`✅ [${mode}模式] AI响应完成，保存到聊天历史`)
        state.currentAIResponse.answer.streaming = false
        // 确保所有相关状态都被正确重置
        state.isThinking = false
        state.isSearching = false
        
        // 🔧 关键修复：检查是否需要继续执行（4步API调用流程）
        const needsContinue = event.data?.needsContinue === true || event.data?.isComplete === false
        const nextUserMessage = event.data?.nextUserMessage
        
        if (needsContinue) {
          console.log(`🔄 [${mode}模式] 检测到needsContinue=true，需要继续执行下一步`)
          console.log(`📝 [${mode}模式] nextUserMessage:`, nextUserMessage)
          
          // 保存当前工具调用结果到聊天历史（作为中间步骤记录）
          if (state.currentAIResponse.functionCalls.length > 0) {
            const toolNames = state.currentAIResponse.functionCalls
              .map(fc => fc.name || '未知工具')
              .join(', ')
            chatHistory.addMessage({
              role: 'assistant',
              type: 'tool_progress', // 标记为工具进度消息
              content: `🔄 正在执行: ${toolNames}...`,
              toolCalls: state.currentAIResponse.functionCalls,
              hasEnhancedData: true
            })
          }
          
          // 重置当前AI响应状态
          state.currentAIResponse = {
            visible: false,
            answer: { visible: false, content: '', streaming: false },
            functionCalls: [],
            componentData: null
          }
          
          // 🔧 自动发送下一轮请求，继续执行4步流程
          setTimeout(async () => {
            const continueMessage = nextUserMessage || '继续执行4步API调用流程，调用下一个工具'
            console.log(`🚀 [${mode}模式] 自动发送继续请求:`, continueMessage)
            
            // 设置输入消息并触发发送
            state.inputMessage = continueMessage
            await handleSendMessage()
          }, 500) // 稍微延迟，让用户看到进度
          
          break // 重要：不要执行后续的正常完成逻辑
        }
        
        state.sending = false
        
        // 🔧 核心修复：将AI的回答添加到聊天历史中
        // 优先使用 currentAIResponse.answer.content (已从answer_complete事件中保存)
        const aiResponseContent = state.currentAIResponse.answer.content || event.data?.content || ''
        
        // 如果有内容或者有工具调用，都要保存消息
        if (aiResponseContent || state.currentAIResponse.functionCalls.length > 0) {
          console.log(`💾 [${mode}模式] 保存AI响应到聊天历史，内容长度:`, aiResponseContent.length, '工具调用数:', state.currentAIResponse.functionCalls.length)
          
          // 构建消息内容：文本内容 + 工具调用信息
          let messageContent = aiResponseContent
          
          // 如果有工具调用但没有文本内容，生成工具调用摘要
          if (!messageContent && state.currentAIResponse.functionCalls.length > 0) {
            const toolNames = state.currentAIResponse.functionCalls
              .map(fc => fc.name || '未知工具')
              .join(', ')
            messageContent = `✅ 已执行工具: ${toolNames}`
          }
          
          // 添加AI消息到聊天历史
          chatHistory.addMessage({
            role: 'assistant',
            type: 'answer', // 标记为答案消息
            content: messageContent,
            // 保存工具调用信息，用于后续渲染
            toolCalls: state.currentAIResponse.functionCalls.length > 0 
              ? state.currentAIResponse.functionCalls 
              : undefined,
            // 保存组件数据（如果有）
            componentData: state.currentAIResponse.componentData,
            // 标记是否有增强数据
            hasEnhancedData: state.currentAIResponse.functionCalls.length > 0
          })
          
          console.log(`✅ [${mode}模式] AI响应已添加到聊天历史`)
        } else {
          console.warn(`⚠️ [${mode}模式] 没有内容也没有工具调用，跳过保存`)
        }
        
        // 🔧 重置当前AI响应状态，准备下一轮对话
        state.currentAIResponse = {
          visible: false,
          answer: { visible: false, content: '', streaming: false },
          functionCalls: [],
          componentData: null
        }
        break

      case 'error':
        console.error(`❌ [${mode}模式] AI响应错误，重置发送状态`)
        state.sending = false
        state.currentAIResponse.answer.streaming = false
        // 确保错误时也重置所有相关状态
        state.isThinking = false
        state.isSearching = false
        ElMessage.error(event.message || '处理失败')
        break
    }
  }

  const handleStopSending = () => {
    console.log(`🛑 [${mode}模式] 用户主动停止发送，重置所有状态`)
    state.sending = false
    state.currentAIResponse.answer.streaming = false
    // 确保停止时重置所有相关状态
    state.isThinking = false
    state.isSearching = false
  }

  // 安全重置机制：防止输入框永久禁用
  let safetyTimeout: NodeJS.Timeout | null = null

  const _setSafetyReset = () => {  // 保留供后续使用
    // 清除之前的超时
    if (safetyTimeout) {
      clearTimeout(safetyTimeout)
    }

    // 设置新的安全超时：30秒后强制重置
    safetyTimeout = setTimeout(() => {
      if (state.sending) {
        console.warn(`⚠️ [${mode}模式] 检测到发送状态超时，强制重置`)
        state.sending = false
        state.currentAIResponse.answer.streaming = false
        state.isThinking = false
        state.isSearching = false
      }
    }, 30000) // 30秒超时
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    console.log(`✅ [${mode}模式] Composable 已挂载`)
  })

  onUnmounted(() => {
    console.log(`✅ [${mode}模式] Composable 已卸载`)
  })

  // ==================== 组件事件处理方法 ====================
  const handleShowHtmlPreview = (data: any) => {
    console.log('🖼️ HTML 预览:', data)
    // 可以在这里添加 HTML 预览逻辑
  }

  const handleMissingFieldsDetected = (data: any) => {
    console.log('⚠️ 缺失字段检测:', data)
    // 可以在这里添加缺失字段处理逻辑
  }

  const handleLoadingComplete = () => {
    console.log('✅ 加载完成')
    // 可以在这里添加加载完成逻辑
  }

  // ==================== 返回接口 ====================
  return {
    state,
    isThinkingComputed,
    handleSendMessage,
    handleStopSending,
    handleStreamEvent,
    handleShowHtmlPreview,
    handleMissingFieldsDetected,
    handleLoadingComplete
  }
}

