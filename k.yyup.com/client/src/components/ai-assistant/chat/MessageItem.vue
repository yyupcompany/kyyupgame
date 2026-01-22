<!--
  简洁聊天消息组件
  参考 Claude/ChatGPT/Grok 风格：简洁文字 + 流畅动画
-->

<template>
  <div class="chat-message" :class="message.role">
    <!-- 头像（始终在前面，CSS 控制位置） -->
    <div class="avatar" :class="message.role === 'assistant' ? 'ai-avatar' : 'user-avatar'">
      <div class="avatar-bg">
        <!-- AI 头像 -->
        <svg v-if="message.role === 'assistant'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke-linejoin="round"/>
          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" stroke-linecap="round"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
        </svg>
        <!-- 用户头像 -->
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="8" r="4" stroke-linecap="round"/>
          <path d="M20 21a8 8 0 1 0-16 0" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- 消息内容 -->
    <div class="message-bubble">
      <!-- 深度思考（Qoder 简洁折叠风格）-->
      <div
        v-if="showThinking && thinkingContent"
        class="deep-thinking"
      >
        <button class="deep-thinking-toggle" @click="toggleThinking">
          <svg class="toggle-chevron" :class="{ expanded: !thinkingCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="toggle-text">深度思考</span>
          <span class="toggle-duration">· {{ thinkingDuration }}</span>
        </button>
        <transition name="thinking-expand">
          <div v-show="!thinkingCollapsed" class="deep-thinking-content">
            <div class="thinking-text" ref="thinkingTextRef">{{ displayedThinkingContent }}</div>
            <span v-if="isThinking" class="typing-cursor"></span>
          </div>
        </transition>
      </div>

      <!-- 🆕 工具执行进度消息 -->
      <div v-if="isToolProgressMessage" class="tool-progress-message">
        <div class="progress-indicator">
          <div class="progress-spinner"></div>
          <span class="progress-text">{{ message.progressMessage || message.content }}</span>
        </div>
        <div v-if="message.progressPercent" class="progress-bar">
          <div class="progress-fill" :style="{ width: message.progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- 🆕 工具调用状态消息 -->
      <div v-else-if="isToolCallMessage" class="tool-call-message">
        <div class="tool-header">
          <div class="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div class="tool-info">
            <span class="tool-name">{{ message.toolName || '工具执行' }}</span>
            <span class="tool-status" :class="message.toolStatus || 'running'">
              {{ getToolStatusText(message.toolStatus) }}
            </span>
          </div>
        </div>
        <div v-if="message.progressMessage" class="tool-progress-text">
          {{ message.progressMessage }}
        </div>
        <div v-if="message.toolIntent" class="tool-intent">
          💡 {{ message.toolIntent }}
        </div>
        <div v-if="message.duration" class="tool-duration">
          ⏱️ {{ formatDuration(message.duration) }}
        </div>
      </div>

      <!-- 正常消息内容（思考类型消息和工具调用消息不显示主内容，避免重复） -->
      <div v-if="!isToolCallMessage && !isToolProgressMessage && (message.type !== 'thinking' || !showThinking)" class="message-text">
        <!-- 使用 Markdown 渲染的内容 -->
        <div class="text-content markdown-content" ref="textContentRef">
          <div class="typewriter-text" v-html="renderedContent"></div>
          <span v-if="isStreaming" class="typing-cursor"></span>
        </div>
      </div>

      <!-- 消息反馈（仅AI消息显示） -->
      <div v-if="message.role === 'assistant' && !isStreaming" class="message-actions">
        <button class="action-btn" @click="handleCopy" title="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke-linecap="round"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="action-btn" @click="handleRegenerate" title="重新生成">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, type Ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { ExtendedChatMessage } from '../types/aiAssistant'

// 配置 marked
marked.setOptions({
  breaks: true,  // 支持换行
  gfm: true      // 支持 GitHub Flavored Markdown
})

// 渲染 Markdown 为 HTML
const renderMarkdown = (content: string): string => {
  if (!content || content === 'undefined' || content === 'null') {
    return ''
  }
  try {
    const html = marked.parse(content)
    // marked.parse 可能返回 Promise，但在同步模式下返回 string
    const htmlString = typeof html === 'string' ? html : ''
    // 使用 DOMPurify 清理 HTML 防止 XSS
    return DOMPurify.sanitize(htmlString)
  } catch (error) {
    console.error('Markdown parse error:', error)
    return content
  }
}

interface Props {
  message: ExtendedChatMessage
  fontSize?: number
  isFullscreenMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 14,
  isFullscreenMode: false
})

const emit = defineEmits<{
  'copy': [content: string]
  'regenerate': []
}>()

// 思考过程折叠状态（🔧修复：默认展开，让用户能立即看到思考内容）
const thinkingCollapsed = ref(false)

// 思考时长
const thinkingStartTime = ref<number>(0)
const thinkingDuration = ref('...')

// 打字机效果状态
const displayedContent = ref('')
const displayedThinkingContent = ref('')
const textContentRef = ref<HTMLElement>()
const thinkingTextRef = ref<HTMLElement>()

// 判断是否正在流式输出
const isStreaming = computed(() => {
  return props.message.sending || (props.message as any).streaming
})

// 🆕 渲染 Markdown 内容
const renderedContent = computed(() => {
  return renderMarkdown(displayedContent.value)
})

// 判断思考过程是否正在加载
const isThinking = computed(() => {
  return props.message.isThinking || props.message.type === 'thinking'
})

// 监听思考状态变化，计算时长
watch(isThinking, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // 开始思考
    thinkingStartTime.value = Date.now()
    thinkingDuration.value = '...'
  } else if (!newVal && oldVal) {
    // 结束思考
    const duration = Math.round((Date.now() - thinkingStartTime.value) / 1000)
    thinkingDuration.value = `${duration}s`
  }
}, { immediate: true })

// 初始化（合并两个 onMounted）
onMounted(() => {
  // 初始化思考时长
  if ((props.message.thinkingProcess as any)?.duration) {
    thinkingDuration.value = `${(props.message.thinkingProcess as any).duration}s`
  } else if (thinkingContent.value && !isThinking.value) {
    thinkingDuration.value = '2s' // 默认显示
  }
  
  // 初始显示完整内容
  if (props.message.content) {
    displayedContent.value = props.message.content
  }
  if (thinkingContent.value) {
    displayedThinkingContent.value = thinkingContent.value
  }
})

// 是否显示思考过程（修复：移除类型限制，只要有思考内容就显示）
const showThinking = computed(() => {
  // 检查是否有思考内容
  const hasThinkingContent = props.message.thinkingProcess?.content ||
    (props.message as any).reasoningContent
  
  // 或者消息类型本身是思考类型
  const isThinkingType = props.message.type === 'thinking'
  
  return hasThinkingContent || isThinkingType
})

// 思考过程内容（修复：思考类型消息的内容也作为思考内容）
const thinkingContent = computed(() => {
  // 优先使用明确的思考内容字段
  if (props.message.thinkingProcess?.content) {
    return props.message.thinkingProcess.content
  }
  if ((props.message as any).reasoningContent) {
    return (props.message as any).reasoningContent
  }
  // 如果是思考类型消息，使用主内容作为思考内容
  if (props.message.type === 'thinking' && props.message.content) {
    return props.message.content
  }
  return ''
})

// 🆕 判断是否是工具进度消息
const isToolProgressMessage = computed(() => {
  return props.message.type === 'tool_progress'
})

// 🆕 判断是否是工具调用消息
const isToolCallMessage = computed(() => {
  return props.message.type === 'tool_call_start' || props.message.type === 'tool_call'
})

// 🆕 获取工具状态文本
function getToolStatusText(status?: string): string {
  switch (status) {
    case 'running':
      return '执行中...'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    case 'pending':
      return '等待中'
    default:
      return '执行中...'
  }
}

// 🆕 格式化持续时间
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(1)}s`
}

// 切换思考过程折叠
function toggleThinking() {
  thinkingCollapsed.value = !thinkingCollapsed.value
}

// 复制
function handleCopy() {
  emit('copy', props.message.content || '')
}

// 重新生成
function handleRegenerate() {
  emit('regenerate')
}

// 打字机效果
function typeWriter(text: string, target: Ref<string>, speed = 20) {
  if (!text) {
    target.value = ''
    return
  }

  // 如果有HTML标签，直接显示
  if (text.includes('<') && text.includes('>')) {
    target.value = text
    return
  }

  let i = 0
  target.value = ''

  function type() {
    if (i < text.length) {
      target.value += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// 监听消息变化，更新显示内容
// 🔧 修复：流式消息直接显示，只有完整消息才用打字机效果
watch(
  () => ({ 
    content: props.message.content, 
    thinking: thinkingContent.value,
    streaming: isStreaming.value,  // 监听流式状态
    role: props.message.role,  // 监听角色
    type: props.message.type   // 🔧 新增：监听消息类型
  }),
  (newVal, oldVal) => {
    // 更新主内容
    if (newVal.content && newVal.content !== oldVal?.content) {
      // 🔧 修复：以下情况直接显示，不用打字机效果
      // 1. 用户消息（立即显示）
      // 2. 流式消息（内容是逐步累加的）
      // 3. 思考消息
      // 4. 工具相关消息（tool_narration, tool_call, tool_call_start, tool_progress等）
      // 5. answer 类型消息（AI 的最终回答，通常也是流式的）
      // 6. 内容累加检测：如果新内容以旧内容开头，说明是流式累加，直接显示
      const isToolRelatedMessage = newVal.type?.startsWith('tool_') || newVal.type === 'search'
      const isAnswerMessage = newVal.type === 'answer'
      const isContentAppending = oldVal?.content && newVal.content.startsWith(oldVal.content)
      
      if (newVal.role === 'user' || newVal.streaming || newVal.type === 'thinking' || isToolRelatedMessage || isAnswerMessage || isContentAppending) {
        displayedContent.value = newVal.content
      } else {
        // 非流式AI消息：使用打字机效果（如历史消息加载）
        typeWriter(newVal.content, displayedContent, 15)
      }
    } else if (newVal.content) {
      displayedContent.value = newVal.content
    }

    // 🔧 思考内容直接显示（流式累加）
    // 🎯 修复：确保思考内容更新时能够正确显示
    if (newVal.thinking && newVal.thinking !== oldVal?.thinking) {
      displayedThinkingContent.value = newVal.thinking
      console.log('💭 [MessageItem] 思考内容已更新:', newVal.thinking.substring(0, 50) + '...')
    } else if (newVal.thinking && !displayedThinkingContent.value) {
      // 🔧 修复：如果有thinking内容但displayedThinkingContent为空，则初始化
      displayedThinkingContent.value = newVal.thinking
      console.log('💭 [MessageItem] 思考内容已初始化:', newVal.thinking.substring(0, 50) + '...')
    }
  }, 
  { immediate: true, deep: true }  // 🔧 添加 deep: true 确保能检测到对象属性变化
)
</script>

<style scoped lang="scss">
.chat-message {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-width: 100%;
  animation: messageIn 0.3s ease;

  &.assistant {
    align-items: flex-start;

    .avatar-bg {
      background: var(--gradient-primary);
    }

    .message-bubble {
      background: var(--ai-bubble-ai-bg);
      border: 1px solid var(--ai-bubble-ai-border);
      box-shadow: var(--shadow-sm);

      &:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--primary-light);
      }
    }
  }

  &.user {
    flex-direction: row-reverse;
    align-items: flex-start;

    .avatar-bg {
      background: var(--ai-bubble-user-bg);
    }

    .message-bubble {
      background: var(--ai-bubble-user-bg);
      color: var(--text-on-primary);
      border: none;
      box-shadow: 0 4px 15px var(--ai-primary-glow);

      .text-content :deep(code) {
        background: rgba(255, 255, 255, 0.2);
      }

      .message-actions .action-btn {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
          color: white;
        }
      }
    }
  }
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .avatar-bg {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
  }
}

.ai-avatar .avatar-bg {
  box-shadow: 0 2px 8px var(--primary-color-light-5, rgba(91, 141, 239, 0.3));
}

.user-avatar .avatar-bg {
  box-shadow: 0 2px 8px var(--primary-color-light-5, rgba(91, 141, 239, 0.3));
}

.message-bubble {
  flex: 1;
  max-width: calc(100% - 52px);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-xl);
  line-height: 1.8;
  font-size: v-bind('fontSize + "px"');
  color: var(--text-primary);
  transition: all 0.3s var(--ai-transition-soft);
}

// 深度思考 - Qoder 简洁折叠风格
.deep-thinking {
  margin-bottom: var(--spacing-sm);
}

.deep-thinking-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-tertiary);
  transition: color 0.15s ease;

  &:hover {
    color: var(--text-secondary);
  }
}

.toggle-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  stroke-width: 2.5;

  &.expanded {
    transform: rotate(90deg);
  }
}

.toggle-text {
  font-weight: 500;
}

.toggle-duration {
  color: var(--text-placeholder);
}

// 展开动画
.thinking-expand-enter-active,
.thinking-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.thinking-expand-enter-from,
.thinking-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.thinking-expand-enter-to,
.thinking-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.deep-thinking-content {
  margin-top: var(--spacing-xs);
  padding-left: var(--spacing-sm);
}

.thinking-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

// 打字光标
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--primary-color);
  animation: cursorBlink 1s step-end infinite;
  flex-shrink: 0;
  margin-top: 0.3em;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 消息文本
.message-text {
  .text-content {
    word-break: break-word;
    line-height: 1.7;

    // 🆕 Markdown 内容样式
    &.markdown-content {
      // 段落
      :deep(p) {
        margin: var(--spacing-xs) 0;
        line-height: 1.7;
        
        &:first-child {
          margin-top: 0;
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      // 标题样式
      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin: var(--spacing-sm) 0 var(--spacing-xs) 0;
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary);
        
        &:first-child {
          margin-top: 0;
        }
      }

      :deep(h1) {
        font-size: 1.25em;
      }

      :deep(h2) {
        font-size: 1.15em;
      }

      :deep(h3) {
        font-size: 1.1em;
      }

      :deep(h4), :deep(h5), :deep(h6) {
        font-size: 1em;
      }

      // 表格样式
      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: var(--spacing-sm) 0;
        font-size: 0.9em;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      :deep(th), :deep(td) {
        padding: var(--spacing-xs) var(--spacing-sm);
        text-align: left;
        border: 1px solid var(--border-color);
      }

      :deep(th) {
        background: var(--bg-secondary);
        font-weight: 600;
        color: var(--text-primary);
      }

      :deep(tr:nth-child(even)) {
        background: var(--bg-tertiary);
      }

      // 引用样式
      :deep(blockquote) {
        margin: var(--spacing-sm) 0;
        padding: var(--spacing-sm) var(--spacing-md);
        border-left: 3px solid var(--primary-color);
        background: var(--bg-secondary);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        color: var(--text-secondary);
      }

      // 水平线
      :deep(hr) {
        margin: var(--spacing-md) 0;
        border: none;
        border-top: 1px solid var(--border-color);
      }

      // 链接
      :deep(a) {
        color: var(--primary-color);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    :deep(code) {
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      font-size: 0.9em;
      font-family: var(--font-family-mono);
      color: var(--primary-color);
    }

    :deep(pre) {
      background: var(--bg-tertiary);
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-light);
      overflow-x: auto;
      margin: var(--spacing-sm) 0;

      code {
        background: none;
        padding: 0;
        color: var(--text-primary);
      }
    }

    :deep(ul), :deep(ol) {
      margin: var(--spacing-xs) 0;
      padding-left: var(--spacing-xl);
    }

    :deep(li) {
      margin: var(--spacing-xs) 0;
      line-height: 1.6;
      
      // 嵌套列表
      :deep(ul), :deep(ol) {
        margin: var(--spacing-xs) 0;
      }
    }

    :deep(strong) {
      font-weight: 600;
      color: var(--text-primary);
    }

    :deep(em) {
      font-style: italic;
    }
  }
}

.typewriter-text {
  word-break: break-word;
}

// 🆕 工具进度消息样式
.tool-progress-message {
  .progress-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }
  
  .progress-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .progress-text {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .progress-bar {
    height: 4px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 🆕 工具调用消息样式
.tool-call-message {
  .tool-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }
  
  .tool-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light-bg);
    border-radius: var(--radius-sm);
    color: var(--primary-color);
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  .tool-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .tool-name {
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .tool-status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    
    &.running {
      background: var(--warning-bg);
      color: var(--warning-color);
    }
    
    &.completed {
      background: var(--success-bg);
      color: var(--success-color);
    }
    
    &.failed {
      background: var(--error-bg);
      color: var(--error-color);
    }
    
    &.pending {
      background: var(--bg-secondary);
      color: var(--text-tertiary);
    }
  }
  
  .tool-progress-text {
    padding: var(--spacing-xs) 0;
    color: var(--text-secondary);
    font-size: 13px;
  }
  
  .tool-intent {
    padding: var(--spacing-xs) 0;
    color: var(--text-tertiary);
    font-size: 13px;
    font-style: italic;
  }
  
  .tool-duration {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

// 消息操作
.message-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

// 响应式
@media (max-width: var(--breakpoint-md)) {
  .chat-message {
    margin-bottom: var(--spacing-md);

    &.user .message-bubble {
      max-width: calc(100% - 52px);
    }
  }

  .message-bubble {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 14px;
  }
}
</style>
