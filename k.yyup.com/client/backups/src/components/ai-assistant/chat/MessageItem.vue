<!--
  单条消息组件
  从 AIAssistant.vue 第87-106行模板提取
-->

<template>
  <div class="message-item ai-message-item" :class="[message.role, { sending: message.sending }]">
    <!-- AI助手头像 -->
    <div class="message-avatar ai-message-avatar" v-if="message.role === 'assistant'">
      <UnifiedIcon name="ai-robot" :size="20" />
    </div>

    <!-- 用户头像 -->
    <div class="message-avatar ai-message-avatar" v-if="message.role === 'user'">
      <UnifiedIcon name="user" :size="20" />
    </div>

    <!-- 消息内容 -->
    <div class="message-content dynamic-font-size" :style="{ '--message-font-size': fontSize + 'px' }">
      <!-- 发送状态指示器 -->
      <div v-if="message.sending" class="sending-indicator">
        <UnifiedIcon name="refresh" :size="16" class="sending-icon" />
        <span class="sending-text">发送中...</span>
      </div>

      <!-- 思考过程动画 -->
      <div v-if="message.type === 'thinking'" class="thinking-message-container">
        <div class="thinking-animation">
          <div class="thinking-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="thinking-text">
            <span class="thinking-label">🤔 AI 正在思考中...</span>
            <div class="thinking-content">{{ message.content }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索动画 -->
      <div v-else-if="message.type === 'search'" class="search-message">
        <SearchAnimation
          :status="message.searchStatus || 'start'"
          :message="message.content"
          :percentage="message.searchPercentage"
          :query="message.searchQuery"
          :result-count="message.searchResultCount"
          :results="message.searchResults"
        />
      </div>

      <!-- 工具解说消息 -->
      <div v-else-if="message.type === 'tool_narration'" class="tool-narration-container">
        <div class="tool-narration-header">
          <span class="tool-narration-icon">💬</span>
          <span class="tool-narration-label">工具解说</span>
          <span v-if="message.toolName" class="tool-name">{{ message.toolName }}</span>
        </div>
        <div class="tool-narration-content">
          <MarkdownMessage
            :content="message.content"
            :role="message.role"
          />
        </div>
      </div>

      <!-- 消息文本内容 -->
      <div v-else class="message-text" :class="{ 'thinking-message': message.isThinking }">
        <MarkdownMessage
          :content="message.content"
          :role="message.role"
        />

        <!-- 🎨 组件渲染区域 -->
        <div v-if="message.componentData" class="component-container">
          <div class="component-header">
            <UnifiedIcon name="grid" :size="18" />
            <span>{{ message.componentData.title || '智能组件' }}</span>
          </div>
          <div class="component-content">
            <ComponentRenderer
              :json-data="message.componentData"
            />
          </div>
        </div>

        <!-- 增强数据显示 -->
        <div v-if="message.hasEnhancedData" class="enhanced-data">
          <!-- 思考过程 -->
          <div
            v-if="message.thinkingProcess"
            class="thinking-section"
            :class="{ collapsed: message.thinkingProcess.collapsed }"
          >
            <div class="thinking-header" @click="toggleThinkingProcess">
              <span class="thinking-icon">🤔</span>
              <span class="thinking-title">思考过程</span>
              <span class="collapse-icon">{{ message.thinkingProcess.collapsed ? '▶' : '▼' }}</span>
            </div>
            <div class="thinking-content">
              <div class="thinking-text">{{ message.thinkingProcess.content }}</div>
            </div>
          </div>

          <!--
            🎯 工具调用显示 - 已移除
            工具调用结果现在通过 tool_narration 消息类型显示（Markdown格式的汇报）
            不再在这里显示原始JSON数据
          -->
        </div>
      </div>

      <!-- 消息时间戳 - 已隐藏 -->
      <!-- <div class="message-timestamp">
        {{ formatTimestamp(message.timestamp) }}
        <span v-if="message.pageContext" class="page-context">
          · {{ message.pageContext }}
        </span>
      </div> -->
    </div>

    <!-- 🎯 AI助手反馈组件 - 仅在AI消息且非发送状态下显示 -->
    <MessageFeedback
      v-if="message.role === 'assistant' && !message.sending"
      :message-id="message.id"
      :conversation-id="message.conversationId"
      :feedback="message.feedback"
      :disabled="message.sending"
      @feedback-submitted="handleFeedbackSubmitted"
      @feedback-updated="handleFeedbackUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import MarkdownMessage from '../panels/MarkdownMessage.vue'
import ComponentRenderer from '@/components/ai/ComponentRenderer.vue'
import MessageFeedback from './MessageFeedback.vue'
import SearchAnimation from '../search/SearchAnimation.vue'
import type { ExtendedChatMessage, FunctionCallState } from '../types/aiAssistant'

// ==================== Props ====================
interface Props {
  message: ExtendedChatMessage
  fontSize: number
  isFullscreenMode?: boolean  // 🆕 是否为全屏模式
}

const props = withDefaults(defineProps<Props>(), {
  isFullscreenMode: false
})

// ==================== Emits ====================
interface Emits {
  'toggle-thinking': [messageId: string]
  'function-call-retry': [functionCall: FunctionCallState]
  'function-call-view-details': [functionCall: FunctionCallState]
  'function-call-export-result': [functionCall: FunctionCallState]
  'feedback-submitted': [feedback: any]
  'feedback-updated': [feedback: any]
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const isUserMessage = computed(() => props.message.role === 'user')
const isAssistantMessage = computed(() => props.message.role === 'assistant')

// ==================== 方法 ====================
// 格式化时间戳
const formatTimestamp = (timestamp: string | Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟显示"刚刚"
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时显示分钟
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 小于24小时显示小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 超过24小时显示具体时间
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'running':
      return '执行中'
    case 'completed':
      return '完成'
    case 'failed':
      return '失败'
    default:
      return '未知'
  }
}

// 🔧 Bug #2修复: 获取表格列名
const getTableColumns = (tableData: any[]) => {
  if (!tableData || tableData.length === 0) {
    return []
  }
  return Object.keys(tableData[0])
}

// 切换思考过程显示
const toggleThinkingProcess = () => {
  emit('toggle-thinking', props.message.id)
}

// 🎯 处理反馈提交
const handleFeedbackSubmitted = (feedback: any) => {
  emit('feedback-submitted', feedback)
}

// 🎯 处理反馈更新
const handleFeedbackUpdated = (feedback: any) => {
  emit('feedback-updated', feedback)
}

// 🎯 处理函数调用事件
const handleFunctionCallRetry = (functionCall: FunctionCallState) => {
  emit('function-call-retry', functionCall)
}

const handleFunctionCallViewDetails = (functionCall: FunctionCallState) => {
  emit('function-call-view-details', functionCall)
}

const handleFunctionCallExportResult = (functionCall: FunctionCallState) => {
  emit('function-call-export-result', functionCall)
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
  transition: all 0.3s ease;
}

.message-item.assistant {
  justify-content: flex-start;
}

.message-item.user {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.message-item.sending {
  opacity: 0.7;
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

/* 🔧 强制应用动态字体大小 */
.message-content.dynamic-font-size {
  font-size: var(--message-font-size, var(--text-lg)) !important;
}

.message-content.dynamic-font-size *:not(code):not(pre):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
  font-size: inherit !important;
}

.message-item.user .message-content {
  max-width: 70%;
  text-align: right;
}

.sending-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-fill-color-light);
  border-radius: var(--text-sm);
  color: var(--el-text-color-regular);
  font-size: var(--text-base);
}

.sending-icon {
  animation: spin 1s linear infinite;
}

.message-text {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  border-radius: var(--text-sm);
  padding: var(--text-sm) var(--text-lg);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 🔧 修复：用户消息样式 - 紫色渐变背景 + 白色文字 */
.message-item.user .message-text {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border: none;
  color: var(--bg-color);
  box-shadow: 0 2px var(--spacing-sm) rgba(102, 126, 234, 0.3);
}

/* 🔧 修复：用户消息内的所有文字都是白色 */
.message-item.user .message-text :deep(*) {
  color: var(--bg-color) !important;
}

.enhanced-data {
  margin-top: var(--text-sm);
  padding-top: var(--text-sm);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

.thinking-section {
  margin-bottom: var(--text-sm);
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.thinking-header:hover {
  background: var(--el-fill-color);
}

.thinking-content {
  padding: var(--text-sm);
  background: var(--el-fill-color-extra-light);
  border-radius: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  /* 🔧 修复：移除固定高度，让内容自动扩展 */
  min-height: auto;
  max-height: none;
  overflow: visible;
}

.thinking-text {
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap; /* 保留换行和空格 */
  word-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 长单词换行 */
  overflow-wrap: break-word; /* 确保长文本换行 */
}

.thinking-section.collapsed .thinking-content {
  display: none;
}

.function-calls-section {
  margin-top: var(--text-sm);
}

.function-calls-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.function-call-item {
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--el-fill-color-extra-light);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.function-call-item.completed {
  border-left: 3px solid var(--el-color-success);
}

.function-call-item.failed {
  border-left: 3px solid var(--el-color-danger);
}

.function-call-name {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.function-call-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-xs);
}

.function-call-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
}

.message-timestamp {
  font-size: var(--text-xs);
  color: var(--el-text-color-placeholder);
  margin-top: var(--spacing-sm);
  text-align: left;
}

.message-item.user .message-timestamp {
  text-align: right;
}

.page-context {
  opacity: 0.7;
}

/* 🎨 组件容器样式 */
.component-container {
  margin-top: var(--text-lg);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background-color: var(--el-bg-color);
}

.component-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background-color: var(--el-fill-color-light);
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.component-header .el-icon {
  font-size: var(--text-xl);
  color: var(--el-color-primary);
}

.component-content {
  padding: var(--text-lg);
}

/* 🎨 思考消息样式 - 优化版 */
.message-item.assistant .message-text.thinking-message {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%) !important;
  border: none !important;
  color: var(--bg-color) !important;
  position: relative;
  overflow: hidden;
  animation: thinkingPulse 2s ease-in-out infinite;
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) rgba(102, 126, 234, 0.5);
  border-radius: var(--text-sm) !important;
  padding: var(--text-lg) var(--text-2xl) !important;
}

.message-item.assistant .message-text.thinking-message::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    var(--white-alpha-15),
    transparent
  );
  animation: thinkingShimmer 3s linear infinite;
  pointer-events: none;
}

.message-item.assistant .message-text.thinking-message::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, var(--white-alpha-10), transparent 50%);
  pointer-events: none;
}

.message-item.assistant .message-text.thinking-message strong {
  color: var(--bg-color) !important;
  text-shadow: 0 2px var(--spacing-xs) var(--black-alpha-30);
  font-size: 1.05em;
  letter-spacing: 0.5px;
}

.message-item.assistant .message-text.thinking-message p {
  color: var(--white-alpha-95) !important;
  margin: var(--spacing-xs) 0 !important;
  position: relative;
  z-index: 1;
  line-height: 1.6;
}

.message-item.assistant .message-text.thinking-message p:first-child {
  margin-top: 0 !important;
}

.message-item.assistant .message-text.thinking-message p:last-child {
  margin-bottom: 0 !important;
}

@keyframes thinkingPulse {
  0%, 100% {
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) rgba(102, 126, 234, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 6px 30px rgba(102, 126, 234, 0.7), 0 0 0 10px rgba(102, 126, 234, 0);
    transform: scale(1.01);
  }
}

@keyframes thinkingShimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
  
  .message-text {
    padding: var(--spacing-2xl) var(--text-base);
  }
}

/* 🔧 Bug #2修复: 工具结果数据样式 */
.function-results-section {
  margin-top: var(--text-sm);
}

.function-result-item {
  margin-bottom: var(--text-lg);
}

.function-result-item:last-child {
  margin-bottom: 0;
}

.function-call-info {
  padding: var(--text-sm);
  background: var(--bg-hover);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-sm);
}

.function-call-info.completed {
  border-left: var(--spacing-xs) solid var(--success-color);
}

.function-call-info.failed {
  border-left: var(--spacing-xs) solid var(--danger-color);
}

.function-call-info.running {
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.function-call-name {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.function-call-description {
  font-size: var(--text-sm);
  color: var(--text-regular);
  margin-bottom: var(--spacing-sm);
}

.function-call-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--info-color);
}

.function-result-data {
  margin-top: var(--text-sm);
}

.query-result-table {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-8);
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--text-sm);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.result-icon {
  font-size: var(--text-xl);
}

.result-summary {
  margin-top: var(--text-sm);
  padding: var(--text-sm);
  background: #f0f9ff;
  border-left: var(--spacing-xs) solid var(--primary-color);
  border-radius: var(--spacing-xs);
  color: var(--text-regular);
  font-size: var(--text-base);
}

.generic-result-data {
  background: var(--bg-hover);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
}

/* 🆕 思考过程动画样式 */
.thinking-message-container {
  padding: var(--text-lg);
  background: linear-gradient(135deg, #f0f4ff 0%, var(--bg-container) 100%);
  border-radius: var(--text-sm);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.thinking-animation {
  display: flex;
  align-items: flex-start;
  gap: var(--text-sm);
}

.thinking-dots {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  flex-shrink: 0;
}

.thinking-dots .dot {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
  border-radius: var(--radius-full);
  background: var(--primary-color);
  animation: bounce 1.4s infinite;
}

.thinking-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.thinking-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-var(--spacing-sm));
    opacity: 1;
  }
}

.thinking-text {
  flex: 1;
}

.thinking-label {
  display: block;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-base);
}

.thinking-content {
  color: var(--text-regular);
  font-size: var(--text-sm);
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.result-json {
  background: var(--bg-white);
  padding: var(--text-sm);
  border-radius: var(--spacing-xs);
  border: var(--border-width-base) solid var(--border-color-light);
  font-size: var(--text-sm);
  color: var(--text-primary);
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

/* 🆕 工具解说消息样式 */
.tool-narration-container {
  padding: var(--text-sm) var(--text-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, #f0f4ff 100%);
  border-radius: var(--text-sm);
  border-left: var(--spacing-xs) solid var(--success-color);
  margin-bottom: var(--spacing-sm);
}

.tool-narration-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.tool-narration-icon {
  font-size: var(--text-lg);
}

.tool-narration-label {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.tool-name {
  font-size: var(--text-sm);
  color: var(--info-color);
  background: var(--shadow-lighter);
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  margin-left: auto;
}

.tool-narration-content {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.6;
}
</style>
