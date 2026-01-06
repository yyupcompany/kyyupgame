<template>
  <div class="mobile-task-overview-card">
    <van-cell-group inset class="task-overview-card" @click="$emit('click')">
      <!-- 卡片头部 -->
      <van-cell class="card-header">
        <template #title>
          <div class="header-content">
            <div class="header-left">
              <van-icon name="todo-list-o" class="header-icon" />
              <span class="header-title">任务概览</span>
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </template>
      </van-cell>

      <!-- 主要统计信息 -->
      <van-cell class="stats-section">
        <template #default>
          <div v-if="loading" class="loading-container">
            <van-skeleton title :row="3" animated />
          </div>

          <div v-else-if="tasks.length === 0" class="empty-state">
            <van-empty description="暂无任务信息" />
          </div>

          <div v-else class="stats-grid">
            <div class="main-stat">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总任务</div>
            </div>
            <div class="divider"></div>
            <div class="sub-stats">
              <div class="sub-stat-item">
                <div class="stat-value completed">{{ stats.completed }}</div>
                <div class="stat-desc">已完成</div>
              </div>
              <div class="sub-stat-item">
                <div class="stat-value pending">{{ stats.pending }}</div>
                <div class="stat-desc">进行中</div>
              </div>
              <div class="sub-stat-item" v-if="stats.overdue > 0">
                <div class="stat-value overdue">{{ stats.overdue }}</div>
                <div class="stat-desc">已逾期</div>
              </div>
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 任务列表 -->
      <van-cell class="tasks-section" v-if="!loading && tasks.length > 0">
        <template #default>
          <div class="tasks-list">
            <div
              v-for="task in limitedTasks"
              :key="task.id"
              class="task-item"
              @click="handleTaskClick(task)"
            >
              <div class="task-status">
                <van-icon
                  :name="getStatusIcon(task.status)"
                  :class="['status-icon', getStatusClass(task.status)]"
                />
              </div>

              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span class="task-priority">
                    <van-icon name="flag-o" size="12" />
                    {{ getPriorityText(task.priority) }}
                  </span>
                  <span class="task-deadline">
                    <van-icon name="calendar-o" size="12" />
                    {{ formatDate(task.deadline) }}
                  </span>
                </div>
              </div>

              <div class="task-action">
                <van-tag
                  :type="getStatusType(task.status)"
                  size="medium"
                >
                  {{ getStatusText(task.status) }}
                </van-tag>
              </div>
            </div>

            <div v-if="tasks.length > showLimit" class="show-more" @click="viewAllTasks">
              <span>查看全部任务 ({{ tasks.length }})</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 进度条展示 -->
      <van-cell class="progress-section" v-if="!loading && tasks.length > 0">
        <template #default>
          <div class="progress-container">
            <div class="progress-header">
              <span class="progress-label">完成进度</span>
              <span class="progress-percentage">{{ completionPercentage }}%</span>
            </div>
            <van-progress
              :percentage="completionPercentage"
              stroke-width="8"
              :color="progressColor"
              track-color="#f0f0f0"
            />
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  deadline: Date
  createTime: Date
  updateTime: Date
  assignee?: string
  progress?: number
}

interface Props {
  stats: TaskStats
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  stats: () => ({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  })
})

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

// 响应式数据
const loading = ref(true)
const tasks = ref<Task[]>([])
const showLimit = ref(3)

// 计算属性
const completionPercentage = computed(() => {
  if (props.stats.total === 0) return 0
  return Math.round((props.stats.completed / props.stats.total) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return '#07c160'
  if (percentage >= 60) return '#ff976a'
  return '#ee0a24'
})

const limitedTasks = computed(() =>
  tasks.value.slice(0, showLimit.value)
)

// 方法
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'play-circle-o'
    case 'pending':
      return 'clock-o'
    case 'overdue':
      return 'warning-o'
    case 'cancelled':
      return 'cross'
    default:
      return 'info-o'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'status-completed'
    case 'in_progress':
      return 'status-in-progress'
    case 'pending':
      return 'status-pending'
    case 'overdue':
      return 'status-overdue'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-default'
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
    case 'cancelled':
      return 'default'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '进行中'
    case 'pending':
      return '待开始'
    case 'overdue':
      return '已逾期'
    case 'cancelled':
      return '已取消'
    default:
      return '未知'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high':
      return '高'
    case 'medium':
      return '中'
    case 'low':
      return '低'
    default:
      return '普通'
  }
}

const formatDate = (date: Date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = targetDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    return '已过期'
  } else if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays <= 7) {
    return `${diffDays}天后`
  } else {
    return targetDate.toLocaleDateString('zh-CN')
  }
}

const handleTaskClick = (task: Task) => {
  router.push(`/mobile/teacher-center/tasks/detail/${task.id}`)
}

const viewAllTasks = () => {
  router.push('/mobile/teacher-center/tasks')
}

const loadTasks = async () => {
  try {
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockTasks: Task[] = [
      {
        id: '1',
        title: '准备春季运动会方案',
        description: '制定详细的运动会活动方案和安全措施',
        status: 'in_progress',
        priority: 'high',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updateTime: new Date(),
        progress: 60
      },
      {
        id: '2',
        title: '完成月度教学总结',
        description: '整理本月教学成果和改进建议',
        status: 'completed',
        priority: 'medium',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updateTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        progress: 100
      },
      {
        id: '3',
        title: '家长会准备工作',
        description: '准备家长会材料和演示文稿',
        status: 'pending',
        priority: 'high',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updateTime: new Date(),
        progress: 20
      },
      {
        id: '4',
        title: '学生评语填写',
        description: '为本班学生填写学期评语',
        status: 'overdue',
        priority: 'high',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        progress: 80
      },
      {
        id: '5',
        title: '教具整理和清点',
        description: '整理教室教具并做好清点记录',
        status: 'cancelled',
        priority: 'low',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        progress: 0
      }
    ]

    tasks.value = mockTasks.sort((a, b) =>
      new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    )

  } catch (error) {
    console.error('加载任务信息失败:', error)
    showToast('加载任务信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-task-overview-card {
  margin: var(--spacing-md) 16px;

  .task-overview-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    // 卡片头部样式
    .card-header {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%);
      cursor: pointer;

      &:active {
        background: linear-gradient(135deg, #ff5722 0%, #ff6b35 100%);
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .header-icon {
            font-size: var(--text-xl);
            color: white;
          }

          .header-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: white;
          }
        }

        .arrow-icon {
          color: white;
          font-size: var(--text-base);
          opacity: 0.8;
        }
      }
    }

    // 统计区域样式
    .stats-section {
      padding: var(--spacing-lg) 16px;

      .stats-grid {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .main-stat {
          flex: 0 0 auto;
          text-align: center;

          .stat-number {
            font-size: var(--text-4xl);
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            font-weight: 500;
          }
        }

        .divider {
          width: 1px;
          height: 40px;
          background: #ebedf0;
          margin: 0 20px;
        }

        .sub-stats {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);

          .sub-stat-item {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .stat-value {
              font-size: var(--text-lg);
              font-weight: 600;
              line-height: 1;

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

            .stat-desc {
              font-size: var(--text-xs);
              color: var(--text-secondary);
              font-weight: 500;
            }
          }
        }
      }
    }

    // 任务列表样式
    .tasks-section {
      padding: var(--spacing-md);

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);

        .task-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9ecef;
            transform: scale(0.98);
          }

          .task-status {
            margin-right: 12px;

            .status-icon {
              font-size: var(--text-base);

              &.status-completed {
                color: #07c160;
              }

              &.status-in-progress {
                color: #409eff;
              }

              &.status-pending {
                color: #ff976a;
              }

              &.status-overdue {
                color: #ee0a24;
              }

              &.status-cancelled {
                color: #969799;
              }
            }
          }

          .task-info {
            flex: 1;
            min-width: 0;

            .task-title {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .task-meta {
              display: flex;
              gap: var(--spacing-md);
              font-size: var(--text-xs);
              color: var(--text-secondary);

              .task-priority,
              .task-deadline {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);

                .van-icon {
                  font-size: var(--text-xs);
                }
              }
            }
          }

          .task-action {
            flex-shrink: 0;
            margin-left: 12px;
          }
        }

        .show-more {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          color: #ff6b35;
          font-size: var(--text-sm);
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;

          &:active {
            background: rgba(255, 107, 53, 0.1);
          }

          span {
            margin-right: 6px;
          }
        }
      }
    }

    // 进度条区域样式
    .progress-section {
      padding: var(--spacing-md);
      background: #f8f9fa;

      .progress-container {
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .progress-label {
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--text-primary);
          }

          .progress-percentage {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

// 加载和空状态
.loading-container,
.empty-state {
  padding: var(--spacing-xl) 16px;
  text-align: center;
}

// Vant组件样式覆盖
:deep(.van-cell-group) {
  background: white;
}

:deep(.van-cell) {
  padding: var(--spacing-md);

  &.card-header {
    padding: var(--spacing-md) 16px;
  }

  &.stats-section {
    padding: var(--spacing-lg) 16px;
  }

  &.tasks-section,
  &.progress-section {
    padding: var(--spacing-md) 16px;
  }

  &:active {
    background-color: transparent;
  }
}

:deep(.van-tag) {
  border-radius: 4px;
}

:deep(.van-progress) {
  .van-progress__portion {
    border-radius: 4px;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-task-overview-card {
    margin: var(--spacing-sm) 12px;

    .task-overview-card {
      .stats-section {
        padding: var(--spacing-md) 12px;

        .stats-grid {
          .main-stat {
            .stat-number {
              font-size: var(--text-3xl);
            }
          }

          .divider {
            margin: 0 16px;
            height: 36px;
          }

          .sub-stats {
            gap: 10px;

            .sub-stat-item {
              .stat-value {
                font-size: var(--text-base);
              }

              .stat-desc {
                font-size: 11px;
              }
            }
          }
        }
      }

      .tasks-section {
        padding: var(--spacing-md);

        .tasks-list {
          gap: 10px;

          .task-item {
            padding: 10px;

            .task-status {
              margin-right: 10px;
            }

            .task-info {
              .task-title {
                font-size: var(--text-sm);
              }

              .task-meta {
                gap: 10px;
                font-size: 11px;
              }
            }

            .task-action {
              margin-left: 10px;
            }
          }
        }
      }

      .progress-section {
        padding: var(--spacing-md);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-task-overview-card {
    .task-overview-card {
      background: var(--dark-card-bg);

      .stats-section {
        .stats-grid {
          .divider {
            background: var(--dark-border-color);
          }
        }
      }

      .tasks-section {
        .tasks-list {
          .task-item {
            background: var(--dark-bg-secondary);
          }
        }
      }

      .progress-section {
        background: var(--dark-bg-secondary);
      }
    }
  }
}
</style>