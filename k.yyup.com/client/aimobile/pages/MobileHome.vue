<template>
  <div class="mobile-home">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span class="time">{{ currentTime }}</span>
      </div>
      <div class="status-right">
        <span :class="['network-status', networkStatus]">
          {{ networkIcon }}
        </span>
        <span class="battery" :style="{ width: `${batteryLevel}%` }">
          🔋
        </span>
      </div>
    </div>

    <!-- 头部区域 -->
    <div class="home-header">
      <div class="greeting">
        <h1>{{ greeting }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      
      <div class="header-actions">
        <button class="notification-btn" @click="openNotifications">
          🔔
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>
        <button class="profile-btn" @click="openProfile">
          👤
        </button>
      </div>
    </div>

    <!-- 快速操作卡片 -->
    <div class="quick-actions">
      <h2>快速开始</h2>
      <div class="action-grid">
        <div 
          v-for="action in quickActions" 
          :key="action.id"
          class="action-card"
          @click="handleQuickAction(action)"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-content">
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </div>
          <div class="action-arrow">→</div>
        </div>
      </div>
    </div>

    <!-- 专家推荐 -->
    <div class="expert-recommendations">
      <div class="section-header">
        <h2>推荐专家</h2>
        <button class="see-all-btn" @click="viewAllExperts">查看全部</button>
      </div>
      
      <div class="expert-carousel">
        <div 
          v-for="expert in recommendedExperts" 
          :key="expert.id"
          class="expert-card"
          @click="chatWithExpert(expert.id)"
        >
          <div class="expert-avatar">{{ expert.icon }}</div>
          <div class="expert-info">
            <h4>{{ expert.name }}</h4>
            <p>{{ expert.description }}</p>
            <div class="expert-stats">
              <span class="rating">⭐ {{ expert.rating }}</span>
              <span class="usage">{{ expert.usageCount }}次咨询</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <div class="section-header">
        <h2>最近活动</h2>
        <button class="see-all-btn" @click="viewHistory">查看历史</button>
      </div>
      
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
          @click="openActivity(activity)"
        >
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 使用统计 -->
    <div class="usage-stats">
      <h2>今日统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ todayStats.workflows }}</div>
          <div class="stat-label">工作流</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ todayStats.chats }}</div>
          <div class="stat-label">对话</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ todayStats.experts }}</div>
          <div class="stat-label">专家</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ todayStats.time }}</div>
          <div class="stat-label">使用时长</div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-navigation">
      <div 
        v-for="nav in bottomNavItems" 
        :key="nav.id"
        :class="['nav-item', { active: nav.active }]"
        @click="navigateTo(nav.route)"
      >
        <div class="nav-icon">{{ nav.icon }}</div>
        <div class="nav-label">{{ nav.label }}</div>
      </div>
    </div>

    <!-- 浮动操作按钮 -->
    <div class="fab-container">
      <button 
        class="fab-main"
        :class="{ expanded: fabExpanded }"
        @click="toggleFab"
      >
        {{ fabExpanded ? '✕' : '➕' }}
      </button>
      
      <div v-if="fabExpanded" class="fab-actions">
        <button class="fab-action" @click="startWorkflow">
          <span class="fab-icon">🎯</span>
          <span class="fab-text">新工作流</span>
        </button>
        <button class="fab-action" @click="startChat">
          <span class="fab-icon">💬</span>
          <span class="fab-text">专家聊天</span>
        </button>
        <button class="fab-action" @click="quickHelp">
          <span class="fab-icon">❓</span>
          <span class="fab-text">快速帮助</span>
        </button>
      </div>
    </div>

    <!-- 应用内通知 -->
    <div class="in-app-notifications">
      <div 
        v-for="notification in inAppNotifications" 
        :key="notification.id"
        :class="['notification-toast', notification.type]"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
        </div>
        <button 
          v-if="notification.closable !== false"
          class="notification-close"
          @click.stop="closeNotification(notification.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 离线提示 -->
    <div v-if="!isOnline" class="offline-banner">
      📡 当前离线，部分功能可能受限
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { mobileNotificationService } from '../services/mobile-notification.service'
import { mobileStorageService, StorageType } from '../services/mobile-storage.service'
import { MOBILE_SMART_EXPERTS } from '../types/mobile-agents'
import type { AgentType } from '../types/mobile-agents'

const router = useRouter()

// ==================== 响应式数据 ====================

// 系统状态
const currentTime = ref('')
const networkStatus = ref('good')
const batteryLevel = ref(100)
const isOnline = ref(navigator.onLine)
const unreadCount = ref(3)

// 浮动按钮
const fabExpanded = ref(false)

// 应用内通知
const inAppNotifications = ref(mobileNotificationService.getInAppNotifications())

// 快速操作
const quickActions = ref([
  {
    id: 1,
    icon: '🎯',
    title: '智能工作流',
    description: '多专家协作解决复杂问题',
    action: 'workflow'
  },
  {
    id: 2,
    icon: '💬',
    title: '专家聊天',
    description: '与AI专家一对一交流',
    action: 'chat'
  },
  {
    id: 3,
    icon: '📚',
    title: '课程指导',
    description: '新老师教学专业指导',
    action: 'curriculum'
  },
  {
    id: 4,
    icon: '📊',
    title: '数据分析',
    description: '智能数据洞察和建议',
    action: 'analysis'
  }
])

// 推荐专家
const recommendedExperts = ref([
  {
    id: 'activity_planner',
    name: '活动策划专家',
    description: '专业活动方案设计',
    icon: '🎯',
    rating: 4.9,
    usageCount: 156
  },
  {
    id: 'curriculum_expert',
    name: '课程教学专家',
    description: '新老师教学指导',
    icon: '📚',
    rating: 4.8,
    usageCount: 89
  },
  {
    id: 'marketing_expert',
    name: '招生营销专家',
    description: '招生策略制定',
    icon: '📈',
    rating: 4.7,
    usageCount: 134
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    icon: '🎯',
    title: '春游活动策划',
    description: '30人参加的春游活动方案',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    status: 'completed'
  },
  {
    id: 2,
    icon: '💬',
    title: '课程设计咨询',
    description: '与课程专家的对话',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    status: 'in_progress'
  },
  {
    id: 3,
    icon: '📊',
    title: '成本分析报告',
    description: '活动预算优化建议',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    status: 'completed'
  }
])

// 今日统计
const todayStats = ref({
  workflows: 3,
  chats: 8,
  experts: 5,
  time: '2.5h'
})

// 底部导航
const bottomNavItems = ref([
  { id: 1, icon: '🏠', label: '首页', route: '/', active: true },
  { id: 2, icon: '🎯', label: '工作流', route: '/workflow', active: false },
  { id: 3, icon: '💬', label: '聊天', route: '/chat', active: false },
  { id: 4, icon: '👥', label: '专家', route: '/experts', active: false },
  { id: 5, icon: '⚙️', label: '设置', route: '/settings', active: false }
])

// ==================== 计算属性 ====================

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const subtitle = computed(() => {
  const messages = [
    '今天想要完成什么任务？',
    '让AI专家助您一臂之力',
    '智能工作流，让工作更高效',
    '专业建议，触手可及'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
})

const networkIcon = computed(() => {
  if (!isOnline.value) return '📡'
  switch (networkStatus.value) {
    case 'excellent': return '📶'
    case 'good': return '📶'
    case 'poor': return '📶'
    default: return '📡'
  }
})

// ==================== 方法 ====================

const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'workflow':
      router.push('/workflow')
      break
    case 'chat':
      router.push('/chat')
      break
    case 'curriculum':
      router.push('/chat/curriculum_expert')
      break
    case 'analysis':
      router.push('/chat/cost_analyst')
      break
  }
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

const chatWithExpert = (expertId: AgentType) => {
  router.push(`/chat/${expertId}`)
}

const viewAllExperts = () => {
  router.push('/experts')
}

const viewHistory = () => {
  router.push('/history')
}

const openActivity = (activity: any) => {
  if (activity.status === 'completed') {
    router.push(`/workflow/${activity.id}`)
  } else {
    router.push('/workflow')
  }
}

const openNotifications = () => {
  router.push('/notifications')
}

const openProfile = () => {
  router.push('/profile')
}

const navigateTo = (route: string) => {
  // 更新导航状态
  bottomNavItems.value.forEach(item => {
    item.active = item.route === route
  })
  
  router.push(route)
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(30)
  }
}

const toggleFab = () => {
  fabExpanded.value = !fabExpanded.value
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(fabExpanded.value ? [50, 30, 50] : [30])
  }
}

const startWorkflow = () => {
  fabExpanded.value = false
  router.push('/workflow')
}

const startChat = () => {
  fabExpanded.value = false
  router.push('/chat')
}

const quickHelp = () => {
  fabExpanded.value = false
  router.push('/help')
}

const handleNotificationClick = (notification: any) => {
  // 处理通知点击
  console.log('通知被点击:', notification)
}

const closeNotification = (id: string) => {
  mobileNotificationService.removeInAppNotification(id)
  inAppNotifications.value = mobileNotificationService.getInAppNotifications()
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
}

const getStatusText = (status: string): string => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'pending': '待处理',
    'failed': '失败'
  }
  return statusMap[status] || status
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const updateBatteryStatus = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery()
      batteryLevel.value = Math.round(battery.level * 100)
    } catch (error) {
      console.log('无法获取电池状态')
    }
  }
}

const updateNetworkStatus = () => {
  isOnline.value = navigator.onLine
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType
    
    switch (effectiveType) {
      case '4g':
        networkStatus.value = 'excellent'
        break
      case '3g':
        networkStatus.value = 'good'
        break
      case '2g':
        networkStatus.value = 'poor'
        break
      default:
        networkStatus.value = isOnline.value ? 'good' : 'offline'
    }
  }
}

const loadUserData = async () => {
  // 加载用户数据和统计信息
  try {
    const stats = await mobileStorageService.get('today_stats', StorageType.LOCAL)
    if (stats) {
      todayStats.value = stats
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

// ==================== 生命周期 ====================

let timeInterval: number
let batteryInterval: number

onMounted(async () => {
  console.log('📱 移动端首页已加载')
  
  // 初始化
  updateTime()
  updateBatteryStatus()
  updateNetworkStatus()
  await loadUserData()
  
  // 设置定时器
  timeInterval = setInterval(updateTime, 1000)
  batteryInterval = setInterval(updateBatteryStatus, 60000)
  
  // 监听网络状态变化
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  
  // 监听应用内通知变化
  setInterval(() => {
    inAppNotifications.value = mobileNotificationService.getInAppNotifications()
  }, 1000)
})

onUnmounted(() => {
  // 清理定时器和事件监听器
  if (timeInterval) clearInterval(timeInterval)
  if (batteryInterval) clearInterval(batteryInterval)
  
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
})
</script>

<style scoped>
.mobile-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow-x: hidden;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  background: rgba(0,0,0,0.1);
}

.status-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.network-status {
  font-size: var(--spacing-md);
}

.battery {
  font-size: var(--spacing-md);
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px var(--spacing-md);
}

.greeting h1 {
  font-size: 2var(--spacing-sm);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
}

.greeting p {
  font-size: var(--spacing-md);
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.notification-btn, .profile-btn {
  position: relative;
  width: 4var(--spacing-xs);
  height: 4var(--spacing-xs);
  border: none;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-btn:hover, .profile-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: -var(--spacing-xs);
  right: -var(--spacing-xs);
  background: #ff4757;
  color: white;
  border-radius: var(--radius-full);
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions, .expert-recommendations, .recent-activities, .usage-stats {
  margin: 2var(--spacing-xs) var(--spacing-md);
}

.quick-actions h2, .expert-recommendations h2, .recent-activities h2, .usage-stats h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border-radius: var(--spacing-md);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-card:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}

.action-icon {
  font-size: var(--spacing-xl);
  margin-right: var(--spacing-md);
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1var(--spacing-sm);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.action-content p {
  font-size: 1var(--spacing-xs);
  opacity: 0.8;
  margin: 0;
}

.action-arrow {
  font-size: 20px;
  opacity: 0.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.see-all-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1var(--spacing-xs);
  opacity: 0.8;
  cursor: pointer;
}

.expert-carousel {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}

.expert-card {
  min-width: 280px;
  background: rgba(255,255,255,0.15);
  border-radius: var(--spacing-md);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.expert-card:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}

.expert-avatar {
  width: 4var(--spacing-sm);
  height: 4var(--spacing-sm);
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2var(--spacing-xs);
  margin-bottom: 12px;
}

.expert-info h4 {
  font-size: var(--spacing-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.expert-info p {
  font-size: 1var(--spacing-xs);
  opacity: 0.8;
  margin: 0 0 var(--spacing-sm) 0;
}

.expert-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  opacity: 0.7;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255,255,255,0.25);
}

.activity-icon {
  font-size: 2var(--spacing-xs);
  margin-right: 12px;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: var(--spacing-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.activity-content p {
  font-size: 1var(--spacing-xs);
  opacity: 0.8;
  margin: 0 0 var(--spacing-xs) 0;
}

.activity-time {
  font-size: 12px;
  opacity: 0.6;
}

.activity-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.completed {
  background: rgba(40, 167, 69, 0.3);
  color: #28a745;
}

.activity-status.in_progress {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  text-align: center;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: var(--spacing-md) var(--spacing-sm);
}

.stat-value {
  font-size: 2var(--spacing-xs);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  display: flex;
  padding: var(--spacing-sm) 0 calc(var(--spacing-sm) + env(safe-area-inset-bottom));
  border-top: var(--border-width-base) solid rgba(255,255,255,0.2);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(102, 126, 234, 0.6);
}

.nav-item.active {
  color: #667eea;
}

.nav-icon {
  font-size: 2var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}

.fab-container {
  position: fixed;
  bottom: 80px;
  right: var(--spacing-md);
  z-index: 1000;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: #667eea;
  color: white;
  border: none;
  font-size: 2var(--spacing-xs);
  cursor: pointer;
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.fab-main:hover {
  transform: scale(1.1);
}

.fab-main.expanded {
  transform: rotate(45deg);
}

.fab-actions {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab-action {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.95);
  color: #667eea;
  border: none;
  border-radius: 2var(--spacing-sm);
  padding: 12px var(--spacing-md);
  cursor: pointer;
  box-shadow: 0 2px var(--spacing-sm) rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  animation: fabSlideIn 0.3s ease;
}

@keyframes fabSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fab-icon {
  font-size: 20px;
  margin-right: var(--spacing-sm);
}

.fab-text {
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  white-space: nowrap;
}

.in-app-notifications {
  position: fixed;
  top: 60px;
  left: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.notification-toast {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.95);
  color: #2c3e50;
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.2);
  backdrop-filter: blur(20px);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: var(--spacing-md);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.notification-content p {
  font-size: 1var(--spacing-xs);
  margin: 0;
  opacity: 0.8;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  opacity: 0.6;
  padding: var(--spacing-xs);
}

.offline-banner {
  position: fixed;
  top: 40px;
  left: var(--spacing-md);
  right: var(--spacing-md);
  background: #ffc107;
  color: #212529;
  padding: 12px;
  border-radius: var(--spacing-sm);
  text-align: center;
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 76var(--spacing-sm)) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .expert-carousel {
    gap: 12px;
  }
  
  .expert-card {
    min-width: 240px;
  }
}

/* 滚动条样式 */
.expert-carousel::-webkit-scrollbar {
  height: var(--spacing-xs);
}

.expert-carousel::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.expert-carousel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
}
</style>
