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
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="welcome-title">
            <UnifiedIcon name="default" />
            欢迎回来，{{ teacherInfo.name }}老师
          </h1>
          <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleQuickAction('clock-in')">
            <UnifiedIcon name="default" />
            快速打卡
          </el-button>
          <el-button @click="refreshDashboard">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

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
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
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
                  <el-checkbox 
                    v-model="task.completed" 
                    @change="handleTaskToggle(task)"
                  />
                  <div class="task-content">
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-meta">
                      <el-tag :type="getTaskPriorityType(task.priority)" size="small">
                        {{ task.priority }}
                      </el-tag>
                      <span class="task-time">{{ task.deadline }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="todayTasks.length === 0" class="empty-state">
                  <el-empty description="今日暂无任务" />
                </div>
              </div>
            </el-card>

            <!-- 课程安排 -->
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">
                    <UnifiedIcon name="default" />
                    今日课程
                  </span>
                  <el-button text type="primary" @click="navigateTo('/teacher-center/teaching')">
                    查看全部
                  </el-button>
                </div>
              </template>
              <div class="schedule-list">
                <div 
                  v-for="course in todayCourses" 
                  :key="course.id"
                  class="schedule-item"
                >
                  <div class="schedule-time">{{ course.time }}</div>
                  <div class="schedule-content">
                    <div class="schedule-title">{{ course.className }} - {{ course.subject }}</div>
                    <div class="schedule-location">{{ course.location }}</div>
                  </div>
                  <div class="schedule-actions">
                    <el-button size="small" @click="handleCourseAction(course, 'start')">
                      开始上课
                    </el-button>
                  </div>
                </div>
                <div v-if="todayCourses.length === 0" class="empty-state">
                  <el-empty description="今日暂无课程安排" />
                </div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧：快捷操作和通知 -->
        <el-col :xs="24" :lg="8">
          <div class="sidebar-content">
            <!-- 快捷操作面板 -->
            <QuickActionsPanel @action="handleQuickAction" />

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
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-time">{{ notification.createdAt }}</div>
                  </div>
                  <div class="notification-status">
                    <el-badge v-if="!notification.read" is-dot />
                  </div>
                </div>
                <div v-if="recentNotifications.length === 0" class="empty-state">
                  <el-empty description="暂无新通知" />
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  Clock,
  Refresh,
  List,
  Calendar,
  Bell
} from '@element-plus/icons-vue'

// 导入API
import {
  getTeacherDashboardData,
  getTeacherActivityStatistics,
  updateTaskStatus,
  clockIn,
  type DashboardData,
  type TodayTask,
  type TodayCourse,
  type RecentNotification
} from '@/api/modules/teacher-dashboard'

// 导入组件
import TaskOverviewCard from './components/TaskOverviewCard.vue'
import ClassOverviewCard from './components/ClassOverviewCard.vue'
import ActivityReminderCard from './components/ActivityReminderCard.vue'
import NotificationCard from './components/NotificationCard.vue'
import QuickActionsPanel from './components/QuickActionsPanel.vue'

// 路由和状态
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const teacherInfo = computed(() => userStore.userInfo || {})

// 仪表板统计数据
const dashboardStats = reactive({
  tasks: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  },
  classes: {
    total: 0,
    todayClasses: 0,
    studentsCount: 0,
    completionRate: 0
  },
  activities: {
    upcoming: 0,
    participating: 0,
    thisWeek: 0
  },
  notifications: {
    unread: 0,
    total: 0,
    urgent: 0
  }
})

// 今日任务
const todayTasks = ref<TodayTask[]>([])

// 今日课程
const todayCourses = ref<TodayCourse[]>([])

// 最新通知
const recentNotifications = ref<RecentNotification[]>([])

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 方法
const navigateTo = (path: string) => {
  router.push(path)
}

const refreshDashboard = async () => {
  loading.value = true
  try {
    await loadDashboardData()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('数据刷新失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const handleQuickAction = async (action: string) => {
  switch (action) {
    case 'clock-in':
      try {
        const result = await clockIn('in')
        ElMessage.success(result.data.message || '打卡成功')
      } catch (error) {
        console.error('打卡失败:', error)
        ElMessage.error('打卡失败')
      }
      break
    case 'upload-media':
      navigateTo('/teacher-center/teaching/media-upload')
      break
    case 'create-task':
      navigateTo('/teacher-center/tasks/create')
      break
    case 'view-schedule':
      navigateTo('/teacher-center/teaching/schedule')
      break
    default:
      console.log('Quick action:', action)
  }
}

const handleTaskToggle = async (task: TodayTask) => {
  try {
    const result = await updateTaskStatus(task.id, task.completed)
    ElMessage.success(result.data.completed ? '任务已完成' : '任务已重新打开')
  } catch (error) {
    console.error('更新任务状态失败:', error)
    ElMessage.error('更新任务状态失败')
    // 恢复原状态
    task.completed = !task.completed
  }
}

const handleCourseAction = (course: any, action: string) => {
  if (action === 'start') {
    navigateTo(`/teacher-center/teaching/course/${course.id}`)
  }
}

const handleNotificationClick = (notification: any) => {
  // 标记为已读并跳转到详情
  navigateTo(`/teacher-center/notifications/${notification.id}`)
}

const getTaskPriorityType = (priority: string) => {
  const typeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'info'
}

const loadDashboardData = async () => {
  try {
    // 并发加载仪表板数据和活动统计数据
    const [dashboardResult, activityStatsResult] = await Promise.all([
      getTeacherDashboardData(),
      getTeacherActivityStatistics()
    ])

    if (dashboardResult.success && dashboardResult.data) {
      // 更新统计数据
      Object.assign(dashboardStats, dashboardResult.data.stats)

      // 更新今日任务
      todayTasks.value = dashboardResult.data.todayTasks || []

      // 更新今日课程
      todayCourses.value = dashboardResult.data.todayCourses || []

      // 更新最新通知
      recentNotifications.value = dashboardResult.data.recentNotifications || []
    }

    // 更新活动统计数据
    if (activityStatsResult.success && activityStatsResult.data) {
      dashboardStats.activities.upcoming = activityStatsResult.data.overview.publishedActivities
      dashboardStats.activities.participating = activityStatsResult.data.overview.totalRegistrations
      dashboardStats.activities.thisWeek = activityStatsResult.data.trends
        .slice(0, 7)
        .reduce((sum, trend) => sum + trend.count, 0)
    }
  } catch (error) {
    console.error('加载工作台数据失败:', error)
    // 使用模拟数据作为后备
    loadMockData()
  }
}

const loadMockData = () => {
  // 模拟数据作为后备
  dashboardStats.tasks = {
    total: 12,
    completed: 8,
    pending: 3,
    overdue: 1
  }

  dashboardStats.classes = {
    total: 3,
    todayClasses: 2,
    studentsCount: 45,
    completionRate: 85
  }

  dashboardStats.activities = {
    upcoming: 2,
    participating: 5,
    thisWeek: 3
  }

  dashboardStats.notifications = {
    unread: 5,
    total: 23,
    urgent: 1
  }

  // 模拟今日任务
  todayTasks.value = [
    {
      id: 1,
      title: '准备明天的数学课教案',
      priority: '高',
      deadline: '18:00',
      completed: false
    },
    {
      id: 2,
      title: '批改作业',
      priority: '中',
      deadline: '20:00',
      completed: true
    }
  ]

  // 模拟今日课程
  todayCourses.value = [
    {
      id: 1,
      time: '09:00-10:30',
      className: '大班A',
      subject: '数学启蒙',
      location: '教室101'
    },
    {
      id: 2,
      time: '14:00-15:30',
      className: '中班B',
      subject: '语言表达',
      location: '教室203'
    }
  ]

  // 模拟最新通知
  recentNotifications.value = [
    {
      id: 1,
      title: '本周教研活动安排',
      createdAt: '2小时前',
      read: false
    },
    {
      id: 2,
      title: '学期末家长会通知',
      createdAt: '1天前',
      read: true
    }
  ]
}

// 生命周期
onMounted(() => {
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.teacher-dashboard {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .welcome-section {
      .welcome-title {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .welcome-subtitle {
        color: var(--el-text-color-secondary);
        margin: 0;
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
  }
}

.stats-cards {
  margin-bottom: var(--spacing-xl);
}

.main-content {
  .content-section,
  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
}

.section-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  }
}

.task-list,
.schedule-list,
.notification-list {
  .task-item,
  .schedule-item,
  .notification-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) 0;
    border-bottom: var(--z-index-dropdown) solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  .task-item {
    gap: var(--spacing-md);

    &.completed {
      opacity: 0.6;

      .task-title {
        text-decoration: line-through;
      }
    }

    .task-content {
      flex: 1;

      .task-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .schedule-item {
    gap: var(--spacing-lg);

    .schedule-time {
      font-weight: 600;
      color: var(--primary-color);
      min-max-width: 100px; width: 100%;
    }

    .schedule-content {
      flex: 1;

      .schedule-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }

      .schedule-location {
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .notification-item {
    cursor: pointer;
    gap: var(--spacing-md);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .notification-content {
      flex: 1;

      .notification-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }

      .notification-time {
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.empty-state {
  padding: var(--spacing-lg);
  text-align: center;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teacher-dashboard {
    padding: var(--spacing-md);
  }

  .dashboard-header .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-md);
    }
  }
}
</style>
