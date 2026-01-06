<!--
  MobileSectionCard.vue - 移动端分组卡片组件
  Mobile Section Card Component

  功能特性:
  - 分组标题和描述显示
  - 中心数量统计
  - 折叠/展开动画
  - 分组图标颜色应用
  - 展开状态管理

  设计令牌: 使用 design-tokens.scss 和 center-colors.ts
-->
<template>
  <div class="mobile-section-card" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 分组头部 -->
    <div
      class="section-header"
      :style="headerStyle"
      @click="toggleCollapse"
    >
      <!-- 左侧图标 -->
      <div class="section-icon" :style="{ backgroundColor: `${color}15` }">
        <UnifiedIcon :name="icon" :size="20" :style="{ color }" />
      </div>

      <!-- 标题信息 -->
      <div class="section-info">
        <h3 class="section-title">{{ title }}</h3>
        <p v-if="description" class="section-description">{{ description }}</p>
      </div>

      <!-- 中心数量 -->
      <div class="section-count">
        <span class="count-number">{{ centerCount }}</span>
        <span class="count-label">个中心</span>
      </div>

      <!-- 展开/折叠按钮 -->
      <div class="section-toggle" :class="{ 'is-rotated': isCollapsed }">
        <UnifiedIcon name="chevron-down" :size="20" />
      </div>
    </div>

    <!-- 分组内容 -->
    <Transition name="collapse">
      <div v-show="!isCollapsed" class="section-content">
        <slot>
          <!-- 默认内容：中心卡片网格 -->
          <div class="centers-grid">
            <slot name="centers" />
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

/**
 * 组件属性定义
 */
interface Props {
  /** 分组标题 */
  title: string
  /** 分组描述 */
  description?: string
  /** 分组图标 */
  icon: string
  /** 分组颜色 */
  color?: string
  /** 分组ID */
  sectionId?: string
  /** 默认折叠状态 */
  defaultCollapsed?: boolean
  /** 是否显示切换按钮 */
  showToggle?: boolean
  /** 是否持久化折叠状态 */
  persistCollapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'var(--primary-color)',
  defaultCollapsed: false,
  showToggle: true,
  persistCollapse: false,
})

/**
 * 状态管理
 */
const isCollapsed = ref(props.defaultCollapsed)

/**
 * 计算属性
 */
const headerStyle = computed(() => ({
  '--section-color': props.color,
}))

const centerCount = computed(() => {
  // 尝试从 slot 中获取子元素数量
  // 在实际使用中，应该通过 props 传入
  return 0
})

/**
 * 切换折叠状态
 */
function toggleCollapse() {
  if (!props.showToggle) return

  isCollapsed.value = !isCollapsed.value

  // 持久化折叠状态
  if (props.persistCollapse && props.sectionId) {
    const storageKey = `section-collapse-${props.sectionId}`
    try {
      localStorage.setItem(storageKey, String(isCollapsed.value))
    } catch (error) {
      console.warn('Failed to persist collapse state:', error)
    }
  }
}

/**
 * 从本地存储恢复折叠状态
 */
function restoreCollapseState() {
  if (!props.persistCollapse || !props.sectionId) return

  const storageKey = `section-collapse-${props.sectionId}`
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  } catch (error) {
    console.warn('Failed to restore collapse state:', error)
  }
}

/**
 * 监听默认折叠状态变化
 */
watch(
  () => props.defaultCollapsed,
  (newValue) => {
    isCollapsed.value = newValue
  }
)

// 组件挂载时恢复状态
restoreCollapseState()

/**
 * 暴露方法给父组件
 */
defineExpose({
  collapse: () => {
    isCollapsed.value = true
  },
  expand: () => {
    isCollapsed.value = false
  },
  toggle: toggleCollapse,
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-section-card {
  display: flex;
  flex-direction: column;
  background: var(--center-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--center-card-border);
  box-shadow: var(--center-card-shadow);
  overflow: hidden;
  margin-bottom: var(--spacing-md);

  // 入场动画
  animation: fadeInUp 400ms ease-out backwards;
}

// ==================== 分组头部 ====================

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  cursor: pointer;
  user-select: none;
  transition: all var(--center-card-transition) var(--transition-timing-ease);
  border-bottom: 1px solid transparent;

  .mobile-section-card:not(.is-collapsed) & {
    border-bottom-color: var(--center-card-border);
  }

  &:hover {
    background: var(--bg-color-hover, #f8fafc);

    [data-theme='dark'] & {
      background: var(--bg-color-hover-dark, #1e293b);
    }

    .section-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.99);
  }
}

// ==================== 分组图标 ====================

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: transform var(--center-card-transition) var(--transition-timing-ease);

  // 图标背景渐变
  background: linear-gradient(
    135deg,
    var(--section-color) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
}

// ==================== 标题信息 ====================

.section-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  min-width: 0;
}

.section-title {
  font-size: var(--text-lg, 18px);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-description {
  font-size: var(--text-sm, 14px);
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ==================== 中心数量 ====================

.section-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--section-color);
  border-radius: var(--radius-md);
  min-width: 60px;
  flex-shrink: 0;
  transition: transform var(--center-card-transition) var(--transition-timing-ease);

  .section-header:hover & {
    transform: scale(1.05);
  }
}

.count-number {
  font-size: var(--text-lg, 18px);
  font-weight: 700;
  color: white;
  line-height: 1;
}

.count-label {
  font-size: var(--mobile-text-xs, 11px);
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

// ==================== 切换按钮 ====================

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: transform var(--center-card-transition) var(--transition-timing-ease);
  color: var(--text-secondary);

  &.is-rotated {
    transform: rotate(-90deg);
  }

  .section-header:hover & {
    background: var(--section-color);
    color: white;
  }
}

// ==================== 分组内容 ====================

.section-content {
  padding: var(--spacing-md);
  background: var(--bg-color-secondary, #f8fafc);

  [data-theme='dark'] & {
    background: var(--bg-color-secondary-dark, #0f172a);
  }
}

.centers-grid {
  display: grid;
  gap: var(--spacing-sm);
}

// ==================== 折叠动画 ====================

.collapse-enter-active,
.collapse-leave-active {
  transition: all 300ms ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 2000px;
  opacity: 1;
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .mobile-section-card {
    margin-bottom: var(--spacing-sm);
  }

  .section-header {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);

    .section-icon {
      width: 32px;
      height: 32px;
    }

    .section-title {
      font-size: var(--mobile-text-base, 15px);
    }

    .section-description {
      font-size: var(--mobile-text-xs, 12px);
    }
  }

  .section-count {
    min-width: 50px;
    padding: var(--spacing-xs);

    .count-number {
      font-size: var(--mobile-text-base, 15px);
    }
  }

  .section-content {
    padding: var(--spacing-sm);
  }
}

// 中等屏幕
@media (min-width: 480px) and (max-width: 1023px) {
  .section-header {
    padding: var(--spacing-md);
  }

  .section-content {
    padding: var(--spacing-md);
  }
}

// 大屏设备
@media (min-width: 1024px) {
  .mobile-section-card {
    margin-bottom: var(--spacing-lg);
  }

  .section-header {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);

    .section-icon {
      width: 48px;
      height: 48px;
    }

    .section-title {
      font-size: var(--text-xl, 20px);
    }

    .section-description {
      font-size: var(--text-base, 16px);
    }
  }

  .section-content {
    padding: var(--spacing-lg);
  }
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .mobile-section-card {
    background: var(--bg-card-dark, #1a1625);
    border: 1px solid var(--border-color-dark, #2a2635);
  }

  .section-title {
    color: var(--text-primary-dark, #f8fafc);
  }

  .section-description {
    color: var(--text-secondary-dark, #94a3b8);
  }

  .section-toggle {
    color: var(--text-tertiary-dark, #64748b);
  }

  .section-header:hover .section-toggle {
    color: white;
  }
}

// ==================== 辅助功能 ====================

// 高对比度模式
@media (prefers-contrast: high) {
  .mobile-section-card {
    border-width: 2px;
  }

  .section-icon,
  .section-count {
    border: 1px solid;
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .mobile-section-card,
  .section-header,
  .section-icon,
  .section-count,
  .section-toggle {
    transition: none;
    animation: none;
  }

  .collapse-enter-active,
  .collapse-leave-active {
    transition: none;
  }

  .section-header:hover .section-icon {
    transform: none;
  }
}

// ==================== 性能优化 ====================

.mobile-section-card {
  will-change: auto;
}

.section-header,
.section-icon,
.section-count,
.section-toggle {
  will-change: transform;
}
</style>
