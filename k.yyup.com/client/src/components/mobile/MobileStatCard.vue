<!--
  MobileStatCard.vue - 移动端统计卡片组件
  Mobile Statistics Card Component

  功能特性:
  - 显示统计数据（数字、标签、图标）
  - 三种变体：default, gradient, glass
  - 数字滚动动画效果
  - 触摸反馈效果
  - 自动应用中心点缀色

  设计令牌: 使用 design-tokens.scss 中的全局变量
-->
<template>
  <div
    class="mobile-stat-card"
    :class="[`variant-${variant}`, touchClass]"
    :style="{ borderLeftColor: color }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mousedown="handleTouchStart"
    @mouseup="handleTouchEnd"
    @mouseleave="handleTouchEnd"
  >
    <!-- 图标区域 -->
    <div class="stat-icon" :style="{ backgroundColor: `${color}20` }">
      <UnifiedIcon :name="icon" :size="iconSize" :style="{ color }" />
    </div>

    <!-- 内容区域 -->
    <div class="stat-info">
      <div class="stat-value" :style="{ color }">
        {{ animatedValue }}
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>

    <!-- 趋势指示器（可选） -->
    <div v-if="trend" class="stat-trend" :class="`trend-${trend}`">
      <UnifiedIcon :name="trendIcon" :size="12" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

/**
 * 组件属性定义
 */
interface Props {
  /** 统计数值 */
  value: string | number
  /** 标签文本 */
  label: string
  /** 图标名称 */
  icon: string
  /** 主题颜色 */
  color: string
  /** 卡片变体 */
  variant?: 'default' | 'gradient' | 'glass'
  /** 图标大小 */
  iconSize?: number
  /** 趋势方向 */
  trend?: 'up' | 'down' | 'neutral'
  /** 动画持续时间（毫秒） */
  animationDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  iconSize: 20,
  animationDuration: 1000,
})

/**
 * 状态管理
 */
const animatedValue = ref<string>(props.value.toString())
const isTouching = ref(false)

/**
 * 计算属性
 */
const touchClass = computed(() => (isTouching.value ? 'is-touching' : ''))

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'trending-up'
    case 'down':
      return 'trending-down'
    default:
      return 'minus'
  }
})

/**
 * 数字滚动动画
 */
function animateNumber(start: number, end: number, duration: number) {
  const startTime = performance.now()
  const difference = end - start

  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数使动画更流畅
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = start + difference * easeOutQuart

    // 格式化数字（保留千分位）
    animatedValue.value = Math.round(current).toLocaleString()

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      animatedValue.value = end.toLocaleString()
    }
  }

  requestAnimationFrame(step)
}

/**
 * 监听值变化，触发动画
 */
watch(
  () => props.value,
  (newValue, oldValue) => {
    const start = parseFloat(oldValue.toString()) || 0
    const end = parseFloat(newValue.toString()) || 0

    if (start !== end) {
      animateNumber(start, end, props.animationDuration)
    }
  },
)

/**
 * 组件挂载时初始化动画
 */
onMounted(() => {
  const end = parseFloat(props.value.toString()) || 0
  animateNumber(0, end, props.animationDuration)
})

/**
 * 触摸事件处理
 */
function handleTouchStart() {
  isTouching.value = true
}

function handleTouchEnd() {
  setTimeout(() => {
    isTouching.value = false
  }, 150)
}
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--center-card-bg);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  box-shadow: var(--center-card-shadow);
  transition: all var(--center-card-transition) var(--transition-timing-ease);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  // 入场动画
  animation: fadeInUp 300ms ease-out forwards;

  // 悬停效果
  &:hover {
    box-shadow: var(--center-card-hover-shadow);
  }

  // 触摸/点击效果
  &.is-touching {
    transform: scale(0.98);
    box-shadow: var(--center-card-active-shadow);
  }

  // ==================== 变体样式 ====================

  // 默认变体
  &.variant-default {
    background: var(--center-card-bg);
    border: 1px solid var(--center-card-border);
  }

  // 渐变变体
  &.variant-gradient {
    background: linear-gradient(
      135deg,
      var(--stat-card-gradient-start) 0%,
      var(--stat-card-gradient-end) 100%
    );
    border: none;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
      border-radius: var(--radius-lg);
    }
  }

  // 毛玻璃变体
  &.variant-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);

    [data-theme='dark'] & {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

// ==================== 图标样式 ====================

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--stat-card-icon-size, 44px);
  height: var(--stat-card-icon-size, 44px);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: transform var(--center-card-transition) var(--transition-timing-ease);

  .mobile-stat-card:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  .mobile-stat-card.is-touching & {
    transform: scale(0.95);
  }
}

// ==================== 内容样式 ====================

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  min-width: 0; // 允许文本截断
}

.stat-value {
  font-size: var(--text-xl, 20px);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  font-feature-settings: 'tnum' 1; // 表格数字对齐
}

.stat-label {
  font-size: var(--text-sm, 14px);
  color: var(--text-secondary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ==================== 趋势指示器 ====================

.stat-trend {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;

  &.trend-up {
    color: var(--success-color);
    background: rgba(82, 196, 26, 0.1);
  }

  &.trend-down {
    color: var(--error-color);
    background: rgba(255, 77, 79, 0.1);
  }

  &.trend-neutral {
    color: var(--text-tertiary);
    background: rgba(0, 0, 0, 0.05);
  }
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .mobile-stat-card {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);

    .stat-icon {
      width: 36px;
      height: 36px;
    }

    .stat-value {
      font-size: var(--mobile-text-lg, 18px);
    }

    .stat-label {
      font-size: var(--mobile-text-xs, 12px);
    }
  }
}

// 中等屏幕
@media (min-width: 480px) and (max-width: 1023px) {
  .mobile-stat-card {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
}

// 大屏设备
@media (min-width: 1024px) {
  .mobile-stat-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);

    .stat-icon {
      width: var(--stat-card-icon-size, 48px);
      height: var(--stat-card-icon-size, 48px);
    }
  }
}

// ==================== 辅助功能 ====================

// 高对比度模式
@media (prefers-contrast: high) {
  .mobile-stat-card {
    border-width: 2px;
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .mobile-stat-card {
    transition: none;

    &:hover {
      transform: none;
    }
  }

  .stat-icon {
    transition: none;

    .mobile-stat-card:hover & {
      transform: none;
    }
  }
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .mobile-stat-card {
    &.variant-default {
      background: var(--bg-card-dark, #1a1625);
      border: 1px solid var(--border-color-dark, #2a2635);
    }

    &.variant-gradient {
      background: linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.2) 0%,
        rgba(99, 102, 241, 0.1) 100%
      );
    }

    &.variant-glass {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  .stat-value {
    color: var(--text-primary-dark, #f8fafc);
  }

  .stat-label {
    color: var(--text-secondary-dark, #94a3b8);
  }
}
</style>
