<template>
  <MobileMainLayout
    title="教师工作台"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 欢迎信息和快速操作 -->
    <div class="welcome-section">
      <div class="welcome-header">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>你好，{{ teacherInfo.name }}老师</h2>
            <p>{{ descriptionText }}</p>
          </div>
          <van-image
            :src="teacherInfo.avatar || '/default-avatar.png'"
            width="64"
            height="64"
            round
            class="teacher-avatar"
          />
        </div>
      </div>

      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <van-button
          type="primary"
          size="small"
          icon="clock-o"
          @click="handleQuickAction('clock-in')"
          class="action-btn"
        >
          快速打卡
        </van-button>
        <van-button
          size="small"
          icon="replay"
          @click="refreshDashboard"
          class="action-btn"
        >
          刷新数据
        </van-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <van-grid :column-num="2" :gutter="12">
        <!-- 任务统计 -->
        <van-grid-item>
          <div class="stat-card" @click="navigateTo('/mobile/teacher-center/tasks')">
            <div class="stat-icon">
              <van-icon name="todo-list-o" size="28" color="#409eff" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardStats.tasks.total }}</div>
              <div class="stat-label">总任务</div>
              <div class="stat-sub">
                <span class="completed">{{ dashboardStats.tasks.completed }}完成</span>
                <span class="pending">{{ dashboardStats.tasks.pending }}进行中</span>
              </div>
            </div>
            <div class="stat-progress">
              <van-progress
                :percentage="taskCompletionPercentage"
                stroke-width="4"
                :show-text="false"
                color="#409eff"
              />
              <div class="progress-text">{{ taskCompletionPercentage }}%</div>
            </div>
          </div>
        </van-grid-item>

        <!-- 班级统计 -->
        <van-grid-item>
          <div class="stat-card" @click="navigateTo('/mobile/teacher-center/teaching')">
            <div class="stat-icon">
              <van-icon name="friends-o" size="28" color="#07c160" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardStats.classes.total }}</div>
              <div class="stat-label">班级数</div>
              <div class="stat-sub">
                <span class="today">{{ dashboardStats.classes.today }}今日课程</span>
                <span class="students">{{ dashboardStats.classes.students }}名学生</span>
              </div>
            </div>
            <div class="stat-progress">
              <div class="attendance-rate">出勤率 {{ dashboardStats.classes.avgAttendance }}%</div>
            </div>
          </div>
        </van-grid-item>

        <!-- 活动统计 -->
        <van-grid-item>
          <div class="stat-card" @click="navigateTo('/mobile/teacher-center/activities')">
            <div class="stat-icon">
              <van-icon name="flag-o" size="28" color="#ff976a" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardStats.activities.total }}</div>
              <div class="stat-label">活动数</div>
              <div class="stat-sub">
                <span class="week">{{ dashboardStats.activities.thisWeek }}本周</span>
                <span class="upcoming">{{ dashboardStats.activities.upcoming }}即将开始</span>
              </div>
            </div>
            <div class="stat-progress">
              <div class="activity-info">{{ dashboardStats.activities.participated }}已参与</div>
            </div>
          </div>
        </van-grid-item>

        <!-- 通知统计 -->
        <van-grid-item>
          <div class="stat-card" @click="navigateTo('/mobile/teacher-center/notifications')">
            <div class="stat-icon">
              <van-icon name="bell-o" size="28" color="#ee0a24" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardStats.notifications.total }}</div>
              <div class="stat-label">通知消息</div>
              <div class="stat-sub">
                <span class="unread">{{ dashboardStats.notifications.unread }}未读</span>
                <van-tag v-if="dashboardStats.notifications.unread > 0" type="danger" size="mini">新</van-tag>
              </div>
            </div>
            <div class="stat-progress">
              <div class="notification-info">{{ dashboardStats.notifications.system }}系统消息</div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 今日任务和课程安排 -->
    <div class="content-section">
      <!-- 今日任务 -->
      <van-card class="section-card">
        <template #title>
          <div class="card-title">
            <van-icon name="calendar-o" size="18" />
            <span>今日任务</span>
            <van-button
              type="primary"
              size="mini"
              plain
              @click="navigateTo('/mobile/teacher-center/tasks')"
            >
              查看全部
            </van-button>
          </div>
        </template>

        <van-loading v-if="loading.tasks" size="24px" vertical>加载中...</van-loading>
        <van-empty v-else-if="error.tasks" description="加载失败" image="error">
          <van-button type="primary" size="small" @click="loadTodayTasks">重试</van-button>
        </van-empty>
        <van-empty v-else-if="todayTasks.length === 0" description="暂无今日任务" />
        <div v-else class="task-list">
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            :class="{ 'completed': task.completed }"
            @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <van-icon
                :name="getTaskIcon(task.type)"
                size="20"
                :color="task.completed ? '#969799' : '#409eff'"
              />
            </div>
            <div class="task-content">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-time">{{ task.time }}</span>
                <van-tag
                  :type="task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'"
                  size="mini"
                >
                  {{ getPriorityText(task.priority) }}
                </van-tag>
              </div>
            </div>
            <div class="task-status">
              <van-checkbox
                :model-value="task.completed"
                @click.stop="toggleTaskStatus(task)"
                icon-size="18px"
              />
            </div>
          </div>
        </div>
      </van-card>

      <!-- 课程安排 -->
      <van-card class="section-card">
        <template #title>
          <div class="card-title">
            <van-icon name="orders-o" size="18" />
            <span>课程安排</span>
            <van-button
              type="primary"
              size="mini"
              plain
              @click="navigateTo('/mobile/teacher-center/teaching')"
            >
              查看课程表
            </van-button>
          </div>
        </template>

        <van-loading v-if="loading.schedule" size="24px" vertical>加载中...</van-loading>
        <van-empty v-else-if="error.schedule" description="加载失败" image="error">
          <van-button type="primary" size="small" @click="loadTodaySchedule">重试</van-button>
        </van-empty>
        <van-empty v-else-if="todaySchedule.length === 0" description="暂无今日课程" />
        <div v-else class="schedule-list">
          <div
            v-for="schedule in todaySchedule"
            :key="schedule.id"
            class="schedule-item"
            @click="handleScheduleClick(schedule)"
          >
            <div class="schedule-time">{{ schedule.time }}</div>
            <div class="schedule-content">
              <h4>{{ schedule.class }}</h4>
              <p>{{ schedule.subject }}</p>
              <div class="schedule-location">
                <van-icon name="location-o" size="14" />
                {{ schedule.location }}
              </div>
            </div>
          </div>
        </div>
      </van-card>

      <!-- 最新通知 -->
      <van-card class="section-card">
        <template #title>
          <div class="card-title">
            <van-icon name="bell-o" size="18" />
            <span>最新通知</span>
            <van-button
              type="primary"
              size="mini"
              plain
              @click="navigateTo('/mobile/teacher-center/notifications')"
            >
              查看全部
            </van-button>
          </div>
        </template>

        <div class="notification-list">
          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            class="notification-item"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <van-icon
                :name="getNotificationIcon(notification.type)"
                size="20"
                :color="getNotificationColor(notification.type)"
              />
            </div>
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.content }}</p>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-badge" v-if="!notification.read">
              <van-badge dot />
            </div>
          </div>
        </div>
      </van-card>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getDashboardStatistics,
  getTodayTasks,
  getTodaySchedule,
  getRecentNotifications,
  updateTaskStatus,
  clockIn
} from '@/api/modules/teacher-dashboard'

// 接口类型定义
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
    overdue: 0
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

// 计算属性
const taskCompletionPercentage = computed(() => {
  if (dashboardStats.value.tasks.total === 0) return 0
  return Math.round((dashboardStats.value.tasks.completed / dashboardStats.value.tasks.total) * 100)
})

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
    showToast('加载仪表板数据失败，请稍后重试')
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
    showToast('加载今日任务失败，请稍后重试')
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
    showToast('加载课程安排失败，请稍后重试')
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
    showToast('加载通知失败，请稍后重试')
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
const handleQuickAction = async (action: string) => {
  switch (action) {
    case 'clock-in':
      try {
        const response = await clockIn('in')
        if (response.success) {
          showSuccessToast('打卡成功！工作愉快~')
          // 刷新数据
          await loadDashboardData()
        } else {
          showFailToast(response.message || '打卡失败')
        }
      } catch (error: any) {
        showFailToast(error.message || '打卡失败，请稍后重试')
      }
      break
    default:
      showToast('执行操作: ' + action)
  }
}

const refreshDashboard = async () => {
  try {
    await loadAllData()
    showSuccessToast('数据已刷新')
  } catch (error) {
    showFailToast('刷新失败，请稍后重试')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const handleTaskClick = (task: Task) => {
  router.push(`/mobile/teacher-center/task-detail?id=${task.id}`)
}

const handleScheduleClick = (schedule: Schedule) => {
  router.push(`/mobile/teacher-center/class-detail?id=${schedule.id}`)
}

const handleNotificationClick = (notification: Notification) => {
  // 标记为已读
  notification.read = true
  router.push(`/mobile/teacher-center/notification-detail?id=${notification.id}`)
}

const toggleTaskStatus = async (task: Task) => {
  try {
    const response = await updateTaskStatus(task.id, !task.completed)
    if (response.success) {
      task.completed = !task.completed
      showSuccessToast(task.completed ? '任务已完成' : '任务已重新开启')
      // 刷新统计数据
      await loadDashboardData()
    } else {
      showFailToast(response.message || '操作失败')
    }
  } catch (error: any) {
    showFailToast(error.message || '操作失败，请稍后重试')
  }
}

// 工具函数
const getTaskIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    meeting: 'friends-o',
    teaching: 'orders-o',
    parent: 'chat-o',
    default: 'todo-list-o'
  }
  return iconMap[type] || 'todo-list-o'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '普通'
  }
  return textMap[priority] || '普通'
}

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    system: 'warning-o',
    task: 'todo-list-o',
    message: 'chat-o'
  }
  return iconMap[type] || 'bell-o'
}

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    system: '#ff976a',
    task: '#409eff',
    message: '#07c160'
  }
  return colorMap[type] || '#409eff'
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
  console.log('教师工作台已挂载')
  loadAllData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

// 欢迎区域
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);

  .welcome-header {
    margin-bottom: var(--spacing-md);
  }

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-text {
      flex: 1;

      h2 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
        opacity: 0.9;
      }
    }

    .teacher-avatar {
      flex-shrink: 0;
      margin-left: var(--spacing-md);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
  }

  .quick-actions {
    display: flex;
    gap: var(--spacing-sm);

    .action-btn {
      flex: 1;
      height: 40px;
      border-radius: var(--radius-lg);
      font-weight: var(--font-medium);

      &:first-child {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
      }

      &:last-child {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }
  }
}

// 统计卡片区域
.stats-section {
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--spacing-md);

  :deep(.van-grid) {
    .van-grid-item {
      padding: 0;
    }
  }

  .stat-card {
    background-color: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color-light);
    height: 100%;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    &:active {
      transform: scale(0.98);
      box-shadow: var(--shadow-lg);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:active::before {
      opacity: 1;
    }

    .stat-icon {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacing-sm);
    }

    .stat-content {
      text-align: center;
      flex: 1;

      .stat-number {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
        font-weight: var(--font-medium);
      }

      .stat-sub {
        display: flex;
        justify-content: center;
        gap: var(--spacing-md);
        font-size: var(--text-xs);
        color: var(--text-tertiary);

        .completed {
          color: var(--success-color);
        }

        .pending {
          color: var(--warning-color);
        }

        .today {
          color: var(--primary-color);
        }

        .students {
          color: var(--info-color);
        }

        .week {
          color: var(--warning-color);
        }

        .upcoming {
          color: var(--danger-color);
        }

        .unread {
          color: var(--danger-color);
          font-weight: var(--font-semibold);
        }
      }
    }

    .stat-progress {
      margin-top: var(--spacing-sm);
      text-align: center;

      .progress-text {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-top: var(--spacing-xs);
        font-weight: var(--font-medium);
      }

      .attendance-rate,
      .activity-info,
      .notification-info {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        font-weight: var(--font-medium);
      }
    }
  }
}

// 内容区域
.content-section {
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-xl);

  .section-card {
    margin-bottom: var(--spacing-md);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);

    :deep(.van-card__header) {
      padding: var(--spacing-md);
      background-color: var(--bg-color-secondary);
      border-bottom: 1px solid var(--border-color-light);
    }

    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      > div {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }
    }

    :deep(.van-card__content) {
      padding: var(--spacing-md);
    }
  }
}

// 任务列表
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-color);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    cursor: pointer;

    &:active {
      background-color: var(--bg-hover);
      border-color: var(--primary-color);
      transform: scale(0.98);
    }

    &.completed {
      opacity: 0.6;
      background-color: var(--bg-disabled);

      .task-content {
        h4, p {
          color: var(--text-secondary);
          text-decoration: line-through;
        }
      }
    }

    .task-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background-color: var(--primary-light-bg);
    }

    .task-content {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: var(--leading-normal);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .task-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--spacing-sm);

        .task-time {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }
      }
    }

    .task-status {
      flex-shrink: 0;
    }
  }
}

// 课程安排列表
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .schedule-item {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-color);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    cursor: pointer;

    &:active {
      background-color: var(--bg-hover);
      border-color: var(--primary-color);
      transform: scale(0.98);
    }

    .schedule-time {
      flex-shrink: 0;
      font-weight: var(--font-semibold);
      color: var(--primary-color);
      font-size: var(--text-sm);
      min-width: 60px;
      display: flex;
      align-items: center;
    }

    .schedule-content {
      flex: 1;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        color: var(--text-primary);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .schedule-location {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        margin-top: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-tertiary);
      }
    }
  }
}

// 通知列表
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-color);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;

    &:active {
      background-color: var(--bg-hover);
      border-color: var(--primary-color);
      transform: scale(0.98);
    }

    .notification-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background-color: var(--bg-color-secondary);
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: var(--leading-normal);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-time {
        margin-top: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-tertiary);
      }
    }

    .notification-badge {
      flex-shrink: 0;
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-sm);
    }
  }
}

// 加载和空状态样式
:deep(.van-loading),
:deep(.van-empty) {
  padding: var(--spacing-xl) 0;
}

// 响应式设计
@media (max-width: 375px) {
  .welcome-section {
    padding: var(--spacing-md);

    .welcome-content {
      .welcome-text {
        h2 {
          font-size: var(--text-lg);
        }

        p {
          font-size: var(--text-xs);
        }
      }

      .teacher-avatar {
        width: 56px;
        height: 56px;
      }
    }

    .quick-actions {
      .action-btn {
        height: 36px;
        font-size: var(--text-sm);
      }
    }
  }

  .stats-section {
    padding: 0 var(--spacing-sm);

    .stat-card {
      padding: var(--spacing-sm);

      .stat-content {
        .stat-number {
          font-size: var(--text-xl);
        }

        .stat-label {
          font-size: var(--text-xs);
        }

        .stat-sub {
          font-size: 10px;
          gap: var(--spacing-xs);
        }
      }
    }
  }

  .content-section {
    padding: 0 var(--spacing-sm);
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .welcome-section {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  }

  .stat-card {
    background-color: var(--bg-color-dark);
    border-color: var(--border-color-dark);
  }

  .task-item,
  .schedule-item,
  .notification-item {
    background-color: var(--bg-color-dark);
    border-color: var(--border-color-dark);
  }
}
</style>
