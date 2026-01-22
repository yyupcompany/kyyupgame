<template>
  <UnifiedCenterLayout
    title="教师工作台"
    :description="descriptionText"
    icon="user"
    :show-header="true"
    :show-title="true"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleQuickAction('clock-in')" class="action-btn">
        <UnifiedIcon name="clock" :size="16" />
        快速打卡
      </el-button>
      <el-button @click="refreshDashboard" class="action-btn">
        <UnifiedIcon name="refresh" :size="16" />
        刷新数据
      </el-button>
    </template>

    <!-- 统计卡片区域 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <!-- 任务统计卡片 -->
      <StatCard
        v-if="!loading.dashboard"
        icon="task"
        :title="t('teacher.dashboard.tasks')"
        :value="dashboardStats.tasks.total"
        :subtitle="`${t('teacher.dashboard.pending')}: ${dashboardStats.tasks.pending}`"
        type="primary"
        :trend="dashboardStats.tasks.pending > 0 ? 'up' : 'stable'"
        clickable
        @click="navigateTo('/teacher-center/tasks')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <!-- 班级统计卡片 -->
      <StatCard
        v-if="!loading.dashboard"
        icon="classes"
        :title="t('teacher.dashboard.classes')"
        :value="dashboardStats.classes.total"
        :subtitle="`${t('teacher.dashboard.todayClasses')}: ${dashboardStats.classes.today}`"
        type="success"
        :trend="dashboardStats.classes.today > 0 ? 'up' : 'stable'"
        clickable
        @click="navigateTo('/teacher-center/teaching')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <!-- 活动统计卡片 -->
      <StatCard
        v-if="!loading.dashboard"
        icon="activities"
        :title="t('teacher.dashboard.activities')"
        :value="dashboardStats.activities.upcoming"
        :subtitle="`${t('teacher.dashboard.thisWeek')}: ${dashboardStats.activities.thisWeek}`"
        type="warning"
        :trend="dashboardStats.activities.upcoming > 0 ? 'up' : 'stable'"
        clickable
        @click="navigateTo('/teacher-center/activities')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <!-- 通知统计卡片 -->
      <StatCard
        v-if="!loading.dashboard"
        icon="notifications"
        :title="t('teacher.dashboard.notifications')"
        :value="dashboardStats.notifications.total"
        :subtitle="`${t('teacher.dashboard.unread')}: ${dashboardStats.notifications.unread}`"
        type="info"
        :trend="dashboardStats.notifications.unread > 0 ? 'up' : 'stable'"
        clickable
        @click="navigateTo('/teacher-center/notifications')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>
    </template>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <el-row :gutter="24" class="content-row">
        <!-- 左侧：今日任务和课程安排 -->
        <el-col :xs="24" :lg="16">
          <div class="content-section">
            <!-- 今日任务 -->
            <el-card class="section-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <div class="card-title-wrapper">
                    <UnifiedIcon name="task" :size="20" class="card-icon" />
                    <span class="card-title">{{ t('teacher.dashboard.todayTasks') }}</span>
                  </div>
                  <el-button type="primary" link @click="navigateTo('/teacher-center/tasks')">
                    <UnifiedIcon name="chevron-right" :size="16" />
                    {{ t('common.viewAll') }}
                  </el-button>
                </div>
              </template>
              <div v-if="loading.tasks" class="loading-container">
                <el-skeleton :loading="loading.tasks" animated :count="3">
                  <template #template>
                    <div class="skeleton-item">
                      <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
                      <div class="skeleton-text">
                        <el-skeleton-item variant="text" style="width: 60%;" />
                        <el-skeleton-item variant="text" style="width: 80%;" />
                        <el-skeleton-item variant="text" style="width: 40%;" />
                      </div>
                    </div>
                  </template>
                </el-skeleton>
              </div>
              <div v-else-if="error.tasks" class="error-container">
                <el-empty :description="t('teacher.dashboard.loadTasksFailed')" :image-size="80">
                  <el-button type="primary" @click="loadTodayTasks">{{ t('common.retry') }}</el-button>
                </el-empty>
              </div>
              <div v-else-if="todayTasks.length === 0" class="empty-container">
                <UnifiedIcon name="check" :size="48" class="empty-icon" />
                <p class="empty-text">{{ t('teacher.dashboard.noTasksToday') }}</p>
              </div>
              <div v-else class="task-list">
                <TransitionGroup name="task-list" tag="div">
                  <div
                    v-for="task in todayTasks"
                    :key="task.id"
                    class="task-item"
                    :class="{ 'completed': task.completed }"
                    @click="handleTaskClick(task)"
                  >
                    <div class="task-icon" :class="getTaskTypeClass(task.type)">
                      <UnifiedIcon :name="getTaskIcon(task.type)" :size="20" />
                    </div>
                    <div class="task-content">
                      <h4 class="task-title">{{ task.title }}</h4>
                      <p class="task-description">{{ task.description }}</p>
                      <div class="task-meta">
                        <span class="task-time">
                          <UnifiedIcon name="clock" :size="12" />
                          {{ task.time }}
                        </span>
                        <el-tag
                          :type="getPriorityType(task.priority)"
                          size="small"
                          effect="light"
                        >
                          {{ getPriorityText(task.priority) }}
                        </el-tag>
                      </div>
                    </div>
                    <UnifiedIcon
                      :name="task.completed ? 'check' : 'chevron-right'"
                      :size="18"
                      class="task-arrow"
                    />
                  </div>
                </TransitionGroup>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧：课程安排和通知 -->
        <el-col :xs="24" :lg="8">
          <div class="sidebar-content">
            <!-- 课程安排 -->
            <el-card class="section-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <div class="card-title-wrapper">
                    <UnifiedIcon name="schedule" :size="20" class="card-icon" />
                    <span class="card-title">{{ t('teacher.dashboard.todaySchedule') }}</span>
                  </div>
                  <el-button type="primary" link @click="navigateTo('/teacher-center/teaching')">
                    <UnifiedIcon name="chevron-right" :size="16" />
                  </el-button>
                </div>
              </template>
              <div v-if="loading.schedule" class="loading-container">
                <el-skeleton :loading="loading.schedule" animated :count="3">
                  <template #template>
                    <div class="skeleton-item schedule-skeleton">
                      <el-skeleton-item variant="text" style="width: 30%; height: var(--spacing-2xl);" />
                      <el-skeleton-item variant="text" style="width: 70%; margin-top: var(--spacing-sm);" />
                      <el-skeleton-item variant="text" style="width: 50%; margin-top: var(--spacing-sm);" />
                    </div>
                  </template>
                </el-skeleton>
              </div>
              <div v-else-if="error.schedule" class="error-container">
                <el-empty :description="t('teacher.dashboard.loadScheduleFailed')" :image-size="60">
                  <el-button type="primary" size="small" @click="loadTodaySchedule">{{ t('common.retry') }}</el-button>
                </el-empty>
              </div>
              <div v-else-if="todaySchedule.length === 0" class="empty-container schedule-empty">
                <UnifiedIcon name="calendar" :size="40" class="empty-icon" />
                <p class="empty-text">{{ t('teacher.dashboard.noCoursesToday') }}</p>
              </div>
              <div v-else class="schedule-list">
                <TransitionGroup name="schedule-list" tag="div">
                  <div
                    v-for="schedule in todaySchedule"
                    :key="schedule.id"
                    class="schedule-item"
                    @click="handleScheduleClick(schedule)"
                  >
                    <div class="schedule-time-block">
                      <span class="schedule-time">{{ schedule.time }}</span>
                    </div>
                    <div class="schedule-content">
                      <h4 class="schedule-class">{{ schedule.class }}</h4>
                      <p class="schedule-subject">{{ schedule.subject }}</p>
                      <div class="schedule-location">
                        <UnifiedIcon name="location" :size="12" />
                        {{ schedule.location }}
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </el-card>

            <!-- 最新通知 -->
            <el-card class="section-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <div class="card-title-wrapper">
                    <UnifiedIcon name="notifications" :size="20" class="card-icon" />
                    <span class="card-title">{{ t('teacher.dashboard.latestNotifications') }}</span>
                  </div>
                  <el-badge :value="unreadCount" :hidden="unreadCount === 0" type="danger">
                    <el-button type="primary" link @click="navigateTo('/teacher-center/notifications')">
                      <UnifiedIcon name="chevron-right" :size="16" />
                    </el-button>
                  </el-badge>
                </div>
              </template>
              <div v-if="loading.notifications" class="loading-container">
                <el-skeleton :loading="loading.notifications" animated :count="3">
                  <template #template>
                    <div class="skeleton-item">
                      <el-skeleton-item variant="circle" style="width: 36px; height: 36px;" />
                      <div class="skeleton-text">
                        <el-skeleton-item variant="text" style="width: 70%;" />
                        <el-skeleton-item variant="text" style="width: 90%;" />
                        <el-skeleton-item variant="text" style="width: 50%;" />
                      </div>
                    </div>
                  </template>
                </el-skeleton>
              </div>
              <div v-else-if="error.notifications" class="error-container">
                <el-empty :description="t('teacher.dashboard.loadNotificationsFailed')" :image-size="60">
                  <el-button type="primary" size="small" @click="loadRecentNotifications">{{ t('common.retry') }}</el-button>
                </el-empty>
              </div>
              <div v-else class="notification-list">
                <TransitionGroup name="notification-list" tag="div">
                  <div
                    v-for="notification in recentNotifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'unread': !notification.read }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-icon" :class="getNotificationTypeClass(notification.type)">
                      <UnifiedIcon :name="getNotificationIcon(notification.type)" :size="16" />
                    </div>
                    <div class="notification-content">
                      <h4 class="notification-title">{{ notification.title }}</h4>
                      <p class="notification-preview">{{ notification.content }}</p>
                      <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                    </div>
                    <div v-if="!notification.read" class="unread-dot"></div>
                  </div>
                </TransitionGroup>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 中文翻译映射
const t = (key: string) => {
  const translations: Record<string, string> = {
    // 统计卡片
    'teacher.dashboard.tasks': '任务数',
    'teacher.dashboard.classes': '班级数',
    'teacher.dashboard.activities': '活动数',
    'teacher.dashboard.notifications': '通知数',
    'teacher.dashboard.pending': '待处理',
    'teacher.dashboard.todayClasses': '今日课程',
    'teacher.dashboard.thisWeek': '本周',
    'teacher.dashboard.unread': '未读',
    // 内容区域
    'teacher.dashboard.todayTasks': '今日任务',
    'teacher.dashboard.todaySchedule': '今日课程',
    'teacher.dashboard.latestNotifications': '最新通知',
    'teacher.dashboard.noTasksToday': '暂无任务',
    'teacher.dashboard.noCoursesToday': '今日暂无课程',
    // 错误提示
    'teacher.dashboard.loadTasksFailed': '加载任务失败',
    'teacher.dashboard.loadScheduleFailed': '加载课程失败',
    'teacher.dashboard.loadNotificationsFailed': '加载通知失败',
    'teacher.dashboard.loadStatsFailed': '加载数据失败',
    'teacher.dashboard.refreshFailed': '刷新失败',
    'teacher.dashboard.dataRefreshed': '数据已刷新',
    // 优先级
    'teacher.dashboard.priorityHigh': '高',
    'teacher.dashboard.priorityMedium': '中',
    'teacher.dashboard.priorityLow': '低',
    'teacher.dashboard.priorityNormal': '普通',
    // 操作
    'common.viewAll': '查看全部',
    'common.retry': '重试',
    // 时间
    'teacher.dashboard.daysAgo': '{days} 天前',
    'teacher.dashboard.hoursAgo': '{hours} 小时前',
    'teacher.dashboard.minutesAgo': '{minutes} 分钟前',
    'teacher.dashboard.justNow': '刚刚',
    // 其他
    'teacher.dashboard.clockInSuccess': '打卡成功',
    'teacher.dashboard.actionExecuted': '操作已执行',
  }
  return translations[key] || key
}
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'
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
  read: boolean
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
  return `今天是 ${currentDate.value}，祝您工作愉快！`
})

// 计算未读通知数量
const unreadCount = computed(() => {
  return recentNotifications.value.filter(n => !n.read).length
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

// 任务类型图标映射
const taskIconMap: Record<string, string> = {
  meeting: 'messages',
  teaching: 'book-open',
  parent: 'user',
  default: 'task'
}

// 任务类型样式类映射
const taskTypeClassMap: Record<string, string> = {
  meeting: 'type-meeting',
  teaching: 'type-teaching',
  parent: 'type-parent',
  default: 'type-default'
}

// 通知类型图标映射
const notificationIconMap: Record<string, string> = {
  system: 'info',
  task: 'task',
  message: 'message-circle'
}

// 通知类型样式类映射
const notificationTypeClassMap: Record<string, string> = {
  system: 'type-system',
  task: 'type-task',
  message: 'type-message'
}

// 获取任务图标
const getTaskIcon = (type: string): string => {
  return taskIconMap[type] || 'task'
}

// 获取任务类型样式类
const getTaskTypeClass = (type: string): string => {
  return taskTypeClassMap[type] || 'type-default'
}

// 获取通知图标
const getNotificationIcon = (type: string): string => {
  return notificationIconMap[type] || 'info'
}

// 获取通知类型样式类
const getNotificationTypeClass = (type: string): string => {
  return notificationTypeClassMap[type] || 'type-system'
}

// 获取优先级类型
const getPriorityType = (priority: string): string => {
  const map: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    high: t('teacher.dashboard.priorityHigh'),
    medium: t('teacher.dashboard.priorityMedium'),
    low: t('teacher.dashboard.priorityLow')
  }
  return map[priority] || t('teacher.dashboard.priorityNormal')
}

// 点击任务
const handleTaskClick = (task: Task) => {
  navigateTo(`/teacher-center/tasks?id=${task.id}`)
}

// 点击课程
const handleScheduleClick = (schedule: Schedule) => {
  navigateTo(`/teacher-center/teaching?scheduleId=${schedule.id}`)
}

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  navigateTo(`/teacher-center/notifications?id=${notification.id}`)
}

// API数据加载函数
const loadDashboardData = async () => {
  try {
    loading.value.dashboard = true
    error.value.dashboard = ''
    const response = await getDashboardStatistics()
    if (response.success && response.data) {
      // 适配不同数据格式
      const stats = response.data.stats || response.data
      dashboardStats.value = {
        tasks: {
          total: stats.tasks?.total || 0,
          completed: stats.tasks?.completed || 0,
          pending: stats.tasks?.pending || 0,
          urgent: stats.tasks?.overdue || 0
        },
        classes: {
          total: stats.classes?.total || 0,
          today: stats.classes?.todayClasses || 0,
          students: stats.classes?.studentsCount || 0,
          avgAttendance: stats.classes?.completionRate || 0
        },
        activities: {
          total: stats.activities?.total || 0,
          thisWeek: stats.activities?.thisWeek || 0,
          upcoming: stats.activities?.upcoming || 0,
          participated: stats.activities?.participating || 0
        },
        notifications: {
          total: stats.notifications?.total || 0,
          unread: stats.notifications?.unread || 0,
          system: 0,
          task: 0
        }
      }
    }
  } catch (err: any) {
    console.error('加载仪表板数据失败:', err)
    error.value.dashboard = err.message || '加载失败'
    ElMessage.error(t('teacher.dashboard.loadStatsFailed'))
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
      todayTasks.value = (response.data as any[]).map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || '任务标题',
        description: item.description || '任务描述',
        type: item.type || 'default',
        time: item.deadline || '09:00',
        priority: item.priority || 'medium',
        completed: item.completed || false
      }))
    }
  } catch (err: any) {
    console.error('加载今日任务失败:', err)
    error.value.tasks = err.message || '加载失败'
    ElMessage.error(t('teacher.dashboard.loadTasksFailed'))
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
      todaySchedule.value = (response.data as any[]).map((item, index) => ({
        id: item.id || index + 1,
        time: item.time || '08:00',
        class: item.className || item.class || '班级名称',
        subject: item.subject || '课程名称',
        location: item.location || '教室'
      }))
    }
  } catch (err: any) {
    console.error('加载课程安排失败:', err)
    error.value.schedule = err.message || '加载失败'
    ElMessage.error(t('teacher.dashboard.loadScheduleFailed'))
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
      recentNotifications.value = (response.data as any[]).map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || '通知标题',
        content: item.content || item.createdAt || '通知内容',
        type: item.type || 'system',
        timestamp: new Date(item.createdAt || Date.now()).getTime(),
        read: item.read || false
      }))
    }
  } catch (err: any) {
    console.error('加载通知失败:', err)
    error.value.notifications = err.message || '加载失败'
    ElMessage.error(t('teacher.dashboard.loadNotificationsFailed'))
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
      ElMessage.success(t('teacher.dashboard.clockInSuccess'))
      break
    default:
      ElMessage.info(t('teacher.dashboard.actionExecuted', { action }))
  }
}

const refreshDashboard = async () => {
  try {
    await loadAllData()
    ElMessage.success(t('teacher.dashboard.dataRefreshed'))
  } catch (error) {
    ElMessage.error(t('teacher.dashboard.refreshFailed'))
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
    return t('teacher.dashboard.daysAgo', { days })
  } else if (hours > 0) {
    return t('teacher.dashboard.hoursAgo', { hours })
  } else if (minutes > 0) {
    return t('teacher.dashboard.minutesAgo', { minutes })
  } else {
    return t('teacher.dashboard.justNow')
  }
}

onMounted(() => {
  console.log('教师仪表板已挂载')
  loadAllData()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

/* ==================== 仪表板内容布局 ==================== */
.dashboard-content {
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
}

.content-row {
  margin: 0 !important;
}

/* ==================== 统计卡片网格优化 ==================== */
.stats-grid-unified {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  width: 100%;
  margin-bottom: var(--spacing-xl);

  @media (max-width: var(--breakpoint-lg)) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  @media (max-width: var(--breakpoint-sm)) {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  :deep(.el-col) {
    margin-bottom: 0 !important;
  }

  // 统一 StatCard 样式
  :deep(.stat-card) {
    height: 100%;
    min-height: 120px;
    transition: all var(--transition-base) ease;
    position: relative;
    overflow: hidden;

    // 背景装饰
    &::after {
      content: '';
      position: absolute;
      right: -20px;
      top: -20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      opacity: 0.1;
      transition: opacity var(--transition-base) ease;
    }

    &.stat-card--primary::after {
      background: var(--primary-color);
    }

    &.stat-card--success::after {
      background: var(--success-color);
    }

    &.stat-card--warning::after {
      background: var(--warning-color);
    }

    &.stat-card--info::after {
      background: var(--info-color);
    }

    &:hover::after {
      opacity: 0.15;
    }
  }
}

/* ==================== 操作按钮样式 ==================== */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base) ease;
  box-shadow: var(--shadow-xs);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  .unified-icon {
    flex-shrink: 0;
  }
}

/* ==================== 统计卡片骨架屏 ==================== */
.stat-card-skeleton {
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  background: var(--el-bg-color);
  transition: all var(--transition-base) ease;

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-lg);
  }
}

/* ==================== 内容区块 ==================== */
.content-section {
  margin-bottom: var(--spacing-xl);
}

.section-card {
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base) ease;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--border-focus);
    transform: translateY(-2px);
  }

  :deep(.el-card__header) {
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 1px solid var(--border-color);
    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
  }

  :deep(.el-card__body) {
    padding: var(--spacing-xl);
    min-height: 200px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .card-title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .card-icon {
        color: var(--primary-color);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--primary-light-bg);
        border-radius: var(--radius-md);
        transition: all var(--transition-base) ease;

        &:hover {
          background: var(--primary-color);
          color: var(--text-on-primary);
          transform: rotate(5deg) scale(1.05);
        }
      }

      .card-title {
        font-weight: var(--font-bold);
        font-size: var(--text-lg);
        color: var(--text-primary);
        line-height: var(--leading-tight);
      }
    }
  }
}

/* ==================== 任务列表 ==================== */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: var(--spacing-sm);
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--spacing-xs);

    &:hover {
      background: var(--text-disabled);
    }
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast) ease;
    background: var(--el-bg-color);
    position: relative;
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--spacing-xs);
      background: var(--primary-color);
      border-radius: var(--radius-sm) 0 0 var(--radius-sm);
      opacity: 0;
      transition: opacity var(--transition-fast) ease;
    }

    &:hover {
      border-color: var(--primary-color-light-3);
      background: var(--bg-hover);
      transform: translateX(2px);
      box-shadow: var(--shadow-sm);

      &::before {
        opacity: 1;
      }

      .task-icon {
        transform: scale(1.05);
      }

      .task-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }

    &.completed {
      opacity: 0.7;
      background: var(--bg-tertiary);

      &::before {
        background: var(--success-color);
      }

      .task-title,
      .task-description {
        text-decoration: line-through;
        color: var(--text-secondary);
      }

      .task-icon {
        background: var(--success-color-light-9);
        color: var(--success-color);
      }
    }

    .task-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-light-bg);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) ease;

      &.type-meeting {
        background: var(--info-color-light-9);
        color: var(--info-color);
      }

      &.type-teaching {
        background: var(--success-color-light-9);
        color: var(--success-color);
      }

      &.type-parent {
        background: var(--warning-color-light-9);
        color: var(--warning-color);
      }

      &.type-default {
        background: var(--primary-light-bg);
        color: var(--primary-color);
      }
    }

    .task-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .task-title {
        margin: 0;
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }

      .task-description {
        margin: 0;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .task-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        margin-top: var(--spacing-xs);

        .task-time {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
      }
    }

    .task-arrow {
      flex-shrink: 0;
      color: var(--text-disabled);
      opacity: 0;
      transform: translateX(-4px);
      transition: all var(--transition-fast) ease;
    }
  }
}

/* ==================== 侧边栏内容 ==================== */
.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* ==================== 课程列表 ==================== */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 280px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: var(--spacing-sm);
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--spacing-xs);

    &:hover {
      background: var(--text-disabled);
    }
  }

  .schedule-item {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast) ease;
    background: var(--el-bg-color);
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--spacing-xs);
      background: var(--success-color);
      border-radius: var(--radius-sm) 0 0 var(--radius-sm);
      opacity: 0;
      transition: opacity var(--transition-fast) ease;
    }

    &:hover {
      border-color: var(--success-color-light-3);
      background: var(--bg-hover);
      transform: translateX(2px);

      &::before {
        opacity: 1;
      }
    }

    .schedule-time-block {
      flex-shrink: 0;
      display: flex;
      align-items: center;

      .schedule-time {
        font-weight: var(--font-semibold);
        font-size: var(--text-sm);
        color: var(--success-color);
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--success-color-light-9);
        border-radius: var(--radius-sm);
        white-space: nowrap;
      }
    }

    .schedule-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .schedule-class {
        margin: 0;
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }

      .schedule-subject {
        margin: 0;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);
      }

      .schedule-location {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-muted);
        padding: 2px var(--spacing-xs);
        background: var(--bg-tertiary);
        border-radius: var(--radius-xs);
        width: fit-content;
      }
    }
  }
}

/* ==================== 通知列表 ==================== */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 280px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: var(--spacing-sm);
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--spacing-xs);

    &:hover {
      background: var(--text-disabled);
    }
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast) ease;
    background: var(--el-bg-color);
    cursor: pointer;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--spacing-xs);
      background: var(--warning-color);
      border-radius: var(--radius-sm) 0 0 var(--radius-sm);
      opacity: 0;
      transition: opacity var(--transition-fast) ease;
    }

    &:hover {
      border-color: var(--warning-color-light-3);
      background: var(--bg-hover);
      transform: translateX(2px);

      &::before {
        opacity: 1;
      }
    }

    &.unread {
      background: var(--bg-active);

      &::before {
        opacity: 1;
        background: var(--primary-color);
      }
    }

    .unread-dot {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-sm);
      width: var(--spacing-sm);
      height: var(--spacing-sm);
      border-radius: 50%;
      background: var(--primary-color);
    }

    .notification-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;

      &.type-system {
        background: var(--info-color-light-9);
        color: var(--info-color);
      }

      &.type-task {
        background: var(--primary-light-bg);
        color: var(--primary-color);
      }

      &.type-message {
        background: var(--warning-color-light-9);
        color: var(--warning-color);
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .notification-title {
        margin: 0;
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }

      .notification-preview {
        margin: 0;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-time {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-top: auto;
      }
    }
  }
}

/* ==================== 加载和空状态 ==================== */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
  border: 1px dashed var(--border-color);
}

.empty-container {
  .empty-icon {
    color: var(--text-disabled);
    opacity: 0.4;
    filter: grayscale(0.5);
    transition: all var(--transition-base) ease;

    &:hover {
      opacity: 0.6;
      filter: grayscale(0);
      transform: scale(1.05);
    }
  }

  .empty-text {
    margin: 0;
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    text-align: center;
  }

  // 添加动画效果
  animation: fadeInUp 0.5s ease-out;
}

.schedule-empty {
  min-height: 150px;
}

// 淡入动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 骨架屏项 ==================== */
.skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);

  &.schedule-skeleton {
    flex-direction: column;
    align-items: flex-start;
  }

  .skeleton-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* ==================== 列表动画 ==================== */
.task-list-enter-active,
.task-list-leave-active,
.schedule-list-enter-active,
.schedule-list-leave-active,
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from,
.task-list-leave-to,
.schedule-list-enter-from,
.schedule-list-leave-to,
.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.task-list-move,
.schedule-list-move,
.notification-list-move {
  transition: transform 0.3s ease;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-lg)) {
  .dashboard-content {
    padding: var(--spacing-md);
    padding-top: var(--spacing-sm);
  }

  .stats-grid-unified {
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--text-sm);

    .unified-icon {
      :deep(svg) {
        width: 14px !important;
        height: 14px !important;
      }
    }
  }

  .section-card {
    :deep(.el-card__body) {
      padding: var(--spacing-md);
    }

    :deep(.el-card__header) {
      padding: var(--spacing-md) var(--spacing-lg);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-content {
    padding: var(--spacing-sm);
  }

  .stats-grid-unified {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .content-section {
    margin-bottom: var(--spacing-md);
  }

  .section-card {
    .card-header {
      .card-title-wrapper {
        gap: var(--spacing-sm);

        .card-icon {
          width: 28px;
          height: 28px;
        }

        .card-title {
          font-size: var(--text-base);
        }
      }
    }
  }

  .sidebar-content {
    gap: var(--spacing-md);
  }

  .task-list,
  .schedule-list,
  .notification-list {
    max-height: 280px;
  }

  .empty-container {
    min-height: 160px;
    padding: var(--spacing-lg);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .dashboard-content {
    padding: var(--spacing-xs);
  }

  .stats-grid-unified {
    gap: var(--spacing-xs);
  }

  .action-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);

    span:not(.unified-icon) {
      display: none;
    }

    .unified-icon {
      margin: 0;
    }
  }

  .section-card {
    :deep(.el-card__body) {
      padding: var(--spacing-sm);
    }

    :deep(.el-card__header) {
      padding: var(--spacing-sm) var(--spacing-md);
    }
  }

  .task-item {
    padding: var(--spacing-sm);

    .task-icon {
      width: 36px;
      height: 36px;
    }

    .task-content {
      .task-title {
        font-size: var(--text-xs);
      }

      .task-description {
        font-size: 10px;
      }
    }
  }

  .schedule-item {
    padding: var(--spacing-xs);

    .schedule-time {
      font-size: var(--text-xs) !important;
      padding: 2px var(--spacing-xs) !important;
    }
  }

  .notification-item {
    padding: var(--spacing-xs);

    .notification-icon {
      width: 28px;
      height: 28px;
    }

    .notification-title {
      font-size: 10px;
    }
  }

  .empty-container {
    min-height: 120px;
    padding: var(--spacing-md);

    .empty-icon {
      :deep(svg) {
        width: 36px !important;
        height: 36px !important;
      }
    }

    .empty-text {
      font-size: var(--text-sm);
    }
  }
}

/* ==================== 主题切换支持 ==================== */
html[data-theme="dark"],
.theme-dark {
  .section-card {
    border-color: var(--border-color-dark);

    :deep(.el-card__header) {
      background: var(--bg-tertiary-dark);
    }
  }

  .task-item,
  .schedule-item,
  .notification-item {
    border-color: var(--border-color-dark);
    background: var(--bg-card-dark);

    &:hover {
      background: var(--bg-hover-dark);
    }
  }

  .skeleton-item {
    border-color: var(--border-color-dark);
    background: var(--bg-card-dark);
  }
}
</style>