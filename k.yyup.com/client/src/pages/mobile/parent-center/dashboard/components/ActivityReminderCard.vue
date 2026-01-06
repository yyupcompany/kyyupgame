<template>
  <van-card
    class="activity-reminder-card"
    @click="$emit('click')"
    :thumb="iconUrl"
  >
    <template #title>
      <div class="card-title">活动</div>
    </template>

    <template #desc>
      <div class="card-stats">
        <div class="main-stat">
          <span class="number">{{ stats.upcoming }}</span>
          <span class="label">即将开始</span>
        </div>
        <div class="sub-stats">
          <div class="stat-item">
            <span class="number participating">{{ stats.participating }}</span>
            <span class="label">参与活动</span>
          </div>
          <div class="stat-item">
            <span class="number this-week">{{ stats.thisWeek }}</span>
            <span class="label">本周活动</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <div class="reminder-badge" v-if="stats.upcoming > 0">
          <van-icon name="bell" :color="iconColor" />
          <span>有 {{ stats.upcoming }} 个活动即将开始</span>
        </div>
        <div class="no-reminder" v-else>
          <span>暂无即将开始的活动</span>
        </div>
      </div>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ActivityStats {
  upcoming: number
  participating: number
  thisWeek: number
}

interface Props {
  stats: ActivityStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const iconUrl = computed(() => {
  // 返回活动图标的URL
  return '/icons/activity-reminder.png'
})

const iconColor = computed(() => {
  if (props.stats.upcoming > 0) return '#ff976a'
  return '#409EFF'
})
</script>

<style lang="scss" scoped>
.activity-reminder-card {
  margin-bottom: var(--van-cell-group-inset-padding);
  border-radius: var(--van-border-radius-lg);

  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .card-title {
    font-size: var(--van-font-size-lg);
    font-weight: var(--van-font-weight-bold);
    color: var(--van-text-color);
    margin-bottom: var(--van-padding-sm);
  }

  .card-stats {
    padding: var(--van-padding-sm) 0;

    .main-stat {
      text-align: center;
      margin-bottom: var(--van-padding-sm);

      .number {
        display: block;
        font-size: var(--text-3xl);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
        line-height: 1;
      }

      .label {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        margin-top: 4px;
      }
    }

    .sub-stats {
      display: flex;
      justify-content: space-around;
      gap: var(--van-padding-xs);

      .stat-item {
        flex: 1;
        text-align: center;

        .number {
          display: block;
          font-size: var(--van-font-size-lg);
          font-weight: var(--van-font-weight-bold);
          line-height: 1;

          &.participating {
            color: var(--van-success-color);
          }

          &.this-week {
            color: var(--van-warning-color);
          }
        }

        .label {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-3);
          margin-top: 2px;
        }
      }
    }
  }

  .card-footer {
    padding-top: var(--van-padding-sm);
    border-top: 1px solid var(--van-border-color);

    .reminder-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--van-padding-xs);
      padding: var(--van-padding-xs) var(--van-padding-sm);
      background-color: #fef3c7;
      border-radius: var(--van-border-radius-sm);
      font-size: var(--van-font-size-sm);
      color: #92400e;
      font-weight: var(--van-font-weight-medium);

      .van-icon {
        font-size: var(--text-base);
      }
    }

    .no-reminder {
      text-align: center;
      padding: var(--van-padding-xs) var(--van-padding-sm);
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-3);
    }
  }
}

// 移动端响应式优化
@media (max-width: 375px) {
  .activity-reminder-card {
    .card-stats {
      .main-stat {
        .number {
          font-size: var(--text-2xl);
        }
      }

      .sub-stats {
        .stat-item {
          .number {
            font-size: var(--van-font-size-md);
          }
        }
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .activity-reminder-card {
    max-width: 400px;
    margin: 0 auto var(--van-cell-group-inset-padding);
  }
}
</style>