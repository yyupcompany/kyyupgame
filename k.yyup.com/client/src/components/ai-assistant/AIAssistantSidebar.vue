<!--
  AI 助手侧边栏版本
  使用 useAIAssistantLogic composable 管理状态和业务逻辑
-->

<template>
  <SidebarLayout
    v-if="props.visible"
    :visible="props.visible"
    @close="emit('update:visible', false)"
    @toggle-fullscreen="handleToggleFullscreen"
    @quick-action="handleQuickAction"
  >
    <template #chat-container>
      <ChatContainer
        :messages="state.messages"
        :sending="state.sending"
        :is-thinking="state.isThinking"
        :message-font-size="state.messageFontSize"
        @send="handleSendMessage"
        @stop="handleStopSending"
        @update:input-message="handleUpdateInput"
      />
    </template>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import SidebarLayout from './layout/SidebarLayout.vue'
import ChatContainer from './chat/ChatContainer.vue'
import { useRouter } from 'vue-router'
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'

// Props 定义
interface Props {
  visible?: boolean
}

const props = defineProps<Props>()

// Emits 定义
interface Emits {
  'update:visible': [value: boolean]
}

const emit = defineEmits<Emits>()

const router = useRouter()

// 🔑 核心：使用 composable 管理所有状态和逻辑
const {
  state,
  handleSendMessage: sendMessage,
  handleStopSending
} = useAIAssistantLogic('sidebar')

// 🔍 生命周期钩子 - 监控组件状态
onMounted(() => {
  console.log('🟦 [AIAssistantSidebar] mounted', {
    visible: props.visible,
    hasState: !!state,
    inputMessage: state.inputMessage,
    sending: state.sending
  })
})

// 🔍 监听 visible prop 变化
watch(() => props.visible, (newVal) => {
  console.log('👁️ [AIAssistantSidebar] visible changed:', {
    visible: newVal,
    hasState: !!state
  })
})

const handleToggleFullscreen = () => {
  // 切换到 AI 全屏助手路由
  router.push('/aiassistant')
}

// 处理快捷导航点击
const handleQuickAction = (text: string) => {
  console.log('🎯 [AIAssistantSidebar] 快捷导航点击:', text)
  // 直接将文本设置为输入内容并发送
  state.inputMessage = text
  handleSendMessage()
}

const handleUpdateInput = (value: string) => {
  console.log('🟡 [AIAssistantSidebar] handleUpdateInput called', {
    value,
    currentInputMessage: state.inputMessage
  })
  
  // 直接更新 state 中的 inputMessage
  state.inputMessage = value
  
  console.log('✅ [AIAssistantSidebar] inputMessage updated:', {
    newValue: state.inputMessage,
    verified: state.inputMessage === value
  })
}

const handleSendMessage = async () => {
  console.log('🟢 [AIAssistantSidebar] handleSendMessage called', {
    inputMessage: state.inputMessage,
    inputTrimmed: state.inputMessage?.trim(),
    sending: state.sending
  })
  
  if (!state.inputMessage?.trim()) {
    console.warn('⚠️ [AIAssistantSidebar] inputMessage is empty')
    return
  }
  
  if (state.sending) {
    console.warn('⚠️ [AIAssistantSidebar] already sending')
    return
  }
  
  console.log('📤 [AIAssistantSidebar] Calling sendMessage...')
  
  try {
    await sendMessage()
    console.log('✅ [AIAssistantSidebar] Message sent successfully')
  } catch (error) {
    console.error('❌ [AIAssistantSidebar] Failed to send message:', error)
  }
}
</script>

<style scoped>
/* 侧边栏特定样式 */
</style>
