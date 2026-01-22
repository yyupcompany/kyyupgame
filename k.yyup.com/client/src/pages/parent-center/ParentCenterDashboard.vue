<template>
  <div class="page-container parent-center-container">
    <!-- 统计概览 -->
    <div class="stats-section">
      <app-card>
        <template #header>
          <app-card-header>
            <div class="app-card-title">
              <UnifiedIcon name="DataBoard" />
              数据概览
            </div>
          </app-card-header>
        </template>
        <app-card-content>
          <div class="stats-grid">
            <div class="stat-card stat-primary" @click="goToChildren">
              <div class="stat-icon">
                <UnifiedIcon name="User" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ childrenCount }}</div>
                <div class="stat-title">我的孩子</div>
                <div class="stat-unit">个</div>
              </div>
            </div>

            <div class="stat-card stat-success">
              <div class="stat-icon">
                <UnifiedIcon name="Document" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ assessmentCount }}</div>
                <div class="stat-title">测评记录</div>
                <div class="stat-unit">次</div>
              </div>
            </div>

            <div class="stat-card stat-warning" @click="goToActivities">
              <div class="stat-icon">
                <UnifiedIcon name="Calendar" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ activityCount }}</div>
                <div class="stat-title">活动报名</div>
                <div class="stat-unit">个</div>
              </div>
            </div>

            <div class="stat-card stat-danger" @click="goToNotifications">
              <div class="stat-icon">
                <UnifiedIcon name="Bell" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ messageCount }}</div>
                <div class="stat-title">未读消息</div>
                <div class="stat-unit">条</div>
              </div>
            </div>
          </div>
        </app-card-content>
      </app-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-row">
        <!-- 孩子成长概览 -->
        <div class="content-card large">
          <app-card>
            <template #header>
              <app-card-header>
                <div class="app-card-title">
                  <span class="title-icon">👨‍👩‍👧‍👦</span>
                  孩子成长概览
                </div>
                <div class="card-actions">
                  <el-button type="primary" @click="goToChildren">
                    <UnifiedIcon name="Plus" />
                    管理孩子
                  </el-button>
                </div>
              </app-card-header>
            </template>
            <app-card-content>
              <div v-if="children.length > 0" class="children-grid">
                <div
                  v-for="child in children"
                  :key="child.id"
                  class="child-card"
                  @click="viewChildGrowth(child.id)"
                >
                  <div class="child-avatar-wrapper">
                    <el-avatar :size="60" :src="child.avatar">
                      <template #error>
                        <div class="avatar-placeholder">{{ child.name.charAt(0) }}</div>
                      </template>
                    </el-avatar>
                  </div>
                  <div class="child-info">
                    <h4 class="child-name">{{ child.name }}</h4>
                    <p class="child-class">{{ child.className }}</p>
                    <p class="child-age">{{ child.age }}岁</p>
                  </div>
                  <div class="child-status">
                    <el-tag :type="child.status === '在园' ? 'success' : 'info'" size="small">
                      {{ child.status }}
                    </el-tag>
                  </div>
                  <div class="child-actions">
                    <el-button type="primary" size="small">
                      查看成长
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无孩子信息">
                <el-button type="primary" @click="goToChildren">添加孩子</el-button>
              </el-empty>
            </app-card-content>
          </app-card>
        </div>

        <!-- 最近活动 -->
        <div class="content-card">
          <app-card>
            <template #header>
              <app-card-header>
                <div class="app-card-title">
                  <span class="title-icon">📅</span>
                  最近活动
                </div>
                <div class="card-actions">
                  <el-button text type="primary" @click="goToActivities">
                    查看更多
                  </el-button>
                </div>
              </app-card-header>
            </template>
            <app-card-content>
              <div v-if="recentActivities.length > 0" class="activity-list">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                  @click="viewActivityDetail(activity)"
                >
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                    <el-tag :type="getActivityTypeColor(activity.type)" size="small">
                      {{ getActivityTypeText(activity.type) }}
                    </el-tag>
                  </div>
                  <UnifiedIcon name="ArrowRight" class="item-arrow" />
                </div>
              </div>
              <el-empty v-else description="暂无活动" />
            </app-card-content>
          </app-card>
        </div>
      </div>

      <div class="content-row">
        <!-- 最新通知 -->
        <div class="content-card">
          <app-card>
            <template #header>
              <app-card-header>
                <div class="app-card-title">
                  <span class="title-icon">🔔</span>
                  最新通知
                </div>
                <div class="card-actions">
                  <el-button text type="primary" @click="goToNotifications">
                    查看更多
                  </el-button>
                </div>
              </app-card-header>
            </template>
            <app-card-content>
              <div v-if="recentNotifications.length > 0" class="notification-list">
                <div
                  v-for="notification in recentNotifications"
                  :key="notification.id"
                  class="notification-item"
                  @click="viewNotificationDetail(notification)"
                >
                  <div class="notification-indicator" :class="{ unread: !notification.isRead }"></div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                    <el-tag :type="getNotificationTypeColor(notification.type)" size="small">
                      {{ getNotificationTypeText(notification.type) }}
                    </el-tag>
                  </div>
                  <UnifiedIcon name="ArrowRight" class="item-arrow" />
                </div>
              </div>
              <el-empty v-else description="暂无通知" />
            </app-card-content>
          </app-card>
        </div>

        <!-- AI助手建议 -->
        <div class="content-card">
          <app-card>
            <template #header>
              <app-card-header>
                <div class="app-card-title">
                  <span class="title-icon">🤖</span>
                  AI助手建议
                </div>
                <div class="card-actions">
                  <el-button text type="primary" @click="goToAIAssistant">
                    查看更多
                  </el-button>
                </div>
              </app-card-header>
            </template>
            <app-card-content>
              <div v-if="aiSuggestions.length > 0" class="ai-suggestions">
                <div
                  v-for="suggestion in aiSuggestions"
                  :key="suggestion.id"
                  class="suggestion-item"
                >
                  <div class="suggestion-icon">
                    <UnifiedIcon :name="suggestion.icon" />
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无AI建议">
                <el-button type="primary" @click="goToAIAssistant">获取建议</el-button>
              </el-empty>
            </app-card-content>
          </app-card>
        </div>
      </div>

      <!-- 社区互动统计 -->
      <div class="content-card">
        <app-card>
          <template #header>
            <app-card-header>
              <div class="app-card-title">
                <span class="title-icon">👥</span>
                社区互动
              </div>
            </app-card-header>
          </template>
          <app-card-content>
            <div class="community-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <UnifiedIcon name="Edit" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ communityStats.posts }}</div>
                  <div class="stat-text">发布动态</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <UnifiedIcon name="Like" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ communityStats.likes }}</div>
                  <div class="stat-text">获得点赞</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <UnifiedIcon name="ChatLineRound" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ communityStats.comments }}</div>
                  <div class="stat-text">收到评论</div>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>

    <!-- 全局加载状态 -->
    <el-loading v-model:full-screen="loading" text="正在加载数据..." />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { useUserStore } from '@/stores/user'

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

interface AISuggestion {
  id: string | number
  icon: string
  title: string
  description: string
  type?: string
}

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)

// 家长信息
const parentName = ref('家长')
const parentAvatar = ref('')
const childrenCount = ref(0)
const assessmentCount = ref(0)
const activityCount = ref(0)
const messageCount = ref(0)

// 数据列表
const children = ref<Child[]>([])
const recentActivities = ref<Activity[]>([])
const recentNotifications = ref<Notification[]>([])
const aiSuggestions = ref<AISuggestion[]>([])

// 社区互动统计
const communityStats = ref({
  posts: 0,
  likes: 0,
  comments: 0
})

// 加载仪表板数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    // 获取当前用户信息
    const currentUser = userStore.userInfo
    parentName.value = currentUser?.realName || currentUser?.username || '家长'
    parentAvatar.value = currentUser?.avatar || ''

    // 并行加载数据
    await Promise.all([
      loadChildrenData(),
      loadActivitiesData(),
      loadNotificationsData(),
      loadStatsData()
    ])

    ElMessage.success('数据加载完成')
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载孩子数据
const loadChildrenData = async () => {
  try {
    // 模拟数据 - 实际项目中调用API
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
    // 模拟数据 - 实际项目中调用API
    const mockActivities: Activity[] = [
      {
        id: 1,
        title: '秋游活动',
        time: '2024-11-05 09:00',
        type: 'outdoor',
        description: '带孩子感受秋天的美丽，体验大自然'
      },
      {
        id: 2,
        title: '亲子运动会',
        time: '2024-11-10 14:00',
        type: 'sports',
        description: '增进亲子感情，锻炼身体'
      },
      {
        id: 3,
        title: '手工制作课',
        time: '2024-11-15 10:00',
        type: 'education',
        description: '培养孩子的动手能力和创造力'
      }
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
    // 模拟数据 - 实际项目中调用API
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: '明天停课通知',
        time: '2024-10-30 10:00',
        type: 'system',
        description: '因设备维护，明天停课一天',
        isRead: false
      },
      {
        id: 2,
        title: '家长会通知',
        time: '2024-10-28 15:30',
        type: 'meeting',
        description: '请准时参加本学期家长会',
        isRead: false
      },
      {
        id: 3,
        title: '疫苗接种提醒',
        time: '2024-10-25 09:00',
        type: 'health',
        description: '请记得按时带孩子接种疫苗',
        isRead: true
      }
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
    // 模拟数据 - 实际项目中调用API
    assessmentCount.value = 5

    // AI建议数据
    aiSuggestions.value = [
      {
        id: 1,
        icon: 'Bulb',
        title: '关注孩子情绪变化',
        description: '建议多与孩子沟通，了解其在园所的生活情况',
        type: 'emotional'
      },
      {
        id: 2,
        icon: 'Clock',
        title: '合理安排作息时间',
        description: '保证孩子充足的睡眠，有助于身体发育',
        type: 'health'
      },
      {
        id: 3,
        icon: 'Star',
        title: '培养学习兴趣',
        description: '通过游戏化的方式培养孩子的学习兴趣',
        type: 'education'
      }
    ]

    // 社区互动统计
    communityStats.value = {
      posts: 12,
      likes: 58,
      comments: 23
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    assessmentCount.value = 0
    aiSuggestions.value = []
    communityStats.value = { posts: 0, likes: 0, comments: 0 }
  }
}

// 导航方法
const goToProfile = () => {
  router.push('/parent-center/profile')
}

const goToChildren = () => {
  router.push('/parent-center/children')
}

const goToActivities = () => {
  router.push('/parent-center/activities')
}

const goToNotifications = () => {
  router.push('/parent-center/notifications')
}

const goToAIAssistant = () => {
  router.push('/parent-center/ai-assistant')
}

const viewChildGrowth = (childId: string | number) => {
  router.push(`/parent-center/child-growth?id=${childId}`)
}

const viewActivityDetail = (activity: Activity) => {
  router.push(`/parent-center/activity-detail?id=${activity.id}`)
}

const viewNotificationDetail = (notification: Notification) => {
  router.push(`/parent-center/notification-detail?id=${notification.id}`)
}

// 工具方法
const getActivityTypeColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    outdoor: 'success',
    sports: 'warning',
    education: 'primary',
    culture: 'info'
  }
  return colorMap[type || 'default'] || 'default'
}

const getActivityTypeText = (type?: string) => {
  const textMap: Record<string, string> = {
    outdoor: '户外活动',
    sports: '体育运动',
    education: '教育学习',
    culture: '文化活动'
  }
  return textMap[type || 'default'] || '活动'
}

const getNotificationTypeColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    system: 'warning',
    meeting: 'primary',
    health: 'success',
    activity: 'info'
  }
  return colorMap[type || 'default'] || 'default'
}

const getNotificationTypeText = (type?: string) => {
  const textMap: Record<string, string> = {
    system: '系统通知',
    meeting: '会议通知',
    health: '健康提醒',
    activity: '活动通知'
  }
  return textMap[type || 'default'] || '通知'
}

// 组件挂载时加载数据
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.page-container {
  padding: var(--spacing-lg);

  .welcome-section {
    margin-bottom: var(--spacing-xl);

    .welcome-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);

      .welcome-avatar {
        flex-shrink: 0;
      }

      .welcome-info {
        flex: 1;

        .welcome-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .welcome-subtitle {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0;
        }
      }

      .welcome-actions {
        flex-shrink: 0;
      }
    }
  }

  .stats-section {
    margin-bottom: var(--spacing-xl);

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);

      .stat-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        &.stat-primary {
          background: var(--gradient-primary);
          color: white;
          border-color: var(--primary-color);
        }

        &.stat-success {
          background: var(--gradient-success);
          color: white;
          border-color: var(--success-color);
        }

        &.stat-warning {
          background: var(--gradient-warning);
          color: white;
          border-color: var(--warning-color);
        }

        &.stat-danger {
          background: var(--gradient-danger);
          color: white;
          border-color: var(--danger-color);
        }

        .stat-icon {
          width: var(--size-icon-xl);
          height: var(--size-icon-xl);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          font-size: var(--text-2xl);
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: var(--text-3xl);
            font-weight: var(--font-bold);
            line-height: 1;
            margin-bottom: var(--spacing-xs);
          }

          .stat-title {
            font-size: var(--text-base);
            font-weight: var(--font-medium);
            margin-bottom: var(--spacing-xs);
          }

          .stat-unit {
            font-size: var(--text-sm);
            opacity: 0.9;
          }
        }
      }
    }
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);

    .content-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-xl);
      align-items: start;

      .content-card {
        &.large {
          grid-column: span 2;
        }
      }
    }

    .content-card {
      background: var(--bg-card);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .children-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);

      .child-card {
        background: var(--bg-tertiary);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        .child-avatar-wrapper {
          flex-shrink: 0;

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;
            font-size: var(--text-xl);
            font-weight: var(--font-bold);
            border-radius: 50%;
          }
        }

        .child-info {
          flex: 1;

          .child-name {
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-xs) 0;
          }

          .child-class {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin: 0 0 var(--spacing-xs) 0;
          }

          .child-age {
            font-size: var(--text-sm);
            color: var(--text-tertiary);
            margin: 0;
          }
        }

        .child-status {
          flex-shrink: 0;
        }

        .child-actions {
          flex-shrink: 0;
        }
      }
    }

    .activity-list,
    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 0;

      .activity-item,
      .notification-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg) 0;
        border-bottom: var(--border-width-base) solid var(--border-color);
        cursor: pointer;
        transition: all 0.3s ease;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: var(--bg-tertiary);
          margin: 0 calc(-1 * var(--spacing-lg));
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .notification-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border-color);
          margin-right: var(--spacing-md);
          flex-shrink: 0;

          &.unread {
            background: var(--danger-color);
          }
        }

        .activity-content,
        .notification-content {
          flex: 1;
          min-width: 0;

          .activity-title,
          .notification-title {
            font-size: var(--text-base);
            font-weight: var(--font-medium);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .activity-time,
          .notification-time {
            font-size: var(--text-sm);
            color: var(--text-tertiary);
            margin-bottom: var(--spacing-xs);
          }
        }

        .item-arrow {
          color: var(--text-tertiary);
          margin-left: var(--spacing-md);
          transition: color 0.3s ease;
          flex-shrink: 0;
        }

        &:hover .item-arrow {
          color: var(--primary-color);
        }
      }
    }

    .ai-suggestions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);

      .suggestion-item {
        display: flex;
        align-items: flex-start;
        padding: var(--spacing-lg);
        background: var(--bg-tertiary);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);

        .suggestion-icon {
          width: var(--size-icon-lg);
          height: var(--size-icon-lg);
          background: var(--primary-light-bg);
          color: var(--primary-color);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-lg);
          flex-shrink: 0;
        }

        .suggestion-content {
          flex: 1;

          .suggestion-title {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .suggestion-desc {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            line-height: 1.4;
          }
        }
      }
    }

    .community-stats {
      display: flex;
      justify-content: space-around;
      padding: var(--spacing-xl) 0;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .stat-icon {
          width: var(--size-icon-xl);
          height: var(--size-icon-xl);
          background: var(--primary-light-bg);
          color: var(--primary-color);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-md);
          font-size: var(--text-xl);
        }

        .stat-content {
          .stat-number {
            font-size: var(--text-3xl);
            font-weight: var(--font-bold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          .stat-text {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-container {
    .main-content {
      .content-row {
        grid-template-columns: 1fr;

        .content-card.large {
          grid-column: span 1;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);

    .welcome-section {
      .welcome-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-lg);
      }
    }

    .stats-section {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);

        .stat-card {
          padding: var(--spacing-md);

          .stat-icon {
            width: var(--size-icon-lg);
            height: var(--size-icon-lg);
            font-size: var(--text-xl);
          }

          .stat-content {
            .stat-value {
              font-size: var(--text-2xl);
            }

            .stat-title {
              font-size: var(--text-sm);
            }
          }
        }
      }
    }

    .main-content {
      gap: var(--spacing-lg);

      .children-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .community-stats {
        flex-direction: column;
        gap: var(--spacing-lg);

        .stat-item {
          flex-direction: row;
          text-align: left;
          gap: var(--spacing-md);
        }
      }
    }
  }
}
</style>