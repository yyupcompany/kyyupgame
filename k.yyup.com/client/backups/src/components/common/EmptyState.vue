<template>
  <div 
    :class="[
      'empty-state',
      `empty-state--${size}`,
      `empty-state--${type}`,
      { 'empty-state--centered': centered }
    ]"
  >
    <div class="empty-state__content">
      <!-- 图标或图像 -->
      <div class="empty-state__icon">
        <!-- 自定义图标 -->
        <slot name="icon">
          <div v-if="icon" class="custom-icon">
            <el-icon :size="iconSize">
              <component :is="icon" />
            </el-icon>
          </div>
          <!-- 内置图标 -->
          <div v-else :class="`built-in-icon built-in-icon--${type}`">
            <svg viewBox="0 0 64 64" :width="iconSize" :height="iconSize">
              <!-- 无数据图标 -->
              <g v-if="type === 'no-data'">
                <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                <path d="M20 32 L44 32 M32 20 L32 44" stroke="currentColor" stroke-width="3" opacity="0.6"/>
                <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.8"/>
              </g>
              
              <!-- 搜索无结果图标 -->
              <g v-else-if="type === 'no-search'">
                <circle cx="28" cy="28" r="12" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="m38 38 8 8" stroke="currentColor" stroke-width="3"/>
                <path d="M22 28 L34 28" stroke="currentColor" stroke-width="2" opacity="0.6"/>
                <path d="M22 24 L30 24" stroke="currentColor" stroke-width="2" opacity="0.6"/>
              </g>
              
              <!-- 错误图标 -->
              <g v-else-if="type === 'error'">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M20 20 L44 44 M44 20 L20 44" stroke="currentColor" stroke-width="3"/>
              </g>
              
              <!-- 网络错误图标 -->
              <g v-else-if="type === 'network'">
                <rect x="8" y="20" width="8" height="24" fill="currentColor" opacity="0.8"/>
                <rect x="20" y="16" width="8" height="28" fill="currentColor" opacity="0.6"/>
                <rect x="32" y="12" width="8" height="32" fill="currentColor" opacity="0.4"/>
                <rect x="44" y="20" width="8" height="24" fill="currentColor" opacity="0.2"/>
                <path d="M52 18 L58 12 M58 18 L52 12" stroke="currentColor" stroke-width="2"/>
              </g>
              
              <!-- 权限不足图标 -->
              <g v-else-if="type === 'forbidden'">
                <rect x="16" y="24" width="32" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M24 24 L24 20 C24 15 27 12 32 12 C37 12 40 15 40 20 L40 24" 
                      fill="none" stroke="currentColor" stroke-width="3"/>
                <circle cx="32" cy="34" r="3" fill="currentColor"/>
              </g>
              
              <!-- 加载中图标 -->
              <g v-else-if="type === 'loading'">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="3" opacity="0.3"/>
                <path d="M32 4 A28 28 0 0 1 60 32" fill="none" stroke="currentColor" stroke-width="3">
                  <animateTransform attributeName="transform" attributeType="XML" type="rotate" 
                                    from="0 32 32" to="360 32 32" dur="1s" repeatCount="indefinite"/>
                </path>
              </g>
              
              <!-- 维护中图标 -->
              <g v-else-if="type === 'maintenance'">
                <rect x="20" y="28" width="24" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
                <circle cx="26" cy="36" r="2" fill="currentColor"/>
                <circle cx="38" cy="36" r="2" fill="currentColor"/>
                <path d="M16 28 L16 24 C16 20 20 16 32 16 C44 16 48 20 48 24 L48 28" 
                      fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M28 20 L36 20" stroke="currentColor" stroke-width="2"/>
              </g>
              
              <!-- 超时图标 -->
              <g v-else-if="type === 'timeout'">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M32 8 L32 32 L48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <circle cx="32" cy="32" r="3" fill="currentColor"/>
              </g>
              
              <!-- 默认图标 -->
              <g v-else>
                <rect x="20" y="16" width="24" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M28 24 L36 24 M28 28 L36 28 M28 32 L32 32" stroke="currentColor" stroke-width="2"/>
              </g>
            </svg>
          </div>
        </slot>
      </div>

      <!-- 标题 -->
      <div v-if="title || $slots.title" class="empty-state__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <!-- 描述 -->
      <div v-if="description || $slots.description" class="empty-state__description">
        <slot name="description">{{ description }}</slot>
      </div>

      <!-- 建议列表 -->
      <div v-if="showSuggestions && suggestions && suggestions.length > 0" class="empty-state__suggestions">
        <div class="suggestions-title">您可以尝试:</div>
        <ul class="suggestions-list">
          <li v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
            {{ suggestion }}
          </li>
        </ul>
      </div>

      <!-- 操作按钮 -->
      <div v-if="hasActions" class="empty-state__actions">
        <slot name="actions">
          <el-button
            v-if="primaryAction"
            :type="primaryAction.type || 'primary'"
            :size="actionSize"
            :loading="primaryAction.loading"
            :disabled="primaryAction.disabled"
            @click="handlePrimaryAction"
          >
            {{ primaryAction.text }}
          </el-button>
          <el-button
            v-if="secondaryAction"
            :type="secondaryAction.type || 'default'"
            :size="actionSize"
            :loading="secondaryAction.loading"
            :disabled="secondaryAction.disabled"
            @click="handleSecondaryAction"
          >
            {{ secondaryAction.text }}
          </el-button>
          
          <!-- 额外操作按钮 -->
          <el-button
            v-for="(action, index) in extraActions"
            :key="`extra-${index}`"
            :type="action.type || 'default'"
            :size="actionSize"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="handleExtraAction(index, action)"
          >
            {{ action.text }}
          </el-button>
        </slot>
      </div>

      <!-- 额外内容 -->
      <div v-if="$slots.extra" class="empty-state__extra">
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Component } from 'vue'

// 定义操作接口
interface Action {
  text: string
  handler?: () => void
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
  disabled?: boolean
}

// 定义属性
interface Props {
  // 空状态类型
  type?: 'no-data' | 'no-search' | 'error' | 'network' | 'forbidden' | 'loading' | 'custom' | 'maintenance' | 'timeout'
  // 大小
  size?: 'small' | 'medium' | 'large'
  // 是否居中
  centered?: boolean
  // 标题
  title?: string
  // 描述
  description?: string
  // 自定义图标
  icon?: Component | string
  // 主要操作
  primaryAction?: Action
  // 次要操作
  secondaryAction?: Action
  // 额外操作按钮
  extraActions?: Action[]
  // 是否显示插图
  showIllustration?: boolean
  // 自定义插图URL
  illustrationUrl?: string
  // 是否显示建议
  showSuggestions?: boolean
  // 建议列表
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'no-data',
  size: 'medium',
  centered: true,
  showIllustration: false,
  showSuggestions: false,
  extraActions: () => []
})

const emit = defineEmits<{
  primaryAction: []
  secondaryAction: []
  extraAction: [index: number, action: Action]
}>()

const slots = useSlots()

// 计算图标尺寸
const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 48
    case 'large':
      return 96
    default:
      return 64
  }
})

// 计算按钮尺寸
const actionSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'small'
    case 'large':
      return 'large'
    default:
      return 'default'
  }
})

// 是否有操作
const hasActions = computed(() => {
  return slots.actions || props.primaryAction || props.secondaryAction || 
         (props.extraActions && props.extraActions.length > 0)
})

// 处理主要操作
const handlePrimaryAction = () => {
  if (props.primaryAction?.handler) {
    props.primaryAction.handler()
  }
  emit('primaryAction')
}

// 处理次要操作
const handleSecondaryAction = () => {
  if (props.secondaryAction?.handler) {
    props.secondaryAction.handler()
  }
  emit('secondaryAction')
}

// 处理额外操作
const handleExtraAction = (index: number, action: Action) => {
  if (action.handler) {
    action.handler()
  }
  emit('extraAction', index, action)
}
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.empty-state {
  display: flex;
  width: 100%;
  min-height: 200px;
  color: var(--info-color);
  
  &--centered {
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  &--small {
    min-height: 120px;
  }
  
  &--large {
    min-height: 300px;
  }
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--text-base);
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 100%;
  height: 100%;
  justify-content: center;
  box-sizing: border-box;
}

.empty-state__icon {
  .custom-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-placeholder);
  }
  
  .built-in-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-placeholder);
    
    &--no-data {
      color: #e6e8eb;
    }
    
    &--no-search {
      color: #d3d4d6;
    }
    
    &--error {
      color: var(--danger-color);
    }
    
    &--network {
      color: var(--warning-color);
    }
    
    &--forbidden {
      color: var(--danger-color);
    }
    
    &--loading {
      color: var(--primary-color);
    }
    
    &--maintenance {
      color: var(--warning-color);
    }
    
    &--timeout {
      color: var(--danger-color);
    }
  }
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-regular);
  margin: 0;
  line-height: 1.4;
}

.empty-state__description {
  font-size: var(--text-sm);
  color: var(--info-color);
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.empty-state__actions {
  display: flex;
  gap: var(--text-xs);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--spacing-sm);
}

.empty-state__extra {
  width: 100%;
  text-align: center;
}

.empty-state__suggestions {
  margin: var(--text-base) 0;
  text-align: left;
  max-width: 300px;
  
  .suggestions-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-regular);
    margin-bottom: var(--text-xs);
  }
  
  .suggestions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .suggestion-item {
      font-size: var(--text-sm);
      color: var(--info-color);
      line-height: 1.6;
      margin-bottom: var(--spacing-xs);
      padding-left: var(--text-base);
      position: relative;
      
      &::before {
        content: '•';
        color: var(--primary-color);
        position: absolute;
        left: 0;
        top: 0;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 不同类型的样式变体
.empty-state--no-data {
  .empty-state__title {
    color: var(--info-color);
  }
}

.empty-state--error {
  .empty-state__title {
    color: var(--danger-color);
  }
  
  .empty-state__description {
    color: var(--danger-color);
    opacity: 0.8;
  }
}

.empty-state--network {
  .empty-state__title {
    color: var(--warning-color);
  }
}

.empty-state--forbidden {
  .empty-state__title {
    color: var(--danger-color);
  }
}

// 大小变体
.empty-state--small {
  .empty-state__content {
    gap: var(--text-xs);
    padding: var(--text-base);
  }
  
  .empty-state__title {
    font-size: var(--text-base);
  }
  
  .empty-state__description {
    font-size: var(--text-sm);
  }
}

.empty-state--large {
  .empty-state__content {
    gap: var(--text-2xl);
    padding: var(--text-4xl);
  }
  
  .empty-state__title {
    font-size: var(--spacing-lg);
  }
  
  .empty-state__description {
    font-size: var(--text-base);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-md)) {
  .empty-state__content {
    padding: var(--text-base);
    gap: var(--text-xs);
  }
  
  .empty-state__title {
    font-size: var(--text-base);
  }
  
  .empty-state__description {
    font-size: var(--text-sm);
  }
  
  .empty-state__actions {
    flex-direction: column;
    width: 100%;
    
    :deep(.el-button) {
      width: 100%;
    }
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .empty-state {
    color: #a3a6ad;
  }
  
  .empty-state__title {
    color: #e5eaf3;
  }
  
  .empty-state__description {
    color: #a3a6ad;
  }
  
  .empty-state__icon .built-in-icon {
    &--no-data {
      color: #4c4d4f;
    }
    
    &--no-search {
      color: #525456;
    }
  }
}

// 优化动画效果，减少CLS
.empty-state__content {
  animation: fadeInStable 0.3s ease-out;
}

@keyframes fadeInStable {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>