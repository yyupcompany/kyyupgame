<!--
  🏫 移动端主布局组件
  
  基于 04-组件开发指南.md 的移动端布局设计
  特性：响应式、触摸友好、PWA支持
-->

<template>
  <div class="mobile-layout" :class="layoutClasses">
    <!-- 顶部状态栏 -->
    <div v-if="showStatusBar" class="mobile-layout__status-bar">
      <div class="status-bar__left">
        <span class="status-bar__time">{{ currentTime }}</span>
      </div>
      <div class="status-bar__right">
        <span class="status-bar__network">{{ networkStatus }}</span>
        <span class="status-bar__battery">{{ batteryLevel }}%</span>
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <header v-if="!hideHeader" class="mobile-layout__header" :class="{ 'header--fixed': fixedHeader }">
      <div class="header__content">
        <!-- 左侧按钮 -->
        <div class="header__left">
          <slot name="header-left">
            <button 
              v-if="showBackButton"
              class="header__back-btn"
              @click="handleBack"
            >
              <span>←</span>
            </button>
            <button 
              v-else-if="showMenuButton"
              class="header__menu-btn"
              @click="toggleSidebar"
            >
              <span>☰</span>
            </button>
          </slot>
        </div>

        <!-- 中间标题 -->
        <div class="header__center">
          <h1 class="header__title">{{ pageTitle }}</h1>
        </div>

        <!-- 右侧操作 -->
        <div class="header__right">
          <slot name="header-right">
            <!-- AI助手快捷按钮 -->
            <button 
              v-if="showAiButton"
              class="header__ai-btn"
              @click="toggleAiAssistant"
            >
              <span>🤖</span>
            </button>
            <!-- 更多操作 -->
            <button 
              v-if="showMoreButton"
              class="header__more-btn"
              @click="showMoreMenu"
            >
              <span>⋯</span>
            </button>
          </slot>
        </div>
      </div>
    </header>

    <!-- 侧边抽屉 -->
    <div v-if="sidebarVisible" class="mobile-sidebar-overlay" @click="closeSidebar">
      <div class="mobile-sidebar" :style="{ width: sidebarWidth }" @click.stop>
        <div class="sidebar__content">
          <div class="sidebar-header">
            <h3>导航菜单</h3>
            <button @click="closeSidebar" class="close-btn">×</button>
          </div>
          <div class="sidebar-menu">
            <div class="menu-item" @click="handleMenuClick({ path: '/mobile/dashboard' })">
              AI助手
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="mobile-layout__main" :style="mainStyle">
      <!-- 内容容器 -->
      <div class="main__container" :class="containerClasses">
        <!-- 页面内容 -->
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="keepAlivePages">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </div>

      <!-- 加载指示器 -->
      <div v-if="loading" class="main__loading">
        <el-loading 
          :text="loadingText"
          background="var(--shadow-heavy)"
        />
      </div>
    </main>

    <!-- 底部导航栏 -->
    <footer
      v-if="showBottomNavComputed"
      class="mobile-layout__footer"
    >
      <div class="mobile-tabbar">
        <div 
          class="tab-item"
          :class="{ active: activeTab === 'dashboard' }"
          @click="handleTabChange('dashboard')"
        >
          <div class="tab-icon">🤖</div>
          <div class="tab-text">AI助手</div>
        </div>
      </div>
    </footer>

    <!-- 全局提示 -->
    <MobileToast ref="toastRef" />

    <!-- 更多菜单弹窗 -->
    <div v-if="moreMenuVisible" class="more-menu-overlay" @click="moreMenuVisible = false">
      <div class="more-menu" @click.stop>
        <div class="more-menu__item" @click="handleRefresh">
          <span>🔄</span>
          <span>刷新</span>
        </div>
        <div class="more-menu__item" @click="handleSettings">
          <span>⚙️</span>
          <span>设置</span>
        </div>
        <div class="more-menu__item" @click="handleFeedback">
          <span>💬</span>
          <span>反馈</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileToast from '../components/MobileToast.vue'

// Props定义
interface Props {
  showStatusBar?: boolean
  showBackButton?: boolean
  showMenuButton?: boolean
  showAiButton?: boolean
  showMoreButton?: boolean
  showBottomNav?: boolean
  fixedHeader?: boolean
  pageTitle?: string
  loading?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showStatusBar: true,
  showBackButton: false,
  showMenuButton: true,
  showAiButton: true,
  showMoreButton: true,
  showBottomNav: true,
  fixedHeader: true,
  pageTitle: '幼儿园管理系统',
  loading: false,
  loadingText: '加载中...'
})

// 响应式数据
const route = useRoute()
const router = useRouter()

const sidebarVisible = ref(false)
const aiAssistantVisible = ref(false)
const moreMenuVisible = ref(false)
const activeTab = ref('dashboard')
const currentTime = ref('')
const networkStatus = ref('WiFi')
const batteryLevel = ref(100)

// 计算属性
const layoutClasses = computed(() => ({
  'mobile-layout--dark': false,
  'mobile-layout--ios': /iPad|iPhone|iPod/.test(navigator.userAgent),
  'mobile-layout--android': /Android/.test(navigator.userAgent),
  'mobile-layout--tablet': window.innerWidth > 768
}))

const hideHeader = computed(() => {
  const meta: any = route.meta || {}
  return meta.hideHeader === true
})

const showBottomNavComputed = computed(() => {
  const meta: any = route.meta || {}
  if (meta.hideTabbar === true) return false
  if (typeof meta.showBottomNav === 'boolean') return meta.showBottomNav
  return props.showBottomNav
})

const containerClasses = computed(() => ({
  'container--padded': showBottomNavComputed.value,
  'container--fullscreen': !showBottomNavComputed.value
}))

const mainStyle = computed(() => ({
  paddingTop: (props.fixedHeader && !hideHeader.value) ? '56px' : '0',
  paddingBottom: showBottomNavComputed.value ? '60px' : '0'
}))

const sidebarWidth = computed(() => 
  window.innerWidth > 768 ? '320px' : '280px'
)

const aiAssistantPosition = computed(() => ({
  bottom: showBottomNavComputed.value ? '80px' : '20px',
  right: '20px'
}))

// 缓存的页面列表
const keepAlivePages = computed(() => [
  'Dashboard',
  'StudentList',
  'ClassList',
  'ActivityList'
])

// 方法
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/dashboard')
  }
}

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const closeSidebar = () => {
  sidebarVisible.value = false
}

const handleMenuClick = (menuItem: any) => {
  router.push(menuItem.path)
  closeSidebar()
}

const toggleAiAssistant = () => {
  aiAssistantVisible.value = !aiAssistantVisible.value
}

const closeAiAssistant = () => {
  aiAssistantVisible.value = false
}

const showMoreMenu = () => {
  moreMenuVisible.value = true
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  router.push(`/mobile/${tab}`)
}

const handleRefresh = () => {
  window.location.reload()
  moreMenuVisible.value = false
}

const handleSettings = () => {
  router.push('/mobile/settings')
  moreMenuVisible.value = false
}

const handleFeedback = () => {
  router.push('/mobile/feedback')
  moreMenuVisible.value = false
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听网络状态
const updateNetworkStatus = () => {
  networkStatus.value = navigator.onLine ? 'WiFi' : '离线'
}

// 监听电池状态
const updateBatteryStatus = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery()
      batteryLevel.value = Math.round(battery.level * 100)
    } catch (error) {
      console.warn('Battery API not supported')
    }
  }
}

// 生命周期
onMounted(() => {
  updateTime()
  updateNetworkStatus()
  updateBatteryStatus()

  // 定时更新时间
  const timeInterval = setInterval(updateTime, 1000)
  
  // 监听网络变化
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  onUnmounted(() => {
    clearInterval(timeInterval)
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
  })
})

// 监听路由变化
watch(() => route.name, (newName) => {
  if (typeof newName === 'string') {
    activeTab.value = newName.replace('Mobile', '').toLowerCase()
  }
})
</script>

<style lang="scss" scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--el-bg-color);
  overflow: hidden;

  // iOS样式适配
  &--ios {
    .mobile-layout__status-bar {
      height: 4var(--spacing-xs);
      padding-top: 20px;
    }
  }

  // Android样式适配
  &--android {
    .mobile-layout__status-bar {
      height: 2var(--spacing-xs);
    }
  }

  // 平板样式适配
  &--tablet {
    .header__title {
      font-size: 20px;
    }
  }

  // 暗色主题
  &--dark {
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
  }
}

// 状态栏样式
.mobile-layout__status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md);
  background: var(--el-color-primary);
  color: white;
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  z-index: 1000;

  .status-bar__left,
  .status-bar__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}

// 头部样式
.mobile-layout__header {
  background: var(--el-bg-color);
  border-bottom: var(--border-width-base) solid var(--el-border-color-light);
  z-index: 999;

  &.header--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }

  .header__content {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 var(--spacing-md);
  }

  .header__left,
  .header__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 4var(--spacing-sm);
  }

  .header__center {
    flex: 1;
    text-align: center;
  }

  .header__title {
    margin: 0;
    font-size: 1var(--spacing-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header__back-btn,
  .header__menu-btn,
  .header__ai-btn,
  .header__more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &:active {
      background: var(--el-fill-color);
    }
  }
}

// 主内容区样式
.mobile-layout__main {
  flex: 1;
  overflow: hidden;
  position: relative;

  .main__container {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &.container--padded {
      padding: var(--spacing-md);
    }

    &.container--fullscreen {
      padding: 0;
    }
  }

  .main__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
}

// 底部导航样式
.mobile-layout__footer {
  background: var(--el-bg-color);
  border-top: var(--border-width-base) solid var(--el-border-color-light);
}

// 移动端侧边栏样式
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  
  .mobile-sidebar {
    height: 100%;
    background: var(--el-bg-color, #fff);
    box-shadow: 2px 0 var(--spacing-sm) var(--shadow-light);
    transition: transform 0.3s ease;
    
    .sidebar__content {
      height: 100%;
      padding: 1rem;
      
      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        border-bottom: var(--border-width-base) solid #eee;
        padding-bottom: 1rem;
        
        h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          
          &:hover {
            color: #333;
          }
        }
      }
      
      .sidebar-menu {
        .menu-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-radius: var(--spacing-sm);
          transition: background 0.2s ease;
          
          &:hover {
            background: #f5f5f5;
          }
        }
      }
    }
  }
}

// 底部导航条样式
.mobile-tabbar {
  display: flex;
  height: 60px;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .tab-icon {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    
    .tab-text {
      font-size: 0.75rem;
      color: #666;
    }
    
    &.active {
      .tab-text {
        color: #409eff;
      }
    }
  }
}

// 更多菜单样式
.more-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1500;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 70px 20px;
}

.more-menu {
  background: #fff;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);
  min-width: 120px;

  .more-menu__item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 12px var(--spacing-md);
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &:active {
      background: var(--el-fill-color);
    }

    span {
      font-size: 1var(--spacing-xs);
      color: var(--el-text-color-primary);
    }
  }
}

// 响应式适配
@media (max-width: 76var(--spacing-sm)) {
  .mobile-layout {
    .header__title {
      font-size: var(--spacing-md);
    }
  }
}

@media (max-width: 480px) {
  .mobile-layout {
    .header__content {
      padding: 0 12px;
    }
    
    .main__container {
      &.container--padded {
        padding: 12px;
      }
    }
  }
}
</style>