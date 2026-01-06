<template>
  <div class="mobile-task-overview-card" @click="$emit('click')">
    <van-card :thumb="iconUrl" :centered="true">
      <template #title>
        <div class="card-title">
          <van-icon name="list-switch" />
          <span>任务</span>
        </div>
      </template>

      <template #desc>
        <div class="card-stats">
          <div class="main-stat">
            <div class="number">{{ stats.total }}</div>
            <div class="label">总任务</div>
          </div>

          <van-grid :column-num="3" :gutter="8">
            <van-grid-item>
              <div class="sub-stat-item completed">
                <div class="number">{{ stats.completed }}</div>
                <div class="label">已完成</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="sub-stat-item pending">
                <div class="number">{{ stats.pending }}</div>
                <div class="label">进行中</div>
              </div>
            </van-grid-item>
            <van-grid-item v-if="stats.overdue > 0">
              <div class="sub-stat-item overdue">
                <div class="number">{{ stats.overdue }}</div>
                <div class="label">已逾期</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </template>

      <template #footer>
        <div class="card-footer">
          <!-- 任务进度条 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">完成率</span>
              <span class="progress-percentage">{{ completionPercentage }}%</span>
            </div>
            <van-progress
              :percentage="completionPercentage"
              stroke-width="8"
              :color="progressColor"
              track-color="#f5f5f5"
              :show-pivot="false"
            />
          </div>

          <!-- 状态指示器 -->
          <div class="status-indicator" :class="progressStatus">
            <van-icon :name="statusIcon" />
            <span>{{ statusText }}</span>
            <van-tag
              v-if="stats.overdue > 0"
              type="danger"
              size="small"
              plain
              class="overdue-tag"
            >
              {{ stats.overdue }} 项逾期
            </van-tag>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 快速操作按钮 -->
    <div class="quick-actions">
      <van-button
        v-if="stats.overdue > 0"
        type="danger"
        size="small"
        icon="warning-o"
        @click.stop="$emit('view-overdue')"
      >
        逾期任务
      </van-button>
      <van-button
        type="primary"
        size="small"
        icon="add-o"
        @click.stop="$emit('create-task')"
      >
        新建任务
      </van-button>
      <van-button
        type="default"
        size="small"
        icon="apps-o"
        @click.stop="$emit('view-all')"
      >
        查看全部
      </van-button>
    </div>

    <!-- 今日任务预览 -->
    <div class="today-tasks" v-if="showTodayTasks && todayTasks.length > 0">
      <van-cell-group inset title="今日任务">
        <van-cell
          v-for="task in todayTasks.slice(0, 3)"
          :key="task.id"
          :title="task.title"
          :label="task.description"
          :value="formatTime(task.dueTime)"
          :icon="getTaskIcon(task.priority)"
          :class="getTaskClass(task)"
          clickable
          @click.stop="$emit('view-task', task)"
        >
          <template #right-icon>
            <van-tag
              :type="getTaskTagType(task.status)"
              size="small"
              plain
            >
              {{ getTaskStatusText(task.status) }}
            </van-tag>
          </template>
        </van-cell>

        <van-cell
          v-if="todayTasks.length > 3"
          title="查看更多今日任务"
          :value="`共 ${todayTasks.length} 项`"
          icon="arrow"
          is-link
          @click.stop="$emit('view-today-tasks')"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
}

interface TodayTask {
  id: number
  title: string
  description: string
  status: 'completed' | 'pending' | 'overdue'
  priority: 'high' | 'medium' | 'low'
  dueTime: string
}

interface Props {
  stats: TaskStats
  showTodayTasks?: boolean
  todayTasks?: TodayTask[]
}

const props = withDefaults(defineProps<Props>(), {
  showTodayTasks: true,
  todayTasks: () => []
})

const emit = defineEmits<{
  click: []
  'view-all': []
  'create-task': []
  'view-overdue': []
  'view-task': [task: TodayTask]
  'view-today-tasks': []
}>()

const iconUrl = computed(() => {
  if (props.stats.overdue > 0) {
    return '/icons/task-overdue.png'
  } else if (props.stats.pending > 0) {
    return '/icons/task-pending.png'
  }
  return '/icons/task-completed.png'
})

const completionPercentage = computed(() => {
  if (props.stats.total === 0) return 0
  return Math.round((props.stats.completed / props.stats.total) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'var(--van-success-color)'
  if (percentage >= 60) return 'var(--van-warning-color)'
  return 'var(--van-danger-color)'
})

const progressStatus = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'danger'
})

const statusIcon = computed(() => {
  if (props.stats.overdue > 0) return 'warning-o'
  if (completionPercentage.value >= 80) return 'success'
  return 'clock-o'
})

const statusText = computed(() => {
  if (props.stats.overdue > 0) return '有逾期任务需要处理'
  if (completionPercentage.value >= 80) return '任务完成情况良好'
  if (completionPercentage.value >= 60) return '任务进行中，请继续努力'
  return '任务进度较慢，需要加快进度'
})

// 方法
const getTaskIcon = (priority: string) => {
  const iconMap = {
    'high': 'fire-o',
    'medium': 'clock-o',
    'low': 'bookmark-o'
  }
  return iconMap[priority as keyof typeof iconMap] || 'bookmark-o'
}

const getTaskClass = (task: TodayTask) => {
  return {
    'task-high': task.priority === 'high',
    'task-overdue': task.status === 'overdue',
    'task-completed': task.status === 'completed'
  }
}

const getTaskTagType = (status: string) => {
  const typeMap = {
    'completed': 'success',
    'pending': 'primary',
    'overdue': 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'default'
}

const getTaskStatusText = (status: string) => {
  const textMap = {
    'completed': '已完成',
    'pending': '进行中',
    'overdue': '已逾期'
  }
  return textMap[status as keyof typeof textMap] || '未知'
}

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.mobile-task-overview-card {
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

          &.completed {
            .number {
              color: var(--van-success-color);
            }
          }

          &.pending {
            .number {
              color: var(--van-primary-color);
            }
          }

          &.overdue {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            .number {
              color: var(--van-danger-color);
              font-weight: bold;
            }

            .label {
              color: var(--van-danger-color);
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

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-label {
              font-size: var(--text-xs);
              color: var(--van-text-color-2);
            }

            .progress-percentage {
              font-size: var(--text-sm);
              font-weight: 600;
              color: var(--van-text-color-1);
            }
          }
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          position: relative;

          &.success {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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

          .overdue-tag {
            margin-left: auto;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
      border-radius: 8px;
      font-size: var(--text-xs);
      font-weight: 500;
      height: 36px;

      &.van-button--danger {
        background: linear-gradient(135deg, var(--van-danger-color), #ef4444);
        border: none;
      }
    }
  }

  .today-tasks {
    margin-top: 8px;

    .task-high {
      border-left: 3px solid var(--van-danger-color);
    }

    .task-overdue {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 20%);
      border-left: 3px solid var(--van-danger-color);
    }

    .task-completed {
      opacity: 0.7;
      border-left: 3px solid var(--van-success-color);
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-task-overview-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .quick-actions {
      background: var(--van-background-color);
      border-top-color: var(--van-border-color);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-task-overview-card {
    margin: var(--spacing-md);

    .quick-actions {
      padding: var(--spacing-md);
      gap: 6px;

      .van-button {
        font-size: 11px;
        height: 32px;
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