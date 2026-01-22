<!--
  AI助手全屏页面版本
  使用 useAIAssistantLogic('fullpage') 获取独立实例
  完全隔离的事件监听和状态管理
-->

<template>
  <!-- 全屏模式始终显示，不依赖visible prop -->
  <FullPageLayout :sidebar-collapsed="leftSidebarCollapsed">
    <!-- 头部插槽 -->
    <template #header>
      <FullPageHeader
        :subtitle="'使用HTTP API模式'"
        mode="HTTP API 模式"
        features="多场景任务支持"
        :usage-label="tokenUsageProgress.label"
        :usage-percent="tokenUsageProgress.percent"
        :sidebar-collapsed="leftSidebarCollapsed"
        @toggle-sidebar="toggleLeftSidebar"
        @close-fullpage="handleCloseFullPage"
        @toggle-theme="handleToggleTheme"
      />
    </template>

    <!-- 侧边栏插槽 -->
    <template #sidebar>
      <FullPageSidebar
        :conversations="conversationList"
        :active-conversation-id="currentConversationId"
        :loading="conversationsLoading"
        :token-usage="tokenUsage"
        @new-conversation="handleNewConversation"
        @select-conversation="handleSelectConversation"
        @delete-conversation="handleDeleteConversation"
        @common-feature="handleCommonFeature"
      />
    </template>

    <!-- 对话区插槽 -->
    <template #dialog>
      <FullPageDialog
        :has-messages="(chatHistory.currentMessages?.value?.length || 0) > 0"
        @quick-action="handleQuickActionFromDialog"
        @suggestion-click="handleQuickQuery"
      >
        <!-- 消息列表 -->
        <template v-if="(chatHistory.currentMessages?.value?.length || 0) > 0" #messages>
          <MessageList
            :messages="chatHistory.currentMessages?.value || []"
            :message-font-size="state.messageFontSize"
            :is-thinking="isThinkingComputed"
          />
        </template>
      </FullPageDialog>
    </template>

    <!-- 输入区插槽 -->
    <template #input>
      <InputArea
        v-model:input-message="state.inputMessage"
        :sending="state.sending"
        :web-search="state.webSearch"
        :font-size="state.messageFontSize"
        :is-registered="state.isRegistered"
        :is-listening="state.isListening"
        :is-speaking="state.isSpeaking"
        :speech-status="state.speechStatus"
        :has-last-message="(chatHistory.currentMessages?.value?.length || 0) > 0"
        :uploading-file="state.uploadingFile"
        :uploading-image="state.uploadingImage"
        :simple-mode="false"
        @send="handleSendMessageWithContext"
        @stop-sending="handleStopSending"
        @update:fontSize="state.messageFontSize = $event"
        @update:webSearch="state.webSearch = $event"
        @toggle-voice-input="handleToggleVoiceInput"
        @toggle-voice-output="handleToggleVoiceOutput"
        @upload-file="handleUploadFile"
        @upload-image="handleUploadImage"
      />
    </template>
  </FullPageLayout>

  <!-- 核心业务逻辑组件(隐藏) -->
  <AIAssistantCore
    v-show="false"
    ref="coreRef"
    :visible="props.visible"
    :is-fullscreen="true"
    @update:visible="emit('update:visible', $event)"
    @show-html-preview="handleShowHtmlPreview"
    @missing-fields-detected="handleMissingFieldsDetected"
    @loading-complete="handleLoadingComplete"
  />

  <!-- 对话框组件 -->
  <AIStatistics
    v-model="statisticsVisible"
    :token-usage="tokenUsage"
    :loading="tokenLoading"
  />

  <QuickQueryGroups
    v-if="quickQueryVisible"
    :collapsed="false"
    @select-query="handleQuickQueryExecute"
    @close="quickQueryVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 导入新的布局组件
import {
  FullPageLayout,
  FullPageHeader,
  FullPageSidebar,
  FullPageDialog
} from './layout/full-page'

// 导入会话管理composable
import { useConversationManager } from './composables/useConversationManager'

// 导入其他组件
import MessageList from './chat/MessageList.vue'
import InputArea from './input/InputArea.vue'
import AIAssistantCore from './core/AIAssistantCore.vue'
import AIStatistics from './dialogs/AIStatistics.vue'
import QuickQueryGroups from './quick-query/QuickQuerySidebar.vue'
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'
import { useChatHistory } from '@/composables/useChatHistory'

// Props
interface Props {
  visible?: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update:visible': [value: boolean]
}

const emit = defineEmits<Emits>()

// 使用会话管理composable
const {
  conversations,
  currentConversationId,
  createConversation,
  addMessage,
  switchConversation,
  deleteConversation,
  isLoading: conversationsLoading
} = useConversationManager()

// 使用聊天历史composable，与AIAssistantCore保持一致
const chatHistory = useChatHistory()

// 使用独立的 Composable 实例
// 每次组件挂载都会创建新的实例，完全隔离
const {
  state,
  isThinkingComputed,
  handleSendMessage,
  handleStopSending,
  handleShowHtmlPreview,
  handleMissingFieldsDetected,
  handleLoadingComplete
} = useAIAssistantLogic('fullpage')

// 本地状态（仅用于全屏模式特定功能）
const tokenUsage = ref<any>(null)
const tokenLoading = ref(false)
const statisticsVisible = ref(false)
const quickQueryVisible = ref(false)
const coreRef = ref()
const leftSidebarCollapsed = ref(false)

// 会话列表（从 composable 获取）
const conversationList = computed(() => {
  return conversations.value.map(conv => ({
    id: conv.id,
    title: conv.title || '新对话',
    messageCount: conv.messages?.length || 0,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  }))
})

// Token用量进度
const tokenUsageProgress = computed(() => {
  const used = tokenUsage.value?.used || 0
  const total = tokenUsage.value?.totalLimit || 100000
  const percent = total > 0 ? Math.round((used / total) * 100) : 0
  return {
    label: `${used.toLocaleString()} / ${total.toLocaleString()}`,
    percent
  }
})

// 方法
const toggleLeftSidebar = () => {
  leftSidebarCollapsed.value = !leftSidebarCollapsed.value
}

const handleNewConversation = () => {
  createConversation()
  // 清空本地消息
  chatHistory.clearCurrentSession()
  state.inputMessage = ''
  ElMessage.success('✅ 创建新会话成功')
}

// 选择会话
const handleSelectConversation = async (id: string | number) => {
  console.log('💬 [会话选择] 切换到会话:', id)
  await switchConversation(String(id))
}

// 删除会话
const handleDeleteConversation = async (id: string | number) => {
  console.log('🗑️ [会话删除] 删除会话:', id)
  await deleteConversation(String(id))
  ElMessage.success('会话已删除')
}

// 重写消息发送处理器，集成会话上下文和真正的API调用
// 优先使用组件内部的输入框内容，保证不会发送空消息
const handleSendMessageWithContext = async (content?: string) => {
  if (!currentConversationId.value) {
    ElMessage.warning('⚠️ 请先选择或创建一个会话')
    return
  }

  // 从参数或当前输入框中获取真实内容，并做去空格处理
  const rawContent = (content ?? state.inputMessage ?? '').trim()
  if (!rawContent) {
    console.warn('⚠️ [AIAssistantFullPage] 发送内容为空，取消发送')
    ElMessage.warning('请输入要发送的内容')
    return
  }

  // 立即清空输入框，提升体验
  state.inputMessage = ''

  try {
    // 🆕 先添加消息到本地聊天历史，确保立即显示
    console.log('🔍 [AIAssistantFullPage] 准备添加消息到本地历史:', {
      content: rawContent,
      contentLength: rawContent.length
    })

    const messageContent = rawContent

    chatHistory.addMessage({
      content: messageContent,
      role: 'user'
    })

    // 🆕 尝试保存到后端，但不阻塞发送
    try {
      await addMessage(currentConversationId.value, {
        content: messageContent,
        role: 'user',
        timestamp: new Date()
      })
      console.log('✅ [AIAssistantFullPage] 消息已保存到后端')
    } catch (saveError) {
      console.warn('⚠️ [AIAssistantFullPage] 保存消息到后端失败，继续发送AI请求:', saveError)
      // 不显示错误信息，不影响用户体验
    }

    // 🆕 调用 AIAssistantCore 的真正 API 调用逻辑
    if (coreRef.value && coreRef.value.handleMultiRoundToolCalling) {
      console.log('🚀 [AIAssistantFullPage] 调用真正的API逻辑')
      return coreRef.value.handleMultiRoundToolCalling(messageContent)
    } else {
      // 降级：使用简化版本的逻辑
      console.log('⚠️ [AIAssistantFullPage] Core组件未准备好，使用简化逻辑')
      return handleSendMessage()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('❌ 发送消息失败')
  }
}

const handleQuickAction = (actionText: string) => {
  console.log('🎯 [AIAssistantFullPage] 快捷导航点击:', actionText)
  // 直接将快捷导航文本作为输入内容发送给AI
  state.inputMessage = actionText
  handleSendMessageWithContext(actionText)
}

const handleCommonFeature = (action: string) => {
  if (action === 'statistics') {
    ElMessage.info('统计功能开发中')
  } else if (action === 'settings') {
    ElMessage.info('设置功能开发中')
  }
}

const handleQuickActionFromDialog = async (text: string, action?: any) => {
  console.log('🎯 [AIAssistantFullPage] 快捷导航点击:', { text, action })
  
  // 确保有当前会话，如果没有则创建新会话
  if (!currentConversationId.value) {
    console.log('📝 [AIAssistantFullPage] 没有当前会话，创建新会话')
    await handleNewConversation()
    // 等待会话创建完成
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // 直接将快捷导航文本作为输入内容发送给AI
  state.inputMessage = text
  await handleSendMessageWithContext(text)
}

const handleQuickQuery = (query: string) => {
  state.inputMessage = query
  handleSendMessage()
}

const handleRetry = () => {
  handleSendMessage()
}

const handleAnswerCopy = (content: string) => {
  console.log('📋 [AnswerDisplay] copy:', content?.slice(0, 50))
}

const handleQuickQueryExecute = (query: any) => {
  console.log('🔍 [QuickQuery] 执行查询:', query)
  const queryText = typeof query === 'string' ? query : (query?.text || query?.title || '')
  handleQuickQuery(queryText)
  quickQueryVisible.value = false
}

// 处理关闭全屏页面
const handleCloseFullPage = () => {
  console.log('🚪 [AIAssistantFullPage] 关闭全屏页面')
  emit('update:visible', false)
  ElMessage.info('返回主页面')
}

// 处理主题切换
const handleToggleTheme = () => {
  console.log('🎨 [AIAssistantFullPage] 主题切换')
  // 主题切换的具体逻辑已在FullPageHeader中处理
  // 这里可以添加额外的主题切换后的处理
}

// ==================== 语音功能 ====================
// 语音输入状态
const isListening = ref(false)
const isSpeaking = ref(false)
const speechStatus = ref('')

// 切换语音输入
const handleToggleVoiceInput = () => {
  if (isListening.value) {
    // 停止录音
    isListening.value = false
    speechStatus.value = ''
    console.log('🛑 [AIAssistantFullPage] 停止语音输入')
  } else {
    // 开始录音（这里需要集成实际的语音识别API）
    isListening.value = true
    speechStatus.value = '正在聆听...'
    console.log('🎤 [AIAssistantFullPage] 开始语音输入')
    ElMessage.info('语音输入功能开发中')
    // 模拟停止
    setTimeout(() => {
      isListening.value = false
      speechStatus.value = ''
    }, 2000)
  }
}

// 切换语音播放
const handleToggleVoiceOutput = () => {
  if (isSpeaking.value) {
    // 停止播放
    isSpeaking.value = false
    console.log('🛑 [AIAssistantFullPage] 停止语音播放')
  } else {
    // 开始播放（这里需要集成实际的语音合成API）
    isSpeaking.value = true
    console.log('🔊 [AIAssistantFullPage] 开始语音播放')
    ElMessage.info('语音播放功能开发中')
    // 模拟停止
    setTimeout(() => {
      isSpeaking.value = false
    }, 2000)
  }
}

// ==================== 文件上传功能 ====================
// 处理文件上传
const handleUploadFile = (file: File) => {
  console.log('📁 [AIAssistantFullPage] 上传文件:', file.name)
  state.uploadingFile = true

  // 模拟上传过程
  setTimeout(() => {
    state.uploadingFile = false
    ElMessage.success(`文件 ${file.name} 上传成功`)
    // 将文件内容添加到输入框或发送
    state.inputMessage = `[已上传文件: ${file.name}] ${file.name} 的内容分析...`
  }, 1500)
}

// 处理图片上传
const handleUploadImage = (file: File) => {
  console.log('🖼️ [AIAssistantFullPage] 上传图片:', file.name)
  state.uploadingImage = true

  // 模拟上传过程
  setTimeout(() => {
    state.uploadingImage = false
    ElMessage.success(`图片 ${file.name} 上传成功`)
    // 将图片添加到输入框
    state.inputMessage = `[已上传图片: ${file.name}] 请分析这张图片的内容`
  }, 1500)
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
/* 
  这个文件不需要样式
  所有样式都在各个布局组件中
*/
</style>

