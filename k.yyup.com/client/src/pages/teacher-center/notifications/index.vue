<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-notifications">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>
            <UnifiedIcon name="default" />
            通知中心
          </h1>
          <p>查看您收到的通知消息</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleMarkAllRead" :disabled="unreadCount === 0">
            <UnifiedIcon name="Check" />
            全部已读
          </el-button>
          <el-button @click="refreshNotifications">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <div class="stats-grid">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <NotificationStatCard
              title="未读消息"
              :value="notificationStats.unread"
              icon="Bell"
              color="var(--el-color-danger)"
              description="需要查看"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <NotificationStatCard
              title="总消息"
              :value="notificationStats.total"
              icon="Message"
              color="var(--el-color-primary)"
              description="全部消息"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <NotificationStatCard
              title="今日消息"
              :value="notificationStats.today"
              icon="Calendar"
              color="var(--el-color-success)"
              description="今天收到"
            />
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-section">
      <el-card>
        <div class="filter-content">
          <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="system">系统通知</el-radio-button>
            <el-radio-button label="announcement">园区公告</el-radio-button>
            <el-radio-button label="class">班级通知</el-radio-button>
          </el-radio-group>
        </div>
      </el-card>
    </div>

    <!-- 园区重要公告 -->
    <div class="school-announcements" v-if="activeCategory === '' || activeCategory === 'announcement'">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <UnifiedIcon name="default" />
              园区重要公告
            </span>
          </div>
        </template>

        <div class="announcement-items">
          <div
            v-for="announcement in importantAnnouncements"
            :key="announcement.id"
            class="announcement-item"
            @click="handleViewAnnouncement(announcement)"
          >
            <div class="announcement-header">
              <el-tag
                :type="announcement.priority === 'urgent' ? 'danger' : 'warning'"
                size="small"
              >
                {{ announcement.priority === 'urgent' ? '紧急' : '重要' }}
              </el-tag>
              <span class="announcement-title">{{ announcement.title }}</span>
              <span class="announcement-time">{{ formatRelativeTime(announcement.created_at) }}</span>
            </div>
            <div class="announcement-content">{{ announcement.content }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <UnifiedIcon name="default" />
              我的通知
            </span>
          </div>
        </template>

        <div class="notification-items" v-loading="loading">
          <div
            v-for="notification in notificationList"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="item-icon">
              <UnifiedIcon name="default" />
            </div>

            <div class="item-content">
              <div class="item-header">
                <div class="item-title">{{ notification.title }}</div>
                <div class="item-meta">
                  <el-tag
                    :type="getPriorityType(notification.priority)"
                    size="small"
                  >
                    {{ getPriorityText(notification.priority) }}
                  </el-tag>
                  <span class="item-time">{{ formatRelativeTime(notification.created_at) }}</span>
                </div>
              </div>
              <div class="item-summary">{{ notification.content }}</div>
              <div class="item-footer">
                <span class="item-category">{{ getCategoryText(notification.type) }}</span>
              </div>
            </div>

            <div class="item-status">
              <el-badge v-if="!notification.is_read" is-dot type="danger" />
            </div>
          </div>

          <div v-if="notificationList.length === 0" class="empty-state">
            <el-empty description="暂无通知消息" />
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="pagination.total"
            layout="total, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知详情弹窗 -->
    <NotificationDetail 
      v-model="notificationDetailVisible"
      :notification="currentNotification"
      @read="handleMarkRead"
      @delete="handleDeleteNotification"
    />
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Check,
  Refresh,
  Message,
  Calendar,
  Notification,
  ChatDotRound,
  User
} from '@element-plus/icons-vue'

// 导入组件
import NotificationDetail from './components/NotificationDetail.vue'
import NotificationStatCard from './components/NotificationStatCard.vue'

// 导入API
import {
  getNotificationList,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '@/api/modules/notification'

// 响应式数据
const loading = ref(false)
const notificationDetailVisible = ref(false)
const currentNotification = ref(null)
const activeCategory = ref('')

// 通知统计
const notificationStats = reactive({
  unread: 0,
  total: 0,
  today: 0
})

// 通知列表
const notificationList = ref([])

// 重要公告列表
const importantAnnouncements = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 计算属性
const unreadCount = computed(() => notificationStats.unread)

// 方法
const handleNotificationClick = (notification: any) => {
  currentNotification.value = notification
  notificationDetailVisible.value = true
  
  // 如果是未读消息，标记为已读
  if (!notification.is_read) {
    handleMarkRead(notification)
  }
}

const handleMarkRead = async (notification: any) => {
  try {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      notification.is_read = true
      notificationStats.unread--
      ElMessage.success('已标记为已读')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

const handleViewAnnouncement = (announcement: any) => {
  // 将公告转换为通知格式以复用详情组件
  const announcementAsNotification = {
    ...announcement,
    type: 'announcement',
    is_read: true // 公告默认为已读状态
  }
  currentNotification.value = announcementAsNotification
  notificationDetailVisible.value = true
}

const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有未读消息标记为已读吗？', '批量操作', {
      type: 'warning'
    })

    await markAllNotificationsAsRead()

    // 更新本地数据
    notificationList.value.forEach(item => {
      item.is_read = true
    })
    notificationStats.unread = 0
    ElMessage.success('所有消息已标记为已读')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量标记已读失败:', error)
      ElMessage.error('批量标记已读失败')
    }
  }
}

const handleDeleteNotification = async (notification: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '确认删除', {
      type: 'warning'
    })

    await deleteNotification(notification.id)

    // 从列表中移除
    const index = notificationList.value.findIndex(item => item.id === notification.id)
    if (index > -1) {
      notificationList.value.splice(index, 1)
    }

    // 更新统计数据
    if (!notification.is_read) {
      notificationStats.unread--
    }
    notificationStats.total--

    // 关闭详情弹窗
    notificationDetailVisible.value = false

    ElMessage.success('通知已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除通知失败')
    }
  }
}

const handleCategoryChange = () => {
  pagination.page = 1
  loadNotifications()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadNotifications()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadNotifications()
}

const refreshNotifications = () => {
  loadNotifications()
}

// 工具方法
const getNotificationIcon = (type: string) => {
  const iconMap = {
    'system': Bell,
    'announcement': Notification,
    'class': ChatDotRound,
    'personal': User
  }
  return iconMap[type] || Bell
}

const getNotificationIconClass = (notification: any) => {
  const classMap = {
    'urgent': 'urgent-icon',
    'important': 'important-icon',
    'normal': 'normal-icon'
  }
  return classMap[notification.priority] || 'normal-icon'
}

const getPriorityType = (priority: string) => {
  const typeMap = {
    'urgent': 'danger',
    'important': 'warning',
    'normal': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap = {
    'urgent': '紧急',
    'important': '重要',
    'normal': '普通'
  }
  return textMap[priority] || '普通'
}

const getCategoryText = (type: string) => {
  const textMap = {
    'system': '系统通知',
    'announcement': '园区公告',
    'class': '班级通知',
    'personal': '个人消息'
  }
  return textMap[type] || '系统通知'
}

const formatRelativeTime = (dateTime: string) => {
  if (!dateTime) return ''
  const now = new Date()
  const date = new Date(dateTime)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    // 并行加载通知列表和统计数据
    const [listResponse, statsResponse] = await Promise.all([
      getNotificationList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: activeCategory.value || undefined
      }),
      getNotificationStats()
    ])

    // 更新通知列表
    if (listResponse.data) {
      notificationList.value = listResponse.data.items || []
      pagination.total = listResponse.data.total || 0
    }

    // 更新统计数据
    if (statsResponse.data) {
      Object.assign(notificationStats, statsResponse.data)
    }
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')

    // 如果API调用失败，使用模拟数据
    notificationStats.unread = 8
    notificationStats.total = 45
    notificationStats.today = 12

    // 重要公告模拟数据
    importantAnnouncements.value = [
      {
        id: 'ann_1',
        title: '2025年春季学期开学准备工作通知',
        content: '各位老师请注意，春季学期将于2月20日正式开学，请提前做好教学准备工作，包括教案准备、教室布置等。',
        priority: 'urgent',
        created_at: '2025-01-20T09:00:00Z'
      },
      {
        id: 'ann_2',
        title: '幼儿园安全管理制度更新',
        content: '根据最新的安全管理要求，我园安全管理制度已更新，请各位老师认真学习新制度内容。',
        priority: 'important',
        created_at: '2025-01-18T14:30:00Z'
      },
      {
        id: 'ann_3',
        title: '教师培训计划安排',
        content: '本学期教师培训计划已制定完成，包括专业技能培训、安全培训等，请关注具体时间安排。',
        priority: 'important',
        created_at: '2025-01-16T11:00:00Z'
      }
    ]

    notificationList.value = [
      {
        id: 1,
        title: '本周教研活动安排',
        content: '请各位老师准时参加本周三下午的教研活动，地点在会议室A。',
        type: 'announcement',
        priority: 'important',
        is_read: false,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        title: '学期末家长会通知',
        content: '学期末家长会将于下周举行，请提前准备相关材料。',
        type: 'class',
        priority: 'normal',
        is_read: true,
        created_at: '2024-01-14T15:20:00Z'
      },
      {
        id: 3,
        title: '系统维护通知',
        content: '系统将于今晚22:00-24:00进行维护，期间可能无法正常使用。',
        type: 'system',
        priority: 'urgent',
        is_read: false,
        created_at: '2024-01-15T09:00:00Z'
      }
    ]

    pagination.total = 45
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.teacher-notifications {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.page-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .header-left {
      h1 {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      p {
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

.stats-section {
  margin-bottom: var(--spacing-xl);

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--text-lg);
    padding: var(--text-2xl);
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    border-radius: var(--text-sm);
    color: white;
    box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-var(--spacing-xs));
      box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(102, 126, 234, 0.4);
    }

    &.unread {
      background: var(--gradient-pink);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(245, 87, 108, 0.3);

      &:hover {
        box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(245, 87, 108, 0.4);
      }
    }

    &.total {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(79, 172, 254, 0.3);

      &:hover {
        box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(79, 172, 254, 0.4);
      }
    }

    &.today {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(67, 233, 123, 0.3);

      &:hover {
        box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(67, 233, 123, 0.4);
      }
    }

    .stat-icon {
      font-size: var(--text-4xl);
      opacity: 0.9;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-base);
        opacity: 0.9;
      }
    }
  }
}

.filter-section {
  margin-bottom: var(--text-3xl);

  .filter-content {
    display: flex;
    justify-content: center;
    padding: var(--spacing-sm) 0;
  }
}

.notifications-list {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

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

  .notification-items {
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: var(--text-lg);
      padding: var(--text-2xl);
      border-radius: var(--text-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: var(--text-sm);
      border: var(--border-width-base) solid var(--el-border-color-light);
      background-color: white;

      &:hover {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-color-primary-light-5);
        transform: translateX(var(--spacing-xs));
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--black-alpha-8);
      }

      &.unread {
        background: linear-gradient(to right, var(--bg-white)5f5 0%, var(--bg-white) 100%);
        border-left: var(--spacing-xs) solid var(--el-color-danger);

        &:hover {
          background: linear-gradient(to right, var(--bg-white)0f0 0%, var(--bg-white) 100%);
        }
      }

      .item-icon {
        margin-top: var(--spacing-xs);
        font-size: var(--text-3xl);

        .urgent-icon {
          color: var(--el-color-danger);
        }

        .important-icon {
          color: var(--el-color-warning);
        }

        .normal-icon {
          color: var(--el-color-info);
        }
      }

      .item-content {
        flex: 1;

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-sm);

          .item-title {
            font-weight: 600;
            font-size: var(--text-lg);
            color: var(--el-text-color-primary);
            flex: 1;
          }

          .item-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .item-time {
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);
            }
          }
        }

        .item-summary {
          color: var(--el-text-color-regular);
          font-size: var(--text-base);
          line-height: 1.6;
          margin-bottom: var(--spacing-sm);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .item-footer {
          .item-category {
            font-size: var(--text-sm);
            color: var(--el-text-color-placeholder);
            background-color: var(--el-fill-color-light);
            padding: var(--spacing-sm) var(--spacing-sm);
            border-radius: var(--spacing-xs);
            display: inline-block;
          }
        }
      }

      .item-status {
        margin-top: var(--spacing-xs);
      }
    }
  }

  .pagination {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: center;
  }
}

.empty-state {
  padding: var(--spacing-10xl);
  text-align: center;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teacher-notifications {
    padding: var(--spacing-md);
  }

  .page-header .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .filter-section .filter-content {
    .category-tabs {
      justify-content: flex-start;
      overflow-x: auto;
    }

    .filter-controls {
      justify-content: flex-start;
    }
  }

  .notification-item {
    .item-header {
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-start;
    }

    .item-footer {
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-start;
    }
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-md);
    }
  }
}

// 园区公告样式
.school-announcements {
  margin-bottom: var(--text-2xl);
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--el-text-color-primary);
    }
  }

  .announcement-items {
    display: flex;
    flex-direction: column;
    gap: var(--text-sm);
  }

  .announcement-item {
    padding: var(--text-lg);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--spacing-sm);
    background-color: var(--el-fill-color-lighter);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-fill-color-light);
      transform: translateY(var(--transform-hover-lift));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    }

    .announcement-header {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--spacing-sm);

      .announcement-title {
        font-weight: 600;
        color: var(--el-text-color-primary);
        flex: 1;
      }

      .announcement-time {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }

    .announcement-content {
      color: var(--el-text-color-regular);
      line-height: 1.6;
      font-size: var(--text-base);
    }
  }
}
</style>
