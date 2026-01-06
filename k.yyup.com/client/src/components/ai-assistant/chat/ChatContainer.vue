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
        :uploadingFile="uploadingFile"
        :uploadingImage="uploadingImage"
        :simpleMode="simpleMode"
        @update:inputMessage="$emit('update:inputMessage', $event)"
        @update:webSearch="$emit('update:webSearch', $event)"
        @update:fontSize="$emit('update:fontSize', $event)"
        @send="handleSendMessage"
        @cancel-send="handleCancelSend"
        @stop-sending="handleStopSending"
        @toggle-voice-input="handleToggleVoiceInput"
        @toggle-voice-output="handleToggleVoiceOutput"
        @show-quick-query="handleShowQuickQuery"
        @upload-file="handleUploadFile"
        @upload-image="handleUploadImage"
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

  // 语音状态（可选，侧边栏模式不需要）
  isListening?: boolean
  isSpeaking?: boolean
  speechStatus?: string

  // 其他状态
  hasLastMessage: boolean
  isLoading?: boolean  // 🆕 加载状态
  isFullscreenMode?: boolean  // 🆕 是否为全屏模式
  simpleMode?: boolean  // 🆕 简化模式(侧边栏)

  // 文件上传状态
  uploadingFile?: boolean
  uploadingImage?: boolean

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

  // 文件上传事件
  'upload-file': [file: File]
  'upload-image': [image: File]
}

const emit = defineEmits<Emits>()

// ==================== 模板引用 ====================
const chatMessagesRef = ref<HTMLElement>()

// ==================== 事件处理 ====================
const handleSendMessage = () => {
  console.log('🟢 [ChatContainer] 收到 send 事件，转发给父组件')
  emit('send')
}

const handleCancelSend = () => {
  console.log('🟡 [ChatContainer] 收到 cancel-send 事件')
  emit('cancel-send')
}

const handleStopSending = () => {
  console.log('🔴 [ChatContainer] 收到 stop-sending 事件')
  emit('stop-sending')
}
const handleSuggestion = (text: string) => {
  console.log('🔍 [ChatContainer] 收到建议文本，转发给父组件:', text)
  emit('suggestion', text)
}
const handleToggleVoiceInput = () => emit('toggle-voice-input')
const handleToggleVoiceOutput = () => emit('toggle-voice-output')
const handleShowQuickQuery = () => emit('show-quick-query')
const toggleThinking = () => emit('toggle-thinking')
const toggleContextOptimization = () => emit('toggle-context-optimization')
const handleUploadFile = (file: File) => emit('upload-file', file)
const handleUploadImage = (image: File) => emit('upload-image', image)

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
// design-tokens 已通过 vite.config 全局注入

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

// 聊天消息区域
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md); // ✨ 优化：从24px降至16px
  padding-bottom: 60px; // ✨ 优化：减小底部空间
  scroll-behavior: smooth;
  background: var(--bg-primary);

  /* 布局容器：消息内部自己控制左右对齐（flex-start允许元素自定义宽度） */
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  transition: all var(--transition-base);
}

// 自定义滚动条样式
.chat-messages::-webkit-scrollbar {
  width: auto;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--text-placeholder);
  }
}

// 聊天输入区域
.chat-input-area {
  position: relative; // 为思考字幕提供定位参考
  flex-shrink: 0;
  padding: var(--spacing-sm) var(--spacing-md); // ✨ 优化：减小内边距
  background: var(--bg-card);
  border-top: var(--border-width-base) solid var(--border-color);
  backdrop-filter: var(--backdrop-blur);

  /* 添加微妙的阴影，提升视觉层次 */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .chat-messages {
    padding: var(--spacing-lg);
    padding-bottom: 60px;
  }

  .chat-input-area {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .chat-messages {
    padding: var(--spacing-md);
    padding-bottom: 50px;
  }

  .chat-input-area {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* 暗色主题适配 */
[data-theme="dark"] .chat-container {
  .chat-messages {
    background: var(--bg-primary-dark);
  }

  .chat-input-area {
    background: var(--bg-card-dark);
    border-top-color: var(--border-color-dark);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
  }

  .chat-messages::-webkit-scrollbar-track {
    background: var(--bg-secondary-dark);
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: var(--border-color-dark);

    &:hover {
      background: var(--text-disabled-dark);
    }
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .chat-input-area {
    border-top-width: auto;
    border-top-color: var(--text-primary);
  }
}

/* 减少动画支持 */
@media (prefers-reduced-motion: reduce) {
  .chat-messages {
    scroll-behavior: auto;
    transition: none;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    transition: none;
  }
}
</style>
