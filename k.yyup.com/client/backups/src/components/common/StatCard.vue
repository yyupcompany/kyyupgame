<template>
  <div 
    class="stat-card" 
    :class="[
      `stat-card--${size}`,
      `stat-card--${type}`,
      { 'stat-card--clickable': clickable },
      { 'stat-card--loading': loading }
    ]"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="card-loading">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-content">
            <el-skeleton-item variant="circle" style="width: var(--icon-size); height: var(--icon-size);" />
            <div class="skeleton-text">
              <el-skeleton-item variant="text" style="width: 60%; height: var(--text-2xl);" />
              <el-skeleton-item variant="text" style="width: 40%; height: var(--text-lg);" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 正常内容 -->
    <div v-else class="card-content">
      <!-- 图标区域 -->
      <div class="card-icon" v-if="icon || iconName || $slots.icon">
        <slot name="icon">
          <!-- 使用LucideIcon组件 -->
          <LucideIcon
            v-if="iconName"
            :name="iconName"
            :size="iconSize"
            :color="iconColor"
            :variant="iconVariant"
            :stroke-width="1.5"
          />
          <!-- 兼容旧的图标方式 -->
          <el-icon v-else-if="icon" :size="iconSize" :color="iconColor">
            <component :is="icon" />
          </el-icon>
        </slot>
      </div>

      <!-- 主要内容 -->
      <div class="card-main">
        <!-- 数值区域 -->
        <div class="card-value">
          <span class="value-number">{{ formattedValue }}</span>
          <span v-if="unit" class="value-unit">{{ unit }}</span>
        </div>

        <!-- 标题区域 -->
        <div class="card-title">{{ title }}</div>

        <!-- 描述区域 -->
        <div v-if="description" class="card-description">{{ description }}</div>
      </div>

      <!-- 趋势指示器 -->
      <div v-if="trend !== undefined" class="card-trend">
        <div 
          class="trend-indicator"
          :class="`trend-indicator--${trendType}`"
        >
          <el-icon class="trend-icon">
            <ArrowUp v-if="trendType === 'up'" />
            <ArrowDown v-if="trendType === 'down'" />
            <Minus v-if="trendType === 'flat'" />
          </el-icon>
          <span v-if="formattedTrend" class="trend-value">{{ formattedTrend }}</span>
        </div>
        <div v-if="trendText" class="trend-text">{{ trendText }}</div>
      </div>
    </div>

    <!-- 底部额外内容 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>

    <!-- 角标 -->
    <div v-if="badge" class="card-badge">
      <el-badge :value="badge" :max="badgeMax" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  description?: string
  icon?: string
  iconName?: string // 新增：使用LucideIcon的图标名称
  iconVariant?: 'default' | 'filled' | 'outlined' | 'rounded' // 新增：图标变体
  iconColor?: string
  iconSize?: number
  trend?: number | 'up' | 'down' | 'stable'
  trendText?: string
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'default' | 'large'
  loading?: boolean
  clickable?: boolean
  badge?: number | string
  badgeMax?: number
  precision?: number
  formatter?: (value: number | string) => string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  loading: false,
  clickable: false,
  badgeMax: 99,
  precision: 0,
  iconSize: 24,
  iconVariant: 'default'
})

const emit = defineEmits<{
  click: []
}>()

// 格式化数值
const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  
  if (typeof props.value === 'number') {
    // 显示完整数字，使用千分位分隔符
    return props.value.toLocaleString()
  }
  
  return String(props.value)
})

// 趋势类型
const trendType = computed(() => {
  if (props.trend === undefined) return 'flat'

  // 如果是字符串类型，直接返回
  if (typeof props.trend === 'string') {
    return props.trend === 'stable' ? 'flat' : props.trend
  }

  // 如果是数字类型，根据数值判断
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'flat'
})

// 格式化趋势值
const formattedTrend = computed(() => {
  if (props.trend === undefined) return ''

  // 如果是字符串类型，不显示百分比（使用 trendText 代替）
  if (typeof props.trend === 'string') {
    return ''
  }

  // 如果是数字类型，显示百分比
  const absValue = Math.abs(props.trend)
  return `${absValue.toFixed(1)}%`
})

// 图标颜色
const iconColor = computed(() => {
  if (props.iconColor) return props.iconColor
  
  const colorMap = {
    default: 'var(--info-color)',
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    danger: 'var(--danger-color)',
    info: 'var(--info-color)'
  }
  
  return colorMap[props.type]
})

// 点击处理
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
// 导入全局样式变量和卡片mixins
@import '@/styles/design-tokens.scss';
@import '@/styles/mixins/card-mixins.scss';

.stat-card {
  position: relative;
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  min-height: var(--spacing-3xl);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-base);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--backdrop-blur);

  /* 渐变边框动画 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--border-width, var(--spacing-xs));
    background: linear-gradient(90deg, var(--card-gradient, var(--gradient-purple)));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition-base);
    z-index: 1;
    will-change: transform;
    backface-visibility: hidden;
  }

  /* 霓虹发光背景光效 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: calc(var(--spacing-xl) * -1.5);
    width: var(--card-glow-size);
    height: var(--card-glow-size);
    background: radial-gradient(circle, var(--card-glow-bg, rgba(102, 126, 234, 0.2)) 0%, var(--card-glow-color, rgba(118, 75, 162, 0.1)) 30%, transparent 70%);
    border-radius: var(--radius-full);
    opacity: 0;
    transition: all var(--transition-base);
    pointer-events: none;
    will-change: opacity, transform;
    transform: translateX(0);
  }

  &--clickable {
    cursor: pointer;
    will-change: transform, box-shadow, border-color;

    &:hover {
      transform: translateY(-var(--spacing-sm)) scale(1.02);
      box-shadow: var(--shadow-2xl),
                  0 0 var(--text-2xl) var(--card-glow-color, rgba(102, 126, 234, 0.3)),
                  0 0 40px var(--card-glow-bg, rgba(102, 126, 234, 0.1));
      border-color: var(--border-focus);

      &::before {
        transform: scaleX(1);
      }

      &::after {
        opacity: 1;
        transform: translateX(30px) scale(1.1);
      }

      .card-icon {
        transform: scale(1.15) rotate(5deg);
      }

      .card-value .value-number {
        transform: scale(1.05);
      }

      .card-trend {
        transform: translateX(var(--spacing-xs));
      }

      &.stat-card--primary {
        box-shadow: var(--shadow-2xl);
      }

      &.stat-card--success {
        box-shadow: var(--shadow-2xl);
      }

      &.stat-card--warning {
        box-shadow: var(--shadow-2xl);
      }

      &.stat-card--info {
        box-shadow: var(--shadow-2xl);
      }

      &.stat-card--danger {
        box-shadow: var(--shadow-2xl);
      }
    }

    // 移动端优化
    @media (hover: none) {
      will-change: auto;

      &:hover {
        transform: none;
        box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--black-alpha-8);
        border-color: var(--border-color);

        &::before {
          transform: scaleX(0);
        }

        &::after {
          opacity: 0;
          right: -50px;
        }

        .card-icon {
          transform: none;
        }

        .card-value .value-number {
          transform: none;
        }

        .card-trend {
          transform: none;
        }
      }
    }
  }

  &--loading {
    .skeleton-content {
      display: flex;
      align-items: center;
      gap: var(--text-sm);

      .skeleton-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }
    }
  }

  // 尺寸变体
  &--small {
    padding: var(--spacing-md);

    .card-value .value-number {
      font-size: var(--text-lg);
    }

    .card-title {
      font-size: var(--text-sm);
    }
  }

  &--large {
    padding: var(--spacing-xl);

    .card-value .value-number {
      font-size: var(--text-2xl);
    }

    .card-title {
      font-size: var(--text-base);
    }
  }

  // 卡片类型变量定义
  &--primary {
    --card-gradient: var(--primary-color);
    --card-gradient-end: var(--primary-hover);
    --card-border-hover: var(--primary-light);
    --card-glow-bg: var(--primary-light-bg);
    --card-glow-color: var(--glow-primary);

    border-color: var(--primary-color);
    background: var(--gradient-primary);
    color: var(--text-on-primary);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--primary-shadow);

    .card-title,
    .card-description {
      color: var(--text-on-primary-secondary);
    }
  }

  &--success {
    --card-gradient: var(--success-color);
    --card-gradient-end: #059669;
    --card-border-hover: var(--success-lighter);
    --card-glow-bg: var(--success-light-bg);
    --card-glow-color: var(--glow-success);

    border-color: var(--success-color);
    background: var(--gradient-success);
    color: var(--text-on-primary);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--glow-success);

    .card-title,
    .card-description {
      color: var(--text-on-primary-secondary);
    }
  }

  &--warning {
    --card-gradient: var(--warning-color);
    --card-gradient-end: #d97706;
    --card-border-hover: var(--warning-lighter);
    --card-glow-bg: var(--warning-light-bg);
    --card-glow-color: var(--glow-warning);

    border-color: var(--warning-color);
    background: var(--gradient-warning);
    color: var(--text-on-primary);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--glow-warning);

    .card-title,
    .card-description {
      color: var(--text-on-primary-secondary);
    }
  }

  &--danger {
    --card-gradient: var(--danger-color);
    --card-gradient-end: #dc2626;
    --card-border-hover: var(--danger-lighter);
    --card-glow-bg: var(--danger-light-bg);
    --card-glow-color: var(--glow-danger);

    border-color: var(--danger-color);
    background: var(--gradient-danger);
    color: var(--text-on-primary);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--glow-danger);

    .card-title,
    .card-description {
      color: var(--text-on-primary-secondary);
    }
  }

  &--info {
    --card-gradient: var(--info-color);
    --card-gradient-end: #1d4ed8;
    --card-border-hover: var(--info-lighter);
    --card-glow-bg: var(--info-light-bg);
    --card-glow-color: var(--glow-blue);

    border-color: var(--info-color);
    background: var(--gradient-info);
    color: var(--text-on-primary);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--glow-blue);

    .card-title,
    .card-description {
      color: var(--text-on-primary-secondary);
    }
  }
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-icon-lg);
  height: var(--size-icon-lg);
  min-width: var(--size-icon-lg);
  min-height: var(--size-icon-lg);
  background: var(--primary-light-bg);
  border-radius: var(--radius-md);
  transition: transform var(--transition-base);
  will-change: transform;
  backface-visibility: hidden;
  
  /* 确保图标显示 */
  svg, .el-icon {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    opacity: 1 !important;
  }
}

.card-main {
  flex: 1;
  min-width: var(--spacing-3xl); /* 确保有足够宽度容纳文字 */
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2xs);
  margin-bottom: var(--spacing-md);

  .value-number {
    font-size: var(--text-2xl);
    font-weight: 600;
    line-height: 1;
    color: var(--text-primary);
    transition: transform var(--transition-base);
    will-change: transform;
    backface-visibility: hidden;
  }

  .value-unit {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: normal;
  }
}

.card-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.card-description {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.card-trend {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-2xs);
  transition: transform var(--transition-base);
  will-change: transform;

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: 500;

    &--up {
      background: var(--success-light-bg);
      color: var(--success-color);
      border: var(--border-width-base) solid rgba(16, 185, 129, 0.2);

      .trend-icon {
        color: var(--success-color);
      }
    }

    &--down {
      background: var(--danger-light-bg);
      color: var(--danger-color);
      border: var(--border-width-base) solid var(--danger-light-bg);

      .trend-icon {
        color: var(--danger-color);
      }
    }

    &--flat {
      background: var(--bg-hover);
      color: var(--text-secondary);
      border: var(--border-width-base) solid var(--border-color-light);

      .trend-icon {
        color: var(--text-secondary);
      }
    }
  }

  .trend-text {
    font-size: var(--text-2xs, 10px);
    color: var(--text-muted);
    text-align: right;
  }
}

.card-footer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--border-color);
}

.card-badge {
  position: absolute;
  top: var(--spacing-sm, var(--spacing-sm));
  right: var(--spacing-sm, var(--spacing-sm));
}

// 🎨 暗黑主题适配
:deep(.dark) {
  .stat-card {
    --bg-card: var(--bg-card);
    --border-color: var(--border-color);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --card-glow-bg: var(--card-glow-bg);
    --card-glow-color: var(--card-glow-color);

    background: var(--bg-card);
    border-color: var(--border-color);
    color: var(--text-primary);
    box-shadow: var(--shadow-lg);

    &::before {
      background: var(--gradient-primary);
    }

    &::after {
      background: radial-gradient(circle, var(--card-glow-bg) 0%, var(--card-glow-color) 30%, transparent 70%);
    }

    &:hover {
      border-color: var(--border-focus);
      box-shadow: var(--shadow-2xl),
                  0 0 var(--text-2xl) var(--card-glow-bg),
                  0 0 40px var(--card-glow-color);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .stat-card {
    padding: var(--spacing-md);

    .card-content {
      gap: var(--spacing-md);
    }

    .card-icon {
      width: var(--size-icon-md);
      height: var(--size-icon-md);
    }

    .card-value .value-number {
      font-size: var(--text-xl);
    }

    &--large {
      .card-value .value-number {
        font-size: var(--text-2xl);
      }
    }
  }
}
</style>
