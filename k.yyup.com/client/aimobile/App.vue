<template>
  <div id="mobile-app" class="mobile-app" :class="appClasses">
    <!-- 移动端状态栏 -->
    <div class="mobile-status-bar" v-if="showStatusBar">
      <div class="status-left">
        <span class="time">{{ currentTime }}</span>
      </div>
      <div class="status-right">
        <span :class="['network-indicator', networkStatus]">
          {{ networkIcon }}
        </span>
        <span class="battery-indicator" :style="batteryStyle">
          🔋
        </span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="app-content" :style="contentStyle">
      <!-- 路由视图 -->
      <router-view v-slot="{ Component, route }">
        <transition 
          :name="transitionName" 
          mode="out-in"
          @enter="onTransitionEnter"
          @leave="onTransitionLeave"
        >
          <keep-alive :include="keepAliveComponents">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </div>

    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- 应用内通知容器 -->
    <div class="notification-container">
      <transition-group name="notification" tag="div">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', notification.type]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">{{ getNotificationIcon(notification.type) }}</div>
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
      </transition-group>
    </div>

    <!-- 网络状态提示 -->
    <div v-if="!isOnline" class="offline-banner">
      <div class="offline-content">
        <span class="offline-icon">📡</span>
        <span class="offline-text">当前离线，部分功能可能受限</span>
        <button v-if="canRetry" @click="retryConnection" class="retry-btn">
          重试
        </button>
      </div>
    </div>

    <!-- 更新提示 -->
    <div v-if="updateAvailable" class="update-banner">
      <div class="update-content">
        <span class="update-icon">🔄</span>
        <span class="update-text">发现新版本</span>
        <button @click="updateApp" class="update-btn">
          立即更新
        </button>
        <button @click="dismissUpdate" class="dismiss-btn">
          稍后
        </button>
      </div>
    </div>

    <!-- 安装提示 -->
    <div v-if="installPrompt" class="install-banner">
      <div class="install-content">
        <span class="install-icon">📱</span>
        <span class="install-text">添加到主屏幕获得更好体验</span>
        <button @click="installApp" class="install-btn">
          安装
        </button>
        <button @click="dismissInstall" class="dismiss-btn">
          取消
        </button>
      </div>
    </div>

    <!-- 调试信息 (开发模式) -->
    <div v-if="isDevelopment && showDebugInfo" class="debug-panel">
      <div class="debug-header">
        <span>调试信息</span>
        <button @click="toggleDebugInfo">{{ showDebugDetails ? '收起' : '展开' }}</button>
      </div>
      <div v-if="showDebugDetails" class="debug-details">
        <div class="debug-item">
          <span class="debug-label">设备类型:</span>
          <span class="debug-value">{{ deviceInfo.type }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">屏幕尺寸:</span>
          <span class="debug-value">{{ deviceInfo.screenSize }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">网络状态:</span>
          <span class="debug-value">{{ networkStatus }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">内存使用:</span>
          <span class="debug-value">{{ memoryUsage }}MB</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">当前路由:</span>
          <span class="debug-value">{{ $route.path }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mobileNotificationService } from './services/mobile-notification.service'
import { mobileStorageService } from './services/mobile-storage.service'

const route = useRoute()
const router = useRouter()

// ==================== 响应式数据 ====================

// 应用状态
const isLoading = ref(false)
const loadingText = ref('加载中...')
const isOnline = ref(navigator.onLine)
const updateAvailable = ref(false)
const installPrompt = ref(false)
const canRetry = ref(true)

// 时间和状态
const currentTime = ref('')
const networkStatus = ref('good')
const batteryLevel = ref(100)

// 通知
const notifications = ref(mobileNotificationService.getInAppNotifications())

// 调试信息
const isDevelopment = ref(import.meta.env.DEV)
const showDebugInfo = ref(false)
const showDebugDetails = ref(false)
const deviceInfo = ref({
  type: 'unknown',
  screenSize: '0x0'
})
const memoryUsage = ref(0)

// 转场动画
const transitionName = ref('slide-left')

// ==================== 计算属性 ====================

const appClasses = computed(() => ({
  'is-mobile': isMobile(),
  'is-tablet': isTablet(),
  'is-desktop': isDesktop(),
  'is-ios': isIOS(),
  'is-android': isAndroid(),
  'is-offline': !isOnline.value,
  'is-loading': isLoading.value,
  'has-notch': hasNotch(),
  'is-standalone': isStandalone()
}))

const showStatusBar = computed(() => {
  return isMobile() && !isStandalone()
})

const contentStyle = computed(() => {
  const styles: any = {}
  
  // 安全区域适配
  if (hasNotch()) {
    styles.paddingTop = 'env(safe-area-inset-top)'
    styles.paddingBottom = 'env(safe-area-inset-bottom)'
  }
  
  return styles
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

const batteryStyle = computed(() => ({
  opacity: batteryLevel.value < 20 ? 0.5 : 1,
  color: batteryLevel.value < 20 ? '#ff4757' : 'inherit'
}))

const keepAliveComponents = computed(() => {
  // 根据路由meta配置决定哪些组件需要缓存
  return ['MobileHome', 'ExpertChat', 'ExpertList']
})

// ==================== 方法 ====================

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const updateNetworkStatus = () => {
  isOnline.value = navigator.onLine
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType
    
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

const updateDeviceInfo = () => {
  deviceInfo.value = {
    type: getDeviceType(),
    screenSize: `${window.screen.width}x${window.screen.height}`
  }
}

const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }
}

const getDeviceType = (): string => {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const isTablet = (): boolean => {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
}

const isDesktop = (): boolean => {
  return !isMobile() && !isTablet()
}

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent)
}

const hasNotch = (): boolean => {
  return isIOS() && window.screen.height >= 812
}

const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

const getNotificationIcon = (type: string): string => {
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'workflow_complete': '🎉',
    'expert_response': '💬'
  }
  return icons[type] || 'ℹ️'
}

const handleNotificationClick = (notification: any) => {
  // 处理通知点击事件
  if (notification.actions && notification.actions.length > 0) {
    notification.actions[0].action()
  }
}

const closeNotification = (id: string) => {
  mobileNotificationService.removeInAppNotification(id)
  notifications.value = mobileNotificationService.getInAppNotifications()
}

const retryConnection = () => {
  canRetry.value = false
  
  // 尝试重新连接
  setTimeout(() => {
    updateNetworkStatus()
    canRetry.value = true
  }, 3000)
}

const updateApp = () => {
  window.location.reload()
}

const dismissUpdate = () => {
  updateAvailable.value = false
}

const installApp = async () => {
  const deferredPrompt = (window as any).deferredPrompt
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('安装选择:', outcome)
    ;(window as any).deferredPrompt = null
    installPrompt.value = false
  }
}

const dismissInstall = () => {
  installPrompt.value = false
}

const toggleDebugInfo = () => {
  showDebugDetails.value = !showDebugDetails.value
}

const onTransitionEnter = (el: Element) => {
  // 转场进入动画
  console.log('页面转场进入:', el)
}

const onTransitionLeave = (el: Element) => {
  // 转场离开动画
  console.log('页面转场离开:', el)
}

// ==================== 生命周期 ====================

let timeInterval: number
let statusInterval: number
let notificationInterval: number

onMounted(() => {
  console.log('📱 移动端应用已挂载')
  
  // 初始化状态
  updateTime()
  updateNetworkStatus()
  updateBatteryStatus()
  updateDeviceInfo()
  updateMemoryUsage()
  
  // 设置定时器
  timeInterval = setInterval(updateTime, 1000)
  statusInterval = setInterval(() => {
    updateBatteryStatus()
    updateMemoryUsage()
  }, 30000)
  
  notificationInterval = setInterval(() => {
    notifications.value = mobileNotificationService.getInAppNotifications()
  }, 1000)
  
  // 监听网络状态变化
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  
  // 监听安装提示
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    ;(window as any).deferredPrompt = e
    installPrompt.value = true
  })
  
  // 监听应用安装
  window.addEventListener('appinstalled', () => {
    console.log('📱 应用已安装')
    installPrompt.value = false
  })
  
  // 开发模式下显示调试信息
  if (isDevelopment.value) {
    showDebugInfo.value = true
  }
})

onUnmounted(() => {
  // 清理定时器和事件监听器
  if (timeInterval) clearInterval(timeInterval)
  if (statusInterval) clearInterval(statusInterval)
  if (notificationInterval) clearInterval(notificationInterval)
  
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
})

// 监听路由变化，更新转场动画
watch(() => route.path, (to, from) => {
  // 根据路由层级决定转场方向
  const toDepth = to.split('/').length
  const fromDepth = from.split('/').length
  
  if (toDepth > fromDepth) {
    transitionName.value = 'slide-left'
  } else if (toDepth < fromDepth) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = 'fade'
  }
})
</script>

<style scoped>
.mobile-app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mobile-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2var(--spacing-xs);
  background: rgba(0,0,0,0.8);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  z-index: 1000;
}

.status-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: var(--spacing-xs) solid #f3f3f3;
  border-top: var(--spacing-xs) solid #667eea;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 1var(--spacing-xs);
}

.notification-container {
  position: fixed;
  top: 60px;
  left: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 1000;
  pointer-events: none;
}

.notification-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.15);
  pointer-events: auto;
  cursor: pointer;
}

.notification-icon {
  font-size: 2var(--spacing-xs);
  margin-right: 12px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--spacing-md);
  font-weight: 600;
}

.notification-content p {
  margin: 0;
  font-size: 1var(--spacing-xs);
  color: #666;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  opacity: 0.6;
  padding: var(--spacing-xs);
}

.offline-banner, .update-banner, .install-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffc107;
  color: #212529;
  padding: 12px var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.update-banner {
  background: #17a2b8;
  color: white;
}

.install-banner {
  background: #28a745;
  color: white;
}

.offline-content, .update-content, .install-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.retry-btn, .update-btn, .install-btn, .dismiss-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: inherit;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: 12px;
  cursor: pointer;
  margin-left: var(--spacing-sm);
}

.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  border-radius: var(--spacing-sm);
  padding: 12px;
  font-size: 12px;
  max-width: 200px;
  z-index: 1000;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.debug-header button {
  background: none;
  border: none;
  color: white;
  font-size: 10px;
  cursor: pointer;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.debug-label {
  opacity: 0.7;
}

.debug-value {
  font-weight: 500;
}

/* 转场动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* 响应式设计 */
@media (max-width: 76var(--spacing-sm)) {
  .debug-panel {
    bottom: 10px;
    right: 10px;
    max-width: 150px;
  }
}

/* 设备特定样式 */
.is-ios {
  /* iOS特定样式 */
}

.is-android {
  /* Android特定样式 */
}

.has-notch {
  /* 刘海屏适配 */
}

.is-standalone {
  /* PWA全屏模式样式 */
}
</style>
