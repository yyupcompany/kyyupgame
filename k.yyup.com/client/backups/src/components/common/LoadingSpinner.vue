<template>
  <div 
    :class="[
      'loading-spinner',
      `loading-spinner--${size}`,
      `loading-spinner--${type}`,
      { 'loading-spinner--overlay': overlay }
    ]"
    :style="overlayStyle"
  >
    <div class="loading-content">
      <!-- 旋转器 -->
      <div v-if="type === 'spinner'" class="spinner">
        <div class="spinner-ring"></div>
      </div>
      
      <!-- 脉冲圆点 -->
      <div v-else-if="type === 'dots'" class="dots">
        <div class="dot" v-for="i in 3" :key="i"></div>
      </div>
      
      <!-- 波浪 -->
      <div v-else-if="type === 'wave'" class="wave">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      
      <!-- 骨架屏 -->
      <div v-else-if="type === 'skeleton'" class="skeleton">
        <div class="skeleton-line" v-for="i in skeletonLines" :key="i"></div>
      </div>
      
      <!-- 进度条 -->
      <div v-else-if="type === 'progress'" class="progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- 加载文本 -->
      <div v-if="text && type !== 'skeleton'" class="loading-text">
        {{ text }}
      </div>
      
      <!-- 详细信息 -->
      <div v-if="detail" class="loading-detail">
        {{ detail }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 定义属性
interface Props {
  // 加载器类型
  type?: 'spinner' | 'dots' | 'wave' | 'skeleton' | 'progress'
  // 大小
  size?: 'small' | 'medium' | 'large'
  // 是否显示遮罩
  overlay?: boolean
  // 加载文本
  text?: string
  // 详细信息
  detail?: string
  // 进度（仅对progress类型有效）
  progress?: number
  // 骨架屏行数
  skeletonLines?: number
  // 自定义颜色
  color?: string
  // 背景颜色（仅遮罩模式）
  backgroundColor?: string
  // z-index
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'medium',
  overlay: false,
  progress: 0,
  skeletonLines: 3,
  zIndex: 1000
})

// 计算遮罩样式
const overlayStyle = computed(() => {
  if (!props.overlay) return {}
  
  return {
    backgroundColor: props.backgroundColor || 'var(--white-alpha-80)',
    zIndex: props.zIndex,
    ...(props.color && { '--loading-color': props.color })
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 颜色变量
  --loading-color: var(--primary-color);
  --loading-bg: var(--bg-hover);
  --loading-text-color: var(--text-regular);
  
  &--overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(2px);
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--text-xs);
}

// 旋转器样式
.spinner {
  .spinner-ring {
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
    border: 3px solid var(--loading-bg);
    border-top: 3px solid var(--loading-color);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }
}

// 大小变体
.loading-spinner--small {
  .spinner-ring {
    width: var(--text-2xl);
    height: var(--text-2xl);
    border-width: 2px;
  }
  
  .loading-text {
    font-size: var(--text-xs);
  }
}

.loading-spinner--large {
  .spinner-ring {
    width: var(--icon-size); height: var(--icon-size);
    border-width: var(--spacing-xs);
  }
  
  .loading-text {
    font-size: var(--text-base);
  }
}

// 脉冲圆点样式
.dots {
  display: flex;
  gap: var(--spacing-lg);
  
  .dot {
    width: var(--spacing-sm);
    height: var(--spacing-sm);
    background-color: var(--loading-color);
    border-radius: var(--radius-full);
    animation: pulse 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
}

.loading-spinner--small .dots .dot {
  width: 6px;
  height: 6px;
}

.loading-spinner--large .dots .dot {
  width: 10px;
  height: 10px;
}

// 波浪样式
.wave {
  display: flex;
  gap: var(--spacing-2xs);
  
  .wave-bar {
    width: var(--spacing-xs);
    height: var(--text-3xl);
    background-color: var(--loading-color);
    border-radius: var(--radius-xs);
    animation: wave 1.2s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -1.1s; }
    &:nth-child(2) { animation-delay: -1.0s; }
    &:nth-child(3) { animation-delay: -0.9s; }
    &:nth-child(4) { animation-delay: -0.8s; }
    &:nth-child(5) { animation-delay: -0.7s; }
  }
}

.loading-spinner--small .wave .wave-bar {
  width: 3px;
  height: var(--text-lg);
}

.loading-spinner--large .wave .wave-bar {
  width: 5px;
  height: var(--spacing-3xl);
}

// 骨架屏样式
.skeleton {
  width: 100%;
  max-width: 300px;
  
  .skeleton-line {
    height: var(--text-lg);
    background: linear-gradient(90deg, 
      var(--loading-bg) 25%, 
      var(--border-color) 50%, 
      var(--loading-bg) 75%
    );
    background-size: 200% 100%;
    border-radius: var(--spacing-xs);
    animation: skeleton 1.5s infinite;
    
    &:not(:last-child) {
      margin-bottom: var(--spacing-sm);
    }
    
    &:last-child {
      width: 60%;
    }
  }
}

.loading-spinner--small .skeleton .skeleton-line {
  height: var(--text-sm);
}

.loading-spinner--large .skeleton .skeleton-line {
  height: var(--text-2xl);
}

// 进度条样式
.progress {
  width: 200px;
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: var(--loading-bg);
    border-radius: var(--radius-xs);
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background-color: var(--loading-color);
      border-radius: var(--radius-xs);
      transition: width 0.3s ease;
      animation: progress-shimmer 2s infinite;
    }
  }
}

.loading-spinner--small .progress {
  width: 150px;
  
  .progress-bar {
    height: var(--spacing-xs);
  }
}

.loading-spinner--large .progress {
  width: 300px;
  
  .progress-bar {
    height: var(--spacing-sm);
  }
}

// 文本样式
.loading-text {
  color: var(--loading-text-color);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
}

.loading-detail {
  color: var(--info-color);
  font-size: var(--text-xs);
  text-align: center;
  max-width: 300px;
}

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

@keyframes skeleton {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-md)) {
  .loading-content {
    gap: var(--spacing-sm);
  }
  
  .loading-text {
    font-size: var(--text-sm);
  }
  
  .loading-detail {
    font-size: var(--text-xs);
  }
}
</style>