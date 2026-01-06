<!--
  🏫 移动端仪表盘页面
  
  基于 04-组件开发指南.md 的仪表盘设计
  特性：数据概览、快捷操作、个性化推荐、实时更新
-->

<template>
  <div class="mobile-dashboard" :class="dashboardClasses">
    <!-- 顶部用户欢迎区 -->
    <div class="dashboard__header">
      <div class="header__greeting">
        <div class="greeting__avatar">
          <el-avatar :size="48" :src="userInfo.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
        <div class="greeting__content">
          <h2 class="greeting__title">{{ greetingText }}</h2>
          <p class="greeting__subtitle">{{ statusText }}</p>
        </div>
        <div class="greeting__weather" v-if="weatherInfo">
          <div class="weather__icon">
            <el-icon><Sunny /></el-icon>
          </div>
          <span class="weather__temp">{{ weatherInfo.temperature }}°</span>
        </div>
      </div>
      
      <!-- 通知横幅 -->
      <div v-if="importantNotices.length > 0" class="header__notices">
        <el-carousel
          height="60px"
          direction="vertical"
          :autoplay="true"
          :interval="3000"
          indicator-position="none"
          arrow="never"
        >
          <el-carousel-item 
            v-for="notice in importantNotices" 
            :key="notice.id"
            class="notice-item"
            @click="handleNoticeClick(notice)"
          >
            <div class="notice__content">
              <el-icon class="notice__icon" :color="notice.color">
                <component :is="notice.icon" />
              </el-icon>
              <span class="notice__text">{{ notice.content }}</span>
              <el-icon class="notice__arrow"><ArrowRight /></el-icon>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 核心数据卡片区 -->
    <div class="dashboard__stats">
      <div class="stats__grid">
        <div 
          v-for="stat in coreStats" 
          :key="stat.id"
          class="stat-card"
          :class="`stat-card--${stat.type}`"
          @click="handleStatClick(stat)"
        >
          <div class="stat-card__icon">
            <el-icon :size="28">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stat.value }}</div>
            <div class="stat-card__label">{{ stat.label }}</div>
            <div class="stat-card__change" :class="{
              'change--positive': stat.change > 0,
              'change--negative': stat.change < 0
            }">
              <el-icon>
                <component :is="stat.change > 0 ? 'TrendCharts' : 'Bottom'" />
              </el-icon>
              <span>{{ Math.abs(stat.change) }}%</span>
            </div>
          </div>
          <div v-if="stat.badge" class="stat-card__badge">
            <el-badge :value="stat.badge" :type="stat.badgeType" />
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区 -->
    <div class="dashboard__actions">
      <div class="actions__header">
        <h3 class="actions__title">快捷操作</h3>
        <button class="actions__more" @click="showMoreActions">
          <el-icon><MoreFilled /></el-icon>
        </button>
      </div>
      <div class="actions__grid">
        <div
          v-for="action in quickActions"
          :key="action.id"
          class="action-card"
          :class="{ 'action-card--disabled': !action.enabled }"
          @click="handleActionClick(action)"
        >
          <div class="action-card__icon" :style="{ background: action.color }">
            <el-icon>
              <component :is="action.icon" />
            </el-icon>
          </div>
          <div class="action-card__content">
            <div class="action-card__title">{{ action.title }}</div>
            <div class="action-card__subtitle">{{ action.subtitle }}</div>
          </div>
          <div v-if="action.badge" class="action-card__badge">
            <el-badge :value="action.badge" />
          </div>
        </div>
      </div>
    </div>

    <!-- 今日待办区 -->
    <div class="dashboard__todos" v-if="todayTodos.length > 0">
      <div class="todos__header">
        <h3 class="todos__title">今日待办</h3>
        <span class="todos__count">{{ pendingTodosCount }}/{{ todayTodos.length }}</span>
      </div>
      <div class="todos__list">
        <div
          v-for="todo in todayTodos.slice(0, 3)"
          :key="todo.id"
          class="todo-item"
          :class="{ 'todo-item--completed': todo.completed }"
          @click="handleTodoClick(todo)"
        >
          <div class="todo-item__checkbox">
            <el-checkbox v-model="todo.completed" @change="updateTodo(todo)" />
          </div>
          <div class="todo-item__content">
            <div class="todo-item__title">{{ todo.title }}</div>
            <div class="todo-item__time">{{ formatTime(todo.deadline) }}</div>
          </div>
          <div class="todo-item__priority" :class="`priority--${todo.priority}`">
            <div class="priority-dot"></div>
          </div>
        </div>
      </div>
      <div v-if="todayTodos.length > 3" class="todos__more">
        <button @click="showAllTodos">
          查看全部 {{ todayTodos.length }} 项待办
        </button>
      </div>
    </div>

    <!-- 最新动态区 -->
    <div class="dashboard__activities">
      <div class="activities__header">
        <h3 class="activities__title">最新动态</h3>
        <button class="activities__refresh" @click="refreshActivities">
          <el-icon><Refresh /></el-icon>
        </button>
      </div>
      <div class="activities__timeline">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item"
          @click="handleActivityClick(activity)"
        >
          <div class="activity-item__avatar">
            <el-avatar :size="32" :src="activity.avatar">
              <el-icon>
                <component :is="activity.icon" />
              </el-icon>
            </el-avatar>
          </div>
          <div class="activity-item__content">
            <div class="activity-item__text">{{ activity.content }}</div>
            <div class="activity-item__time">{{ formatRelativeTime(activity.createdAt) }}</div>
          </div>
          <div class="activity-item__indicator">
            <div class="indicator-dot" :class="`indicator--${activity.type}`"></div>
          </div>
        </div>
      </div>
      <div class="activities__more">
        <button @click="showAllActivities">查看更多动态</button>
      </div>
    </div>

    <!-- AI智能推荐区 -->
    <div class="dashboard__ai-recommendations" v-if="aiRecommendations.length > 0">
      <div class="recommendations__header">
        <h3 class="recommendations__title">
          <el-icon><MagicStick /></el-icon>
          AI智能推荐
        </h3>
        <button class="recommendations__refresh" @click="refreshRecommendations">
          <el-icon><Refresh /></el-icon>
        </button>
      </div>
      <div class="recommendations__carousel">
        <el-carousel
          :height="recommendationHeight"
          :autoplay="false"
          arrow="hover"
          indicator-position="outside"
        >
          <el-carousel-item 
            v-for="recommendation in aiRecommendations"
            :key="recommendation.id"
            class="recommendation-item"
          >
            <div class="recommendation__content">
              <div class="recommendation__icon">
                <el-icon>
                  <component :is="recommendation.icon" />
                </el-icon>
              </div>
              <div class="recommendation__text">
                <h4 class="recommendation__title">{{ recommendation.title }}</h4>
                <p class="recommendation__description">{{ recommendation.description }}</p>
              </div>
              <div class="recommendation__actions">
                <button 
                  class="recommendation__btn recommendation__btn--primary"
                  @click="handleRecommendationAction(recommendation, 'accept')"
                >
                  {{ recommendation.primaryAction }}
                </button>
                <button 
                  class="recommendation__btn recommendation__btn--secondary"
                  @click="handleRecommendationAction(recommendation, 'dismiss')"
                >
                  稍后
                </button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 浮动操作按钮 -->
    <div class="dashboard__fab">
      <el-button
        type="primary"
        circle
        size="large"
        class="fab__button"
        @click="openAiAssistant"
      >
        <el-icon><ChatRound /></el-icon>
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="dashboard__loading">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton__stats">
            <el-skeleton-item variant="rect" style="height: 80px; border-radius: var(--spacing-sm);" />
            <el-skeleton-item variant="rect" style="height: 80px; border-radius: var(--spacing-sm);" />
          </div>
          <div class="skeleton__content">
            <el-skeleton-item variant="h3" style="width: 40%" />
            <el-skeleton-item variant="text" />
            <el-skeleton-item variant="text" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMobileStore } from '../stores/mobile'
import { useAiAssistantStore } from '../stores/ai-assistant'
import {
  User,
  Sunny,
  ArrowRight,
  TrendCharts,
  Bottom,
  MoreFilled,
  Refresh,
  MagicStick,
  ChatRound,
  // 统计图标
  DataLine,
  UserFilled,
  School,
  Trophy,
  Calendar,
  Bell,
  Document,
  // 操作图标
  Edit,
  Plus,
  Search,
  Camera,
  Phone,
  Location
} from '@element-plus/icons-vue'

// 数据
const router = useRouter()
const userStore = useUserStore()
const mobileStore = useMobileStore()
const aiStore = useAiAssistantStore()

const isLoading = ref(true)
const refreshTimer = ref<NodeJS.Timeout>()

// 计算属性
const dashboardClasses = computed(() => ({
  'dashboard--mobile': mobileStore.isMobile,
  'dashboard--tablet': mobileStore.isTablet,
  'dashboard--ios': mobileStore.isIOS,
  'dashboard--android': mobileStore.isAndroid
}))

const userInfo = computed(() => userStore.userInfo)
const userRole = computed(() => userStore.userRole)

const greetingText = computed(() => {
  const hour = new Date().getHours()
  const name = userInfo.value?.name || '用户'
  
  if (hour < 6) return `夜深了，${name}`
  if (hour < 12) return `早上好，${name}`
  if (hour < 18) return `下午好，${name}`
  return `晚上好，${name}`
})

const statusText = computed(() => {
  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  return `今天是${today}`
})

const recommendationHeight = computed(() => 
  mobileStore.isMobile ? '120px' : '140px'
)

const pendingTodosCount = computed(() => 
  todayTodos.value.filter(todo => !todo.completed).length
)

// 模拟数据
const weatherInfo = ref({
  temperature: 22,
  condition: 'sunny',
  city: '北京'
})

const importantNotices = ref([
  {
    id: '1',
    content: '新学期招生报名现已开始，欢迎咨询！',
    icon: 'Bell',
    color: '#1890ff',
    type: 'info',
    url: '/mobile/enrollment'
  },
  {
    id: '2',
    content: '本周五将举行家长会，请准时参加',
    icon: 'Calendar',
    color: '#52c41a',
    type: 'event',
    url: '/mobile/activities'
  }
])

const coreStats = ref([
  {
    id: 'students',
    label: '在校学生',
    value: '248',
    change: 5.2,
    icon: 'UserFilled',
    type: 'primary',
    badge: 3,
    badgeType: 'success'
  },
  {
    id: 'classes',
    label: '活跃班级',
    value: '12',
    change: 0,
    icon: 'School',
    type: 'success'
  },
  {
    id: 'activities',
    label: '本月活动',
    value: '8',
    change: -2.1,
    icon: 'Trophy',
    type: 'warning'
  },
  {
    id: 'messages',
    label: '未读消息',
    value: '5',
    change: 15.3,
    icon: 'Bell',
    type: 'danger',
    badge: 'new'
  }
])

const quickActions = ref([
  {
    id: 'add-student',
    title: '添加学生',
    subtitle: '录入新学生信息',
    icon: 'Plus',
    color: '#1890ff',
    enabled: true,
    path: '/mobile/students/add'
  },
  {
    id: 'scan-qr',
    title: '扫码考勤',
    subtitle: '快速签到签退',
    icon: 'Camera',
    color: '#52c41a',
    enabled: true,
    action: 'scan'
  },
  {
    id: 'contact-parent',
    title: '联系家长',
    subtitle: '发送消息通知',
    icon: 'Phone',
    color: '#faad14',
    enabled: true,
    badge: 2,
    path: '/mobile/communication'
  },
  {
    id: 'create-report',
    title: '生成报告',
    subtitle: 'AI智能分析',
    icon: 'Document',
    color: '#722ed1',
    enabled: true,
    action: 'ai-report'
  }
])

const todayTodos = ref([
  {
    id: '1',
    title: '审核本周招生申请材料',
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    priority: 'high',
    completed: false
  },
  {
    id: '2',
    title: '准备明天的教学计划',
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    priority: 'medium',
    completed: true
  },
  {
    id: '3',
    title: '回复家长微信群消息',
    deadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
    priority: 'low',
    completed: false
  }
])

const recentActivities = ref([
  {
    id: '1',
    content: '张小明家长提交了请假申请',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    avatar: '',
    icon: 'Document',
    type: 'info'
  },
  {
    id: '2',
    content: '小二班完成了今日晨检',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    avatar: '',
    icon: 'Trophy',
    type: 'success'
  },
  {
    id: '3',
    content: '李老师上传了课堂照片',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    avatar: '',
    icon: 'Camera',
    type: 'info'
  }
])

const aiRecommendations = ref([
  {
    id: '1',
    title: '智能课程安排建议',
    description: '根据学生出勤率，建议调整下周二的体育课时间',
    icon: 'Calendar',
    primaryAction: '查看详情',
    type: 'schedule'
  },
  {
    id: '2',
    title: '家长沟通提醒',
    description: '小明连续3天情绪不佳，建议主动联系家长了解情况',
    icon: 'Phone',
    primaryAction: '立即联系',
    type: 'communication'
  }
])

// 方法
const handleNoticeClick = (notice: any) => {
  if (notice.url) {
    router.push(notice.url)
  }
}

const handleStatClick = (stat: any) => {
  const routeMap: Record<string, string> = {
    students: '/mobile/students',
    classes: '/mobile/classes',
    activities: '/mobile/activities',
    messages: '/mobile/messages'
  }
  
  const route = routeMap[stat.id]
  if (route) {
    router.push(route)
  }
}

const handleActionClick = (action: any) => {
  if (!action.enabled) return
  
  if (action.path) {
    router.push(action.path)
  } else if (action.action) {
    performAction(action.action)
  }
}

const performAction = (actionType: string) => {
  switch (actionType) {
    case 'scan':
      mobileStore.openScanner()
      break
    case 'ai-report':
      openAiAssistant()
      break
    default:
      console.log(`执行动作: ${actionType}`)
  }
}

const handleTodoClick = (todo: any) => {
  router.push(`/mobile/todos/${todo.id}`)
}

const updateTodo = async (todo: any) => {
  // 模拟API调用
  console.log('更新待办:', todo)
}

const handleActivityClick = (activity: any) => {
  router.push(`/mobile/activities/${activity.id}`)
}

const handleRecommendationAction = async (recommendation: any, action: string) => {
  if (action === 'accept') {
    if (recommendation.type === 'schedule') {
      router.push('/mobile/schedule')
    } else if (recommendation.type === 'communication') {
      router.push('/mobile/communication')
    }
  } else if (action === 'dismiss') {
    // 移除推荐
    const index = aiRecommendations.value.findIndex(r => r.id === recommendation.id)
    if (index > -1) {
      aiRecommendations.value.splice(index, 1)
    }
  }
}

const showMoreActions = () => {
  router.push('/mobile/actions')
}

const showAllTodos = () => {
  router.push('/mobile/todos')
}

const showAllActivities = () => {
  router.push('/mobile/activities')
}

const refreshActivities = async () => {
  // 模拟刷新数据
  console.log('刷新动态数据')
}

const refreshRecommendations = async () => {
  // 调用AI推荐服务
  await aiStore.getSmartSuggestions()
}

const openAiAssistant = () => {
  aiStore.showAssistant()
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (date: Date) => {
  const now = Date.now()
  const diff = now - date.getTime()
  
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  return date.toLocaleDateString('zh-CN')
}

const loadDashboardData = async () => {
  try {
    isLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 根据用户角色调整数据
    adjustDataByRole()
    
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

const adjustDataByRole = () => {
  if (userRole.value === 'parent') {
    // 家长角色显示孩子相关数据
    coreStats.value = [
      {
        id: 'children',
        label: '我的孩子',
        value: '2',
        change: 0,
        icon: 'UserFilled',
        type: 'primary'
      },
      {
        id: 'activities',
        label: '参与活动',
        value: '5',
        change: 25,
        icon: 'Trophy',
        type: 'success'
      }
    ]
    
    quickActions.value = quickActions.value.filter(action => 
      ['contact-parent', 'scan-qr'].includes(action.id)
    )
  }
}

// 生命周期
onMounted(async () => {
  await loadDashboardData()
  
  // 设置定时刷新
  refreshTimer.value = setInterval(() => {
    refreshActivities()
  }, 5 * 60 * 1000) // 5分钟刷新一次
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.mobile-dashboard {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding-bottom: 80px; // 为底部导航留空间
}

// 头部区域
.dashboard__header {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  padding: 20px var(--spacing-md) var(--spacing-md);
  color: white;

  .header__greeting {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .greeting__content {
      flex: 1;

      .greeting__title {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 20px;
        font-weight: 600;
      }

      .greeting__subtitle {
        margin: 0;
        font-size: 1var(--spacing-xs);
        opacity: 0.9;
      }
    }

    .greeting__weather {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--spacing-md);

      .weather__icon {
        font-size: 1var(--spacing-sm);
      }
    }
  }

  .header__notices {
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--spacing-sm);
    overflow: hidden;

    .notice-item {
      display: flex !important;
      align-items: center;
      cursor: pointer;

      .notice__content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 12px;
        width: 100%;

        .notice__icon {
          font-size: var(--spacing-md);
        }

        .notice__text {
          flex: 1;
          font-size: 1var(--spacing-xs);
        }

        .notice__arrow {
          font-size: 12px;
          opacity: 0.7;
        }
      }
    }
  }
}

// 统计卡片区域
.dashboard__stats {
  padding: var(--spacing-md);
  margin-top: -20px;

  .stats__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    position: relative;
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: var(--spacing-md);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--spacing-xs) var(--spacing-md) rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }

    .stat-card__icon {
      margin-bottom: 12px;
      color: var(--el-color-primary);
    }

    .stat-card__content {
      .stat-card__value {
        font-size: 2var(--spacing-sm);
        font-weight: 700;
        color: var(--el-text-color-primary);
        line-height: 1;
        margin-bottom: var(--spacing-xs);
      }

      .stat-card__label {
        font-size: 1var(--spacing-xs);
        color: var(--el-text-color-secondary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-card__change {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 12px;

        &.change--positive {
          color: var(--el-color-success);
        }

        &.change--negative {
          color: var(--el-color-danger);
        }
      }
    }

    .stat-card__badge {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    &--primary {
      border-left: var(--spacing-xs) solid var(--el-color-primary);
    }

    &--success {
      border-left: var(--spacing-xs) solid var(--el-color-success);
    }

    &--warning {
      border-left: var(--spacing-xs) solid var(--el-color-warning);
    }

    &--danger {
      border-left: var(--spacing-xs) solid var(--el-color-danger);
    }
  }
}

// 快捷操作区域
.dashboard__actions {
  padding: 0 var(--spacing-md) var(--spacing-md);

  .actions__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .actions__title {
      margin: 0;
      font-size: 1var(--spacing-sm);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .actions__more {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      border: none;
      border-radius: var(--radius-full);
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color);
      }
    }
  }

  .actions__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-var(--border-width-base));
      box-shadow: 0 var(--spacing-xs) 12px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: translateY(0);
    }

    &.action-card--disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        transform: none;
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      }
    }

    .action-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4var(--spacing-sm);
      height: 4var(--spacing-sm);
      border-radius: 12px;
      color: white;

      .el-icon {
        font-size: 2var(--spacing-xs);
      }
    }

    .action-card__content {
      flex: 1;

      .action-card__title {
        font-size: var(--spacing-md);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 2px;
      }

      .action-card__subtitle {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .action-card__badge {
      position: relative;
    }
  }
}

// 待办事项区域
.dashboard__todos {
  padding: 0 var(--spacing-md) var(--spacing-md);

  .todos__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .todos__title {
      margin: 0;
      font-size: 1var(--spacing-sm);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .todos__count {
      font-size: 1var(--spacing-xs);
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: 12px;
    }
  }

  .todos__list {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px var(--spacing-md);
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: background 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--el-fill-color-extra-light);
    }

    &.todo-item--completed {
      opacity: 0.6;

      .todo-item__title {
        text-decoration: line-through;
      }
    }

    .todo-item__checkbox {
      flex-shrink: 0;
    }

    .todo-item__content {
      flex: 1;

      .todo-item__title {
        font-size: 1var(--spacing-xs);
        color: var(--el-text-color-primary);
        margin-bottom: 2px;
      }

      .todo-item__time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .todo-item__priority {
      flex-shrink: 0;

      .priority-dot {
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        border-radius: var(--radius-full);
      }

      &.priority--high .priority-dot {
        background: var(--el-color-danger);
      }

      &.priority--medium .priority-dot {
        background: var(--el-color-warning);
      }

      &.priority--low .priority-dot {
        background: var(--el-color-success);
      }
    }
  }

  .todos__more {
    text-align: center;
    margin-top: var(--spacing-sm);

    button {
      border: none;
      background: none;
      color: var(--el-color-primary);
      font-size: 1var(--spacing-xs);
      cursor: pointer;
      padding: var(--spacing-sm) var(--spacing-md);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 最新动态区域
.dashboard__activities {
  padding: 0 var(--spacing-md) var(--spacing-md);

  .activities__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .activities__title {
      margin: 0;
      font-size: 1var(--spacing-sm);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .activities__refresh {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      border: none;
      border-radius: var(--radius-full);
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color);
      }
    }
  }

  .activities__timeline {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px var(--spacing-md);
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: background 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--el-fill-color-extra-light);
    }

    .activity-item__avatar {
      flex-shrink: 0;
    }

    .activity-item__content {
      flex: 1;

      .activity-item__text {
        font-size: 1var(--spacing-xs);
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .activity-item__time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .activity-item__indicator {
      flex-shrink: 0;

      .indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: var(--radius-full);

        &.indicator--info {
          background: var(--el-color-info);
        }

        &.indicator--success {
          background: var(--el-color-success);
        }
      }
    }
  }

  .activities__more {
    text-align: center;
    margin-top: var(--spacing-sm);

    button {
      border: none;
      background: none;
      color: var(--el-color-primary);
      font-size: 1var(--spacing-xs);
      cursor: pointer;
      padding: var(--spacing-sm) var(--spacing-md);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// AI推荐区域
.dashboard__ai-recommendations {
  padding: 0 var(--spacing-md) var(--spacing-md);

  .recommendations__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .recommendations__title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin: 0;
      font-size: 1var(--spacing-sm);
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        color: var(--el-color-warning);
      }
    }

    .recommendations__refresh {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      border: none;
      border-radius: var(--radius-full);
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color);
      }
    }
  }

  .recommendations__carousel {
    .recommendation-item {
      background: var(--el-bg-color);
      border-radius: 12px;
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      overflow: hidden;

      .recommendation__content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: var(--spacing-md);

        .recommendation__icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--el-color-primary-light-9);
          border-radius: var(--radius-full);
          color: var(--el-color-primary);
        }

        .recommendation__text {
          flex: 1;

          .recommendation__title {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: 1var(--spacing-xs);
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .recommendation__description {
            margin: 0;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }

        .recommendation__actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);

          .recommendation__btn {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;

            &--primary {
              background: var(--el-color-primary);
              color: white;
              border: none;

              &:hover {
                background: var(--el-color-primary-light-3);
              }
            }

            &--secondary {
              background: transparent;
              color: var(--el-text-color-secondary);
              border: var(--border-width-base) solid var(--el-border-color);

              &:hover {
                border-color: var(--el-color-primary);
                color: var(--el-color-primary);
              }
            }
          }
        }
      }
    }
  }
}

// 浮动操作按钮
.dashboard__fab {
  position: fixed;
  bottom: 100px; // 在底部导航上方
  right: 20px;
  z-index: 1000;

  .fab__button {
    width: 56px;
    height: 56px;
    box-shadow: 0 var(--spacing-xs) var(--spacing-md) var(--shadow-medium);

    .el-icon {
      font-size: 2var(--spacing-xs);
    }
  }
}

// 加载状态
.dashboard__loading {
  padding: var(--spacing-md);

  .skeleton__stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 2var(--spacing-xs);
  }

  .skeleton__content {
    .el-skeleton-item {
      margin-bottom: 12px;
    }
  }
}

// 响应式适配
@media (max-width: 480px) {
  .dashboard__stats .stats__grid {
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: 12px;

    .stat-card__value {
      font-size: 2var(--spacing-xs);
    }
  }

  .action-card {
    padding: 10px;

    .action-card__icon {
      width: 40px;
      height: 40px;

      .el-icon {
        font-size: 20px;
      }
    }
  }
}

// 平板适配
@media (min-width: 76var(--spacing-sm)) {
  .dashboard__stats .stats__grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .dashboard__actions .actions__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>