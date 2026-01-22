<!--
  思考过程组件 - Qoder风格简约版
  单行显示，点击展开详情
-->

<template>
  <div class="event-row" :class="{ expanded: !collapsed }" @click="handleToggle">
    <!-- 单行头部 -->
    <div class="event-header">
      <span class="expand-icon">{{ collapsed ? '▸' : '▾' }}</span>
      <div v-if="isStreaming" class="pulse-indicator">
        <span class="pulse-ring"></span>
        <span class="pulse-dot"></span>
      </div>
      <span v-else class="event-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="event-label">深度思考</span>
      <span class="event-time">· {{ elapsedTime }}</span>
    </div>
    
    <!-- 展开内容 -->
    <div v-if="!collapsed" class="event-content">
      <div class="content-text">{{ content }}<span v-if="isStreaming" class="cursor">|</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

// ==================== Props ====================
interface Props {
  content: string
  collapsed: boolean
  isStreaming?: boolean
  showProgress?: boolean
  progressPercentage?: number
  startTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  showProgress: false,
  progressPercentage: 0,
  startTime: () => Date.now()
})

// ==================== Emits ====================
interface Emits {
  'toggle': []
}

const emit = defineEmits<Emits>()

// ==================== 计时器 ====================
const now = ref(Date.now())
let timer: number | null = null

const elapsedTime = computed(() => {
  const seconds = Math.floor((now.value - props.startTime) / 1000)
  return `${seconds}s`
})

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ==================== 事件处理 ====================
const handleToggle = () => {
  emit('toggle')
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入，无需手动导入

// Qoder风格事件行
.event-row {
  padding: var(--spacing-xs) 0;
  cursor: pointer;
  transition: background 0.15s ease;
  border-radius: var(--radius-sm);
  
  &:hover {
    background: var(--bg-hover);
  }
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 0 var(--spacing-sm);
  height: 28px;
}

.pulse-indicator {
  position: relative;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--ai-thinking-pulse);
  opacity: 0.4;
  animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ai-thinking-pulse);
  box-shadow: 0 0 8px var(--ai-primary-glow);
}

.event-check {
  color: var(--success-color);
  display: flex;
  align-items: center;
  width: 12px;
  height: 12px;

  svg {
    width: 100%;
    height: 100%;
  }
}

@keyframes pulse-ring {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.event-label {
  flex: 1;
}

.event-time {
  color: var(--text-tertiary);
  font-size: 12px;
}

.event-content {
  margin-left: 24px;
  margin-top: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--border-color);
}

.content-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow-y: auto;
}

.cursor {
  animation: blink 0.8s infinite;
  color: var(--primary-color);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
