<template>
  <transition name="visual-feedback">
    <div v-if="visible" class="visual-feedback" :class="feedbackClass">
      <div class="feedback-content">
        <!-- 操作类型图标 -->
        <div class="feedback-icon">
          <i :class="iconClass"></i>
        </div>
        
        <!-- 反馈信息 -->
        <div class="feedback-info">
          <h4>{{ title }}</h4>
          <p v-if="description">{{ description }}</p>
          
          <!-- 进度条 -->
          <el-progress 
            v-if="showProgress" 
            :percentage="progress" 
            :status="progressStatus"
            :stroke-width="6"
          />
          
          <!-- 操作详情 -->
          <div v-if="details" class="feedback-details">
            <div v-for="(detail, index) in details" :key="index" class="detail-item">
              <span class="detail-label">{{ detail.label }}:</span>
              <span class="detail-value">{{ detail.value }}</span>
            </div>
          </div>
        </div>
        
        <!-- 动画效果 -->
        <div v-if="showAnimation" class="feedback-animation">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

import { computed } from 'vue';

export interface FeedbackDetail {
  label: string;
  value: string | number;
}

interface Props {
  visible?: boolean;
  type?: 'navigate' | 'click' | 'form' | 'capture' | 'query' | 'create' | 'success' | 'error' | 'info';
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  details?: FeedbackDetail[];
  showAnimation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'info',
  title: '正在处理',
  showProgress: false,
  progress: 0,
  showAnimation: true
});

const feedbackClass = computed(() => {
  return `feedback-${props.type}`;
});

const iconClass = computed(() => {
  const iconMap = {
    navigate: 'navigation',
    click: 'mouse-pointer',
    form: 'edit',
    capture: 'camera',
    query: 'search',
    create: 'plus',
    success: 'check-circle',
    error: 'x-circle',
    info: 'info'
  };
  return iconMap[props.type] || 'loader';
});

const progressStatus = computed(() => {
  if (props.progress === 100) return 'success';
  if (props.type === 'error') return 'exception';
  return undefined;
});
</script>

<style lang="scss" scoped>
.visual-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  background: var(--bg-card-alpha, rgba(255, 255, 255, 0.98));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xl);
  min-width: 100%; max-width: 320px;
  max-width: 100%; max-width: 480px;
  backdrop-filter: blur(10px);
  
  &.feedback-navigate {
    --feedback-color: var(--primary-color);
  }

  &.feedback-click {
    --feedback-color: var(--success-color);
  }

  &.feedback-form {
    --feedback-color: var(--warning-color);
  }

  &.feedback-capture {
    --feedback-color: var(--text-muted);
  }

  &.feedback-query {
    --feedback-color: var(--primary-color);
  }

  &.feedback-create {
    --feedback-color: var(--success-color);
  }

  &.feedback-success {
    --feedback-color: var(--success-color);
  }

  &.feedback-error {
    --feedback-color: var(--danger-color);
  }

  &.feedback-info {
    --feedback-color: var(--primary-color);
  }
}

.feedback-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  position: relative;
}

.feedback-icon {
  flex-shrink: 0;
  width: var(--icon-size); height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--feedback-color);
  color: var(--text-on-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-3xl);
  
  i {
    animation: icon-pulse 2s ease-in-out infinite;
  }
}

.feedback-info {
  flex: 1;
  
  h4 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  p {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
  }
  
  :deep(.el-progress) {
    margin-top: var(--spacing-sm);
  }
}

.feedback-details {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--z-index-dropdown) solid var(--border-color);
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
    font-size: var(--text-sm);
    
    .detail-label {
      color: var(--text-secondary);
    }
    
    .detail-value {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

.feedback-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .pulse-ring {
    position: absolute;
    top: var(--text-3xl);
    left: var(--text-3xl);
    width: var(--icon-size); height: var(--icon-size);
    border: 2px solid var(--feedback-color);
    border-radius: var(--radius-full);
    opacity: 0;
    animation: pulse-expand 3s ease-out infinite;
    
    &.delay-1 {
      animation-delay: 1s;
    }
    
    &.delay-2 {
      animation-delay: 2s;
    }
  }
}

// 动画效果
.visual-feedback-enter-active,
.visual-feedback-leave-active {
  transition: all var(--transition-normal) ease;
}

.visual-feedback-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.visual-feedback-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.1);
}

@keyframes icon-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse-expand {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

// 深色模式
:root[data-theme="dark"] .visual-feedback {
  background: var(--bg-card-alpha-dark, rgba(30, 30, 30, 0.98));
  
  .feedback-icon {
    background: rgba(var(--feedback-color-rgb), 0.2);
    color: var(--feedback-color);
  }
  
  .pulse-ring {
    border-color: rgba(var(--feedback-color-rgb), 0.4);
  }
}
</style>