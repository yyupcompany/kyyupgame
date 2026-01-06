<template>
  <MobileMainLayout
    title="家长工作台"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
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
    <van-loading v-if="loading" type="spinner" color="#1989fa" vertical>
      加载中...
    </van-loading>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { showToast } from 'vant'
import parentApi from '@/api/modules/parent'
import { ApiResponse } from '@/utils/request'

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
    // TODO: 根据当前家长ID获取孩子列表
    // const response = await parentApi.getParentChildren(currentUser.id)

    // 临时模拟数据
    const mockChildren: Child[] = [
      {
        id: 1,
        name: '张小明',
        className: '大班一班',
        avatar: 'https://via.placeholder.com/60',
        age: 6,
        status: '在园'
      },
      {
        id: 2,
        name: '张小红',
        className: '中班二班',
        avatar: 'https://via.placeholder.com/60',
        age: 5,
        status: '在园'
      }
    ]

    children.value = mockChildren
    childrenCount.value = mockChildren.length
  } catch (error) {
    console.error('加载孩子数据失败:', error)
    children.value = []
    childrenCount.value = 0
  }
}

// 加载活动数据
const loadActivitiesData = async () => {
  try {
    // TODO: 调用活动API获取最近活动
    // const response = await activityApi.getRecentActivities()

    // 临时模拟数据
    const mockActivities: Activity[] = [
      { id: 1, title: '秋游活动', time: '2024-11-05 09:00', type: 'outdoor' },
      { id: 2, title: '亲子运动会', time: '2024-11-10 14:00', type: 'sports' }
    ]

    recentActivities.value = mockActivities
    activityCount.value = mockActivities.length
  } catch (error) {
    console.error('加载活动数据失败:', error)
    recentActivities.value = []
    activityCount.value = 0
  }
}

// 加载通知数据
const loadNotificationsData = async () => {
  try {
    // TODO: 调用通知API获取最新通知
    // const response = await notificationApi.getRecentNotifications()

    // 临时模拟数据
    const mockNotifications: Notification[] = [
      { id: 1, title: '明天停课通知', time: '2024-10-30 10:00', type: 'system', isRead: false },
      { id: 2, title: '家长会通知', time: '2024-10-28 15:30', type: 'meeting', isRead: false }
    ]

    recentNotifications.value = mockNotifications
    messageCount.value = mockNotifications.filter(n => !n.isRead).length
  } catch (error) {
    console.error('加载通知数据失败:', error)
    recentNotifications.value = []
    messageCount.value = 0
  }
}

// 加载统计数据
const loadStatsData = async () => {
  try {
    // TODO: 调用统计API获取测评记录数等统计数据
    // const response = await statisticsApi.getParentStats()

    // 临时模拟数据
    assessmentCount.value = 5
  } catch (error) {
    console.error('加载统计数据失败:', error)
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
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

// 统计卡片区域
.stats-section {
  background: var(--card-bg);
  margin-bottom: 12px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    .stat-card {
      position: relative;
      padding: var(--spacing-lg) 16px;
      border-radius: 12px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:active {
        transform: scale(0.98);
      }

      &.stat-primary {
        background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-success {
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-warning {
        background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      &.stat-danger {
        background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        color: white;
        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
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
        gap: 2px;

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
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 16px 12px;
    border-bottom: 1px solid #f0f0f0;

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base);
      font-weight: 600;
      color: #333;

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
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f8f9fa;
        margin: 0 -16px;
        padding: 14px 16px;
        border-radius: 8px;
      }

      .activity-content {
        flex: 1;
        min-width: 0;

        .activity-title {
          font-size: var(--text-base);
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-time {
          font-size: var(--text-sm);
          color: #999;
          line-height: 1.4;
        }
      }

      .item-arrow {
        color: #999;
        font-size: var(--text-base);
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
        margin-left: 12px;
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
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f8f9fa;
        margin: 0 -16px;
        padding: 14px 16px;
        border-radius: 8px;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: var(--text-base);
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notification-time {
          font-size: var(--text-sm);
          color: #999;
          line-height: 1.4;
        }
      }

      .item-arrow {
        color: #999;
        font-size: var(--text-base);
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
        margin-left: 12px;
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
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        background: var(--card-bg);
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        transform: translateY(-1px);
      }

      .child-avatar-wrapper {
        margin-right: 12px;
        position: relative;

        .child-avatar {
          border: 2px solid #409eff;
          background: #f0f8ff;

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
          color: #333;
        }

        .child-class {
          font-size: var(--text-sm);
          color: #666;
        }
      }

      .child-actions {
        margin-left: 12px;

        :deep(.van-button) {
          border-radius: 20px;
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
    background: #1a1a1a;
    border-color: #333;

    .section-header {
      border-color: #333;

      .section-title {
        color: #fff;
      }
    }

    .activity-item,
    .notification-item {
      border-color: #333;

      &:active {
        background-color: #2a2a2a;
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
      background: #2a2a2a;
      border-color: #333;

      &:active {
        background: #333;
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
        background: #2a2a2a;
        border-color: #333;
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
