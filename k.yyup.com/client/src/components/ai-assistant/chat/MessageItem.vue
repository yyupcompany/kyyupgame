<!--
  单条消息组件
  从 AIAssistant.vue 第87-106行模板提取
-->

<template>
  <div class="message-item ai-message-item" :class="[message.role, { sending: message.sending }]">
    <!-- 侧边栏模式：移除头像图标，节省空间 -->

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

      <!-- 工具调用开始消息 -->
      <div v-else-if="message.type === 'tool_call_start'" class="tool-call-start-container">
        <div class="tool-call-start-header">
          <span class="tool-call-start-icon">🚀</span>
          <span class="tool-call-start-label">工具调用</span>
          <span v-if="message.toolName" class="tool-name">{{ message.toolName }}</span>
          <span class="tool-call-status status-running">执行中</span>
        </div>
        <div class="tool-call-start-content">
          <div class="tool-call-description">
            {{ message.description || message.content || `正在执行 ${message.toolName || '未知工具'}` }}
          </div>
          <div v-if="message.intent" class="tool-call-intent">
            <span class="intent-label">📋 执行意图:</span>
            <span class="intent-content">{{ message.intent }}</span>
          </div>
          <div class="tool-call-progress">
            <div class="progress-bar">
              <div class="progress-fill running-progress"></div>
            </div>
          </div>
        </div>
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
        <!-- 🆕 简化模式(侧边栏):不渲染组件,只显示提示文本 -->
        <div v-if="message.componentData && !isFullscreenMode" class="component-placeholder">
          <div class="placeholder-icon">📊</div>
          <div class="placeholder-text">
            <strong>{{ message.componentData.title || '智能组件' }}</strong>
            <span class="placeholder-hint">请切换到全屏模式查看完整内容</span>
          </div>
        </div>
        <!-- 全屏模式:渲染完整组件 -->
        <div v-else-if="message.componentData && isFullscreenMode" class="component-container">
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

        <!-- 🎯 思考过程 - 只在答案消息中显示思考摘要，点击后展开 -->
        <div v-if="message.type === 'answer' && message.thinkingProcess" class="thinking-section">
          <div class="thinking-header" @click="toggleThinkingProcess">
            <span class="thinking-icon">🤔</span>
            <span class="thinking-title">思考过程</span>
            <span class="collapse-icon">{{ message.thinkingProcess.collapsed ? '▶' : '▼' }}</span>
          </div>
          <div class="thinking-content" v-show="!message.thinkingProcess.collapsed">
            <div class="thinking-text">{{ message.thinkingProcess.content }}</div>
          </div>
        </div>
      </div>

      <!-- 消息时间戳 - 已隐藏 -->
      <!-- <div class="message-timestamp">
        {{ formatTimestamp(message.timestamp) }}
        <span v-if="message.pageContext" class="page-context">
          · {{ message.pageContext }}
        </span>
      </div> -->

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
  </div>
</template>

<script setup lang="ts">
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
// (已移除未使用的计算属性)

// ==================== 方法 ====================
// (已移除未使用的辅助方法)

// 切换思考过程显示
const toggleThinkingProcess = () => {
  if (props.message.thinkingProcess) {
    props.message.thinkingProcess.collapsed = !props.message.thinkingProcess.collapsed
  }
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
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.message-item {
  display: flex;
  gap: var(--spacing-sm); // 侧边栏模式：减小间距
  margin-bottom: var(--spacing-sm); // 侧边栏模式：减小消息间距
  transition: all var(--transition-normal) ease;
  align-items: flex-start;

  width: 100%;
  border-left: none !important;
  border: none !important;
  position: relative;
}

/* 移除所有伪元素样式 */
.message-item::before,
.message-item::after {
  display: none !important;
  content: none !important;
}

.message-item.assistant {
  /* AI 消息始终靠左 */
  justify-content: flex-start !important;
}

.message-item.user {
  /* 用户消息始终靠右，并且头像在右侧 */
  justify-content: flex-end !important;
  flex-direction: row-reverse !important;
}

.message-item.sending {
  opacity: 0.7;
}

// 侧边栏模式：移除头像样式，节省空间

.message-content {
  flex: 1;
  min-width: 0;
  max-width: 100%; // 侧边栏模式：扩展到全宽
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* 助手机器人消息：全宽 */
.message-item.assistant .message-content {
  max-width: 100%;
}

/* 🔧 强制应用动态字体大小 */
.message-content.dynamic-font-size {
  font-size: var(--message-font-size, var(--text-lg)) !important;
}

.message-content.dynamic-font-size *:not(code):not(pre):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
  font-size: inherit !important;
}

/* 侧边栏模式：用户消息全宽 */
.message-item.user .message-content {
  max-width: 100%;
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm); // ✨ 优化：从8px/16px降至4px/8px，更紧凑
  display: block;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-light);
  }
}

/* 🤖 AI 回复：柔和卡片，现代化设计 */
.message-item.assistant .message-text {
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb, 67), 0.03),
    rgba(var(--primary-color-rgb, 67), 0.01)
  );
  border-color: var(--border-color);
  border-left: 2px solid var(--primary-color) !important; // ✨ 优化：减小左边框
  border-radius: var(--radius-md);
}

/* 👤 用户消息：品牌色渐变，现代感 */
.message-item.user .message-text {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border: none !important;
  border-left: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 67), 0.3);
  border-radius: var(--radius-lg);

  &:hover {
    box-shadow: 0 6px 16px rgba(var(--primary-color-rgb, 67), 0.4);
    transform: translateY(-1px);
  }
}

/* 保证用户气泡里的所有文字都是浅色 */
.message-item.user .message-text :deep(*) {
  color: var(--text-on-primary) !important;
}

/* 思考过程样式 - 内嵌式设计 */
.thinking-section {
  width: 100%; // 🔧 修复：确保宽度占满父容器
  margin-top: var(--text-sm);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-tertiary);
  box-sizing: border-box; // 🔧 修复：确保边框计算在宽度内
}

.thinking-header {
  width: 100%; // 🔧 修复：确保占满父容器
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;

  &:hover {
    background: var(--bg-hover);
  }
}

.thinking-icon {
  font-size: var(--text-base);
  animation: thinking 2s ease-in-out infinite;
}

.thinking-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: var(--text-sm);
}

.collapse-icon {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  transition: transform 0.2s ease;
}

.thinking-content {
  width: 100%; // 🔧 修复：确保占满父容器
  box-sizing: border-box;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--el-bg-color);
  max-height: 200px;
  overflow-y: auto;
}

.thinking-text {
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-wrap: break-word;
}

@keyframes thinking {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(3deg); }
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
  border: var(--border-width) solid var(--el-border-color-light);
  border-radius: var(--spacing-sm);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  background-color: var(--el-bg-color);
}

.component-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background-color: var(--el-fill-color-light);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
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

/* 🎨 组件占位符样式 (侧边栏模式) - 美化版 */
.component-placeholder {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb, 67), 0.02),
    rgba(var(--primary-color-rgb, 67), 0.01)
  );
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    background: linear-gradient(135deg,
      rgba(var(--primary-color-rgb, 67), 0.05),
      rgba(var(--primary-color-rgb, 67), 0.02)
    );
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.placeholder-icon {
  font-size: var(--text-4xl);
  flex-shrink: 0;
}

.placeholder-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.placeholder-text strong {
  color: var(--el-text-color-primary);
  font-size: var(--text-base);
}

.placeholder-hint {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
}

/* 🎨 思考消息样式 - 优化版 */
.message-item.assistant .message-text.thinking-message {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%) !important;
  border: none !important;
  color: var(--bg-color) !important;
  position: relative;
  overflow: hidden;
  animation: thinkingPulse 2s ease-in-out infinite;
  box-shadow: 0 var(--spacing-xs) var(--spacing-xl) rgba(102, 126, 234, 0.5);
  border-radius: var(--text-sm) !important;
  padding: var(--text-lg) var(--spacing-xl) !important;
}

/*
.message-item.assistant .message-text.thinking-message::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background-color: var(--primary-color);
  border-radius: 2px;
  opacity: 0.3;
}

.message-item.assistant .message-text.thinking-message::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background-color: var(--primary-color);
  border-radius: 2px;
  animation: thinking-bar 1.5s infinite;
}
*/

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
  z-index: var(--z-index-dropdown);
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
    box-shadow: 0 var(--spacing-xs) var(--spacing-xl) rgba(102, 126, 234, 0.5);
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
  background: var(--bg-primary);
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

/* 🆕 思考过程动画样式 - 美化版 */
.thinking-message-container {
  width: 100%; // 🔧 修复：确保占满父容器
  box-sizing: border-box;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb, 67), 0.05),
    rgba(var(--primary-color-rgb, 67), 0.02)
  );
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary-color) !important;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateX(2px);
  }
}

.thinking-animation {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
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
  border: var(--border-width) solid var(--border-color-light);
  font-size: var(--text-sm);
  color: var(--text-primary);
  overflow-x: auto;
  max-min-height: 60px; height: auto;
  overflow-y: auto;
  margin: 0;
}

/* 🆕 工具解说消息样式 - 美化版 */
.tool-narration-container {
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg,
    rgba(var(--info-color-rgb, 144), 0.05),
    rgba(var(--info-color-rgb, 144), 0.02)
  );
  border-radius: var(--radius-md);
  border-left: 4px solid var(--info-color) !important;
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateX(2px);
  }
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

/* 🆕 工具调用开始消息样式 */
.tool-call-start-container {
  padding: var(--text-sm) var(--text-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: none !important;
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.tool-call-start-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.tool-call-start-icon {
  font-size: var(--text-lg);
  animation: pulse 2s infinite;
}

.tool-call-start-label {
  font-size: var(--text-sm);
  color: var(--warning-color);
  font-weight: 600;
}

.tool-call-status {
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  margin-left: auto;
  font-weight: 500;
}

.status-running {
  background: var(--warning-color-light-9);
  color: var(--warning-color);
  border: 1px solid var(--warning-color-light-7);
  animation: statusPulse 1.5s ease-in-out infinite;
}

.tool-call-start-content {
  font-size: var(--text-base);
  color: var(--text-primary);
}

.tool-call-description {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
  font-weight: 500;
}

.tool-call-intent {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(251, 146, 60, 0.08);
  border-radius: var(--spacing-xs);
  border-left: 3px solid var(--warning-color);
}

.intent-label {
  font-weight: 600;
  color: var(--warning-color);
  margin-right: var(--spacing-sm);
}

.intent-content {
  color: var(--text-regular);
  font-style: italic;
}

.tool-call-progress {
  margin-top: var(--spacing-sm);
}

.progress-bar {
  height: 4px;
  background: var(--el-fill-color-light);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--warning-color), var(--primary-color));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.running-progress {
  width: 30%;
  animation: progressAnimation 2s ease-in-out infinite;
}

@keyframes progressAnimation {
  0%, 100% {
    width: 30%;
  }
  50% {
    width: 70%;
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
