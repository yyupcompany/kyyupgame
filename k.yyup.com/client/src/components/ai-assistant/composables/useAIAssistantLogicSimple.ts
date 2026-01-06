/**
 * AI 助手简化逻辑 Composable - 用于测试功能隔离性
 * 简化版本，移除了复杂的依赖，专注于测试隔离性
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export type AIAssistantMode = 'sidebar' | 'fullpage'

export function useAIAssistantLogic(mode: AIAssistantMode) {
  console.log(`🎯 [${mode}模式] Composable 开始创建`)

  // ==================== 独立的状态 ====================
  // 每个实例都有自己的状态，完全隔离
  const state = reactive({
    // 消息相关
    messages: [] as any[],
    inputMessage: '',
    sending: false,

    // AI响应相关
    currentAIResponse: {
      visible: false,
      answer: { visible: false, content: '', streaming: false, hasComponent: false, componentData: null },
      functionCalls: [],
      componentData: null
    },

    // 工具调用相关
    toolCalls: [] as any[],

    // 状态标志
    isSearching: false,
    showThinkingSubtitle: false,
    thinkingSubtitle: '',

    // UI状态
    webSearch: false,
    messageFontSize: 16,
    isRegistered: false,
    uploadingFile: false,
    uploadingImage: false,

    // 侧边栏状态
    leftSidebarCollapsed: false,
    rightSidebarThinking: ''
  })

  // ==================== 计算属性 ====================
  const isThinkingComputed = computed(() => state.sending || state.isSearching)

  // ==================== 核心方法 ====================
  const handleSendMessage = async () => {
    if (!state.inputMessage.trim() || state.sending) return

    const message = state.inputMessage.trim()
    state.inputMessage = ''
    state.sending = true

    console.log(`🚀 [${mode}模式] 开始发送消息:`, message)

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    }
    state.messages.push(userMessage)

    try {
      // 模拟 AI 响应
      setTimeout(() => {
        const response = `这是来自 ${mode} 模式的响应：${message}`

        state.currentAIResponse.visible = true
        state.currentAIResponse.answer.visible = true
        state.currentAIResponse.answer.content = response
        state.sending = false

        // 添加 AI 响应消息
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date()
        }
        state.messages.push(assistantMessage)

        console.log(`✅ [${mode}模式] 响应完成`)
      }, 1000)
    } catch (error) {
      console.error('消息发送失败:', error)
      state.sending = false
      ElMessage.error('发送失败，请重试')
    }
  }

  const handleStopSending = () => {
    state.sending = false
    console.log(`🛑 [${mode}模式] 停止发送`)
  }

  // ==================== 组件事件处理方法 ====================
  const handleShowHtmlPreview = (data: any) => {
    console.log(`🖼️ [${mode}模式] HTML 预览:`, data)
  }

  const handleMissingFieldsDetected = (data: any) => {
    console.log(`⚠️ [${mode}模式] 缺失字段检测:`, data)
  }

  const handleLoadingComplete = () => {
    console.log(`✅ [${mode}模式] 加载完成`)
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    console.log(`✅ [${mode}模式] Composable 已挂载，实例ID:`, Math.random().toString(36).substr(2, 9))
  })

  onUnmounted(() => {
    console.log(`✅ [${mode}模式] Composable 已卸载`)
  })

  // ==================== 返回接口 ====================
  return {
    state,
    isThinkingComputed,
    handleSendMessage,
    handleStopSending,
    handleShowHtmlPreview,
    handleMissingFieldsDetected,
    handleLoadingComplete
  }
}