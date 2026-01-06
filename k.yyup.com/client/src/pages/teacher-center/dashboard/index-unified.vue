<template>
  <UnifiedCenterLayout
    title="教师工作台"
    :description="`今天是 ${currentDate}，祝您工作愉快！`"
    :icon="User"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleQuickAction('clock-in')">
        <UnifiedIcon name="default" />
        快速打卡
      </el-button>
      <el-button @click="refreshDashboard">
        <UnifiedIcon name="Refresh" />
        刷新数据
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <el-col :xs="24" :sm="12" :md="6">
        <TaskOverviewCard
          :stats="dashboardStats.tasks"
          @click="navigateTo('/teacher-center/tasks')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <ClassOverviewCard
          :stats="dashboardStats.classes"
          @click="navigateTo('/teacher-center/teaching')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <ActivityReminderCard
          :stats="dashboardStats.activities"
          @click="navigateTo('/teacher-center/activities')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <NotificationCard
          :stats="dashboardStats.notifications"
          @click="navigateTo('/teacher-center/notifications')"
        />
      </el-col>
    </template>

    <!-- 主要内容区域 -->
    <el-row :gutter="20">
      <!-- 左侧：今日任务和课程安排 -->
      <el-col :xs="24" :lg="16">
        <div class="content-section">
          <!-- 今日任务 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <UnifiedIcon name="default" />
                  今日任务
                </span>
                <el-button text type="primary" @click="navigateTo('/teacher-center/tasks')">
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="task-list">
              <div
                v-for="task in todayTasks"
                :key="task.id"
                class="task-item"
                :class="{ 'completed': task.completed }"
              >
                <div class="task-icon">
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                </div>
                <div class="task-content">
                  <h4>{{ task.title }}</h4>
                  <p>{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="task-time">{{ task.time }}</span>
                    <el-tag
                      :type="task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'"
                      size="small"
                    >
                      {{ task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '普通' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧：课程安排和通知 -->
      <el-col :xs="24" :lg="8">
        <div class="sidebar-content">
          <!-- 课程安排 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <UnifiedIcon name="default" />
                  课程安排
                </span>
                <el-button text type="primary" @click="navigateTo('/teacher-center/teaching')">
                  查看课程表
                </el-button>
              </div>
            </template>
            <div class="schedule-list">
              <div
                v-for="schedule in todaySchedule"
                :key="schedule.id"
                class="schedule-item"
              >
                <div class="schedule-time">{{ schedule.time }}</div>
                <div class="schedule-content">
                  <h4>{{ schedule.class }}</h4>
                  <p>{{ schedule.subject }}</p>
                  <div class="schedule-location">
                    <UnifiedIcon name="default" />
                    {{ schedule.location }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 最新通知 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <UnifiedIcon name="default" />
                  最新通知
                </span>
                <el-button text type="primary" @click="navigateTo('/teacher-center/notifications')">
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="notification-list">
              <div
                v-for="notification in recentNotifications"
                :key="notification.id"
                class="notification-item"
              >
                <div class="notification-icon">
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                </div>
                <div class="notification-content">
                  <h4>{{ notification.title }}</h4>
                  <p>{{ notification.content }}</p>
                  <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Clock, Refresh, List, VideoCamera, Reading, Document, Calendar, LocationInformation, Bell, Setting, ChatLineSquare } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import TaskOverviewCard from '../components/TaskOverviewCard.vue'
import ClassOverviewCard from '../components/ClassOverviewCard.vue'
import ActivityReminderCard from '../components/ActivityReminderCard.vue'
import NotificationCard from '../components/NotificationCard.vue'
import { formatDistanceToNow } from '@/utils/date'

interface Task {
  id: number
  title: string
  description: string
  type: 'meeting' | 'teaching' | 'parent' | 'default'
  time: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

interface Schedule {
  id: number
  time: string
  class: string
  subject: string
  location: string
}

interface Notification {
  id: number
  title: string
  content: string
  type: 'system' | 'task' | 'message'
  timestamp: number
}

const router = useRouter()

// 响应式数据
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const teacherInfo = ref({
  name: '张老师',
  avatar: '',
  department: '大班'
})

const dashboardStats = ref({
  tasks: {
    total: 12,
    completed: 8,
    pending: 4,
    urgent: 2
  },
  classes: {
    total: 4,
    today: 3,
    students: 92,
    avgAttendance: 95
  },
  activities: {
    total: 8,
    thisWeek: 3,
    upcoming: 2,
    participated: 15
  },
  notifications: {
    total: 15,
    unread: 5,
    system: 3,
    task: 2
  }
})

const todayTasks = ref<Task[]>([
  {
    id: 1,
    title: '晨间活动',
    description: '组织幼儿进行晨间体操活动',
    type: 'teaching',
    time: '08:00',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: '家长会议',
    description: '与家长代表讨论本月的活动安排',
    type: 'meeting',
    time: '10:00',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: '准备午餐',
    description: '检查并准备幼儿午餐',
    type: 'default',
    time: '11:30',
    priority: 'medium',
    completed: true
  },
  {
    id: 4,
    title: '午睡巡视',
    description: '检查幼儿午睡情况',
    type: 'teaching',
    time: '12:30',
    priority: 'low',
    completed: false
  }
])

const todaySchedule = ref<Schedule[]>([
  {
    id: 1,
    time: '09:00 - 09:30',
    class: '大班A组',
    subject: '语言表达课',
    location: '教学楼201教室'
  },
  {
    id: 2,
    time: '10:00 - 10:30',
    class: '大班B组',
    subject: '数学游戏课',
    location: '活动中心大厅'
  },
  {
    id: 3,
    time: '14:30 - 15:00',
    class: '大班全体',
    subject: '音乐律动课',
    location: '多功能厅'
  }
])

const recentNotifications = ref<Notification[]>([
  {
    id: 1,
    title: '系统维护通知',
    content: '系统将于今晚22:00进行维护升级',
    type: 'system',
    timestamp: Date.now() - 3600000
  },
  {
    id: 2,
    title: '新任务提醒',
    content: '您有一个新的教学任务待完成',
    type: 'task',
    timestamp: Date.now() - 1800000
  },
  {
    id: 3,
    title: '家长留言',
    content: '小明妈妈询问孩子最近的表现情况',
    type: 'message',
    timestamp: Date.now() - 900000
  }
])

// 方法定义
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'clock-in':
      ElMessage.success('打卡成功！工作愉快~')
      break
    default:
      ElMessage.info('执行操作: ' + action)
  }
}

const refreshDashboard = () => {
  ElMessage.success('数据已刷新')
  // 这里可以添加实际的数据刷新逻辑
}

const navigateTo = (path: string) => {
  router.push(path)
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

onMounted(() => {
  // 可以在这里加载实际数据
  console.log('教师仪表板已挂载')
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.content-section {
  margin-bottom: var(--spacing-xl);
}

.section-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-min-height: 60px; height: auto;
  overflow-y: auto;

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &.completed {
      opacity: 0.6;
      background-color: var(--el-fill-color-light);
    }

    .task-icon {
      flex-shrink: 0;
      font-size: 1.2em;
      color: var(--el-color-primary);
    }

    .task-content {
      flex: 1;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-regular);
        line-height: 1.4;
      }

      .task-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--spacing-sm);

        .task-time {
          font-size: var(--text-xs);
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    max-min-height: 60px; height: auto;
    overflow-y: auto;

    .schedule-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--radius-sm);

      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .schedule-time {
        flex-shrink: 0;
        font-weight: 500;
        color: var(--el-color-primary);
        min-width: auto;
      }

      .schedule-content {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-sm);
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-xs);
          color: var(--el-text-color-regular);
        }

        .schedule-location {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-min-height: 60px; height: auto;
  overflow-y: auto;

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .notification-icon {
      flex-shrink: 0;
      font-size: 1.2em;
      color: var(--el-color-primary);
    }

    .notification-content {
      flex: 1;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-xs);
        color: var(--el-text-color-regular);
        line-height: 1.4;
      }

      .notification-time {
        margin-top: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .content-section,
  .sidebar-content {
    .section-card {
      margin-bottom: var(--spacing-md);
    }
  }
}
</style>