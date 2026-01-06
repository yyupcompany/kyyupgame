<template>
  <van-cell-group inset class="mobile-curriculum-stat-card" @click="handleClick">
    <van-cell
      :border="false"
      :title="title"
      :value="formatValue(value)"
      :label="description"
      center
    >
      <template #icon>
        <div class="stat-icon" :style="{ backgroundColor: color + '20', color: color }">
          <van-icon :name="icon" size="24" />
        </div>
      </template>
      <template #extra>
        <div class="stat-extra">
          <van-tag
            v-if="trend"
            :type="trendType"
            size="small"
            :icon="trendIcon"
          >
            {{ formatTrend(trend) }}
          </van-tag>
          <van-icon v-if="clickable" name="arrow" color="#c8c9cc" />
        </div>
      </template>
    </van-cell>

    <!-- 进度条（可选） -->
    <div v-if="showProgress && progress !== undefined" class="stat-progress">
      <van-progress
        :percentage="progress"
        :stroke-width="4"
        :color="color"
        track-color="#f5f5f5"
        :show-pivot="false"
      />
      <span class="progress-text">{{ progress }}%</span>
    </div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showToast } from 'vant'

interface Props {
  title: string
  value: number | string
  icon: string
  color: string
  description?: string
  trend?: number // 趋势值（正负数）
  showProgress?: boolean
  progress?: number // 0-100
  clickable?: boolean
  format?: 'number' | 'percentage' | 'currency' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  showProgress: false,
  clickable: false,
  format: 'default'
})

const emit = defineEmits<{
  'click': [data: { title: string; value: number | string }]
}>()

// 趋势类型
const trendType = computed(() => {
  if (!props.trend) return 'default'
  return props.trend > 0 ? 'success' : props.trend < 0 ? 'danger' : 'default'
})

// 趋势图标
const trendIcon = computed(() => {
  if (!props.trend) return ''
  return props.trend > 0 ? 'arrow-up' : props.trend < 0 ? 'arrow-down' : 'minus'
})

// 格式化数值显示
function formatValue(value: number | string): string {
  if (typeof value === 'string') {
    return value
  }

  switch (props.format) {
    case 'number':
      return value.toLocaleString()
    case 'percentage':
      return `${value}%`
    case 'currency':
      return `¥${value.toLocaleString()}`
    case 'default':
    default:
      return value.toString()
  }
}

// 格式化趋势显示
function formatTrend(trend: number): string {
  const absValue = Math.abs(trend)
  const sign = trend > 0 ? '+' : trend < 0 ? '-' : ''
  return `${sign}${absValue}%`
}

// 处理点击事件
function handleClick() {
  if (props.clickable) {
    emit('click', {
      title: props.title,
      value: props.value
    })
    showToast(`查看${props.title}详情`)
  }
}
</script>

<style scoped lang="scss">
.mobile-curriculum-stat-card {
  margin-bottom: var(--van-padding-md);
  border-radius: var(--van-radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  :deep(.van-cell) {
    padding: var(--van-padding-md) var(--van-padding-lg);

    .van-cell__title {
      font-size: var(--van-font-size-md);
      font-weight: 600;
      color: var(--van-text-color-1);
      line-height: 1.4;
    }

    .van-cell__value {
      font-size: var(--van-font-size-xl);
      font-weight: 700;
      color: var(--van-text-color-1);
      line-height: 1.2;
    }

    .van-cell__label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-3);
      margin-top: var(--van-padding-xs);
      line-height: 1.4;
    }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--van-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--van-padding-md);
    flex-shrink: 0;

    .van-icon {
      font-size: var(--text-2xl);
    }
  }

  .stat-extra {
    display: flex;
    align-items: center;
    gap: var(--van-padding-xs);
    margin-left: var(--van-padding-sm);

    .van-tag {
      font-size: var(--van-font-size-xs);
      padding: 2px 6px;
      border-radius: var(--van-radius-sm);
    }
  }

  .stat-progress {
    display: flex;
    align-items: center;
    gap: var(--van-padding-sm);
    padding: 0 var(--van-padding-lg) var(--van-padding-md);

    :deep(.van-progress) {
      flex: 1;
    }

    .progress-text {
      font-size: var(--van-font-size-xs);
      color: var(--van-text-color-2);
      font-weight: 500;
      min-width: 36px;
      text-align: right;
    }
  }
}

// 特殊样式变体
.mobile-curriculum-stat-card.danger {
  :deep(.van-cell__value) {
    color: var(--van-danger-color);
  }
}

.mobile-curriculum-stat-card.success {
  :deep(.van-cell__value) {
    color: var(--van-success-color);
  }
}

.mobile-curriculum-stat-card.warning {
  :deep(.van-cell__value) {
    color: var(--van-warning-color);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-curriculum-stat-card {
    :deep(.van-cell) {
      padding: var(--van-padding-sm) var(--van-padding-md);

      .van-cell__title {
        font-size: var(--van-font-size-sm);
      }

      .van-cell__value {
        font-size: var(--van-font-size-lg);
      }

      .van-cell__label {
        font-size: var(--van-font-size-xs);
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      margin-right: var(--van-padding-sm);

      .van-icon {
        font-size: var(--text-xl);
      }
    }

    .stat-extra {
      .van-tag {
        font-size: 10px;
        padding: 1px 4px;
      }
    }

    .stat-progress {
      padding: 0 var(--van-padding-md) var(--van-padding-sm);
    }
  }
}

// 紧凑模式（用于网格布局）
.mobile-curriculum-stat-card.compact {
  margin-bottom: var(--van-padding-sm);

  :deep(.van-cell) {
    padding: var(--van-padding-sm);

    .van-cell__value {
      font-size: var(--van-font-size-lg);
    }

    .van-cell__label {
      display: none; // 紧凑模式隐藏描述
    }
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    margin-right: var(--van-padding-sm);

    .van-icon {
      font-size: var(--text-lg);
    }
  }

  .stat-progress {
    padding: 0 var(--van-padding-sm) var(--van-padding-sm);
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-curriculum-stat-card {
    background: var(--van-background-2);

    :deep(.van-cell) {
      background: transparent;
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-curriculum-stat-card {
  animation: fadeIn 0.3s ease;
}

// 网格布局支持
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--van-padding-md);
  margin: var(--van-padding-md) 0;

  .mobile-curriculum-stat-card {
    margin-bottom: 0;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-sm);
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>