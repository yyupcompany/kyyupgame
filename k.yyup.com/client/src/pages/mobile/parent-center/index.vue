<template>
  <MobileSubPageLayout title="家长工作台" back-path="/mobile/parent-center">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div
          class="stat-card stat-primary"
          @click="goToChildren"
        >
          <div class="stat-icon">
            <van-icon name="contact" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ childrenCount }}</div>
            <div class="stat-title">我的孩子</div>
            <div class="stat-unit">个</div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <van-icon name="description" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ assessmentCount }}</div>
            <div class="stat-title">测评记录</div>
            <div class="stat-unit">次</div>
          </div>
        </div>

        <div
          class="stat-card stat-warning"
          @click="goToActivities"
        >
          <div class="stat-icon">
            <van-icon name="calendar-o" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activityCount }}</div>
            <div class="stat-title">活动报名</div>
            <div class="stat-unit">个</div>
          </div>
        </div>

        <div
          class="stat-card stat-danger"
          @click="goToNotifications"
        >
          <div class="stat-icon">
            <van-icon name="bell-o" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ messageCount }}</div>
            <div class="stat-title">未读消息</div>
            <div class="stat-unit">条</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="title-icon">📅</span>
          <span>最近活动</span>
        </div>
        <van-button type="primary" size="mini" @click="goToActivities">
          查看更多
        </van-button>
      </div>

      <div class="activity-list">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item"
          @click="viewActivityDetail(activity)"
        >
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
      </div>

      <van-empty v-if="recentActivities.length === 0" description="暂无活动" />
    </div>

    <!-- 最新通知 -->
    <div class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="title-icon">🔔</span>
          <span>最新通知</span>
        </div>
        <van-button type="primary" size="mini" @click="goToNotifications">
          查看更多
        </van-button>
      </div>

      <div class="notification-list">
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="notification-item"
          @click="viewNotificationDetail(notification)"
        >
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-time">{{ notification.time }}</div>
          </div>
          <van-icon name="arrow" class="item-arrow" />
        </div>
      </div>

      <van-empty v-if="recentNotifications.length === 0" description="暂无通知" />
    </div>

    <!-- 孩子成长概览 -->
    <div class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="title-icon">👨‍👩‍👧‍👦</span>
          <span>孩子成长概览</span>
        </div>
        <van-button type="primary" size="mini" @click="goToChildren">
          管理孩子
        </van-button>
      </div>

      <div class="children-grid">
        <div
          v-for="child in children"
          :key="child.id"
          class="child-card"
          @click="viewChildGrowth(child.id)"
        >
          <div class="child-avatar-wrapper">
            <van-image
              :src="child.avatar"
              width="60"
              height="60"
              round
              class="child-avatar"
            >
              <template #error>
                <div class="avatar-placeholder">{{ child.name.charAt(0) }}</div>
              </template>
            </van-image>
          </div>
          <div class="child-info">
            <div class="child-name">{{ child.name }}</div>
            <div class="child-class">{{ child.className }}</div>
          </div>
          <div class="child-actions">
            <van-button type="primary" size="small">
              查看成长
            </van-button>
          </div>
        </div>
      </div>

      <van-empty v-if="children.length === 0" description="暂无孩子信息" />
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" color="var(--primary-color)" vertical>
      加载中...
    </van-loading>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showToast } from 'vant'
import { request } from '@/utils/request'

interface Child {
  id: string | number
  name: string
  className: string
  avatar?: string
  age?: number
  status?: string
}

interface Activity {
  id: string | number
  title: string
  time: string
  type?: string
  description?: string
}

interface Notification {
  id: string | number
  title: string
  time: string
  type?: string
  description?: string
  isRead?: boolean
}

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)

// 家长信息
const parentName = ref('家长')
const childrenCount = ref(0)
const assessmentCount = ref(0)
const activityCount = ref(0)
const messageCount = ref(0)

// 数据列表
const children = ref<Child[]>([])
const recentActivities = ref<Activity[]>([])
const recentNotifications = ref<Notification[]>([])

// 加载仪表板数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    // 获取当前用户信息
    const currentUser = userStore.userInfo
    parentName.value = currentUser?.realName || currentUser?.username || '家长'

    // 并行加载数据
    await Promise.all([
      loadChildrenData(),
      loadActivitiesData(),
      loadNotificationsData(),
      loadStatsData()
    ])
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    showToast('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载孩子数据
const loadChildrenData = async () => {
  try {
    const parentId = userStore.userInfo?.id
    if (!parentId) {
      console.warn('无法获取家长ID')
      children.value = []
      childrenCount.value = 0
      return
    }

    const response = await request.get('/api/students', {
      params: {
        parentId: parentId,
        page: 1,
        pageSize: 10
      }
    })

    if (response.success && response.data) {
      const data = response.data
      let studentList: Child[] = []
      
      if (Array.isArray(data)) {
        studentList = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          className: s.className || s.class?.name || '未分班',
          avatar: s.avatar || '',
          age: s.age || calculateAge(s.birthday),
          status: s.status || '在园'
        }))
      } else if (data.rows && Array.isArray(data.rows)) {
        studentList = data.rows.map((s: any) => ({
          id: s.id,
          name: s.name,
          className: s.className || s.class?.name || '未分班',
          avatar: s.avatar || '',
          age: s.age || calculateAge(s.birthday),
          status: s.status || '在园'
        }))
      } else if (data.items && Array.isArray(data.items)) {
        studentList = data.items.map((s: any) => ({
          id: s.id,
          name: s.name,
          className: s.className || s.class?.name || '未分班',
          avatar: s.avatar || '',
          age: s.age || calculateAge(s.birthday),
          status: s.status || '在园'
        }))
      }
      
      children.value = studentList
      childrenCount.value = studentList.length
    } else {
      children.value = []
      childrenCount.value = 0
    }
  } catch (error) {
    console.error('加载孩子数据失败:', error)
    children.value = []
    childrenCount.value = 0
  }
}

// 计算年龄
const calculateAge = (birthday: string | null | undefined): number => {
  if (!birthday) return 0
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age > 0 ? age : 0
}

// 加载活动数据
const loadActivitiesData = async () => {
  try {
    const response = await request.get('/api/activities', {
      params: {
        page: 1,
        pageSize: 5,
        status: 'upcoming'
      }
    })

    if (response.success && response.data) {
      const data = response.data
      let activityList: Activity[] = []
      
      const activities = Array.isArray(data) ? data : (data.rows || data.items || [])
      activityList = activities.slice(0, 5).map((a: any) => ({
        id: a.id,
        title: a.title || a.name,
        time: formatActivityTime(a.startTime || a.start_time),
        type: a.type || 'general'
      }))
      
      recentActivities.value = activityList
      activityCount.value = activityList.length
    } else {
      recentActivities.value = []
      activityCount.value = 0
    }
  } catch (error) {
    console.error('加载活动数据失败:', error)
    recentActivities.value = []
    activityCount.value = 0
  }
}

// 格式化活动时间
const formatActivityTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '待定'
  try {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

// 加载通知数据
const loadNotificationsData = async () => {
  try {
    const response = await request.get('/api/notifications', {
      params: {
        page: 1,
        pageSize: 5,
        unreadOnly: false
      }
    })

    if (response.success && response.data) {
      const data = response.data
      let notificationList: Notification[] = []
      
      const notifications = Array.isArray(data) ? data : (data.rows || data.items || [])
      notificationList = notifications.slice(0, 5).map((n: any) => ({
        id: n.id,
        title: n.title,
        time: formatActivityTime(n.createdAt || n.created_at),
        type: n.type || 'system',
        isRead: n.isRead || n.is_read || false
      }))
      
      recentNotifications.value = notificationList
      messageCount.value = notificationList.filter(n => !n.isRead).length
    } else {
      recentNotifications.value = []
      messageCount.value = 0
    }
  } catch (error) {
    console.error('加载通知数据失败:', error)
    recentNotifications.value = []
    messageCount.value = 0
  }
}

// 加载统计数据
const loadStatsData = async () => {
  try {
    const parentId = userStore.userInfo?.id
    if (!parentId) {
      assessmentCount.value = 0
      return
    }

    // 尝试获取测评记录数
    const response = await request.get('/api/assessments/parent-stats', {
      params: { parentId }
    })
    
    if (response.success && response.data) {
      assessmentCount.value = response.data.totalCount || response.data.count || 0
    } else {
      assessmentCount.value = 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 统计API可能不存在，设为0而不是显示错误
    assessmentCount.value = 0
  }
}

// 导航方法
const goToChildren = () => {
  router.push('/mobile/parent-center/children')
}

const goToActivities = () => {
  router.push('/mobile/parent-center/activities')
}

const goToNotifications = () => {
  router.push('/mobile/parent-center/notifications')
}

const viewChildGrowth = (childId: string | number) => {
  router.push(`/mobile/parent-center/child-growth?id=${childId}`)
}

const viewActivityDetail = (activity: Activity) => {
  router.push(`/mobile/parent-center/activity-detail?id=${activity.id}`)
}

const viewNotificationDetail = (notification: Notification) => {
  router.push(`/mobile/parent-center/notification-detail?id=${notification.id}`)
}

// 错误处理
const handleApiError = (error: any, defaultMessage: string = '操作失败') => {
  console.error(error)
  const message = error?.response?.data?.message || error?.message || defaultMessage
  showToast(message)
}

// 下拉刷新
const handleRefresh = async () => {
  await loadDashboardData()
  showToast('刷新成功')
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

// 统计卡片区域
.stats-section {
  background: var(--card-bg);
  margin-bottom: var(--spacing-md);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    .stat-card {
      position: relative;
      padding: var(--spacing-lg) 16px;
      border-radius: var(--spacing-md);
      background: var(--bg-page);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:active {
        transform: scale(0.98);
      }

      &.stat-primary {
        background: var(--gradient-primary);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-success {
        background: var(--gradient-success);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-warning {
        background: linear-gradient(135deg, var(--warning-color) 0%, var(--warning-hover) 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-danger {
        background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--spacing-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }

      .stat-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          line-height: 1;
        }

        .stat-title {
          font-size: var(--text-sm);
          opacity: 0.9;
          line-height: 1.2;
        }

        .stat-unit {
          font-size: var(--text-xs);
          opacity: 0.8;
        }
      }
    }
  }
}

// 内容区域
.content-section {
  background: var(--card-bg);
  margin-bottom: var(--spacing-md);
  border-radius: var(--spacing-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 16px 12px;
    border-bottom: 1px solid var(--border-light);

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);

      .title-icon {
        font-size: var(--text-lg);
      }
    }
  }

  // 活动列表
  .activity-list {
    padding: 0 16px 16px;

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--border-light);
      transition: background-color 0.2s ease;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: var(--bg-page);
        margin: 0 -16px;
        padding: 14px 16px;
        border-radius: var(--spacing-sm);
      }

      .activity-content {
        flex: 1;
        min-width: 0;

        .activity-title {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-time {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: 1.4;
        }
      }

      .item-arrow {
        color: #999;
        font-size: var(--text-base);
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
        margin-left: var(--spacing-md);
      }

      &:active .item-arrow {
        opacity: 1;
        color: var(--primary-color);
      }
    }
  }

  // 通知列表
  .notification-list {
    padding: 0 16px 16px;

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--border-light);
      transition: background-color 0.2s ease;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: var(--bg-page);
        margin: 0 -16px;
        padding: 14px 16px;
        border-radius: var(--spacing-sm);
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notification-time {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: 1.4;
        }
      }

      .item-arrow {
        color: #999;
        font-size: var(--text-base);
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
        margin-left: var(--spacing-md);
      }

      &:active .item-arrow {
        opacity: 1;
        color: var(--primary-color);
      }
    }
  }

  // 孩子网格
  .children-grid {
    padding: var(--spacing-md);
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);

    .child-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-page);
      border-radius: var(--spacing-md);
      border: 1px solid var(--border-light);
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        background: var(--card-bg);
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        transform: translateY(-1px);
      }

      .child-avatar-wrapper {
        margin-right: var(--spacing-md);
        position: relative;

        .child-avatar {
          border: 2px solid var(--primary-color);
          background: var(--primary-light);

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;
            font-size: var(--text-lg);
            font-weight: bold;
            border-radius: 50%;
          }
        }
      }

      .child-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);

        .child-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .child-class {
          font-size: var(--text-sm);
          color: #666;
        }
      }

      .child-actions {
        margin-left: var(--spacing-md);

        :deep(.van-button) {
          border-radius: var(--spacing-xl);
          padding: 0 16px;
        }
      }
    }
  }
}

// 加载状态
.van-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

// 空状态
:deep(.van-empty) {
  padding: 40px 20px;
}

// 响应式设计
@media (min-width: 768px) {
  .stats-section {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-md);
      padding: var(--spacing-md);

      .stat-card {
        padding: var(--spacing-lg) 20px;

        .stat-icon {
          width: 56px;
          height: 56px;
        }

        .stat-content {
          .stat-value {
            font-size: var(--text-3xl);
          }

          .stat-title {
            font-size: var(--text-base);
          }
        }
      }
    }
  }

  .content-section {
    .children-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-md);
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .content-section {
    background: var(--bg-card);
    border-color: var(--text-primary);

    .section-header {
      border-color: var(--text-primary);

      .section-title {
        color: #fff;
      }
    }

    .activity-item,
    .notification-item {
      border-color: var(--text-primary);

      & {
        background-color: var(--bg-page);
      }

      .activity-title,
      .notification-title {
        color: #fff;
      }

      .activity-time,
      .notification-time {
        color: #999;
      }
    }

    .child-card {
      background: var(--bg-page);
      border-color: var(--text-primary);

      &:active {
        background: var(--text-primary);
      }

      .child-name {
        color: #fff;
      }

      .child-class {
        color: #ccc;
      }
    }
  }

  .stats-section {
    .stat-card {
      &:not(.stat-primary):not(.stat-success):not(.stat-warning):not(.stat-danger) {
        background: var(--bg-page);
        border-color: var(--text-primary);
      }
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-section {
  animation: fadeInUp 0.4s ease-out;
}

.stat-card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.3s;
}
</style>
