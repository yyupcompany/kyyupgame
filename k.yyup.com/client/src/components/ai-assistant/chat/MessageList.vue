<!--
  消息列表组件
  参考 Claude/ChatGPT 风格：简洁容器，优雅欢迎页
-->

<template>
  <div class="chat-message-list">
    <!-- 空状态/欢迎页 -->
    <template v-if="messages.length === 0">
      <slot name="empty">
        <div class="welcome-container">
          <div class="welcome-icon">
            <div class="icon-glow"></div>
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="24" cy="20" r="8" fill="currentColor" opacity="0.15"/>
              <path d="M10 38C10 31 16 27 24 27C32 27 38 31 38 38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="24" cy="20" r="3" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="welcome-title">有什么可以帮您的？</h2>
          <p class="welcome-subtitle">我是您的AI助手，可以帮助您处理各种任务</p>

          <!-- 快捷建议 -->
          <div class="quick-suggestions">
            <div class="suggestion-label">试试这样问</div>
            <div class="suggestion-cards">
              <button class="suggestion-card" @click="handleSuggestion('帮我制定下周的幼儿园亲子活动方案')">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" stroke-linejoin="round"/>
                  <path d="M10 6v4l2 2" stroke-linecap="round"/>
                </svg>
                <span>制定幼儿园活动方案</span>
              </button>
              <button class="suggestion-card" @click="handleSuggestion('分析近期招生数据并给出建议')">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 17V4a1 1 0 011-1h4a1 1 0 011 1v13" stroke-linecap="round"/>
                  <path d="M13 17V9a1 1 0 00-1-1H8a1 1 0 00-1 1v8" stroke-linecap="round"/>
                  <path d="M17 17v-3a1 1 0 012-1h2" stroke-linecap="round"/>
                </svg>
                <span>分析招生数据</span>
              </button>
              <button class="suggestion-card" @click="handleSuggestion('生成家长通知文案')">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" stroke-linejoin="round"/>
                  <path d="M6 8h8M6 11h4" stroke-linecap="round"/>
                </svg>
                <span>生成家长通知</span>
              </button>
              <button class="suggestion-card" @click="handleSuggestion('帮我写一份教学反思')">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M10 2v16M2 10h16" stroke-linecap="round"/>
                  <path d="M14 4l-4 4-2 2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>撰写教学反思</span>
              </button>
            </div>
          </div>
        </div>
      </slot>
    </template>

    <!-- 消息列表 -->
    <template v-else>
      <div class="messages-scroll">
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :font-size="messageFontSize"
          @copy="handleCopy"
          @regenerate="handleRegenerate"
        />
      </div>

      <!-- 思考中状态 -->
      <div v-if="isThinking" class="typing-indicator">
        <div class="typing-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
            <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </template>

    <!-- 插槽用于插入其他内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import MessageItem from './MessageItem.vue'
import type { ExtendedChatMessage } from '../types/aiAssistant'

interface Props {
  messages: ExtendedChatMessage[]
  messageFontSize?: number
  isThinking?: boolean
  isFullscreenMode?: boolean
}

withDefaults(defineProps<Props>(), {
  messageFontSize: 14,
  isThinking: false,
  isFullscreenMode: false
})

const emit = defineEmits<{
  'copy': [content: string]
  'regenerate': []
}>()

function handleCopy(content: string) {
  navigator.clipboard.writeText(content).then(() => {
    // 可以添加复制成功的提示
  })
  emit('copy', content)
}

function handleRegenerate() {
  emit('regenerate')
}

function handleSuggestion(text: string) {
  // 可以通过事件通知父组件
  console.log('Suggestion clicked:', text)
}
</script>

<style scoped lang="scss">
.chat-message-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg) var(--spacing-xl);
  scroll-behavior: smooth;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--radius-full);

    &:hover {
      background: var(--text-tertiary);
    }
  }
}

// 欢迎页面
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  position: relative;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);

  .icon-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, var(--primary-light-bg) 0%, transparent 70%);
    animation: pulseGlow 2s ease-in-out infinite;
  }

  svg {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.welcome-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  margin: 0 0 var(--spacing-2xl);
  font-size: var(--text-base);
  color: var(--text-secondary);
}

// 快捷建议
.quick-suggestions {
  width: 100%;
  max-width: 480px;

  .suggestion-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--spacing-md);
  }
}

.suggestion-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;

  svg {
    width: 20px;
    height: 20px;
    color: var(--primary-color);
    flex-shrink: 0;
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: 500;
    line-height: 1.4;
  }

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }
}

// 思考中指示器
.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
}

.typing-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
  }
}

.typing-dots {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: typingDot 1.4s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
}

// 响应式
@media (max-width: var(--breakpoint-md)) {
  .messages-scroll {
    padding: var(--spacing-md);
  }

  .welcome-icon {
    width: 64px;
    height: 64px;

    .icon-glow {
      inset: -15px;
    }
  }

  .welcome-title {
    font-size: var(--text-xl);
  }

  .welcome-subtitle {
    font-size: var(--text-sm);
  }

  .suggestion-cards {
    grid-template-columns: 1fr;
  }

  .suggestion-card {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
