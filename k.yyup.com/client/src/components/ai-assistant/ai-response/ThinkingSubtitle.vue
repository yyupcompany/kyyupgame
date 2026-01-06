<!--
  思考字幕组件 v2.0
  在输入框上方显示AI的思考内容，带淡入淡出动画效果
  新增：暂停/展开功能，用户可控制显示节奏
-->

<template>
  <Transition name="subtitle-fade">
    <div v-if="currentSubtitle || expandedSubtitles.length > 0" class="thinking-subtitle" :class="{ 'is-expanded': isExpanded }">
      <!-- 紧凑模式：单条思考内容 -->
      <div v-if="!isExpanded" class="subtitle-content" @click="toggleExpand">
        <span class="subtitle-icon">🤔</span>
        <span class="subtitle-text">{{ currentSubtitle }}</span>
        <!-- 暂停/继续按钮 -->
        <button
          class="subtitle-control-btn"
          @click.stop="togglePause"
          :title="isPaused ? '继续显示' : '暂停显示'"
        >
          <UnifiedIcon :name="isPaused ? 'play' : 'pause'" :size="14" />
        </button>
        <!-- 展开按钮（有多条时显示） -->
        <button
          v-if="subtitleQueue.length > 0"
          class="subtitle-expand-btn"
          @click.stop="toggleExpand"
          title="查看所有思考过程"
        >
          <span class="expand-count" v-if="subtitleQueue.length > 0">+{{ subtitleQueue.length + 1 }}条</span>
          <UnifiedIcon name="arrow-down" :size="14" />
        </button>
      </div>

      <!-- 展开模式：显示所有思考内容 -->
      <div v-else class="subtitle-expanded">
        <div class="expanded-header">
          <span class="expanded-title">思考过程</span>
          <div class="expanded-actions">
            <button class="control-btn" @click="togglePause" :title="isPaused ? '继续' : '暂停'">
              <UnifiedIcon :name="isPaused ? 'play' : 'pause'" :size="14" />
              {{ isPaused ? '继续' : '暂停' }}
            </button>
            <button class="control-btn primary" @click="toggleExpand" title="收起">
              <UnifiedIcon name="arrow-up" :size="14" />
              收起
            </button>
          </div>
        </div>
        <div class="expanded-list">
          <!-- 当前显示的内容 -->
          <div class="expanded-item current">
            <span class="item-badge">当前</span>
            <span class="item-content">{{ currentSubtitle }}</span>
          </div>
          <!-- 队列中的内容 -->
          <div
            v-for="(item, index) in subtitleQueue"
            :key="index"
            class="expanded-item"
          >
            <span class="item-badge">#{{ index + 2 }}</span>
            <span class="item-content">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

// ==================== Props ====================
interface Props {
  thinkingContent?: string  // 思考内容
  visible?: boolean         // 是否显示
  displayDuration?: number  // 每条显示时长（毫秒），默认3000ms
}

const props = withDefaults(defineProps<Props>(), {
  thinkingContent: '',
  visible: false,
  displayDuration: 3000  // 改为3秒，用户有更多时间阅读
})

// ==================== Emits ====================
interface Emits {
  (e: 'thinking-complete'): void  // 思考过程完成
}

const emit = defineEmits<Emits>()

// ==================== State ====================
const currentSubtitle = ref<string>('')
const subtitleQueue = ref<string[]>([])
let subtitleTimer: NodeJS.Timeout | null = null
const isPaused = ref(false)
const isExpanded = ref(false)

// ==================== Methods ====================

/**
 * 切换暂停/继续
 */
const togglePause = () => {
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    // 继续显示
    showNextSubtitle()
  } else {
    // 暂停显示
    if (subtitleTimer) {
      clearTimeout(subtitleTimer)
      subtitleTimer = null
    }
  }
}

/**
 * 切换展开/收起
 */
const toggleExpand = () => {
  isExpanded.value = !isPaused.value

  // 如果是收起模式，重新开始显示
  if (!isExpanded.value && !isPaused.value) {
    showNextSubtitle()
  }
}

/**
 * 显示下一个字幕
 */
const showNextSubtitle = () => {
  // 如果暂停了，不继续
  if (isPaused.value) return

  if (subtitleQueue.value.length === 0) {
    // 队列空了，通知思考完成
    currentSubtitle.value = ''
    emit('thinking-complete')
    return
  }

  // 取出队列中的第一个字幕
  const nextSubtitle = subtitleQueue.value.shift()
  if (!nextSubtitle) return

  // 显示字幕
  currentSubtitle.value = nextSubtitle

  // 定时切换下一条（使用配置的时长）
  const duration = props.displayDuration || 3000
  subtitleTimer = setTimeout(() => {
    // 如果展开了，不自动切换，让用户手动控制
    if (isExpanded.value) return

    currentSubtitle.value = ''

    // 淡出动画完成后（300ms）显示下一个
    setTimeout(() => {
      showNextSubtitle()
    }, 300)
  }, duration)
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
  const maxLength = 80  // 增加显示长度
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
  isPaused.value = false
  isExpanded.value = false
  if (subtitleTimer) {
    clearTimeout(subtitleTimer)
    subtitleTimer = null
  }
}

/**
 * 获取队列中的思考内容数量
 */
const getQueueCount = () => {
  return subtitleQueue.value.length
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
  } else if (props.thinkingContent) {
    // 重新可见时，添加当前思考内容
    addThinkingContent(props.thinkingContent)
  }
})

// ==================== Lifecycle ====================
onUnmounted(() => {
  clearSubtitles()
})

// ==================== Expose ====================
defineExpose({
  addThinkingContent,
  clearSubtitles,
  togglePause,
  toggleExpand,
  getQueueCount,
  isPaused,
  isExpanded
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

.thinking-subtitle {
  font-size: inherit;
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: var(--text-sm);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
  z-index: var(--z-index-sticky);

  &.is-expanded {
    align-items: flex-start;
  }
}

.subtitle-content {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  backdrop-filter: blur(10px);
  border: var(--border-width) solid var(--accent-marketing-heavy);
  border-radius: var(--radius-xl);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-medium);
  max-width: 85%;
  cursor: pointer;
  pointer-events: auto;
  transition: all var(--transition-base);

  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
    border-color: var(--accent-marketing-light);
  }
}

.subtitle-icon {
  font-size: var(--text-lg);
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.subtitle-text {
  font-size: var(--text-sm);
  font-weight: 500;
  color: rgba(229, 231, 235, 0.95);
  line-height: 1.4;
  text-align: left;
  flex: 1;
}

.subtitle-control-btn,
.subtitle-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
  }
}

.expand-count {
  font-size: 10px;
  margin-right: 2px;
  color: var(--accent-marketing-light);
}

// ==================== 展开模式样式 ====================
.subtitle-expanded {
  width: 100%;
  max-width: 500px;
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(16px);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  overflow: hidden;
}

.expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: var(--border-width) solid var(--border-color);
  background: rgba(99, 102, 241, 0.1);
}

.expanded-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &::before {
    content: '🤔';
    font-size: var(--text-lg);
  }
}

.expanded-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.control-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-focus);
    color: var(--text-primary);
  }

  &.primary {
    background: var(--accent-marketing-heavy);
    border-color: var(--accent-marketing-heavy);
    color: var(--text-on-primary);

    &:hover {
      background: var(--accent-marketing-hover);
    }
  }
}

.expanded-list {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.expanded-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: var(--border-width) solid transparent;
  transition: all var(--transition-fast);

  &:last-child {
    margin-bottom: 0;
  }

  &.current {
    border-color: var(--accent-marketing-heavy);
    background: rgba(99, 102, 241, 0.1);
  }
}

.item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 20px;
  padding: 0 var(--spacing-sm);
  background: var(--accent-marketing-medium);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  color: var(--text-on-primary);
  flex-shrink: 0;
}

.current .item-badge {
  background: var(--accent-marketing-heavy);
}

.item-content {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.5;
  text-align: left;
}

// 淡入淡出动画
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: all var(--transition-normal) ease;
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
}

.dark .subtitle-expanded {
  background: rgba(20, 20, 30, 0.95);
}

.dark .subtitle-text {
  color: rgba(229, 231, 235, 1);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .subtitle-content {
    max-width: 95%;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .subtitle-text {
    font-size: var(--text-xs);
  }

  .subtitle-expanded {
    max-width: 100%;
  }

  .expanded-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .expanded-item {
    padding: var(--spacing-sm);
  }

  .item-content {
    font-size: var(--text-xs);
  }
}
</style>
