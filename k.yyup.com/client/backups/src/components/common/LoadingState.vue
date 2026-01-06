<template>
  <div 
    :class="[
      'loading-state',
      `loading-state--${variant}`,
      `loading-state--${size}`,
      { 'loading-state--overlay': overlay }
    ]"
  >
    <div class="loading-content">
      <!-- 自定义加载图标 -->
      <div class="loading-icon" v-if="!$slots.icon">
        <div :class="['spinner', `spinner--${spinnerType}`]">
          <div v-if="spinnerType === 'dots'" class="spinner-dots">
            <div class="dot" v-for="i in 3" :key="i"></div>
          </div>
          
          <div v-else-if="spinnerType === 'circle'" class="spinner-circle">
            <svg viewBox="0 0 50 50" class="circular">
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray="31.416" 
                stroke-dashoffset="31.416"
              />
            </svg>
          </div>
          
          <div v-else-if="spinnerType === 'pulse'" class="spinner-pulse">
            <div class="pulse-ring" v-for="i in 3" :key="i"></div>
          </div>
          
          <div v-else-if="spinnerType === 'bars'" class="spinner-bars">
            <div class="bar" v-for="i in 5" :key="i"></div>
          </div>
          
          <div v-else class="spinner-default">
            <el-icon :size="iconSize" class="is-loading">
              <Loading />
            </el-icon>
          </div>
        </div>
      </div>
      
      <!-- 插槽图标 -->
      <div class="loading-icon" v-else>
        <slot name="icon" />
      </div>
      
      <!-- 加载文本 -->
      <div v-if="text || $slots.text" class="loading-text">
        <slot name="text">{{ text }}</slot>
      </div>
      
      <!-- 进度条 -->
      <div v-if="showProgress && progress !== undefined" class="loading-progress">
        <el-progress 
          :percentage="progress" 
          :color="progressColor"
          :show-text="showProgressText"
          :stroke-width="progressStrokeWidth"
        />
      </div>
      
      <!-- 提示信息 -->
      <div v-if="tip || $slots.tip" class="loading-tip">
        <slot name="tip">{{ tip }}</slot>
      </div>
      
      <!-- 取消按钮 -->
      <div v-if="cancelable" class="loading-actions">
        <el-button 
          size="small" 
          type="info" 
          plain 
          @click="handleCancel"
          :disabled="canceling"
        >
          {{ canceling ? '取消中...' : '取消' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  // 加载文本
  text?: string
  // 提示信息
  tip?: string
  // 变体样式
  variant?: 'default' | 'minimal' | 'card' | 'page'
  // 大小
  size?: 'small' | 'medium' | 'large'
  // 加载器类型
  spinnerType?: 'default' | 'dots' | 'circle' | 'pulse' | 'bars'
  // 是否显示为遮罩层
  overlay?: boolean
  // 是否可取消
  cancelable?: boolean
  // 是否显示进度
  showProgress?: boolean
  // 进度值 (0-100)
  progress?: number
  // 进度条颜色
  progressColor?: string | string[]
  // 是否显示进度文本
  showProgressText?: boolean
  // 进度条粗细
  progressStrokeWidth?: number
  // 最小显示时间（毫秒）
  minShowTime?: number
  // 延迟显示时间（毫秒）
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium',
  spinnerType: 'default',
  overlay: false,
  cancelable: false,
  showProgress: false,
  showProgressText: true,
  progressStrokeWidth: 8,
  minShowTime: 500,
  delay: 0
})

const emit = defineEmits<{
  cancel: []
}>()

// 状态管理
const canceling = ref(false)

// 计算图标大小
const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 20
    case 'large':
      return 48
    default:
      return 32
  }
})

// 处理取消
const handleCancel = async () => {
  if (canceling.value) return
  
  canceling.value = true
  try {
    emit('cancel')
  } finally {
    // 延迟重置状态，避免闪烁
    setTimeout(() => {
      canceling.value = false
    }, 300)
  }
}

// 暴露方法
defineExpose({
  cancel: handleCancel
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  
  &--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--white-alpha-80);
    backdrop-filter: blur(2px);
    z-index: 100;
  }
  
  &--small {
    .loading-content {
      gap: 0.5rem;
    }
    
    .loading-text {
      font-size: var(--text-xs);
    }
    
    .loading-tip {
      font-size: var(--text-xs);
    }
  }
  
  &--medium {
    .loading-content {
      gap: 0.75rem;
    }
    
    .loading-text {
      font-size: var(--text-sm);
    }
    
    .loading-tip {
      font-size: var(--text-xs);
    }
  }
  
  &--large {
    .loading-content {
      gap: 1rem;
    }
    
    .loading-text {
      font-size: var(--text-base);
    }
    
    .loading-tip {
      font-size: var(--text-sm);
    }
  }
  
  &--minimal {
    .loading-content {
      gap: 0.5rem;
    }
    
    .loading-icon {
      opacity: 0.6;
    }
  }
  
  &--card {
    padding: 2rem;
    background: var(--el-bg-color-page);
    border-radius: var(--spacing-sm);
    border: var(--border-width-base) solid var(--el-border-color-lighter);
    
    .loading-content {
      gap: 1rem;
    }
  }
  
  &--page {
    min-height: 200px;
    
    .loading-content {
      gap: 1.5rem;
    }
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  display: inline-block;
  
  &--dots {
    .spinner-dots {
      display: flex;
      gap: var(--spacing-xs);
      
      .dot {
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        background: currentColor;
        border-radius: var(--radius-full);
        animation: dot-bounce 1.4s ease-in-out infinite both;
        
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
      }
    }
  }
  
  &--circle {
    .spinner-circle {
      width: var(--spacing-3xl);
      height: var(--spacing-3xl);
      
      .circular {
        animation: rotate 2s linear infinite;
        width: 100%;
        height: 100%;
        
        circle {
          animation: dash 1.5s ease-in-out infinite;
        }
      }
    }
  }
  
  &--pulse {
    .spinner-pulse {
      position: relative;
      width: var(--spacing-3xl);
      height: var(--spacing-3xl);
      
      .pulse-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 2px solid currentColor;
        border-radius: var(--radius-full);
        opacity: 0;
        animation: pulse-ring 2s ease-in-out infinite;
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.7s; }
        &:nth-child(3) { animation-delay: 1.4s; }
      }
    }
  }
  
  &--bars {
    .spinner-bars {
      display: flex;
      gap: var(--spacing-sm);
      align-items: flex-end;
      height: var(--text-2xl);
      
      .bar {
        width: 3px;
        background: currentColor;
        animation: bar-scale 1.2s ease-in-out infinite;
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.1s; }
        &:nth-child(3) { animation-delay: 0.2s; }
        &:nth-child(4) { animation-delay: 0.3s; }
        &:nth-child(5) { animation-delay: 0.4s; }
      }
    }
  }
}

.loading-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
}

.loading-tip {
  color: var(--el-text-color-secondary);
  margin: 0;
  max-width: 300px;
  line-height: 1.4;
}

.loading-progress {
  width: 200px;
  margin: 0.5rem 0;
}

.loading-actions {
  margin-top: 0.5rem;
}

// 动画定义
@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes bar-scale {
  0%, 40%, 100% {
    transform: scaleY(0.5);
  }
  20% {
    transform: scaleY(1);
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .loading-state {
    &--overlay {
      background: var(--black-alpha-60);
    }
    
    &--card {
      background: var(--el-bg-color-page);
      border-color: var(--el-border-color);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .loading-state {
    &--page {
      min-height: 150px;
    }
    
    &--card {
      padding: 1.5rem;
    }
  }
  
  .loading-progress {
    width: 150px;
  }
  
  .loading-tip {
    max-width: 250px;
    font-size: var(--text-xs);
  }
}
</style>