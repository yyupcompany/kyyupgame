<!--
  MobileQuickActions.vue - 移动端快捷操作组件
  Mobile Quick Actions Component

  功能特性:
  - 快捷操作按钮（新增、导入、导出等）
  - 横向滚动支持
  - 图标+文字展示
  - 触摸反馈效果
  - 自定义操作配置

  设计令牌: 使用 design-tokens.scss
-->
<template>
  <div class="mobile-quick-actions">
    <div
      ref="scrollRef"
      class="actions-scroll-container"
      :class="{ 'is-scrollable': isScrollable }"
    >
      <div class="actions-list">
        <button
          v-for="(action, index) in actions"
          :key="action.id || index"
          class="quick-action-button"
          :class="[
            `variant-${action.variant || 'default'}`,
            { 'is-disabled': action.disabled }
          ]"
          :style="getActionStyle(action)"
          @click="handleActionClick(action, index)"
        >
          <!-- 操作图标 -->
          <div class="action-icon">
            <UnifiedIcon :name="action.icon" :size="20" />
          </div>

          <!-- 操作标签 -->
          <span class="action-label">{{ action.label }}</span>

          <!-- 徽章（可选） -->
          <div v-if="action.badge" class="action-badge">
            {{ action.badge }}
          </div>
        </button>
      </div>
    </div>

    <!-- 滚动指示器 -->
    <Transition name="fade">
      <div v-if="showScrollIndicator" class="scroll-indicator">
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

/**
 * 操作项接口定义
 */
export interface QuickAction {
  /** 操作唯一标识 */
  id?: string
  /** 操作图标名称 */
  icon: string
  /** 操作标签文本 */
  label: string
  /** 操作类型/样式变体 */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 操作颜色（自定义） */
  color?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 徽章内容 */
  badge?: string | number
  /** 操作数据（透传） */
  data?: any
}

/**
 * 组件属性定义
 */
interface Props {
  /** 快捷操作列表 */
  actions: QuickAction[]
  /** 每行显示数量（0表示自动） */
  itemsPerRow?: number
  /** 最小按钮宽度 */
  minButtonWidth?: number
  /** 最大按钮宽度 */
  maxButtonWidth?: number
  /** 是否显示滚动指示器 */
  showScrollIndicator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  itemsPerRow: 0,
  minButtonWidth: 80,
  maxButtonWidth: 120,
  showScrollIndicator: true,
})

/**
 * Emits 定义
 */
interface Emits {
  (event: 'action', action: QuickAction, index: number): void
}

const emit = defineEmits<Emits>()

/**
 * 状态管理
 */
const scrollRef = ref<HTMLElement>()
const isScrollable = ref(false)
const scrollPosition = ref(0)

/**
 * 计算属性
 */
const showScrollIndicator = computed(() => props.showScrollIndicator && isScrollable.value)

/**
 * 获取操作按钮样式
 */
function getActionStyle(action: QuickAction) {
  const style: Record<string, string> = {}

  if (action.color) {
    style['--action-color'] = action.color
  }

  return style
}

/**
 * 操作点击处理
 */
function handleActionClick(action: QuickAction, index: number) {
  if (action.disabled) return

  // 触发事件
  emit('action', action, index)

  // 震动反馈（如果支持）
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

/**
 * 检查是否可滚动
 */
function checkScrollable() {
  if (!scrollRef.value) return

  const { scrollWidth, clientWidth } = scrollRef.value
  isScrollable.value = scrollWidth > clientWidth
}

/**
 * 监听滚动位置
 */
function handleScroll() {
  if (!scrollRef.value) return

  scrollPosition.value = scrollRef.value.scrollLeft
}

/**
 * 组件挂载
 */
onMounted(() => {
  nextTick(() => {
    checkScrollable()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', checkScrollable)
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  window.removeEventListener('resize', checkScrollable)
})

/**
 * 暴露方法
 */
defineExpose({
  scrollToEnd: () => {
    if (!scrollRef.value) return
    scrollRef.value.scrollTo({
      left: scrollRef.value.scrollWidth,
      behavior: 'smooth',
    })
  },
  scrollToStart: () => {
    if (!scrollRef.value) return
    scrollRef.value.scrollTo({
      left: 0,
      behavior: 'smooth',
    })
  },
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-quick-actions {
  position: relative;
}

// ==================== 滚动容器 ====================

.actions-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE 10+

  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Opera
  }

  &.is-scrollable {
    // 添加滚动阴影
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );
  }
}

.actions-list {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
}

// ==================== 操作按钮 ====================

.quick-action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
  min-width: 80px;
  max-width: 120px;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  // 入场动画
  animation: fadeInUp 300ms ease-out backwards;

  // 交错延迟
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 50ms};
    }
  }

  // 悬停效果（仅桌面）
  @media (hover: hover) {
    &:hover:not(.is-disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);

      .action-icon {
        transform: scale(1.1);
      }
    }
  }

  // 点击效果
  &:active:not(.is-disabled) {
    transform: scale(0.95);
  }

  // 禁用状态
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // ==================== 样式变体 ====================

  // 默认变体
  &.variant-default {
    --action-color: var(--primary-color);
  }

  // 主要变体
  &.variant-primary {
    --action-color: var(--primary-color);
    background: var(--action-color);
    border-color: var(--action-color);
    color: white;

    .action-icon,
    .action-label {
      color: white;
    }
  }

  // 成功变体
  &.variant-success {
    --action-color: var(--success-color);

    &:not(.variant-primary) {
      border-color: var(--action-color);
    }
  }

  // 警告变体
  &.variant-warning {
    --action-color: var(--warning-color);

    &:not(.variant-primary) {
      border-color: var(--action-color);
    }
  }

  // 危险变体
  &.variant-danger {
    --action-color: var(--error-color);

    &:not(.variant-primary) {
      border-color: var(--action-color);
    }
  }
}

// ==================== 操作图标 ====================

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--action-color);
  color: white;
  transition: transform var(--transition-duration-fast) var(--transition-timing-ease);

  .quick-action-button:not(.variant-primary) & {
    background: color-mix(in srgb, var(--action-color) 10%, transparent);
    color: var(--action-color);
  }
}

// ==================== 操作标签 ====================

.action-label {
  font-size: var(--text-xs, 12px);
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .quick-action-button.variant-primary & {
    color: white;
  }
}

// ==================== 徽章 ====================

.action-badge {
  position: absolute;
  top: var(--spacing-xs, 4px);
  right: var(--spacing-xs, 4px);
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--error-color);
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse-glow 2s infinite;
}

// ==================== 滚动指示器 ====================

.scroll-indicator {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(
    to left,
    var(--bg-card) 0%,
    transparent 100%
  );
  pointer-events: none;
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .quick-action-button {
    min-width: 70px;
    max-width: 100px;
    padding: var(--spacing-sm);

    .action-icon {
      width: 36px;
      height: 36px;
    }

    .action-label {
      font-size: var(--mobile-text-xs, 11px);
    }
  }
}

// 中等屏幕
@media (min-width: 480px) and (max-width: 1023px) {
  .quick-action-button {
    min-width: 90px;
    max-width: 130px;
  }
}

// 大屏设备
@media (min-width: 1024px) {
  .actions-scroll-container {
    // 大屏设备居中显示，限制最大宽度
    max-width: var(--breakpoint-lg, 1024px);
    margin: 0 auto;
  }

  .quick-action-button {
    min-width: 100px;
    max-width: 150px;
  }
}

// ==================== 过渡动画 ====================

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .quick-action-button {
    background: var(--bg-card-dark, #1a1625);
    border: 1px solid var(--border-color-dark, #2a2635);

    &:hover:not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  .action-label {
    color: var(--text-primary-dark, #f8fafc);
  }

  .scroll-indicator {
    background: linear-gradient(
      to left,
      var(--bg-card-dark) 0%,
      transparent 100%
    );
  }
}

// ==================== 辅助功能 ====================

// 高对比度模式
@media (prefers-contrast: high) {
  .quick-action-button {
    border-width: 2px;
  }

  .action-icon {
    border: 1px solid;
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .quick-action-button,
  .action-icon {
    transition: none;
    animation: none;
  }

  .quick-action-button:hover:not(.is-disabled) {
    transform: none;
  }

  .action-badge {
    animation: none;
  }
}

// ==================== 性能优化 ====================

.quick-action-button {
  will-change: transform;
}

.action-icon {
  will-change: transform;
}
</style>
