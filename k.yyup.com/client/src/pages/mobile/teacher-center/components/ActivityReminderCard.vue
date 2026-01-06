<template>
  <div class="mobile-activity-reminder-card">
    <van-cell-group inset class="reminder-card">
      <!-- 卡片头部 -->
      <van-cell class="card-header" @click="$emit('click')">
        <template #title>
          <div class="header-content">
            <div class="header-left">
              <van-icon name="calendar-o" class="header-icon" />
              <span class="header-title">活动提醒</span>
            </div>
            <van-badge
              :content="unreadCount"
              :show-zero="false"
              v-if="unreadCount > 0"
            >
              <van-icon name="bell" class="bell-icon" />
            </van-badge>
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

          <div v-else-if="reminders.length === 0" class="empty-state">
            <van-empty description="暂无活动提醒" />
          </div>

          <div v-else class="stats-grid">
            <div class="main-stat">
              <div class="stat-number">{{ stats.upcoming }}</div>
              <div class="stat-label">即将开始</div>
            </div>
            <div class="divider"></div>
            <div class="sub-stats">
              <div class="sub-stat-item">
                <div class="stat-value participating">{{ stats.participating }}</div>
                <div class="stat-desc">参与活动</div>
              </div>
              <div class="sub-stat-item">
                <div class="stat-value this-week">{{ stats.thisWeek }}</div>
                <div class="stat-desc">本周活动</div>
              </div>
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 活动列表 -->
      <van-cell class="reminders-section" v-if="!loading && reminders.length > 0">
        <template #default>
          <div class="reminders-list">
            <div
              v-for="reminder in limitedReminders"
              :key="reminder.id"
              class="reminder-item"
              @click="handleReminderClick(reminder)"
            >
              <div class="reminder-status">
                <van-icon
                  :name="getStatusIcon(reminder.status)"
                  :class="['status-icon', getStatusClass(reminder.status)]"
                />
              </div>

              <div class="reminder-content">
                <div class="reminder-title">{{ reminder.title }}</div>
                <div class="reminder-time">{{ formatTime(reminder.reminderTime) }}</div>
              </div>

              <div class="reminder-action">
                <van-icon name="arrow" />
              </div>
            </div>

            <div v-if="reminders.length > showLimit" class="show-more" @click="showAllReminders">
              <span>查看全部 ({{ reminders.length }})</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 提醒状态栏 -->
      <van-cell class="reminder-section" v-if="stats.upcoming > 0">
        <template #default>
          <div class="reminder-badge">
            <van-icon name="bell" class="reminder-icon" />
            <span class="reminder-text">有 {{ stats.upcoming }} 个活动即将开始</span>
          </div>
        </template>
      </van-cell>

      <!-- 无活动提醒 -->
      <van-cell class="no-reminder-section" v-else-if="!loading">
        <template #default>
          <div class="no-reminder">
            <van-icon name="info-o" class="no-reminder-icon" />
            <span class="no-reminder-text">暂无即将开始的活动</span>
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

interface ActivityStats {
  upcoming: number
  participating: number
  thisWeek: number
}

interface ActivityReminder {
  id: string
  title: string
  description?: string
  reminderTime: Date
  status: 'pending' | 'completed' | 'overdue'
  activityId?: string
  priority: 'high' | 'medium' | 'low'
}

interface Props {
  stats: ActivityStats
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  stats: () => ({
    upcoming: 0,
    participating: 0,
    thisWeek: 0
  })
})

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

// 响应式数据
const loading = ref(true)
const reminders = ref<ActivityReminder[]>([])
const showLimit = ref(3)

// 计算属性
const unreadCount = computed(() =>
  reminders.value.filter(r => r.status !== 'completed').length
)

const limitedReminders = computed(() =>
  reminders.value.slice(0, showLimit.value)
)

// 方法
const formatTime = (time: Date) => {
  const now = new Date()
  const reminderDate = new Date(time)
  const diffMs = reminderDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) {
    return '已过期'
  } else if (diffHours < 1) {
    return '即将开始'
  } else if (diffHours < 24) {
    return `${diffHours}小时后`
  } else if (diffDays < 7) {
    return `${diffDays}天后`
  } else {
    return reminderDate.toLocaleDateString('zh-CN')
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'clock-o'
    case 'overdue':
      return 'warning-o'
    default:
      return 'info-o'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'status-completed'
    case 'pending':
      return 'status-pending'
    case 'overdue':
      return 'status-overdue'
    default:
      return 'status-default'
  }
}

const handleReminderClick = (reminder: ActivityReminder) => {
  if (reminder.activityId) {
    router.push(`/mobile/teacher-center/activities/detail/${reminder.activityId}`)
  } else {
    showToast('活动详情暂未开放')
  }
}

const showAllReminders = () => {
  router.push('/mobile/teacher-center/notifications')
}

const loadReminders = async () => {
  try {
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockReminders: ActivityReminder[] = [
      {
        id: '1',
        title: '春季亲子运动会',
        description: '明天上午9点开始',
        reminderTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'pending',
        activityId: 'activity-1',
        priority: 'high'
      },
      {
        id: '2',
        title: '教师培训会议',
        description: '教学能力提升培训',
        reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'pending',
        activityId: 'activity-2',
        priority: 'medium'
      },
      {
        id: '3',
        title: '月末教学总结',
        description: '提交本月教学总结报告',
        reminderTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        activityId: 'activity-3',
        priority: 'low'
      },
      {
        id: '4',
        title: '家长开放日',
        description: '邀请家长参观课堂',
        reminderTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        activityId: 'activity-4',
        priority: 'high'
      }
    ]

    reminders.value = mockReminders.sort((a, b) =>
      new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime()
    )

  } catch (error) {
    console.error('加载活动提醒失败:', error)
    showToast('加载活动提醒失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReminders()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-reminder-card {
  margin: var(--spacing-md) 16px;

  .reminder-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    // 卡片头部样式
    .card-header {
      background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
      cursor: pointer;

      &:active {
        background: linear-gradient(135deg, #3a8ee6 0%, #5cadff 100%);
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

        .bell-icon {
          color: white;
          font-size: var(--text-lg);
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

              &.participating {
                color: #07c160;
              }

              &.this-week {
                color: #ff976a;
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

    // 活动列表样式
    .reminders-section {
      padding: var(--spacing-md);

      .reminders-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);

        .reminder-item {
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

          .reminder-status {
            margin-right: 12px;

            .status-icon {
              font-size: var(--text-base);

              &.status-completed {
                color: #07c160;
              }

              &.status-pending {
                color: #ff976a;
              }

              &.status-overdue {
                color: #ee0a24;
              }
            }
          }

          .reminder-content {
            flex: 1;
            min-width: 0;

            .reminder-title {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .reminder-time {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }
          }

          .reminder-action {
            color: #969799;
            font-size: var(--text-base);
          }
        }

        .show-more {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          color: #409eff;
          font-size: var(--text-sm);
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;

          &:active {
            background: rgba(64, 158, 255, 0.1);
          }

          span {
            margin-right: 6px;
          }
        }
      }
    }

    // 提醒区域样式
    .reminder-section {
      background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 100%);
      border-top: 1px solid #ffd666;

      .reminder-badge {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .reminder-icon {
          color: #fa8c16;
          font-size: var(--text-base);
          animation: pulse 2s infinite;
        }

        .reminder-text {
          font-size: var(--text-sm);
          color: #ad6800;
          font-weight: 500;
        }
      }
    }

    // 无提醒区域样式
    .no-reminder-section {
      background: #f8f9fa;
      border-top: 1px solid #ebedf0;

      .no-reminder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);

        .no-reminder-icon {
          color: #969799;
          font-size: var(--text-base);
        }

        .no-reminder-text {
          font-size: var(--text-sm);
          color: #969799;
          font-weight: 500;
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

  &.reminders-section,
  &.reminder-section,
  &.no-reminder-section {
    padding: var(--spacing-md) 16px;
  }

  &:active {
    background-color: transparent;
  }
}

// 动画效果
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-activity-reminder-card {
    margin: var(--spacing-sm) 12px;

    .reminder-card {
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
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-activity-reminder-card {
    .reminder-card {
      background: var(--dark-card-bg);

      .stats-section {
        .stats-grid {
          .divider {
            background: var(--dark-border-color);
          }
        }
      }

      .reminders-section {
        .reminders-list {
          .reminder-item {
            background: var(--dark-bg-secondary);
          }
        }
      }

      .no-reminder-section {
        background: var(--dark-bg-secondary);
        border-top-color: var(--dark-border-color);
      }
    }
  }
}
</style>