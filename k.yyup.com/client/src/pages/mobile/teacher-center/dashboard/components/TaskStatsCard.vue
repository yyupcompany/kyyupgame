<template>
  <div class="task-stats-card" @click="$emit('click')">
    <van-loading v-if="loading" type="spinner" color="#409eff" />
    <div v-else class="card-content">
      <div class="card-header">
        <van-icon name="todo-list-o" size="24" color="#409eff" />
        <span class="card-title">任务统计</span>
        <van-tag
          v-if="stats.urgent > 0"
          type="danger"
          size="small"
        >
          {{ stats.urgent }} 紧急
        </van-tag>
      </div>

      <div class="stats-main">
        <div class="total-stats">
          <div class="total-number">{{ stats.total }}</div>
          <div class="total-label">总任务</div>
          <div class="progress-bar">
            <van-progress
              :percentage="completionPercentage"
              :show-text="false"
              stroke-width="4"
              color="#07c160"
            />
            <span class="progress-text">{{ completionPercentage }}% 完成</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number completed">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-number pending">{{ stats.pending }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-item" v-if="stats.overdue > 0">
          <div class="stat-number overdue">{{ stats.overdue }}</div>
          <div class="stat-label">已逾期</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  urgent?: number
}

interface Props {
  stats: TaskStats
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  click: []
}>()

const completionPercentage = computed(() => {
  if (props.stats.total === 0) return 0
  return Math.round((props.stats.completed / props.stats.total) * 100)
})
</script>

<style lang="scss" scoped>
.task-stats-card {
  background: #fff;
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: 16px;

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      flex: 1;
    }
  }

  .stats-main {
    margin-bottom: 16px;

    .total-stats {
      text-align: center;

      .total-number {
        font-size: var(--text-4xl);
        font-weight: 700;
        color: #409eff;
        margin-bottom: 4px;
        line-height: 1;
      }

      .total-label {
        font-size: var(--text-sm);
        color: #969799;
        margin-bottom: 12px;
      }

      .progress-bar {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .progress-text {
          font-size: var(--text-xs);
          color: #07c160;
          font-weight: 500;
          white-space: nowrap;
        }
      }
    }
  }

  .stats-grid {
    display: flex;
    justify-content: space-around;
    gap: var(--spacing-sm);

    .stat-item {
      text-align: center;
      flex: 1;

      .stat-number {
        font-size: var(--text-xl);
        font-weight: 600;
        line-height: 1;
        margin-bottom: 4px;

        &.completed {
          color: #07c160;
        }

        &.pending {
          color: #ff976a;
        }

        &.overdue {
          color: #ee0a24;
        }
      }

      .stat-label {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }
}
</style>