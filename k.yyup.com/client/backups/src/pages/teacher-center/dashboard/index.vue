<template>
  <UnifiedCenterLayout
    title="教师工作台"
    :description="descriptionText"
    icon="user"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleQuickAction('clock-in')">
        <UnifiedIcon name="clock" :size="16" />
        快速打卡
      </el-button>
      <el-button @click="refreshDashboard">
        <UnifiedIcon name="refresh" :size="16" />
        刷新数据
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <el-col :xs="24" :sm="12" :md="6">
        <el-skeleton v-if="loading.dashboard" :loading="loading.dashboard" animated>
          <template #template>
            <el-card>
              <div style="padding: var(--spacing-5xl);">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: var(--spacing-2xl);" />
                <el-skeleton-item variant="text" style="width: 60%; height: var(--spacing-md);" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
        <TaskOverviewCard
          v-else
          :stats="dashboardStats.tasks"
          @click="navigateTo('/teacher-center/tasks')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-skeleton v-if="loading.dashboard" :loading="loading.dashboard" animated>
          <template #template>
            <el-card>
              <div style="padding: var(--spacing-5xl);">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: var(--spacing-2xl);" />
                <el-skeleton-item variant="text" style="width: 60%; height: var(--spacing-md);" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
        <ClassOverviewCard
          v-else
          :stats="dashboardStats.classes"
          @click="navigateTo('/teacher-center/teaching')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-skeleton v-if="loading.dashboard" :loading="loading.dashboard" animated>
          <template #template>
            <el-card>
              <div style="padding: var(--spacing-5xl);">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: var(--spacing-2xl);" />
                <el-skeleton-item variant="text" style="width: 60%; height: var(--spacing-md);" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
        <ActivityReminderCard
          v-else
          :stats="dashboardStats.activities"
          @click="navigateTo('/teacher-center/activities')"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-skeleton v-if="loading.dashboard" :loading="loading.dashboard" animated>
          <template #template>
            <el-card>
              <div style="padding: var(--spacing-5xl);">
                <el-skeleton-item variant="text" style="width: 80%; height: 20px; margin-bottom: var(--spacing-2xl);" />
                <el-skeleton-item variant="text" style="width: 60%; height: var(--spacing-md);" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
        <NotificationCard
          v-else
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
                  <el-icon><List /></el-icon>
                  今日任务
                </span>
                <el-button text type="primary" @click="navigateTo('/teacher-center/tasks')">
                  查看全部
                </el-button>
              </div>
            </template>
            <div v-if="loading.tasks" class="loading-container">
              <el-skeleton :loading="loading.tasks" animated :count="4">
                <template #template>
                  <div style="margin-bottom: var(--spacing-4xl); padding: var(--spacing-4xl); border: var(--border-width-base) solid #f0f0f0; border-radius: var(--spacing-sm);">
                    <el-skeleton-item variant="text" style="width: 20%; height: 20px; margin-bottom: var(--spacing-2xl);" />
                    <el-skeleton-item variant="text" style="width: 80%; height: var(--spacing-md); margin-bottom: var(--spacing-base);" />
                    <el-skeleton-item variant="text" style="width: 60%; height: 1var(--spacing-xs);" />
                  </div>
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="error.tasks" class="error-container">
              <el-empty description="加载任务失败" :image-size="100">
                <el-button type="primary" @click="loadTodayTasks">重试</el-button>
              </el-empty>
            </div>
            <div v-else-if="todayTasks.length === 0" class="empty-container">
              <el-empty description="暂无今日任务" :image-size="100" />
            </div>
            <div v-else class="task-list">
              <div
                v-for="task in todayTasks"
                :key="task.id"
                class="task-item"
                :class="{ 'completed': task.completed }"
              >
                <div class="task-icon">
                  <el-icon v-if="task.type === 'meeting'"><VideoCamera /></el-icon>
                  <el-icon v-else-if="task.type === 'teaching'"><Reading /></el-icon>
                  <el-icon v-else-if="task.type === 'parent'"><User /></el-icon>
                  <el-icon v-else><Document /></el-icon>
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
                  <el-icon><Calendar /></el-icon>
                  课程安排
                </span>
                <el-button text type="primary" @click="navigateTo('/teacher-center/teaching')">
                  查看课程表
                </el-button>
              </div>
            </template>
            <div v-if="loading.schedule" class="loading-container">
              <el-skeleton :loading="loading.schedule" animated :count="3">
                <template #template>
                  <div style="margin-bottom: var(--spacing-4xl); padding: var(--spacing-4xl); border: var(--border-width-base) solid #f0f0f0; border-radius: var(--spacing-sm);">
                    <el-skeleton-item variant="text" style="width: 30%; height: 1var(--spacing-sm); margin-bottom: var(--spacing-2xl);" />
                    <el-skeleton-item variant="text" style="width: 70%; height: var(--spacing-md); margin-bottom: var(--spacing-base);" />
                    <el-skeleton-item variant="text" style="width: 50%; height: 1var(--spacing-xs);" />
                  </div>
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="error.schedule" class="error-container">
              <el-empty description="加载课程安排失败" :image-size="100">
                <el-button type="primary" @click="loadTodaySchedule">重试</el-button>
              </el-empty>
            </div>
            <div v-else-if="todaySchedule.length === 0" class="empty-container">
              <el-empty description="暂无今日课程" :image-size="100" />
            </div>
            <div v-else class="schedule-list">
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
                    <el-icon><LocationInformation /></el-icon>
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
                  <el-icon><Bell /></el-icon>
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
                  <el-icon v-if="notification.type === 'system'"><Setting /></el-icon>
                  <el-icon v-else-if="notification.type === 'task'"><List /></el-icon>
                  <el-icon v-else><ChatLineSquare /></el-icon>
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
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import TaskOverviewCard from './components/TaskOverviewCard.vue'
import ClassOverviewCard from './components/ClassOverviewCard.vue'
import ActivityReminderCard from './components/ActivityReminderCard.vue'
import NotificationCard from './components/NotificationCard.vue'
import { formatDistanceToNow } from '@/utils/date'
import {
  getDashboardStatistics,
  getTodayTasks,
  getTodaySchedule,
  getRecentNotifications
} from '@/api/modules/teacher-dashboard'

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

const descriptionText = computed(() => {
  return `今天是 ${currentDate}，祝您工作愉快！`
})

// 加载和错误状态
const loading = ref({
  dashboard: false,
  tasks: false,
  schedule: false,
  notifications: false
})

const error = ref({
  dashboard: '',
  tasks: '',
  schedule: '',
  notifications: ''
})

const teacherInfo = ref({
  name: '张老师',
  avatar: '',
  department: '大班'
})

const dashboardStats = ref({
  tasks: {
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0
  },
  classes: {
    total: 0,
    today: 0,
    students: 0,
    avgAttendance: 0
  },
  activities: {
    total: 0,
    thisWeek: 0,
    upcoming: 0,
    participated: 0
  },
  notifications: {
    total: 0,
    unread: 0,
    system: 0,
    task: 0
  }
})

const todayTasks = ref<Task[]>([])

const todaySchedule = ref<Schedule[]>([])

const recentNotifications = ref<Notification[]>([])

// API数据加载函数
const loadDashboardData = async () => {
  try {
    loading.value.dashboard = true
    error.value.dashboard = ''
    const response = await getDashboardStatistics()
    if (response.success && response.data) {
      dashboardStats.value = response.data
    } else {
      throw new Error(response.message || '获取仪表板数据失败')
    }
  } catch (err: any) {
    console.error('加载仪表板数据失败:', err)
    error.value.dashboard = err.message || '加载失败'
    ElMessage.error('加载仪表板数据失败，请稍后重试')
  } finally {
    loading.value.dashboard = false
  }
}

const loadTodayTasks = async () => {
  try {
    loading.value.tasks = true
    error.value.tasks = ''
    const response = await getTodayTasks()
    if (response.success && response.data) {
      todayTasks.value = response.data
    } else {
      throw new Error(response.message || '获取今日任务失败')
    }
  } catch (err: any) {
    console.error('加载今日任务失败:', err)
    error.value.tasks = err.message || '加载失败'
    ElMessage.error('加载今日任务失败，请稍后重试')
  } finally {
    loading.value.tasks = false
  }
}

const loadTodaySchedule = async () => {
  try {
    loading.value.schedule = true
    error.value.schedule = ''
    const response = await getTodaySchedule()
    if (response.success && response.data) {
      todaySchedule.value = response.data
    } else {
      throw new Error(response.message || '获取课程安排失败')
    }
  } catch (err: any) {
    console.error('加载课程安排失败:', err)
    error.value.schedule = err.message || '加载失败'
    ElMessage.error('加载课程安排失败，请稍后重试')
  } finally {
    loading.value.schedule = false
  }
}

const loadRecentNotifications = async () => {
  try {
    loading.value.notifications = true
    error.value.notifications = ''
    const response = await getRecentNotifications()
    if (response.success && response.data) {
      recentNotifications.value = response.data
    } else {
      throw new Error(response.message || '获取通知失败')
    }
  } catch (err: any) {
    console.error('加载通知失败:', err)
    error.value.notifications = err.message || '加载失败'
    ElMessage.error('加载通知失败，请稍后重试')
  } finally {
    loading.value.notifications = false
  }
}

const loadAllData = async () => {
  await Promise.all([
    loadDashboardData(),
    loadTodayTasks(),
    loadTodaySchedule(),
    loadRecentNotifications()
  ])
}

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

const refreshDashboard = async () => {
  try {
    await loadAllData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败，请稍后重试')
  }
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
  console.log('教师仪表板已挂载')
  loadAllData()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

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
  max-height: 400px;
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
    max-height: 300px;
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
        min-width: 80px;
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
  max-height: 250px;
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