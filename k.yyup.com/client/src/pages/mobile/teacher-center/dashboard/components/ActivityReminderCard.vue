<template>
  <div class="mobile-activity-reminder-card" @click="$emit('click')">
    <van-card :thumb="iconUrl" :centered="true">
      <template #title>
        <div class="card-title">
          <van-icon name="fire" />
          <span>活动</span>
        </div>
      </template>

      <template #desc>
        <div class="card-stats">
          <div class="main-stat">
            <div class="number">{{ stats.upcoming }}</div>
            <div class="label">即将开始</div>
          </div>

          <van-grid :column-num="2" :gutter="12">
            <van-grid-item>
              <div class="sub-stat-item participating">
                <div class="number">{{ stats.participating }}</div>
                <div class="label">参与活动</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="sub-stat-item this-week">
                <div class="number">{{ stats.thisWeek }}</div>
                <div class="label">本周活动</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </template>

      <template #footer>
        <div class="card-footer">
          <div v-if="stats.upcoming > 0" class="reminder-badge">
            <van-icon name="bell" />
            <span>有 {{ stats.upcoming }} 个活动即将开始</span>
          </div>
          <div v-else class="no-reminder">
            <van-icon name="info-o" />
            <span>暂无即将开始的活动</span>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 快速操作按钮 -->
    <div class="quick-actions" v-if="stats.upcoming > 0">
      <van-button
        type="primary"
        size="small"
        icon="calendar-o"
        @click.stop="$emit('view-calendar')"
      >
        查看日程
      </van-button>
      <van-button
        type="default"
        size="small"
        icon="add-o"
        @click.stop="$emit('create-activity')"
      >
        创建活动
      </van-button>
    </div>
  </div>
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
  'view-calendar': []
  'create-activity': []
}>()

const iconUrl = computed(() => {
  // 返回活动相关的图标URL，可以根据状态动态变化
  if (props.stats.upcoming > 0) {
    return '/icons/activity-active.png'
  }
  return '/icons/activity-normal.png'
})

const iconClass = computed(() => {
  if (props.stats.upcoming > 0) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.mobile-activity-reminder-card {
  margin: var(--spacing-md);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.van-card) {
    background: transparent;

    .van-card__thumb {
      width: 48px;
      height: 48px;
      margin: var(--spacing-md) auto;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .van-card__content {
      padding: 0 16px 16px;
    }

    .van-card__title {
      margin-bottom: 12px;

      .card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-color-1);

        .van-icon {
          color: var(--van-warning-color);
          font-size: var(--text-xl);
        }
      }
    }

    .van-card__desc {
      .card-stats {
        text-align: center;

        .main-stat {
          margin-bottom: 16px;

          .number {
            font-size: var(--text-4xl);
            font-weight: bold;
            color: var(--van-warning-color);
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }
        }

        .sub-stat-item {
          text-align: center;
          padding: var(--spacing-md);
          border-radius: 8px;
          background: var(--van-background-color-light);

          .number {
            font-size: var(--text-xl);
            font-weight: 600;
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }

          &.participating {
            .number {
              color: var(--van-success-color);
            }
          }

          &.this-week {
            .number {
              color: var(--van-primary-color);
            }
          }
        }
      }
    }

    .van-card__footer {
      padding: 0;

      .card-footer {
        .reminder-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-sm);
          color: #e6a23c;
          font-weight: 500;

          .van-icon {
            color: #e6a23c;
          }
        }

        .no-reminder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--van-background-color-light);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-sm);
          color: var(--van-text-color-2);

          .van-icon {
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
      border-radius: 20px;
      font-weight: 500;
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-activity-reminder-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    :deep(.van-card) {
      .van-card__title .card-title {
        color: var(--van-text-color-1);
      }
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-activity-reminder-card {
    margin: var(--spacing-md);

    .quick-actions {
      padding: var(--spacing-md);
      gap: var(--spacing-sm);

      .van-button {
        font-size: var(--text-sm);
      }
    }
  }
}
</style>