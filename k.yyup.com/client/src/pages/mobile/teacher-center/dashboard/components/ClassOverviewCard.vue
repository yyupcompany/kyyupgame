<template>
  <div class="mobile-class-overview-card" @click="$emit('click')">
    <van-card :thumb="iconUrl" :centered="true">
      <template #title>
        <div class="card-title">
          <van-icon name="friends-o" />
          <span>课程</span>
        </div>
      </template>

      <template #desc>
        <div class="card-stats">
          <div class="main-stat">
            <div class="number">{{ stats.total }}</div>
            <div class="label">负责班级</div>
          </div>

          <van-grid :column-num="3" :gutter="8">
            <van-grid-item>
              <div class="sub-stat-item today">
                <div class="number">{{ stats.todayClasses }}</div>
                <div class="label">今日课程</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="sub-stat-item students">
                <div class="number">{{ stats.studentsCount }}</div>
                <div class="label">学生总数</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="sub-stat-item completion">
                <div class="number">{{ stats.completionRate }}%</div>
                <div class="label">完成率</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </template>

      <template #footer>
        <div class="card-footer">
          <!-- 教学进度条 -->
          <div class="progress-section">
            <div class="progress-label">教学完成率</div>
            <van-progress
              :percentage="stats.completionRate"
              stroke-width="8"
              :color="progressColor"
              track-color="#f5f5f5"
              :show-pivot="true"
              pivot-text-color="#fff"
              pivot-color="var(--van-primary-color)"
            />
          </div>

          <!-- 状态指示器 -->
          <div class="status-indicator" :class="progressStatus">
            <van-icon :name="statusIcon" />
            <span>{{ statusText }}</span>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 快速操作按钮 -->
    <div class="quick-actions">
      <van-button
        type="primary"
        size="small"
        icon="todo-list-o"
        @click.stop="$emit('view-schedule')"
      >
        课程表
      </van-button>
      <van-button
        type="default"
        size="small"
        icon="user-circle-o"
        @click.stop="$emit('manage-students')"
      >
        学生管理
      </van-button>
      <van-button
        type="default"
        size="small"
        icon="bar-chart-o"
        @click.stop="$emit('view-reports')"
      >
        统计报告
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ClassStats {
  total: number
  todayClasses: number
  studentsCount: number
  completionRate: number
}

interface Props {
  stats: ClassStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  'view-schedule': []
  'manage-students': []
  'view-reports': []
}>()

const iconUrl = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) {
    return '/icons/class-success.png'
  } else if (rate >= 70) {
    return '/icons/class-warning.png'
  }
  return '/icons/class-primary.png'
})

const progressColor = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return 'var(--van-success-color)'
  if (rate >= 70) return 'var(--van-warning-color)'
  return 'var(--van-danger-color)'
})

const progressStatus = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'danger'
})

const statusIcon = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'close'
})

const statusText = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return '教学进度优秀'
  if (rate >= 70) return '教学进度良好'
  return '需要加强教学'
})
</script>

<style lang="scss" scoped>
.mobile-class-overview-card {
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
          color: var(--van-primary-color);
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
            color: var(--van-primary-color);
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
          padding: var(--spacing-md) 8px;
          border-radius: 8px;
          background: var(--van-background-color-light);

          .number {
            font-size: var(--text-lg);
            font-weight: 600;
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: 11px;
            color: var(--van-text-color-2);
          }

          &.today {
            .number {
              color: var(--van-primary-color);
            }
          }

          &.students {
            .number {
              color: var(--van-success-color);
            }
          }

          &.completion {
            .number {
              color: var(--van-warning-color);
            }
          }
        }
      }
    }

    .van-card__footer {
      padding: 0;

      .card-footer {
        .progress-section {
          margin-bottom: 12px;

          .progress-label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin-bottom: 8px;
            text-align: center;
          }

          :deep(.van-progress) {
            .van-progress__pivot {
              font-size: 10px;
            }
          }
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: var(--spacing-sm) 16px;
          border-radius: 0 0 12px 12px;
          font-size: var(--text-xs);
          font-weight: 500;

          &.success {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            color: var(--van-success-color);

            .van-icon {
              color: var(--van-success-color);
            }
          }

          &.warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            color: var(--van-warning-color);

            .van-icon {
              color: var(--van-warning-color);
            }
          }

          &.danger {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            color: var(--van-danger-color);

            .van-icon {
              color: var(--van-danger-color);
            }
          }
        }
      }
    }
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);

    .van-button {
      border-radius: 8px;
      font-size: var(--text-xs);
      font-weight: 500;
      height: 36px;

      .van-icon {
        margin-right: 4px;
        font-size: var(--text-sm);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-class-overview-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .quick-actions {
      background: var(--van-background-color);
      border-top-color: var(--van-border-color);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-class-overview-card {
    margin: var(--spacing-md);

    .quick-actions {
      padding: var(--spacing-md);
      gap: 6px;

      .van-button {
        font-size: 11px;
        height: 32px;

        .van-icon {
          font-size: var(--text-xs);
          margin-right: 2px;
        }
      }
    }

    :deep(.van-card) {
      .van-card__thumb {
        width: 40px;
        height: 40px;
      }

      .van-card__title .card-title {
        font-size: var(--text-base);

        .van-icon {
          font-size: var(--text-lg);
        }
      }

      .van-card__desc .card-stats {
        .main-stat .number {
          font-size: var(--text-3xl);
        }

        .sub-stat-item {
          padding: 10px 6px;

          .number {
            font-size: var(--text-base);
          }

          .label {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>