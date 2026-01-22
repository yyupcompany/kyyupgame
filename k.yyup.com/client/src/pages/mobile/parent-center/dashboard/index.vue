<template>
  <MobileSubPageLayout title="家长工作台" back-path="/mobile/parent-center">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <van-image
          class="avatar"
          :src="parentAvatar"
          fit="cover"
          round
          width="60"
          height="60"
        >
          <template #error>
            <van-icon name="contact" size="40" />
          </template>
        </van-image>
        <div class="welcome-text">
          <div class="greeting" v-if="parentName">欢迎回来，{{ parentName }}</div>
          <div class="greeting" v-else>欢迎回来</div>
          <div class="subtitle">孩子的成长，我们一起守护</div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <van-grid :column-num="4" :gutter="12" class="stats-grid" v-if="!loading">
        <van-grid-item @click="goToChildren">
          <van-icon name="contact" size="24" color="#409EFF" />
          <div class="stat-value">{{ childrenCount }}</div>
          <div class="stat-label">我的孩子</div>
        </van-grid-item>
        <van-grid-item>
          <van-icon name="records" size="24" color="#67C23A" />
          <div class="stat-value">{{ assessmentCount }}</div>
          <div class="stat-label">测评记录</div>
        </van-grid-item>
        <van-grid-item @click="goToActivities">
          <van-icon name="calendar-o" size="24" color="#E6A23C" />
          <div class="stat-value">{{ activityCount }}</div>
          <div class="stat-label">活动报名</div>
        </van-grid-item>
        <van-grid-item @click="goToNotifications">
          <van-icon name="bell" size="24" color="#F56C6C" />
          <div class="stat-value">{{ messageCount }}</div>
          <div class="stat-label">未读消息</div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 孩子成长概览 -->
      <div class="content-card">
        <div class="card-header">
          <div class="header-title">
            <span class="title-icon">👨‍👩‍👧‍👦</span>
            <span>孩子成长概览</span>
          </div>
          <van-button type="primary" size="small" @click="goToChildren">
            管理孩子
          </van-button>
        </div>
        <div v-if="children.length > 0" class="children-list">
          <div v-for="child in children" :key="child.id" class="child-card">
            <div class="child-avatar-wrapper">
              <van-image
                class="child-avatar"
                :src="child.avatar"
                round
                width="60"
                height="60"
                lazy-load
              >
                <template #error>
                  <van-icon name="contact" size="30" />
                </template>
              </van-image>
            </div>
            <div class="child-info">
              <div class="child-name">{{ child.name }}</div>
              <div class="child-class">{{ child.className }}</div>
            </div>
            <van-button
              type="primary"
              size="small"
              @click="viewChildGrowth(child.id)"
            >
              查看成长
            </van-button>
          </div>
        </div>
        <van-empty v-else description="暂无孩子信息" />
      </div>

      <!-- 最近活动和最新通知 -->
      <div class="cards-row">
        <!-- 最近活动 -->
        <div class="content-card half-card">
          <div class="card-header">
            <div class="header-title">
              <span class="title-icon">📅</span>
              <span>最近活动</span>
            </div>
            <van-button
              text
              type="primary"
              size="small"
              @click="goToActivities"
            >
              查看更多
            </van-button>
          </div>
          <div v-if="recentActivities.length > 0" class="items-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="list-item"
              @click="goToActivityDetail(activity.id)"
            >
              <div class="item-content">
                <div class="item-title">{{ activity.title }}</div>
                <div class="item-time">{{ activity.time }}</div>
              </div>
              <van-icon name="arrow" />
            </div>
          </div>
          <van-empty v-else description="暂无活动" />
        </div>

        <!-- 最新通知 -->
        <div class="content-card half-card">
          <div class="card-header">
            <div class="header-title">
              <span class="title-icon">🔔</span>
              <span>最新通知</span>
            </div>
            <van-button
              text
              type="primary"
              size="small"
              @click="goToNotifications"
            >
              查看更多
            </van-button>
          </div>
          <div v-if="recentNotifications.length > 0" class="items-list">
            <div
              v-for="notification in recentNotifications"
              :key="notification.id"
              class="list-item"
              @click="goToNotificationDetail(notification.id)"
            >
              <div class="item-content">
                <div class="item-title">{{ notification.title }}</div>
                <div class="item-time">{{ notification.time }}</div>
              </div>
              <van-icon name="arrow" />
            </div>
          </div>
          <van-empty v-else description="暂无通知" />
        </div>
      </div>

      <!-- AI助手建议 -->
      <div class="content-card">
        <div class="card-header">
          <div class="header-title">
            <span class="title-icon">🤖</span>
            <span>AI助手建议</span>
          </div>
          <van-button
            text
            type="primary"
            size="small"
            @click="goToAIAssistant"
          >
            查看更多
          </van-button>
        </div>
        <div v-if="aiSuggestions.length > 0" class="ai-suggestions">
          <div
            v-for="suggestion in aiSuggestions"
            :key="suggestion.id"
            class="suggestion-item"
          >
            <div class="suggestion-icon">
              <van-icon :name="suggestion.icon" size="20" />
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-desc">{{ suggestion.description }}</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无AI建议" />
      </div>

      <!-- 社区互动统计 -->
      <div class="content-card">
        <div class="card-header">
          <div class="header-title">
            <span class="title-icon">👥</span>
            <span>社区互动</span>
          </div>
        </div>
        <div class="community-stats">
          <div class="stat-item">
            <div class="stat-number">{{ communityStats.posts }}</div>
            <div class="stat-text">发布动态</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ communityStats.likes }}</div>
            <div class="stat-text">获得点赞</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ communityStats.comments }}</div>
            <div class="stat-text">收到评论</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading" />

    <!-- 错误提示 -->
    <van-notify v-model:show="showError" type="danger" :message="errorMessage" />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import parentApi from '@/api/modules/parent'
import activityApi from '@/api/modules/activity'
import notificationApi from '@/api/modules/notification'
import request from '@/utils/request'

const router = useRouter()

// 加载状态
const loading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 家长信息
const parentName = ref('家长')
const parentAvatar = ref('')
const childrenCount = ref(0)
const assessmentCount = ref(0)
const activityCount = ref(0)
const messageCount = ref(0)

// 孩子列表
const children = ref<any[]>([])

// 最近活动
const recentActivities = ref<any[]>([])

// 最新通知
const recentNotifications = ref<any[]>([])

// AI助手建议
const aiSuggestions = ref<any[]>([])

// 社区互动统计
const communityStats = ref({
  posts: 0,
  likes: 0,
  comments: 0
})

// 错误处理
const handleError = (error: any, message: string) => {
  console.error(message, error)
  errorMessage.value = message
  showError.value = true
  loading.value = false
}

// 加载仪表板数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    // 获取家长信息
    parentName.value = localStorage.getItem('user_name') || '家长'
    parentAvatar.value = localStorage.getItem('user_avatar') || ''

    // ✅ 使用真实的API调用，与PC端保持一致
    console.log('🔄 开始加载家长中心数据...')

    // 1. 获取孩子列表
    try {
      const childrenResponse = await request.get('/api/parents/children')
      if (childrenResponse.data && Array.isArray(childrenResponse.data.items)) {
        children.value = childrenResponse.data.items.map((child: any) => ({
          id: child.id,
          name: child.name || '未命名',
          avatar: child.avatar || '',
          className: child.className || '未分班'
        }))
        childrenCount.value = children.value.length
        console.log('👨‍👩‍👧‍👦 孩子数量:', childrenCount.value)
      }
    } catch (error) {
      console.warn('⚠️ 获取孩子列表失败:', error)
      children.value = []
      childrenCount.value = 0
    }

    // 2. 获取统计数据
    try {
      const statsResponse = await request.get('/api/parents/stats')
      if (statsResponse.data) {
        assessmentCount.value = statsResponse.data.assessmentCount || 0
        activityCount.value = statsResponse.data.activityCount || 0
        messageCount.value = statsResponse.data.messageCount || 0
        console.log('📊 统计数据:', statsResponse.data)
      }
    } catch (error) {
      console.warn('⚠️ 获取统计数据失败:', error)
      assessmentCount.value = 0
      activityCount.value = 0
      messageCount.value = 0
    }

    // 3. 获取最近活动
    try {
      const activitiesResponse = await request.get('/api/activities', {
        params: { limit: 5, sortBy: 'startDate', sortOrder: 'desc' }
      })
      if (activitiesResponse.data && Array.isArray(activitiesResponse.data.items)) {
        recentActivities.value = activitiesResponse.data.items.slice(0, 5).map((activity: any) => ({
          id: activity.id,
          title: activity.title || '未命名活动',
          time: activity.startDate || ''
        }))
      }
    } catch (error) {
      console.warn('⚠️ 获取最近活动失败:', error)
      recentActivities.value = []
    }

    // 4. 获取最新通知
    try {
      const notificationsResponse = await request.get('/api/notifications', {
        params: { limit: 5, isRead: false }
      })
      if (notificationsResponse.data && Array.isArray(notificationsResponse.data.items)) {
        recentNotifications.value = notificationsResponse.data.items.slice(0, 5).map((notification: any) => ({
          id: notification.id,
          title: notification.title || '无标题',
          time: notification.createdAt || '',
          isRead: notification.isRead || false
        }))
      }
    } catch (error) {
      console.warn('⚠️ 获取最新通知失败:', error)
      recentNotifications.value = []
    }

    // 5. AI助手建议（静态数据）
    aiSuggestions.value = [
      { id: 1, icon: 'bulb-o', title: '关注孩子情绪变化', description: '建议多与孩子沟通，了解其在园所的生活情况' },
      { id: 2, icon: 'clock-o', title: '合理安排作息时间', description: '保证孩子充足的睡眠，有助于身体发育' }
    ]

    console.log('✅ 家长中心数据加载完成')
    console.log('- 孩子数量:', childrenCount.value)
    console.log('- 测评记录:', assessmentCount.value)
    console.log('- 活动报名:', activityCount.value)
    console.log('- 未读消息:', messageCount.value)

  } catch (error) {
    handleError(error, '加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 导航方法
const goToChildren = () => {
  showToast('正在跳转到孩子管理...')
  router.push('/mobile/parent-center/children')
}
const goToActivities = () => {
  showToast('正在跳转到活动中心...')
  router.push('/mobile/parent-center/activities')
}
const goToNotifications = () => {
  showToast('正在跳转到通知中心...')
  router.push('/mobile/parent-center/notifications')
}
const goToAIAssistant = () => {
  showToast('正在打开AI助手...')
  router.push('/mobile/parent-center/ai-assistant')
}
const viewChildGrowth = (childId: number) => {
  showToast('正在查看成长档案...')
  router.push(`/mobile/parent-center/children/growth/${childId}`)
}
const goToActivityDetail = (activityId: number) => {
  showToast('正在查看活动详情...')
  router.push(`/mobile/parent-center/activities/${activityId}`)
}
const goToNotificationDetail = (notificationId: number) => {
  showToast('正在查看通知详情...')
  router.push(`/mobile/parent-center/notifications/${notificationId}`)
}

// 页面加载时获取数据
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

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.welcome-section {
  padding: var(--spacing-lg) 16px;
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
  color: white;
  margin-bottom: 16px;

  .welcome-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .avatar {
      width: 60px;
      height: 60px;
      background: var(--card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .welcome-text {
      flex: 1;

      .greeting {
        font-size: var(--text-lg);
        font-weight: 600;
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: var(--text-sm);
        opacity: 0.9;
      }
    }
  }
}

.stats-section {
  padding: 0 16px;
  margin-bottom: 16px;

  .stats-grid {
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;

    :deep(.van-grid-item__content) {
      padding: var(--spacing-md) 8px;
      background: var(--card-bg);

      &:active {
        background: #f5f5f5;
      }
    }

    .stat-value {
      font-size: var(--text-xl);
      font-weight: 600;
      color: #333;
      margin: var(--spacing-sm) 0 4px;
    }

    .stat-label {
      font-size: var(--text-xs);
      color: #999;
    }
  }
}

.main-content {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &.half-card {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title {
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
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  .child-card {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:active {
      background: #e9ecef;
      transform: scale(0.98);
    }

    .child-avatar-wrapper {
      margin-right: 12px;

      .child-avatar {
        background: #e9ecef;
      }
    }

    .child-info {
      flex: 1;

      .child-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .child-class {
        font-size: var(--text-sm);
        color: #666;
      }
    }
  }
}

.cards-row {
  display: flex;
  gap: var(--spacing-md);

  .content-card {
    flex: 1;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0;

  .list-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f5f5f5;
      margin: 0 -16px;
      padding: var(--spacing-md) 16px;
      border-radius: 8px;
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-title {
        font-size: var(--text-sm);
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-time {
        font-size: var(--text-xs);
        color: #999;
      }
    }

    .van-icon {
      color: #999;
      margin-left: 8px;
    }
  }
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  .suggestion-item {
    display: flex;
    align-items: flex-start;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;

    .suggestion-icon {
      width: 36px;
      height: 36px;
      background: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .suggestion-content {
      flex: 1;

      .suggestion-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .suggestion-desc {
        font-size: var(--text-sm);
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

.community-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md) 0;

  .stat-item {
    text-align: center;

    .stat-number {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 4px;
    }

    .stat-text {
      font-size: var(--text-sm);
      color: #666;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

// 响应式设计
@media (min-width: 768px) {
  .main-content {
    max-width: 768px;
    margin: 0 auto;
  }

  .cards-row {
    flex-direction: row;
  }

  .stats-section {
    .stats-grid {
      max-width: 768px;
      margin: 0 auto;
    }
  }
}
</style>