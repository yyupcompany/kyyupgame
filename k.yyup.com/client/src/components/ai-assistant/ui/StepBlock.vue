<!--
  步骤块组件 - 类似 Cursor 的效果
  用于显示工具调用、对话消息等步骤
-->
<template>
  <div class="step-block" :class="{ expanded: isExpanded, collapsed: !isExpanded }">
    <!-- 步骤头部 - 可点击展开/折叠 -->
    <div class="step-header" @click="toggleExpand">
      <!-- 左侧图标 -->
      <div class="step-icon" :class="iconClass || ''">
        <template v-if="!iconClass">
          <UnifiedIcon name="ai-center" />
        </template>
        <span v-else class="icon-placeholder">{{ iconText || '•' }}</span>
      </div>
      
      <!-- 中间文本描述 -->
      <div class="step-text">
        <span class="step-description">{{ description }}</span>
        <span v-if="subtitle" class="step-subtitle">{{ subtitle }}</span>
      </div>
      
      <!-- 右侧展开/折叠箭头 -->
      <div class="step-chevron" v-if="hasContent">
        <el-icon>
          <ArrowDown v-if="isExpanded" />
          <ArrowRight v-else />
        </el-icon>
      </div>
    </div>
    
    <!-- 展开内容 -->
    <div v-if="isExpanded && hasContent" class="step-content">
      <slot name="content">
        <div v-if="content" class="step-content-text">{{ content }}</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Component } from 'vue'

// ==================== Props ====================
interface Props {
  description: string  // 步骤描述文本
  subtitle?: string   // 副标题
  icon?: Component    // 图标组件
  iconText?: string   // 图标文本（如果没有图标组件）
  iconClass?: string | Record<string, boolean>  // 图标样式类（字符串或对象）
  content?: string    // 展开后的内容
  defaultExpanded?: boolean  // 默认是否展开
  hasContent?: boolean      // 是否有可展开的内容
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
  hasContent: true
})

// ==================== 状态 ====================
const isExpanded = ref(props.defaultExpanded)

// ==================== 方法 ====================
const toggleExpand = () => {
  if (props.hasContent) {
    isExpanded.value = !isExpanded.value
  }
}

// ==================== 暴露方法 ====================
defineExpose({
  expand: () => { isExpanded.value = true },
  collapse: () => { isExpanded.value = false },
  toggle: toggleExpand
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.step-block {
  background: var(--el-fill-color-extra-light);
  border: var(--border-width) solid var(--el-border-color-lighter);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast) ease;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter);
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-sm) var(--text-lg);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.step-icon {
  width: var(--text-3xl);
  height: var(--text-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--text-lg);
  color: var(--el-text-color-regular);

  .icon-placeholder {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }
}

.step-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.step-description {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  word-break: break-word;
}

.step-subtitle {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  line-height: 1.3;
}

.step-chevron {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s ease;
}

.step-content {
  padding: var(--text-sm) var(--text-lg);
  padding-top: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  animation: slideDown 0.2s ease;
}

/* 🎨 深色主题适配 */
:global(.theme-dark) .step-block {
  background: var(--white-alpha-5);
  border-color: var(--white-alpha-10);
}

:global(.theme-dark) .step-content {
  background: var(--shadow-heavy);
  border-top-color: var(--white-alpha-10);
}

.step-content-text {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-wrap: break-word;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 60px;
    height: auto;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .step-header {
    padding: var(--spacing-2xl) var(--text-sm);
    gap: var(--spacing-2xl);
  }

  .step-icon {
    width: var(--spacing-xl);
    height: var(--spacing-xl);
    font-size: var(--text-base);
  }

  .step-description {
    font-size: var(--text-sm);
  }

  .step-content {
    padding: var(--spacing-2xl) var(--text-sm);
    padding-top: 0;
  }
}
</style>
