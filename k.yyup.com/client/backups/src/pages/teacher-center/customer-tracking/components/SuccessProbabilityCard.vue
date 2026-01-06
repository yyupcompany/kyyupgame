<template>
  <el-card class="success-probability-card">
    <template #header>
      <div class="card-header">
        <h4>
          <el-icon><TrendCharts /></el-icon>
          成功概率
        </h4>
      </div>
    </template>

    <div class="probability-content">
      <div class="probability-circle">
        <el-progress
          type="circle"
          :percentage="probability"
          :width="120"
          :color="probabilityColor"
        >
          <template #default="{ percentage }">
            <span class="percentage-value">{{ percentage }}%</span>
          </template>
        </el-progress>
      </div>
      
      <div class="probability-trend">
        <div :class="['trend-indicator', trendClass]">
          <el-icon v-if="trend > 0"><CaretTop /></el-icon>
          <el-icon v-else-if="trend < 0"><CaretBottom /></el-icon>
          <el-icon v-else><Minus /></el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
        <div class="trend-label">较上次{{ trend > 0 ? '上升' : trend < 0 ? '下降' : '持平' }}</div>
      </div>
      
      <div class="probability-level">
        <el-tag :type="levelTagType" size="large">
          {{ levelText }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  customerId: number;
  probability: number;
}

const props = defineProps<Props>();

// 模拟趋势数据
const trend = computed(() => 5); // TODO: 从API获取趋势

const probabilityColor = computed(() => {
  const p = props.probability;
  if (p >= 70) return 'var(--success-color)';
  if (p >= 40) return 'var(--warning-color)';
  return 'var(--danger-color)';
});

const trendClass = computed(() => {
  if (trend.value > 0) return 'trend-up';
  if (trend.value < 0) return 'trend-down';
  return 'trend-stable';
});

const levelText = computed(() => {
  const p = props.probability;
  if (p >= 70) return '高概率成交';
  if (p >= 40) return '中等概率';
  return '需要加强跟进';
});

const levelTagType = computed(() => {
  const p = props.probability;
  if (p >= 70) return 'success';
  if (p >= 40) return 'warning';
  return 'danger';
});
</script>

<style scoped lang="scss">
.success-probability-card {
  height: 100%;

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }

  .card-header {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .probability-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);

    .probability-circle {
      .percentage-value {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .probability-trend {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);

      .trend-indicator {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-base);
        font-weight: 600;

        &.trend-up {
          color: var(--el-color-success);
        }

        &.trend-down {
          color: var(--el-color-danger);
        }

        &.trend-stable {
          color: var(--el-text-color-secondary);
        }
      }

      .trend-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }

    .probability-level {
      width: 100%;
      text-align: center;
    }
  }
}
</style>
