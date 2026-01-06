<template>
  <div class="mobile-loading" :class="[`loading-${type}`, { fullscreen }]">
    <!-- 背景遮罩 -->
    <div
      v-if="showOverlay"
      class="loading-overlay"
      :style="{ backgroundColor: overlayColor }"
    ></div>

    <!-- 加载内容容器 -->
    <div class="loading-container" :class="[`container-${size}`, { 'with-text': !!text }]">
      <!-- 加载图标 -->
      <div class="loading-icon" :class="{ spinning: !type.includes('pulse') }">
        <!-- 不同类型的加载图标 -->
        <van-loading
          v-if="type === 'spinner' || type === 'circle'"
          :size="iconSize"
          :color="color"
        />

        <div
          v-else-if="type === 'dots'"
          class="dots-loading"
          :style="{ '--dot-color': color }"
        >
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
        </div>

        <div
          v-else-if="type === 'pulse'"
          class="pulse-loading"
          :style="{ '--pulse-color': color }"
        >
          <div class="pulse-circle"></div>
        </div>

        <div
          v-else-if="type === 'skeleton'"
          class="skeleton-loading"
        >
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>

        <!-- 自定义图标插槽 -->
        <slot name="icon" v-else>
          <van-loading :size="iconSize" :color="color" />
        </slot>
      </div>

      <!-- 加载文本 -->
      <div v-if="text" class="loading-text" :style="{ color }">
        {{ text }}
      </div>

      <!-- 进度信息 -->
      <div v-if="showProgress && progress !== undefined" class="loading-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: `${progress}%`,
              backgroundColor: color
            }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'circle' | 'dots' | 'pulse' | 'skeleton' | 'custom'
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
  showOverlay?: boolean
  overlayColor?: string
  fullscreen?: boolean
  showProgress?: boolean
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'medium',
  color: 'var(--primary-color)',
  text: '',
  showOverlay: false,
  overlayColor: 'rgba(0, 0, 0, 0.3)',
  fullscreen: false,
  showProgress: false,
  progress: undefined
})

// 计算图标尺寸
const iconSize = computed(() => {
  const sizeMap = {
    small: '20px',
    medium: '24px',
    large: '32px'
  }
  return sizeMap[props.size]
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-loading {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal);
    min-height: 100vh;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .loading-container {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--mobile-gap-sm);

    &.container-small {
      .loading-text {
        font-size: var(--mobile-text-sm);
      }
    }

    &.container-medium {
      .loading-text {
        font-size: var(--mobile-text-base);
      }
    }

    &.container-large {
      .loading-text {
        font-size: var(--mobile-text-lg);
      }
    }

    &.with-text {
      padding: var(--mobile-padding);
      background: var(--bg-color);
      border-radius: var(--mobile-radius-lg);
      box-shadow: var(--mobile-shadow-md);
    }
  }

  .loading-icon {
    .spinning {
      animation: spin 1s linear infinite;
    }
  }

  .loading-text {
    text-align: center;
    font-weight: var(--font-medium);
    line-height: 1.4;
  }

  .loading-progress {
    width: 100%;
    max-width: 200px;
    margin-top: var(--mobile-gap-sm);

    .progress-bar {
      height: 4px;
      background: var(--bg-color-light);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: var(--mobile-gap-xs);

      .progress-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s var(--transition-timing-ease);
      }
    }

    .progress-text {
      text-align: center;
      font-size: var(--mobile-text-xs);
      color: var(--text-secondary);
    }
  }
}

/* 点状加载动画 */
.dots-loading {
  display: flex;
  gap: var(--spacing-sm);

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    animation: dotSequence 1.4s infinite ease-in-out;

    &.dot-1 {
      animation-delay: -0.32s;
    }

    &.dot-2 {
      animation-delay: -0.16s;
    }

    &.dot-3 {
      animation-delay: 0;
    }
  }
}

/* 脉冲加载动画 */
.pulse-loading {
  .pulse-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--pulse-color);
    animation: pulseScale 1.5s infinite ease-in-out;
  }
}

/* 骨架屏加载 */
.skeleton-loading {
  width: 100%;
  max-width: 300px;
  padding: var(--mobile-gap);

  .skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, var(--bg-color-light) 25%, var(--border-color) 50%, var(--bg-color-light) 75%);
    background-size: 200% 100%;
    border-radius: 6px;
    margin-bottom: var(--mobile-gap-sm);
    animation: shimmer 1.5s infinite;

    &.skeleton-title {
      height: 20px;
      width: 60%;
    }

    &.skeleton-text {
      width: 100%;

      &.short {
        width: 40%;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

/* 动画定义 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dotSequence {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulseScale {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 响应式适配 */
@media (max-width: 479px) {
  .mobile-loading {
    .loading-container {
      &.with-text {
        margin: 0 var(--mobile-padding);
        max-width: calc(100vw - 32px);
      }
    }
  }
}
</style>