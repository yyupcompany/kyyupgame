<!--
  聊天容器组件
  从 AIAssistant.vue 第66-186行模板提取
-->

<template>
  <div class="chat-container">
    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="chatMessagesRef">
      <!-- 欢迎消息 -->
      <WelcomeMessage 
        v-if="messages.length === 0"
        @suggestion="handleSuggestion"
      />

      <!-- 聊天消息列表 -->
      <MessageList
        :messages="messages"
        :message-font-size="messageFontSize"
        :current-ai-response="currentAIResponse"
        :context-optimization="contextOptimization"
        :is-loading="isLoading"
        :is-fullscreen-mode="isFullscreenMode"
        @toggle-thinking="toggleThinking"
        @toggle-context-optimization="toggleContextOptimization"
      />
    </div>

    <!-- 聊天输入区域 -->
    <div class="chat-input-area">
      <!-- 思考字幕（在输入框上方） -->
      <ThinkingSubtitle
        :thinking-content="thinkingSubtitle"
        :visible="showThinkingSubtitle"
      />

      <InputArea
        :inputMessage="inputMessage"
        :webSearch="webSearch"
        :fontSize="messageFontSize"
        :sending="sending"
        :isRegistered="isRegistered"
        :isListening="isListening"
        :isSpeaking="isSpeaking"
        :speechStatus="speechStatus"
        :hasLastMessage="hasLastMessage"
        @update:inputMessage="$emit('update:inputMessage', $event)"
        @update:webSearch="$emit('update:webSearch', $event)"
        @update:fontSize="$emit('update:fontSize', $event)"
        @send="handleSendMessage"
        @cancel-send="handleCancelSend"
        @stop-sending="handleStopSending"
        @toggle-voice-input="handleToggleVoiceInput"
        @toggle-voice-output="handleToggleVoiceOutput"
        @show-quick-query="handleShowQuickQuery"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WelcomeMessage from './WelcomeMessage.vue'
import MessageList from './MessageList.vue'
import InputArea from '../input/InputArea.vue'
import ThinkingSubtitle from '../ai-response/ThinkingSubtitle.vue'
import type { ExtendedChatMessage, CurrentAIResponseState } from '../types/aiAssistant'

// ==================== Props ====================
interface Props {
  // 消息数据
  messages: ExtendedChatMessage[]
  currentAIResponse?: CurrentAIResponseState  // 改为可选，避免Vue警告
  contextOptimization?: any

  // 输入状态
  inputMessage: string
  webSearch: boolean
  messageFontSize: number
  sending: boolean

  // 用户状态
  isRegistered: boolean

  // 语音状态
  isListening: boolean
  isSpeaking: boolean
  speechStatus: string

  // 其他状态
  hasLastMessage: boolean
  isLoading?: boolean  // 🆕 加载状态
  isFullscreenMode?: boolean  // 🆕 是否为全屏模式

  // 思考字幕
  thinkingSubtitle?: string
  showThinkingSubtitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentAIResponse: () => ({
    visible: false,
    thinking: {
      visible: false,
      collapsed: false,
      content: ''
    },
    functionCalls: [],
    answer: {
      visible: false,
      content: '',
      streaming: false,
      hasComponent: false,
      componentData: null
    }
  })
})

// ==================== Emits ====================
interface Emits {
  // 输入事件
  'update:inputMessage': [value: string]
  'update:webSearch': [value: boolean]
  'update:fontSize': [value: number]

  // 消息事件
  'send': []
  'cancel-send': []
  'stop-sending': [] // 🆕 停止发送事件
  'suggestion': [text: string]

  // 语音事件
  'toggle-voice-input': []
  'toggle-voice-output': []

  // UI事件
  'show-quick-query': []
  'toggle-thinking': []
  'toggle-context-optimization': []
}

const emit = defineEmits<Emits>()

// ==================== 模板引用 ====================
const chatMessagesRef = ref<HTMLElement>()

// ==================== 事件处理 ====================
const handleSendMessage = () => emit('send')
const handleCancelSend = () => emit('cancel-send')
const handleStopSending = () => emit('stop-sending') // 🆕 停止发送处理
const handleSuggestion = (text: string) => {
  console.log('🔍 [ChatContainer] 收到建议文本，转发给父组件:', text)
  emit('suggestion', text)
}
const handleToggleVoiceInput = () => emit('toggle-voice-input')
const handleToggleVoiceOutput = () => emit('toggle-voice-output')
const handleShowQuickQuery = () => emit('show-quick-query')
const toggleThinking = () => emit('toggle-thinking')
const toggleContextOptimization = () => emit('toggle-context-optimization')

// ==================== 滚动控制 ====================
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    // 🔧 修复：滚动条焦点要比文字稍微靠下一点，给文字区域留一点空间
    const scrollOffset = 30; // 底部留白30px，给文字区域留出空间
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight + scrollOffset
  }
}

// ==================== 暴露给父组件 ====================
defineExpose({
  scrollToBottom,
  chatMessagesRef
})
</script>

<style scoped lang="scss">
// 🎨 导入主题变量
@import '@/styles/design-tokens.scss';

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

// 🎨 3️⃣ 中间对话区域 - 使用主题变量
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-2xl);
  padding-bottom: 50px; // 🔧 增加底部padding，配合滚动偏移给文字区域留空间
  scroll-behavior: smooth;
  background: var(--ai-chat-bg);

  /* 🎯 布局容器：只负责布局，不控制子元素宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;

  transition: all var(--ai-transition-normal);
}

// 🎨 7️⃣ 滚动条样式 - 使用主题变量
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--ai-scrollbar-track);
  border-radius: var(--radius-xs);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--ai-scrollbar-thumb);
  border-radius: var(--radius-xs);
  transition: background var(--ai-transition-fast);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--ai-scrollbar-thumb-hover);
}

.chat-input-area {
  position: relative; // 🎯 添加相对定位，让字幕可以绝对定位在上方
  flex-shrink: 0;
  padding: 0 var(--text-2xl) var(--text-2xl);
  background: transparent;
  border-top: var(--border-width-base) solid var(--ai-header-border);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .chat-messages {
    padding: var(--text-lg);
  }
  
  .chat-input-area {
    padding: 0 var(--text-lg) var(--text-lg);
  }
}
</style>
