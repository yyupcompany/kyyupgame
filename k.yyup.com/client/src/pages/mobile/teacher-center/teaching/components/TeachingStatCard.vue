<template>
  <van-card class="teaching-stat-card" :class="[`stat-${type}`, { 'clickable': clickable }]" @click="handleClick">
    <template #thumb>
      <div class="stat-icon" :style="{ backgroundColor: color + '20', color: color }">
        <van-icon :name="icon" size="24" />
      </div>
    </template>

    <template #title>
      <div class="stat-content">
        <div class="stat-value">
          {{ displayValue }}<span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
        </div>
        <div class="stat-title">{{ title }}</div>
      </div>
    </template>

    <template #tags v-if="trend">
      <van-tag :type="trendType" size="small">
        <van-icon :name="trendIcon" />
        {{ trendText }}
      </van-tag>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  icon: string
  color: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  suffix?: string
  trend?: number // 趋势百分比
  clickable?: boolean
  format?: 'number' | 'percent' | 'duration' | 'count'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  suffix: '',
  trend: undefined,
  clickable: false,
  format: 'number'
})

const emit = defineEmits<{
  click: []
}>()

// 计算显示值
const displayValue = computed(() => {
  switch (props.format) {
    case 'percent':
      return `${props.value}%`
    case 'duration':
      return formatDuration(props.value)
    case 'count':
      return props.value.toLocaleString()
    case 'number':
    default:
      if (props.value >= 10000) {
        return `${(props.value / 10000).toFixed(1)}万`
      } else if (props.value >= 1000) {
        return `${(props.value / 1000).toFixed(1)}k`
      }
      return props.value.toString()
  }
})

// 计算趋势
const trendType = computed(() => {
  if (!props.trend) return 'default'
  return props.trend > 0 ? 'success' : props.trend < 0 ? 'danger' : 'default'
})

const trendIcon = computed(() => {
  if (!props.trend) return 'minus'
  return props.trend > 0 ? 'arrow-up' : 'arrow-down'
})

const trendText = computed(() => {
  if (!props.trend) return '无变化'
  const absValue = Math.abs(props.trend)
  return `${absValue > 100 ? absValue.toFixed(0) : absValue.toFixed(1)}%`
})

// 方法
const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

// 格式化时长
const formatDuration = (minutes: number) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`
  }
  return `${minutes}m`
}
</script>

<style lang="scss" scoped>
.teaching-stat-card {
  transition: all 0.3s ease;
  border-radius: var(--van-border-radius-lg);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.clickable {
    cursor: pointer;

    &:active {
      transform: translateY(0);
    }
  }

  // 类型主题
  &.stat-primary {
    border-left: 4px solid var(--van-primary-color);
  }

  &.stat-success {
    border-left: 4px solid var(--van-success-color);
  }

  &.stat-warning {
    border-left: 4px solid var(--van-warning-color);
  }

  &.stat-danger {
    border-left: 4px solid var(--van-danger-color);
  }

  &.stat-info {
    border-left: 4px solid var(--van-info-color);
  }

  :deep(.van-card__thumb) {
    width: auto;
    height: auto;
    margin-right: var(--van-padding-md);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--van-border-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .stat-content {
    flex: 1;
    min-width: 0;

    .stat-value {
      font-size: var(--van-font-size-xxl);
      font-weight: bold;
      color: var(--van-text-color);
      line-height: 1.2;
      margin-bottom: var(--van-padding-xs);

      .stat-suffix {
        font-size: var(--van-font-size-lg);
        font-weight: normal;
        color: var(--van-text-color-2);
        margin-left: 2px;
      }
    }

    .stat-title {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
      line-height: 1.3;
    }
  }

  :deep(.van-card__footer) {
    padding-top: var(--van-padding-xs);
  }
}

// 响应式设计
@media (max-width: 375px) {
  .teaching-stat-card {
    .stat-icon {
      width: 40px;
      height: 40px;

      .van-icon {
        font-size: var(--text-xl) !important;
      }
    }

    .stat-content {
      .stat-value {
        font-size: var(--van-font-size-xl);

        .stat-suffix {
          font-size: var(--van-font-size-md);
        }
      }
    }
  }
}

@media (min-width: 768px) {
  .teaching-stat-card {
    .stat-icon {
      width: 56px;
      height: 56px;

      .van-icon {
        font-size: var(--text-3xl) !important;
      }
    }

    .stat-content {
      .stat-value {
        font-size: var(--text-4xl);
        font-size: var(--van-font-size-xxxl);

        .stat-suffix {
          font-size: var(--van-font-size-xl);
        }
      }

      .stat-title {
        font-size: var(--van-font-size-md);
      }
    }
  }
}

// 暗黑模式适配
:root[data-theme='dark'] .teaching-stat-card {
  background-color: var(--van-background-2);
  border-color: var(--van-border-color-dark);

  &.stat-primary {
    border-left-color: var(--van-primary-color);
  }

  &.stat-success {
    border-left-color: var(--van-success-color);
  }

  &.stat-warning {
    border-left-color: var(--van-warning-color);
  }

  &.stat-danger {
    border-left-color: var(--van-danger-color);
  }

  &.stat-info {
    border-left-color: var(--van-info-color);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  .stat-content {
    .stat-value {
      color: var(--van-text-color);
    }

    .stat-title {
      color: var(--van-text-color-2);
    }
  }
}

// 动画效果
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.teaching-stat-card.pulse {
  animation: pulse 2s infinite;
}

// 加载状态
.teaching-stat-card.loading {
  .stat-icon {
    opacity: 0.6;
  }

  .stat-content {
    .stat-value,
    .stat-title {
      opacity: 0.6;
    }
  }
}
</style>