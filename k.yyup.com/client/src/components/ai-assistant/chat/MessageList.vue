<!--
  消息列表组件
  从 AIAssistant.vue 第87-163行模板提取
-->

<template>
  <div class="message-list">
    <!-- 🎯 新架构：渲染所有聊天历史消息，包括用户消息、思考消息、答案消息 -->
    <template v-for="message in allMessages" :key="message.id">
      <!-- 用户消息 -->
      <MessageItem
        v-if="message.role === 'user'"
        :message="message"
        :font-size="messageFontSize"
        :is-fullscreen-mode="isFullscreenMode"
      />

      <!-- 🎯 工具意图消息（精简显示，只在非全屏模式且有内容时显示） -->
      <div
        v-else-if="message.type === 'tool_intent' && !isFullscreenMode && message.content"
        class="tool-intent-inline"
      >
        <UnifiedIcon name="lightbulb" :size="14" />
        <span class="intent-text">{{ message.content }}</span>
      </div>

      <!-- 🎯 工具调用消息（统一使用ToolCallBar，不再区分简化和完整模式） -->
      <ToolCallBar
        v-else-if="message.type === 'tool_call' && (message.toolName || message.content)"
        :tool-name="message.toolName || message.content"
        :status="message.toolStatus || 'running'"
        :intent="message.toolIntent || message.intent"
        :description="message.toolDescription || message.description || message.content"
        :start-timestamp="message.startTimestamp"
        :duration="message.duration"
        :progress="message.progress"
        :result="message.result"
        :simple-mode="simpleMode"
      />

      <!-- 🎯 工具解说消息（内嵌在答案中显示，不单独占位） -->
      <div
        v-else-if="message.type === 'tool_narration' && message.content"
        class="tool-narration-inline"
      >
        <span class="narration-check">✓</span>
        <MarkdownMessage :content="message.content" role="assistant" />
      </div>

      <!-- 🎯 思考消息（折叠到消息底部） -->
      <!-- 思考过程现在通过 MessageItem 的 thinkingProcess 内嵌显示 -->

      <!-- 🎯 上下文优化消息（折叠显示） -->
      <div
        v-else-if="message.type === 'context_optimization' && message.content"
        class="context-optimization-inline"
      >
        <UnifiedIcon name="setting" :size="12" />
        <span class="context-text">{{ message.content }}</span>
      </div>

      <!-- 🎯 AI答案消息 -->
      <MessageItem
        v-else-if="message.type === 'answer' || message.role === 'assistant' || !message.type"
        :message="message"
        :font-size="messageFontSize"
        :is-fullscreen-mode="isFullscreenMode"
      />
    </template>

    <!-- 🎯 加载状态 - 当AI正在处理时显示思考动画 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="loading-text">AI 正在思考...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref, onMounted, onUnmounted } from 'vue'
import MessageItem from './MessageItem.vue'
import ToolCallBar from '../ai-response/ToolCallBar.vue'
import LoadingMessage from '../ai-response/LoadingMessage.vue'
import MarkdownMessage from '../panels/MarkdownMessage.vue'
import type { ExtendedChatMessage, CurrentAIResponseState } from '../types/aiAssistant'

// ====================  Props ====================
interface Props {
  messages: ExtendedChatMessage[]
  currentAIResponse?: CurrentAIResponseState // 改为可选,避免Vue警告
  messageFontSize: number
  contextOptimization?: any
  isLoading?: boolean // 🆕 加载状态标志
  isFullscreenMode?: boolean // 🆕 是否为全屏模式
  simpleMode?: boolean // 🆕 简化模式(侧边栏),只使用Markdown,不渲染工具组件
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

// 🧠 ToolCall 状态和计时 Hook
const now = ref(Date.now())
let toolTimer: number | null = null

const getToolStatusInfo = (msg: ExtendedChatMessage) => {
  const status = (msg as any).toolStatus || 'running'
  if (status === 'completed') {
    return { status: 'completed', cls: 'status-completed', text: '执行完成' }
  }
  if (status === 'failed' || status === 'error') {
    return { status: 'failed', cls: 'status-failed', text: '执行失败' }
  }
  return { status: 'running', cls: 'status-running', text: '执行中' }
}

const getToolElapsedSeconds = (msg: ExtendedChatMessage): number | null => {
  const start = (msg as any).startTimestamp
  if (!start) return null
  const info = getToolStatusInfo(msg)
  const baseDuration = (msg as any).duration
  let durationMs: number
  if (info.status === 'running') {
    durationMs = now.value - start
  } else {
    durationMs = typeof baseDuration === 'number' ? baseDuration : now.value - start
  }
  if (!Number.isFinite(durationMs) || durationMs < 0) return null
  return Math.floor(durationMs / 1000)
}

onMounted(() => {
  toolTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 500)
})

onUnmounted(() => {
  if (toolTimer) {
    clearInterval(toolTimer)
    toolTimer = null
  }
})

// ==================== 计算属性 ====================
/**
 * 🎯 新架构：显示所有消息，包括思考消息和答案消息
 */
const allMessages = computed(() => {
  console.log('📊 [MessageList] 当前消息数:', props.messages.length)
  console.log('📋 [MessageList] 消息列表:', props.messages.map(m => ({
    id: m.id,
    role: m.role,
    type: (m as any).type,
    content: m.content?.substring(0, 50)
  })))
  return props.messages
})

/**
 * 🎯 检查是否已有思考消息，避免与加载状态重复显示
 */
const hasThinkingMessage = computed(() => {
  return props.messages.some(m => (m as any).type === 'thinking')
})

// ==================== 调试日志 ====================
watch(
  () => props.currentAIResponse,
  newVal => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 [MessageList] currentAIResponse变化')
    console.log('📊 [visible]:', newVal?.visible)
    console.log('📊 [functionCalls.length]:', newVal?.functionCalls?.length)
    console.log('📋 [functionCalls]:', JSON.stringify(newVal?.functionCalls, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  },
  { deep: true, immediate: true }
)

// ==================== Emits ====================
interface Emits {
  'toggle-thinking': []
  'toggle-context-optimization': []
}

const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================
const handleToggleThinking = () => {
  emit('toggle-thinking')
}

const handleToggleContextOptimization = () => {
  emit('toggle-context-optimization')
}

// 🆕 切换thinking消息的折叠状态
const toggleThinkingCollapse = (message: ExtendedChatMessage) => {
  ;(message as any).collapsed = !(message as any).collapsed
  console.log('💭 [思考折叠] 切换状态:', (message as any).collapsed)
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

// ✨ 现代化消息列表样式
.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: flex-start;
  padding: var(--spacing-sm);
  width: 100%;
  max-width: 100%;
  margin: 0;
  flex-shrink: 0;
  transition: all var(--transition-base);

  background: linear-gradient(180deg,
    transparent 0%,
    rgba(var(--primary-color-rgb, 67), 0.02) 50%,
    transparent 100%
  );
}

// ✨ 美化消息项样式
.message-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: 0;
  width: fit-content;
  max-width: 95%;
  border-left: none !important;
  border: none !important;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.assistant {
  justify-content: flex-start;
  align-self: flex-start;
}

.message-item.user {
  justify-content: flex-end;
  flex-direction: row-reverse;
  align-self: flex-end;
}

// ✨ 美化头像样式
.message-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  font-size: var(--text-base);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light-3));
  border-color: var(--primary-color-light-5);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb, 0), 0.3);
}

.message-item.user .message-avatar {
  background: var(--el-color-success-light-9);
  border: none !important;
  color: var(--el-color-success);
}

.message-content {
  flex: 1;
  min-width: 0;
  max-width: 80%;
}

.message-item.user .message-content {
  max-width: 70%;
}

// ==================== 精简的内联工具消息样式 ====================

/* 🎯 工具意图内联样式 - 简约版 */
.tool-intent-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: var(--spacing-xs) 0;
  background: rgba(251, 191, 60, 0.1);
  border-left: 2px solid var(--warning-color);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);

  .intent-text {
    line-height: 1.4;
  }
}

/* 🎯 工具解说内联样式 - 简约版 */
.tool-narration-inline {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  margin: var(--spacing-xs) 0;
  font-size: var(--text-xs);

  .narration-check {
    color: var(--success-color);
    font-size: 10px;
    margin-top: 3px;
    flex-shrink: 0;
  }

  :deep(p) {
    margin: 0;
    line-height: 1.5;
    color: var(--text-secondary);
  }
}

/* 🎯 上下文优化内联样式 */
.context-optimization-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-2xs) var(--spacing-sm);
  margin: var(--spacing-xs) 0;
  background: rgba(99, 102, 241, 0.08);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-placeholder);

  .context-text {
    line-height: 1.4;
  }
}

// ==================== 加载状态样式 ====================
.loading-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-color);

  .loading-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.thinking-dots {
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: dotBounce 1.4s ease-in-out infinite;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// ==================== 响应式设计 ====================
@media (max-width: var(--breakpoint-md)) {
  .message-item {
    gap: var(--spacing-2xl);
    margin-bottom: var(--text-base);
  }

  .message-avatar {
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
    font-size: var(--text-lg);
  }

  .message-content {
    max-width: 85%;
  }

  .message-item.user .message-content {
    max-width: 75%;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .message-item {
    gap: var(--spacing-sm);
    margin-bottom: var(--text-sm);
  }

  .message-avatar {
    width: var(--icon-size);
    height: var(--icon-size);
    font-size: var(--text-base);
  }

  .message-content {
    max-width: 90%;
  }

  .message-item.user .message-content {
    max-width: 80%;
  }
}
</style>