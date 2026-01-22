<!--
  MobileCenterCard.vue - 移动端中心卡片组件
  Mobile Center Card Component

  功能特性:
  - 显示中心信息（图标、名称、描述）
  - 自动应用中心点缀色
  - Material Design 涟漪效果
  - 滑动手势支持
  - 触摸反馈动画

  设计令牌: 使用 design-tokens.scss 和 center-colors.ts
-->
<template>
  <div
    ref="cardRef"
    class="mobile-center-card"
    :class="[touchClass, { 'is-pressed': isPressed }]"
    :style="cardStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @mousedown="handleTouchStart"
    @mouseup="handleTouchEnd"
    @mouseleave="handleTouchEnd"
  >
    <!-- 涟漪效果容器 -->
    <div class="ripple-container">
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple-effect"
        :style="rippleStyle(ripple)"
      />
    </div>

    <!-- 中心图标 -->
    <div class="center-icon" :style="{ backgroundColor: `${accentColor}15` }">
      <UnifiedIcon :name="icon" :size="iconSize" :style="{ color: accentColor }" />
    </div>

    <!-- 中心信息 -->
    <div class="center-info">
      <h4 class="center-name">{{ name }}</h4>
      <p v-if="description" class="center-description">{{ description }}</p>
    </div>

    <!-- 右侧箭头 -->
    <div v-if="showArrow" class="center-arrow">
      <UnifiedIcon name="chevron-right" :size="16" :style="{ color: accentColor }" />
    </div>

    <!-- 角标（可选） -->
    <div v-if="badge" class="center-badge" :style="{ backgroundColor: accentColor }">
      {{ badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { useRouter } from 'vue-router'

/**
 * 组件属性定义
 */
interface Props {
  /** 中心名称 */
  name: string
  /** 中心描述 */
  description?: string
  /** 图标名称 */
  icon: string
  /** 中心路由 */
  route: string
  /** 中心点缀色 */
  accentColor: string
  /** 图标大小 */
  iconSize?: number
  /** 是否显示右侧箭头 */
  showArrow?: boolean
  /** 角标内容 */
  badge?: string | number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 24,
  showArrow: true,
  disabled: false,
})

/**
 * Emits 定义
 */
interface Emits {
  (event: 'click', payload: { name: string; route: string }): void
}

const emit = defineEmits<Emits>()

/**
 * 状态管理
 */
const cardRef = ref<HTMLElement>()
const router = useRouter()
const isTouching = ref(false)
const isPressed = ref(false)
const ripples = ref<Array<{ id: number; x: number; y: number }>>([])
let rippleId = 0
let rippleTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * 计算属性
 */
const touchClass = computed(() => (isTouching.value ? 'is-touching' : ''))

const cardStyle = computed(() => ({
  '--center-accent-color': props.accentColor,
}))

/**
 * 涟漪效果样式计算
 */
function rippleStyle(ripple: { x: number; y: number }) {
  return {
    left: `${ripple.x}px`,
    top: `${ripple.y}px`,
    backgroundColor: props.accentColor,
  }
}

/**
 * 点击处理
 */
function handleClick(event: MouseEvent) {
  if (props.disabled) return

  // 创建涟漪效果
  createRipple(event)

  // 触发自定义事件
  emit('click', {
    name: props.name,
    route: props.route,
  })

  // 如果有路由，则导航
  if (props.route) {
    router.push(props.route)
  }
}

/**
 * 创建涟漪效果
 */
function createRipple(event: MouseEvent) {
  if (!cardRef.value) return

  const rect = cardRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const id = rippleId++
  ripples.value.push({ id, x, y })

  // 清理涟漪
  if (rippleTimeout) clearTimeout(rippleTimeout)
  rippleTimeout = setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }, 600)
}

/**
 * 触摸开始
 */
function handleTouchStart(event: TouchEvent | MouseEvent) {
  if (props.disabled) return

  isTouching.value = true
  isPressed.value = true

  // 如果是触摸事件，创建涟漪
  if (event instanceof TouchEvent && event.touches.length > 0) {
    const touch = event.touches[0]
    createRipple(touch as unknown as MouseEvent)
  }
}

/**
 * 触摸结束
 */
function handleTouchEnd() {
  setTimeout(() => {
    isTouching.value = false
    isPressed.value = false
  }, 150)
}

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  if (rippleTimeout) clearTimeout(rippleTimeout)
})

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 设置初始动画延迟
  if (cardRef.value) {
    cardRef.value.style.animationDelay = `${Math.random() * 100}ms`
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-center-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  background: #ffffff;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 200ms ease;

  // 入场动画
  animation: fadeInUp 300ms ease-out backwards;

  // 悬停效果（仅桌面）
  @media (hover: hover) {
    &:hover {
      border-color: var(--center-accent-color);
      box-shadow: var(--center-card-hover-shadow);
      transform: translateY(-2px);

      .center-icon {
        transform: scale(1.1);
        background-color: var(--center-accent-color);
      }

      .center-arrow {
        transform: translateX(4px);
      }
    }
  }

  // 触摸/按下效果
  &.is-touching,
  &.is-pressed {
    transform: scale(0.98);
    box-shadow: var(--center-card-active-shadow);
    border-color: var(--center-accent-color);
  }

  // 禁用状态
  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// ==================== 涟漪效果 ====================

.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.ripple-effect {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.3;
  transform: scale(0);
  margin-left: -50px;
  margin-top: -50px;
  animation: ripple 600ms ease-out forwards;
  pointer-events: none;
}

// ==================== 中心图标 ====================

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md, 8px);
  flex-shrink: 0;
  transition: all 200ms ease;
  // 使用点缀色作为背景
  background-color: color-mix(in srgb, var(--center-accent-color, #5b8def) 15%, transparent);

  // 确保图标可见
  svg, .unified-icon {
    color: var(--center-accent-color, #5b8def) !important;
  }
}

// ==================== 中心信息 ====================

.center-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  min-width: 0;
}

.center-name {
  font-size: var(--text-base, 16px);
  font-weight: 600;
  color: var(--text-primary, #2c3e50);
  line-height: 1.3;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.center-description {
  font-size: var(--text-sm, 14px);
  color: var(--text-secondary, #8492a6);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// ==================== 右侧箭头 ====================

.center-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform var(--center-card-transition) var(--transition-timing-ease);
}

// ==================== 角标 ====================

.center-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse-glow 2s infinite;
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .mobile-center-card {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);

    .center-icon {
      width: 40px;
      height: 40px;
    }

    .center-name {
      font-size: var(--mobile-text-base, 15px);
    }

    .center-description {
      font-size: var(--mobile-text-xs, 12px);
      -webkit-line-clamp: 1;
    }
  }
}

// 中等屏幕
@media (min-width: 480px) and (max-width: 1023px) {
  .mobile-center-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
}

// 大屏设备
@media (min-width: 1024px) {
  .mobile-center-card {
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);

    .center-icon {
      width: 56px;
      height: 56px;
    }

    .center-name {
      font-size: var(--text-lg, 18px);
    }

    .center-description {
      font-size: var(--text-base, 16px);
    }
  }
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .mobile-center-card {
    background: #1e293b;
    border: 1px solid #334155;

    &:hover {
      border-color: var(--center-accent-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  .center-name {
    color: #f1f5f9;
  }

  .center-description {
    color: #94a3b8;
  }

  .ripple-effect {
    opacity: 0.2;
  }
}

// ==================== 辅助功能 ====================

// 高对比度模式
@media (prefers-contrast: high) {
  .mobile-center-card {
    border-width: 2px;
  }

  .center-icon {
    border: 1px solid;
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .mobile-center-card {
    transition: none;
    animation: none;

    &:hover {
      transform: none;
    }
  }

  .center-icon,
  .center-arrow {
    transition: none;
  }

  .ripple-effect {
    animation: none;
  }

  .center-badge {
    animation: none;
  }
}

// ==================== 性能优化 ====================

.mobile-center-card {
  // GPU 加速
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}
</style>
