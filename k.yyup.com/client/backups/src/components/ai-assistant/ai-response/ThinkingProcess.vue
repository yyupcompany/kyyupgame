<!--
  思考过程组件
  从 AIAssistant.vue 第116-127行模板提取
-->

<template>
  <div class="thinking-container" :class="{ collapsed: collapsed }">
    <div class="thinking-header" @click="handleToggle">
      <div class="thinking-title">
        <span class="thinking-icon">🤔</span>
        <span class="thinking-text">思考过程</span>
        <span v-if="isStreaming" class="thinking-status">正在思考...</span>
      </div>
      <span class="collapse-icon">{{ collapsed ? '▶' : '▼' }}</span>
    </div>
    <div class="thinking-content" v-show="!collapsed">
      <!-- 🔧 展开状态：最多显示4行 -->
      <div class="thinking-text-content" :class="{ 'line-clamp-4': !collapsed }">
        {{ content }}
        <span v-if="isStreaming" class="thinking-cursor"></span>
      </div>
      <div v-if="showProgress" class="thinking-progress">
        <el-progress
          :percentage="progressPercentage"
          :show-text="false"
          :stroke-width="2"
          color="var(--el-color-primary)"
        />
      </div>
    </div>
    <!-- 🔧 收缩状态：显示1-2行摘要 -->
    <div class="thinking-summary" v-show="collapsed">
      <div class="thinking-summary-text line-clamp-2">
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ==================== Props ====================
interface Props {
  content: string
  collapsed: boolean
  isStreaming?: boolean
  showProgress?: boolean
  progressPercentage?: number
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  showProgress: false,
  progressPercentage: 0
})

// ==================== Emits ====================
interface Emits {
  'toggle': []
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const hasContent = computed(() => props.content && props.content.trim().length > 0)

// ==================== 事件处理 ====================
const handleToggle = () => {
  emit('toggle')
}
</script>

<style scoped>
.thinking-container {
  background: var(--el-fill-color-extra-light);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  border-radius: var(--text-sm);
  margin-bottom: var(--text-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.thinking-container:hover {
  border-color: var(--el-border-color-light);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.thinking-header:hover {
  background: var(--el-fill-color);
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.thinking-icon {
  font-size: var(--text-lg);
  animation: thinking 2s ease-in-out infinite;
}

.thinking-text {
  font-size: var(--text-sm); /* 🔧 统一为var(--text-sm)，与智能查询标签一致 */
}

.thinking-status {
  font-size: var(--text-sm);
  color: var(--el-color-primary);
  font-weight: normal;
  margin-left: var(--spacing-sm);
}

.collapse-icon {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  transition: transform 0.2s ease;
}

.thinking-container.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.thinking-content {
  padding: var(--text-lg);
  background: var(--el-bg-color);
}

.thinking-text-content {
  font-size: var(--text-sm); /* 🔧 统一为var(--text-sm)，与智能查询标签一致 */
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
}

/* 🔧 展开状态：最多显示4行 */
.thinking-text-content.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 🔧 收缩状态摘要 */
.thinking-summary {
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-bg-color);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

.thinking-summary-text {
  font-size: var(--text-sm); /* 🔧 统一为var(--text-sm)，与智能查询标签一致 */
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 🔧 收缩状态：最多显示2行 */
.thinking-summary-text.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thinking-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--el-color-primary);
  margin-left: var(--spacing-sm);
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

.thinking-progress {
  margin-top: var(--text-sm);
  padding-top: var(--text-sm);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

/* 动画效果 */
@keyframes thinking {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 折叠动画 */
.thinking-content {
  transition: all 0.3s ease;
  /* 🔧 修复：移除固定高度限制，让内容自动扩展 */
  min-height: auto;
  max-height: none;
  overflow: visible;
}

.thinking-container.collapsed .thinking-content {
  max-height: 0;
  padding: 0 var(--text-lg);
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .thinking-header {
    padding: var(--spacing-2xl) var(--text-base);
  }
  
  .thinking-content {
    padding: var(--text-base);
  }
  
  .thinking-text-content {
    font-size: var(--text-sm);
  }
  
  .thinking-text {
    font-size: var(--text-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .thinking-header {
    padding: var(--spacing-sm) var(--text-sm);
  }
  
  .thinking-content {
    padding: var(--text-sm);
  }
  
  .thinking-title {
    gap: var(--spacing-lg);
  }
  
  .thinking-icon {
    font-size: var(--text-base);
  }
  
  .thinking-text {
    font-size: var(--text-sm);
  }
  
  .thinking-status {
    font-size: var(--text-xs);
  }
}

/* 明亮主题优化 */
.thinking-container {
  background: linear-gradient(135deg, var(--white-alpha-95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid var(--accent-marketing-medium);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-4);
}

.thinking-container:hover {
  border-color: rgba(139, 92, 246, 0.35);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-light);
}

.thinking-header {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%);
  border-bottom: var(--border-width-base) solid rgba(139, 92, 246, 0.15);
}

.thinking-header:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%);
}

.thinking-title {
  color: var(--color-gray-700);
}

.thinking-text {
  color: var(--text-primary-dark);
  font-weight: 600;
}

.thinking-status {
  color: var(--ai-primary);
}

.collapse-icon {
  color: var(--dark-text-1);
}

.thinking-content {
  background: var(--white-alpha-80);
  border-top: var(--border-width-base) solid rgba(139, 92, 246, 0.1);
}

.thinking-text-content {
  color: var(--dark-surface-3);
}

.thinking-cursor {
  background: var(--ai-primary);
}

/* 暗色主题适配 */
.theme-dark .thinking-container {
  background: var(--el-fill-color-dark);
  border-color: var(--el-border-color-dark);
}

.theme-dark .thinking-header {
  background: var(--el-fill-color-darker);
}

.theme-dark .thinking-header:hover {
  background: var(--el-fill-color-dark);
}

.theme-dark .thinking-content {
  background: var(--el-bg-color-dark);
}

.theme-dark .thinking-title {
  color: #f9fafb;
}

.theme-dark .thinking-text {
  color: var(--border-color);
}

.theme-dark .thinking-text-content {
  color: var(--border-color);
}
</style>
