<!--
  简洁聊天容器组件
  参考豆包/Gemini风格：简洁布局，无复杂组件
-->

<template>
  <div class="chat-container">
    <!-- 消息区域 -->
    <div class="chat-messages">
      <MessageList
        :messages="messages"
        :message-font-size="messageFontSize"
        :is-thinking="isThinking"
        :is-fullscreen-mode="isFullscreenMode"
        @copy="handleCopy"
        @regenerate="handleRegenerate"
      />
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-wrapper">
      <div class="input-container">
        <textarea
          v-model="inputValue"
          class="chat-input"
          :placeholder="placeholder"
          :disabled="sending"
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @input="autoResize"
        />
        <button
          class="send-btn"
          :class="{ sending }"
          :disabled="!canSend || sending"
          @click="handleSend"
        >
          <svg v-if="!sending" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else class="stop-icon" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <p class="input-hint">按 Enter 发送，Shift+Enter 换行</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import MessageList from './MessageList.vue'
import type { ExtendedChatMessage } from '../types/aiAssistant'

interface Props {
  messages: ExtendedChatMessage[]
  sending?: boolean
  isThinking?: boolean
  messageFontSize?: number
  isFullscreenMode?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  sending: false,
  isThinking: false,
  messageFontSize: 14,
  isFullscreenMode: false,
  placeholder: '输入消息...'
})

const emit = defineEmits<{
  'send': [content: string]
  'stop': []
  'update:inputMessage': [value: string]
}>()

const inputValue = ref('')

const canSend = computed(() => {
  return inputValue.value.trim().length > 0
})

function autoResize(e: Event) {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 150) + 'px'
}

function handleSend() {
  if (!canSend.value || props.sending) return

  const content = inputValue.value.trim()
  inputValue.value = ''

  // 重置输入框高度
  nextTick(() => {
    const input = document.querySelector('.chat-input') as HTMLTextAreaElement
    if (input) {
      input.style.height = 'auto'
    }
  })

  emit('send', content)
}

function handleStop() {
  emit('stop')
}

function handleCopy(content: string) {
  console.log('Copy:', content)
}

function handleRegenerate() {
  console.log('Regenerate')
}

// 监听输入变化
watch(inputValue, (newVal) => {
  emit('update:inputMessage', newVal)
})
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.chat-messages {
  flex: 1;
  overflow: hidden;
}

.chat-input-wrapper {
  padding: 16px 24px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 24px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--el-color-primary);
  }
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 15px;
  line-height: 1.5;
  max-height: 150px;
  min-height: 24px;
  padding: 0;
  color: var(--el-text-color-primary);

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.send-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover:not(:disabled) {
    background: var(--el-color-primary-light-3);
    transform: scale(1.05);
  }

  &:disabled {
    background: var(--el-border-color);
    cursor: not-allowed;
  }

  &.sending {
    background: var(--el-color-warning);
  }
}

.stop-icon {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.input-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// 响应式
@media (max-width: 640px) {
  .chat-input-wrapper {
    padding: 12px 16px;
  }

  .input-container {
    padding: 10px 14px;
    border-radius: 20px;
  }

  .chat-input {
    font-size: 14px;
  }

  .send-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .input-hint {
    display: none;
  }
}
</style>
