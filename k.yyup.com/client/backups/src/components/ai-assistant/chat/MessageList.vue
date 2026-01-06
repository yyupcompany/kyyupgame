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

      <!-- AI思考消息 -->
      <div v-else-if="message.type === 'thinking'" class="message-item assistant thinking-message">
        <div class="message-avatar">
          <el-icon><Service /></el-icon>
        </div>
        <div class="message-content" :style="{ fontSize: messageFontSize + 'px' }">
          <ThinkingProcess
            :content="message.content"
            :collapsed="false"
          />
        </div>
      </div>

      <!-- 🎯 工具意图消息 -->
      <div v-else-if="message.type === 'tool_intent'" class="message-item assistant tool-intent-message">
        <div class="message-avatar">
          <el-icon><Service /></el-icon>
        </div>
        <div class="message-content" :style="{ fontSize: messageFontSize + 'px' }">
          <div class="tool-intent-content">
            <span class="intent-icon">💡</span>
            <span class="intent-text">{{ message.content }}</span>
          </div>
        </div>
      </div>

      <!-- 🎯 工具调用消息 -->
      <div v-else-if="message.type === 'tool_call'" class="message-item assistant tool-call-message">
        <ToolCallBar
          :tool-name="message.toolName || message.content"
          :status="message.toolStatus || 'running'"
          :intent="message.toolIntent"
          :description="message.toolDescription"
        />
      </div>

      <!-- 🎯 工具解说消息 -->
      <div v-else-if="message.type === 'tool_narration'" class="message-item assistant tool-narration-message">
        <!-- 简洁的文本显示，带✅图标 -->
        <div class="narration-simple">
          <svg class="narration-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="narration-text">{{ message.content }}</span>
        </div>
      </div>

      <!-- AI答案消息 -->
      <MessageItem
        v-else-if="message.type === 'answer' || message.role === 'assistant'"
        :message="message"
        :font-size="messageFontSize"
        :is-fullscreen-mode="isFullscreenMode"
      />
    </template>

    <!-- 加载状态消息 - 当AI开始处理时立即显示 -->
    <div v-if="isLoading" class="message-item assistant loading-response">
      <div class="message-avatar">
        <el-icon><Service /></el-icon>
      </div>
      <div class="message-content" :style="{ fontSize: messageFontSize + 'px' }">
        <LoadingMessage message="AI 正在思考中..." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import MessageItem from './MessageItem.vue'
import ThinkingProcess from '../ai-response/ThinkingProcess.vue'
import ToolCallBar from '../ai-response/ToolCallBar.vue'
import LoadingMessage from '../ai-response/LoadingMessage.vue'
import MarkdownMessage from '../panels/MarkdownMessage.vue'
import type { ExtendedChatMessage, CurrentAIResponseState } from '../types/aiAssistant'

// ==================== Props ====================
interface Props {
  messages: ExtendedChatMessage[]
  currentAIResponse?: CurrentAIResponseState  // 改为可选，避免Vue警告
  messageFontSize: number
  contextOptimization?: any
  isLoading?: boolean  // 🆕 加载状态标志
  isFullscreenMode?: boolean  // 🆕 是否为全屏模式
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

// ==================== 调试日志 ====================
watch(() => props.currentAIResponse, (newVal) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 [MessageList] currentAIResponse变化')
  console.log('📊 [visible]:', newVal?.visible)
  console.log('📊 [functionCalls.length]:', newVal?.functionCalls?.length)
  console.log('📋 [functionCalls]:', JSON.stringify(newVal?.functionCalls, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}, { deep: true, immediate: true })

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
</script>

<style scoped lang="scss">
// 🎨 导入主题变量
@import '@/styles/design-tokens.scss';

.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);

  /* 🎯 对话框宽度控制：使用响应式变量 */
  width: var(--ai-content-width);
  max-width: var(--ai-content-max-width);
  margin: 0 auto;

  /* 🔧 防止缩放时变形 */
  transform-origin: center center;
  flex-shrink: 0;

  /* 🎨 平滑过渡 */
  transition: all var(--ai-transition-normal);
}

.message-item {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
}

.message-item.assistant {
  justify-content: flex-start;
}

/* 🔧 修复：用户消息靠右对齐 */
.message-item.user {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--text-xl);
}

.message-item.assistant .message-avatar {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.message-item.user .message-avatar {
  background: var(--el-color-success-light-9);
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

.current-response {
  animation: fadeInUp 0.3s ease-out;
}

.cursor-ai-container {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

/* 🎯 工具意图消息样式 */
.tool-intent-message {
  margin-bottom: var(--spacing-sm);
}

.tool-intent-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xl) var(--text-base);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border-left: 3px solid var(--warning-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: #92400e;
}

.intent-icon {
  font-size: var(--text-xl);
  flex-shrink: 0;
}

.intent-text {
  flex: 1;
  line-height: 1.5;
}

/* 🎯 工具调用消息样式 */
.tool-call-message {
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

/* 🎯 工具解说消息样式 - 简洁版 */
.tool-narration-message {
  width: 100%;
  margin-bottom: var(--spacing-xs);
}

.narration-simple {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xs) var(--text-sm);
  background: transparent;
  border-left: 2px solid var(--success-color); // 绿色左边框
  font-size: var(--text-sm); // 与侧边栏一致
  color: var(--el-text-color-regular);
  line-height: 1.5;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.05);
  }
}

.narration-icon {
  width: var(--text-base); // 更小的图标
  height: var(--text-base);
  flex-shrink: 0;
}

.narration-text {
  flex: 1;
  min-width: 0;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(var(--text-2xl));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
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
    width: var(--icon-size); height: var(--icon-size);
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
