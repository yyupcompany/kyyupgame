<!--
  思考字幕组件
  在输入框上方显示AI的思考内容，带淡入淡出动画效果
-->

<template>
  <Transition name="subtitle-fade">
    <div v-if="currentSubtitle" class="thinking-subtitle">
      <div class="subtitle-content">
        <span class="subtitle-icon">🤔</span>
        <span class="subtitle-text">{{ currentSubtitle }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// ==================== Props ====================
interface Props {
  thinkingContent?: string  // 思考内容
  visible?: boolean         // 是否显示
}

const props = withDefaults(defineProps<Props>(), {
  thinkingContent: '',
  visible: false
})

// ==================== State ====================
const currentSubtitle = ref<string>('')
const subtitleQueue = ref<string[]>([])
let subtitleTimer: NodeJS.Timeout | null = null

// ==================== Methods ====================

/**
 * 显示下一个字幕
 */
const showNextSubtitle = () => {
  if (subtitleQueue.value.length === 0) {
    currentSubtitle.value = ''
    return
  }

  // 取出队列中的第一个字幕
  const nextSubtitle = subtitleQueue.value.shift()
  if (!nextSubtitle) return

  // 显示字幕
  currentSubtitle.value = nextSubtitle

  // 2秒后淡出并显示下一个
  subtitleTimer = setTimeout(() => {
    currentSubtitle.value = ''
    
    // 淡出动画完成后（300ms）显示下一个
    setTimeout(() => {
      showNextSubtitle()
    }, 300)
  }, 2000)
}

/**
 * 清理文本中的特殊字符
 */
const cleanText = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/�/g, '') // 移除菱形问号
    .replace(/[\uFFFD]/g, '') // 移除替换字符 (Unicode)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
    .replace(/^[🔍📊📈🔎📋🧭📸✍️✅👆📝✏️🔧⏳🎨🚀📥💡👥🌐📄📜📦]\s*/, '') // 移除开头的emoji
    .trim()
}

/**
 * 添加新的思考内容到队列
 */
const addThinkingContent = (content: string) => {
  if (!content || !content.trim()) return

  // 清理内容（移除特殊字符和emoji）
  const cleanContent = cleanText(content)

  // 如果清理后内容为空，跳过
  if (!cleanContent) return

  // 如果内容太长，截断并添加省略号
  const maxLength = 50
  const displayContent = cleanContent.length > maxLength
    ? cleanContent.substring(0, maxLength) + '...'
    : cleanContent

  // 避免重复添加相同内容
  if (subtitleQueue.value[subtitleQueue.value.length - 1] === displayContent) {
    return
  }

  // 添加到队列
  subtitleQueue.value.push(displayContent)

  // 如果当前没有显示字幕，立即开始显示
  if (!currentSubtitle.value) {
    showNextSubtitle()
  }
}

/**
 * 清空字幕队列
 */
const clearSubtitles = () => {
  subtitleQueue.value = []
  currentSubtitle.value = ''
  if (subtitleTimer) {
    clearTimeout(subtitleTimer)
    subtitleTimer = null
  }
}

// ==================== Watchers ====================

/**
 * 监听思考内容变化
 */
watch(() => props.thinkingContent, (newContent) => {
  if (newContent && props.visible) {
    addThinkingContent(newContent)
  }
})

/**
 * 监听可见性变化
 */
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    clearSubtitles()
  }
})

// ==================== Lifecycle ====================
import { onUnmounted } from 'vue'

onUnmounted(() => {
  clearSubtitles()
})

// ==================== Expose ====================
defineExpose({
  addThinkingContent,
  clearSubtitles
})
</script>

<style scoped lang="scss">
.thinking-subtitle {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: var(--text-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}

.subtitle-content {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xl) var(--text-2xl);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  backdrop-filter: blur(10px);
  border: var(--border-width-base) solid var(--accent-marketing-heavy);
  border-radius: var(--text-2xl);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-medium);
  max-width: 80%;
}

.subtitle-icon {
  font-size: var(--text-xl);
  animation: pulse 2s ease-in-out infinite;
}

.subtitle-text {
  font-size: var(--text-base);
  font-weight: 500;
  color: rgba(229, 231, 235, 0.95);
  line-height: 1.4;
  text-align: center;
}

// 淡入淡出动画
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: all 0.3s ease;
}

.subtitle-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.subtitle-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// 暗黑主题适配
.dark .subtitle-content {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-heavy);
}

.dark .subtitle-text {
  color: rgba(229, 231, 235, 1);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .subtitle-content {
    max-width: 90%;
    padding: var(--spacing-sm) var(--text-lg);
  }

  .subtitle-icon {
    font-size: var(--text-lg);
  }

  .subtitle-text {
    font-size: var(--text-sm);
  }
}
</style>

