<template>
  <UnifiedCenterLayout
    :title="t('teacher.notifications.title')"
    :description="t('teacher.notifications.description')"
    icon="notifications"
    :show-header="true"
    :show-title="true"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button
        type="primary"
        @click="handleMarkAllRead"
        :disabled="unreadCount === 0"
        class="action-btn"
      >
        <UnifiedIcon name="check" :size="16" />
        {{ t('teacher.notifications.markAllRead') }}
      </el-button>
      <el-button @click="refreshNotifications" class="action-btn">
        <UnifiedIcon name="refresh" :size="16" />
        {{ t('teacher.notifications.refresh') }}
      </el-button>
    </template>

    <!-- 统计卡片区域 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        v-if="!loading.stats"
        icon="notifications"
        :title="t('teacher.notifications.unread')"
        :value="notificationStats.unread"
        :subtitle="t('teacher.notifications.needView')"
        type="danger"
        :trend="notificationStats.unread > 0 ? 'up' : 'stable'"
        clickable
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="messages"
        :title="t('teacher.notifications.total')"
        :value="notificationStats.total"
        :subtitle="t('teacher.notifications.allMessages')"
        type="primary"
        clickable
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="calendar"
        :title="t('teacher.notifications.today')"
        :value="notificationStats.today"
        :subtitle="t('teacher.notifications.receivedToday')"
        type="success"
        clickable
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="check"
        :title="t('teacher.notifications.read')"
        :value="notificationStats.total - notificationStats.unread"
        :subtitle="t('teacher.notifications.readMessages')"
        type="info"
        clickable
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>
    </template>

    <!-- 主要内容区域 -->
    <div class="notifications-content">
      <!-- 分类筛选 -->
      <div class="filter-section">
        <el-card class="filter-card" shadow="hover">
          <div class="filter-content">
            <el-radio-group v-model="activeCategory" @change="handleCategoryChange" class="category-tabs">
              <el-radio-button label="">
                <UnifiedIcon name="list" :size="14" />
                {{ t('teacher.notifications.all') }}
              </el-radio-button>
              <el-radio-button label="system">
                <UnifiedIcon name="info" :size="14" />
                {{ t('teacher.notifications.system') }}
              </el-radio-button>
              <el-radio-button label="announcement">
                <UnifiedIcon name="notifications" :size="14" />
                {{ t('teacher.notifications.announcement') }}
              </el-radio-button>
              <el-radio-button label="class">
                <UnifiedIcon name="classes" :size="14" />
                {{ t('teacher.notifications.class') }}
              </el-radio-button>
            </el-radio-group>
          </div>
        </el-card>
      </div>

      <!-- 园区重要公告 -->
      <div
        class="announcements-section"
        v-if="activeCategory === '' || activeCategory === 'announcement'"
      >
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title-wrapper">
                <UnifiedIcon name="notifications" :size="20" class="card-icon" />
                <span class="card-title">{{ t('teacher.notifications.importantAnnouncements') }}</span>
              </div>
              <el-tag type="danger" effect="light" size="small">
                {{ t('teacher.notifications.urgent') }}
              </el-tag>
            </div>
          </template>

          <div v-if="loading.announcements" class="loading-container">
            <el-skeleton :loading="loading.announcements" animated :count="2">
              <template #template>
                <div class="skeleton-item">
                  <el-skeleton-item variant="text" style="width: 30%; height: var(--spacing-2xl);" />
                  <el-skeleton-item variant="text" style="width: 80%; margin-top: var(--spacing-sm);" />
                  <el-skeleton-item variant="text" style="width: 100%; margin-top: var(--spacing-sm);" />
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="importantAnnouncements.length === 0" class="empty-container">
            <UnifiedIcon name="check" :size="48" class="empty-icon" />
            <p class="empty-text">{{ t('teacher.notifications.noAnnouncements') }}</p>
          </div>
          <div v-else class="announcement-list">
            <TransitionGroup name="announcement-list" tag="div">
              <div
                v-for="announcement in importantAnnouncements"
                :key="announcement.id"
                class="announcement-item"
                :class="{ 'urgent': announcement.priority === 'urgent' }"
                @click="handleViewAnnouncement(announcement)"
              >
                <div class="announcement-badge">
                  <UnifiedIcon
                    :name="announcement.priority === 'urgent' ? 'warning' : 'info'"
                    :size="14"
                  />
                </div>
                <div class="announcement-body">
                  <div class="announcement-header">
                    <span class="announcement-title">{{ announcement.title }}</span>
                    <el-tag
                      :type="announcement.priority === 'urgent' ? 'danger' : 'warning'"
                      size="small"
                      effect="light"
                    >
                      {{ announcement.priority === 'urgent' ? t('teacher.notifications.priorityUrgent') : t('teacher.notifications.priorityImportant') }}
                    </el-tag>
                  </div>
                  <p class="announcement-content">{{ announcement.content }}</p>
                  <div class="announcement-footer">
                    <span class="announcement-time">
                      <UnifiedIcon name="clock" :size="12" />
                      {{ formatRelativeTime(announcement.created_at) }}
                    </span>
                  </div>
                </div>
                <UnifiedIcon name="chevron-right" :size="18" class="announcement-arrow" />
              </div>
            </TransitionGroup>
          </div>
        </el-card>
      </div>

      <!-- 通知列表 -->
      <div class="notifications-list-section">
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title-wrapper">
                <UnifiedIcon name="messages" :size="20" class="card-icon" />
                <span class="card-title">{{ t('teacher.notifications.myNotifications') }}</span>
              </div>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" type="danger">
                <span class="notification-count">{{ t('teacher.notifications.totalCount', { total: pagination.total }) }}</span>
              </el-badge>
            </div>
          </template>

          <div v-if="loading.list" class="loading-container">
            <el-skeleton :loading="loading.list" animated :count="4">
              <template #template>
                <div class="skeleton-item">
                  <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
                  <div class="skeleton-text">
                    <el-skeleton-item variant="text" style="width: 70%;" />
                    <el-skeleton-item variant="text" style="width: 90%;" />
                    <el-skeleton-item variant="text" style="width: 50%;" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="notificationList.length === 0" class="empty-container">
            <UnifiedIcon name="notifications" :size="48" class="empty-icon" />
            <p class="empty-text">{{ t('teacher.notifications.noNotifications') }}</p>
          </div>
          <div v-else class="notification-items">
            <TransitionGroup name="notification-list" tag="div">
              <div
                v-for="notification in notificationList"
                :key="notification.id"
                class="notification-item"
                :class="{
                  'unread': !notification.is_read,
                  [getPriorityClass(notification.priority)]: true
                }"
                @click="handleNotificationClick(notification)"
              >
                <div class="item-icon" :class="getPriorityClass(notification.priority)">
                  <UnifiedIcon :name="getNotificationIcon(notification.type)" :size="18" />
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-title">{{ notification.title }}</span>
                    <el-tag
                      :type="getPriorityType(notification.priority)"
                      size="small"
                      effect="light"
                    >
                      {{ getPriorityText(notification.priority) }}
                    </el-tag>
                  </div>
                  <p class="item-summary">{{ notification.content }}</p>
                  <div class="item-footer">
                    <span class="item-category">
                      <UnifiedIcon :name="getCategoryIcon(notification.type)" :size="12" />
                      {{ getCategoryText(notification.type) }}
                    </span>
                    <span class="item-time">
                      <UnifiedIcon name="clock" :size="12" />
                      {{ formatRelativeTime(notification.created_at) }}
                    </span>
                  </div>
                </div>
                <div class="item-status">
                  <el-badge v-if="!notification.is_read" is-dot type="danger" />
                  <UnifiedIcon
                    :name="notification.is_read ? 'check' : 'chevron-right'"
                    :size="16"
                    class="status-icon"
                  />
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- 分页 -->
          <div class="pagination" v-if="pagination.total > 0">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <NotificationDetail
      v-model="notificationDetailVisible"
      :notification="currentNotification"
      @read="handleMarkRead"
      @delete="handleDeleteNotification"
    />
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
// 翻译函数 - 支持插值
const t = (key: string, params?: Record<string, any>) => {
  const translations: Record<string, string> = {
    'teacher.notifications.title': '消息通知',
    'teacher.notifications.description': '查看系统通知、公告和班级消息',
    'teacher.notifications.markAllRead': '全部已读',
    'teacher.notifications.refresh': '刷新',
    'teacher.notifications.unread': '未读消息',
    'teacher.notifications.needView': '需要查看',
    'teacher.notifications.total': '全部消息',
    'teacher.notifications.allMessages': '所有通知',
    'teacher.notifications.today': '今日消息',
    'teacher.notifications.receivedToday': '今日接收',
    'teacher.notifications.read': '已读消息',
    'teacher.notifications.readMessages': '已查看通知',
    'teacher.notifications.all': '全部',
    'teacher.notifications.system': '系统',
    'teacher.notifications.announcement': '公告',
    'teacher.notifications.class': '班级',
    'teacher.notifications.personal': '个人',
    'teacher.notifications.importantAnnouncements': '园区重要公告',
    'teacher.notifications.urgent': '紧急',
    'teacher.notifications.noAnnouncements': '暂无重要公告',
    'teacher.notifications.priorityUrgent': '紧急',
    'teacher.notifications.priorityImportant': '重要',
    'teacher.notifications.priorityNormal': '普通',
    'teacher.notifications.myNotifications': '我的通知',
    'teacher.notifications.totalCount': '共 {total} 条',
    'teacher.notifications.noNotifications': '暂无通知',
    'teacher.notifications.minutesAgo': '{minutes} 分钟前',
    'teacher.notifications.hoursAgo': '{hours} 小时前',
    'teacher.notifications.daysAgo': '{days} 天前',
    'teacher.notifications.markedAsRead': '已标记为已读',
    'teacher.notifications.markReadFailed': '标记已读失败',
    'teacher.notifications.confirmMarkAllRead': '确定将所有消息标记为已读？',
    'teacher.notifications.batchOperation': '批量操作',
    'teacher.notifications.allMarkedAsRead': '已全部标记为已读',
    'teacher.notifications.batchMarkReadFailed': '批量标记失败',
    'teacher.notifications.confirmDelete': '确定删除这条通知吗？',
    'teacher.notifications.confirmDeleteTitle': '删除确认',
    'teacher.notifications.deleted': '删除成功',
    'teacher.notifications.deleteFailed': '删除失败',
    'teacher.notifications.loadFailed': '加载通知失败',
    // 模拟数据文本
    'teacher.notifications.springSemesterNotice': '春季学期开学通知',
    'teacher.notifications.springSemesterContent': '各位家长好，春季学期将于2月20日正式开学，请各位家长提前做好开学准备。',
    'teacher.notifications.safetyManagementUpdate': '安全管理规定更新',
    'teacher.notifications.safetyManagementContent': '园区安全管理规定已更新，请各位教师认真学习并遵照执行。',
    'teacher.notifications.weeklyTeachingActivity': '本周教学活动安排',
    'teacher.notifications.weeklyTeachingContent': '本周将开展丰富多彩的教学活动，包括户外运动、美术手工等。',
    'teacher.notifications.parentMeetingNotice': '家长会通知',
    'teacher.notifications.parentMeetingContent': '定于本周六下午3点召开家长会，请各位家长准时参加。',
    'teacher.notifications.systemMaintenance': '系统维护通知',
    'teacher.notifications.systemMaintenanceContent': '系统将于今晚22:00-24:00进行维护升级，期间服务可能暂停。'
  }
  let result = translations[key] || key
  // 插值处理
  if (params) {
    Object.keys(params).forEach(paramKey => {
      result = result.replace(`{${paramKey}}`, String(params[paramKey]))
    })
  }
  return result
}
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'
import NotificationDetail from './components/NotificationDetail.vue'
import {
  getNotificationList,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '@/api/modules/notification'

// 加载状态
const loading = reactive({
  stats: false,
  list: false,
  announcements: false
})

const notificationDetailVisible = ref(false)
const currentNotification = ref<any>(null)
const activeCategory = ref('')

// 通知统计
const notificationStats = reactive({
  unread: 0,
  total: 0,
  today: 0
})

// 通知列表
const notificationList = ref<any[]>([])

// 重要公告列表
const importantAnnouncements = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 计算属性
const unreadCount = computed(() => notificationStats.unread)

// 图标映射
const iconMap: Record<string, string> = {
  system: 'info',
  announcement: 'notifications',
  class: 'classes',
  personal: 'user'
}

// 分类图标映射
const categoryIconMap: Record<string, string> = {
  system: 'info',
  announcement: 'notifications',
  class: 'classes',
  personal: 'user'
}

// 优先级类名映射
const priorityClassMap: Record<string, string> = {
  urgent: 'priority-urgent',
  important: 'priority-important',
  normal: 'priority-normal'
}

// 获取通知图标
const getNotificationIcon = (type: string): string => {
  return iconMap[type] || 'info'
}

// 获取分类图标
const getCategoryIcon = (type: string): string => {
  return categoryIconMap[type] || 'info'
}

// 获取优先级类名
const getPriorityClass = (priority: string): string => {
  return priorityClassMap[priority] || 'priority-normal'
}

// 获取优先级类型
const getPriorityType = (priority: string): string => {
  const map: Record<string, string> = {
    urgent: 'danger',
    important: 'warning',
    normal: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    urgent: t('teacher.notifications.priorityUrgent'),
    important: t('teacher.notifications.priorityImportant'),
    normal: t('teacher.notifications.priorityNormal')
  }
  return map[priority] || t('teacher.notifications.priorityNormal')
}

// 获取分类文本
const getCategoryText = (type: string): string => {
  const map: Record<string, string> = {
    system: t('teacher.notifications.system'),
    announcement: t('teacher.notifications.announcement'),
    class: t('teacher.notifications.class'),
    personal: t('teacher.notifications.personal')
  }
  return map[type] || t('teacher.notifications.system')
}

// 时间格式化
const formatRelativeTime = (dateTime: string) => {
  if (!dateTime) return ''
  const now = new Date()
  const date = new Date(dateTime)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return t('teacher.notifications.minutesAgo', { minutes })
  } else if (hours < 24) {
    return t('teacher.notifications.hoursAgo', { hours })
  } else {
    return t('teacher.notifications.daysAgo', { days })
  }
}

// 点击通知
const handleNotificationClick = (notification: any) => {
  currentNotification.value = notification
  notificationDetailVisible.value = true

  if (!notification.is_read) {
    handleMarkRead(notification)
  }
}

// 标记已读
const handleMarkRead = async (notification: any) => {
  try {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      notification.is_read = true
      notificationStats.unread--
      ElMessage.success(t('teacher.notifications.markedAsRead'))
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error(t('teacher.notifications.markReadFailed'))
  }
}

// 查看公告
const handleViewAnnouncement = (announcement: any) => {
  const announcementAsNotification = {
    ...announcement,
    type: 'announcement',
    is_read: true
  }
  currentNotification.value = announcementAsNotification
  notificationDetailVisible.value = true
}

// 全部已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm(
      t('teacher.notifications.confirmMarkAllRead'),
      t('teacher.notifications.batchOperation'),
      { type: 'warning' }
    )

    await markAllNotificationsAsRead()

    notificationList.value.forEach(item => {
      item.is_read = true
    })
    notificationStats.unread = 0
    ElMessage.success(t('teacher.notifications.allMarkedAsRead'))
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量标记已读失败:', error)
      ElMessage.error(t('teacher.notifications.batchMarkReadFailed'))
    }
  }
}

// 删除通知
const handleDeleteNotification = async (notification: any) => {
  try {
    await ElMessageBox.confirm(
      t('teacher.notifications.confirmDelete'),
      t('teacher.notifications.confirmDeleteTitle'),
      { type: 'warning' }
    )

    await deleteNotification(notification.id)

    const index = notificationList.value.findIndex(item => item.id === notification.id)
    if (index > -1) {
      notificationList.value.splice(index, 1)
    }

    if (!notification.is_read) {
      notificationStats.unread--
    }
    notificationStats.total--
    pagination.total--

    notificationDetailVisible.value = false
    ElMessage.success(t('teacher.notifications.deleted'))
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error(t('teacher.notifications.deleteFailed'))
    }
  }
}

// 分类切换
const handleCategoryChange = () => {
  pagination.page = 1
  loadNotifications()
}

// 页码切换
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadNotifications()
}

// 每页数量切换
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadNotifications()
}

// 刷新通知
const refreshNotifications = () => {
  loadNotifications()
}

// 加载数据
const loadNotifications = async () => {
  loading.list = true
  loading.stats = true
  loading.announcements = true

  try {
    // 并行加载数据
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
      const data = listResponse.data
      notificationList.value = (data.items || data.list || []).map((item: any, index: number) => ({
        id: item.id || index + 1,
        title: item.title || '通知标题',
        content: item.content || item.summary || '通知内容',
        type: item.type || 'system',
        priority: item.priority || 'normal',
        is_read: item.is_read || item.read || false,
        created_at: item.created_at || item.createdAt || new Date().toISOString()
      }))
      pagination.total = data.total || 0
    }

    // 更新统计数据
    if (statsResponse.data) {
      const stats = statsResponse.data
      notificationStats.unread = stats.unread || 0
      notificationStats.total = stats.total || 0
      notificationStats.today = stats.today || 0
    }

    // 加载重要公告
    await loadImportantAnnouncements()
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error(t('teacher.notifications.loadFailed'))

    // 使用模拟数据
    notificationStats.unread = 8
    notificationStats.total = 45
    notificationStats.today = 12

    importantAnnouncements.value = [
      {
        id: 'ann_1',
        title: t('teacher.notifications.springSemesterNotice'),
        content: t('teacher.notifications.springSemesterContent'),
        priority: 'urgent',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ann_2',
        title: t('teacher.notifications.safetyManagementUpdate'),
        content: t('teacher.notifications.safetyManagementContent'),
        priority: 'important',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    notificationList.value = [
      {
        id: 1,
        title: t('teacher.notifications.weeklyTeachingActivity'),
        content: t('teacher.notifications.weeklyTeachingContent'),
        type: 'announcement',
        priority: 'important',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 2,
        title: t('teacher.notifications.parentMeetingNotice'),
        content: t('teacher.notifications.parentMeetingContent'),
        type: 'class',
        priority: 'normal',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        title: t('teacher.notifications.systemMaintenance'),
        content: t('teacher.notifications.systemMaintenanceContent'),
        type: 'system',
        priority: 'urgent',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]

    pagination.total = 45
  } finally {
    loading.list = false
    loading.stats = false
    loading.announcements = false
  }
}

// 加载重要公告
const loadImportantAnnouncements = async () => {
  try {
    // 这里可以调用专门的公告API，暂时使用空数组
    // 如果API返回数据，则更新 importantAnnouncements
  } catch (error) {
    console.error('加载公告失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

/* ==================== 内容区域 ==================== */
.notifications-content {
  padding: var(--spacing-md);
}

.content-row {
  margin: 0 !important;
}

/* ==================== 操作按钮 ==================== */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
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

/* ==================== 筛选区域 ==================== */
.filter-section {
  margin-bottom: var(--spacing-md);

  .filter-card {
    border-radius: var(--radius-lg);
    border: var(--border-width-base) solid var(--border-color-light);
    background: var(--el-bg-color);
    transition: all var(--transition-base) ease;

    &:hover {
      box-shadow: var(--shadow-sm);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-sm) var(--spacing-md);
    }
  }

  .filter-content {
    display: flex;
    justify-content: center;
    overflow-x: auto;
    padding: var(--spacing-xs) 0;

    .category-tabs {
      display: flex;
      gap: var(--spacing-xs);

      :deep(.el-radio-button) {
        .el-radio-button__inner {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          border: var(--border-width-base) solid var(--border-color-light);
          background: var(--el-bg-color);
          box-shadow: none;
          transition: all var(--transition-fast) ease;

          &:hover {
            background: var(--bg-hover);
          }
        }

        &.is-active .el-radio-button__inner {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: var(--text-on-primary);
        }
      }
    }
  }
}

/* ==================== 公告区域 ==================== */
.announcements-section {
  margin-bottom: var(--spacing-md);
}

/* ==================== 通知列表区域 ==================== */
.notifications-list-section {
  margin-bottom: var(--spacing-md);
}

/* ==================== 通用卡片样式 ==================== */
.section-card {
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  background: var(--el-bg-color);
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-base) ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  :deep(.el-card__header) {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: var(--border-width-base) solid var(--border-color-lighter);
    background: var(--bg-tertiary);
  }

  :deep(.el-card__body) {
    padding: var(--spacing-md);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .card-title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .card-icon {
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .card-title {
        font-weight: var(--font-semibold);
        font-size: var(--text-base);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }
    }

    .notification-count {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
}

/* ==================== 公告列表 ==================== */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.announcement-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-fast) ease;

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
    box-shadow: var(--shadow-sm);

    &::before {
      opacity: 1;
    }

    .announcement-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.urgent {
    background: var(--danger-color-light-9);

    &::before {
      background: var(--danger-color);
      opacity: 1;
    }

    .announcement-badge {
      background: var(--danger-color-light-7);
      color: var(--danger-color);
    }

    &:hover {
      background: var(--danger-color-light-7);
    }
  }

  .announcement-badge {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--warning-color-light-9);
    color: var(--warning-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast) ease;
  }

  .announcement-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    .announcement-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      .announcement-title {
        font-weight: var(--font-semibold);
        font-size: var(--text-sm);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }
    }

    .announcement-content {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .announcement-footer {
      .announcement-time {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
    }
  }

  .announcement-arrow {
    flex-shrink: 0;
    color: var(--text-disabled);
    opacity: 0;
    transform: translateX(-4px);
    transition: all var(--transition-fast) ease;
  }
}

/* ==================== 通知列表 ==================== */
.notification-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 200px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-fast) ease;

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

    .item-status .status-icon {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.unread {
    background: var(--bg-active);

    &::before {
      opacity: 1;
      background: var(--primary-color);
    }
  }

  &.priority-urgent {
    .item-icon {
      background: var(--danger-color-light-9);
      color: var(--danger-color);
    }
  }

  &.priority-important {
    .item-icon {
      background: var(--warning-color-light-9);
      color: var(--warning-color);
    }
  }

  &.priority-normal {
    .item-icon {
      background: var(--info-color-light-9);
      color: var(--info-color);
    }
  }

  .item-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--primary-light-bg);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast) ease;
  }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    .item-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      .item-title {
        font-weight: var(--font-semibold);
        font-size: var(--text-sm);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }
    }

    .item-summary {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-footer {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;

      .item-category,
      .item-time {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
    }
  }

  .item-status {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    .status-icon {
      color: var(--text-disabled);
      opacity: 0;
      transform: translateX(-4px);
      transition: all var(--transition-fast) ease;
    }
  }
}

/* ==================== 加载和空状态 ==================== */
.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

.empty-container {
  .empty-icon {
    color: var(--text-disabled);
    opacity: 0.5;
  }

  .empty-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: center;
  }
}

.skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);

  .skeleton-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* ==================== 分页 ==================== */
.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--border-color-lighter);

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: transparent;
  }
}

/* ==================== 列表动画 ==================== */
.announcement-list-enter-active,
.announcement-list-leave-active,
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.announcement-list-enter-from,
.announcement-list-leave-to,
.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.announcement-list-move,
.notification-list-move {
  transition: transform 0.3s ease;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-lg)) {
  .notifications-content {
    padding: var(--spacing-sm);
  }

  .section-card {
    :deep(.el-card__body) {
      padding: var(--spacing-sm);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .filter-section {
    .filter-content {
      justify-content: flex-start;

      .category-tabs {
        :deep(.el-radio-button__inner) {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-xs);

          span {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs);
          }
        }
      }
    }
  }

  .announcement-item {
    flex-direction: column;
    gap: var(--spacing-sm);

    .announcement-badge {
      width: var(--spacing-2xl);
      height: var(--spacing-2xl);
    }

    .announcement-arrow {
      display: none;
    }
  }

  .notification-item {
    flex-direction: column;
    gap: var(--spacing-sm);

    .item-icon {
      width: 32px;
      height: 32px;
    }

    .item-status {
      align-self: flex-end;

      .status-icon {
        display: none;
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .announcement-item {
    padding: var(--spacing-sm);

    .announcement-title {
      font-size: var(--text-xs);
    }

    .announcement-content {
      font-size: var(--spacing-md);
    }
  }

  .notification-item {
    padding: var(--spacing-sm);

    .item-title {
      font-size: var(--text-xs);
    }

    .item-summary {
      font-size: var(--spacing-md);
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

  .announcement-item,
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

  .filter-card {
    border-color: var(--border-color-dark);
    background: var(--bg-card-dark);
  }
}
</style>
