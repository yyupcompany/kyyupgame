<!--
  AI助手全屏页面版本
  使用 useAIAssistantLogic('fullpage') 获取独立实例
  完全隔离的事件监听和状态管理
-->

<template>
  <!-- 全屏模式始终显示，不依赖visible prop -->
  <FullPageLayout :sidebar-collapsed="state.leftSidebarCollapsed">
    <!-- 头部插槽 -->
    <template #header>
      <FullPageHeader
        :subtitle="'使用HTTP API模式'"
        mode="HTTP API 模式"
        features="多场景任务支持"
        :usage-label="tokenUsageProgress.label"
        :usage-percent="tokenUsageProgress.percent"
        :sidebar-collapsed="state.leftSidebarCollapsed"
        @toggle-sidebar="toggleLeftSidebar"
        @close-fullpage="handleCloseFullPage"
        @toggle-theme="handleToggleTheme"
      />
    </template>

    <!-- 侧边栏插槽 -->
    <template #sidebar>
      <FullPageSidebar
        @new-conversation="handleNewConversation"
        @quick-action="handleQuickAction"
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
        <!-- 消息列表插槽 -->
        <template v-if="(chatHistory.currentMessages?.value?.length || 0) > 0" #messages>
          <MessageList
            :messages="chatHistory.currentMessages?.value || []"
            :current-ai-response="state.currentAIResponse"
            :message-font-size="state.messageFontSize"
            :is-thinking="isThinkingComputed"
            :thinking-subtitle="state.thinkingSubtitle"
            :show-thinking-subtitle="state.showThinkingSubtitle"
          />

          <!-- AI响应显示 -->
          <AnswerDisplay
            v-if="state.currentAIResponse?.answer?.visible"
            :content="state.currentAIResponse?.answer?.content || ''"
            :streaming="!!state.currentAIResponse?.answer?.streaming"
            :has-component="!!(state.currentAIResponse?.answer?.componentData)"
            :component-data="state.currentAIResponse?.answer?.componentData || null"
            @regenerate="handleRetry"
            @copy="handleAnswerCopy"
          />

          <!-- 函数调用显示 -->
          <FunctionCallList
            v-if="(state.toolCalls?.length || 0) > 0"
            :function-calls="state.toolCalls || []"
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
        :is-listening="false"
        :is-speaking="false"
        :speech-status="''"
        :has-last-message="(chatHistory.currentMessages?.value?.length || 0) > 0"
        :uploading-file="state.uploadingFile"
        :uploading-image="state.uploadingImage"
        @send="handleSendMessageWithContext"
        @stop-sending="handleStopSending"
        @update:fontSize="state.messageFontSize = $event"
        @update:webSearch="state.webSearch = $event"
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
import AnswerDisplay from './ai-response/AnswerDisplay.vue'
import FunctionCallList from './ai-response/FunctionCallList.vue'
import InputArea from './input/InputArea.vue'
import AIAssistantCore from './core/AIAssistantCore.vue'
import AIStatistics from './dialogs/AIStatistics.vue'
import QuickQueryGroups from './quick-query/QuickQuerySidebar.vue'
import { useAIAssistantLogic } from './composables/useAIAssistantLogicSimple'
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
  currentConversationId,
  createConversation,
  addMessage
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
  // 使用对象修改避免直接赋值readonly属性
  Object.assign(state, { leftSidebarCollapsed: !state.leftSidebarCollapsed })
}

const handleNewConversation = () => {
  createConversation()
  // 清空本地消息（使用splice避免直接赋值）
  chatHistory.currentMessages.value.splice(0)
  state.inputMessage = ''
  ElMessage.success('✅ 创建新会话成功')
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

const handleQuickAction = (action: string) => {
  const actionMap: Record<string, string> = {
    'create-activity': '创建活动',
    'check-attendance': '检查考勤',
    'generate-report': '生成报告'
  }
  handleQuickQuery(actionMap[action] || action)
}

const handleCommonFeature = (action: string) => {
  if (action === 'statistics') {
    ElMessage.info('统计功能开发中')
  } else if (action === 'settings') {
    ElMessage.info('设置功能开发中')
  }
}

const handleQuickActionFromDialog = (action: string) => {
  const actionMap: Record<string, string> = {
    'create-activity': '创建活动方案',
    'data-analysis': '数据分析',
    'task-management': '任务管理'
  }
  handleQuickQuery(actionMap[action] || action)
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
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
/* 
  这个文件不需要样式
  所有样式都在各个布局组件中
*/
</style>

