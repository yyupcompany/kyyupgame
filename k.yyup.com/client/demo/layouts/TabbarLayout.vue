<template>
  <div class="tabbar-layout">
    <!-- 左侧区域 -->
    <div class="tabbar-left">
      <!-- 菜单切换按钮 -->
      <button 
        class="menu-toggle-btn"
        @click="$emit('toggle-sidebar')"
        title="切换侧边栏"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <span v-for="(item, index) in breadcrumbs" :key="index" class="breadcrumb-item">
          <router-link v-if="item.path" :to="item.path" class="breadcrumb-link">
            {{ item.title }}
          </router-link>
          <span v-else class="breadcrumb-text">{{ item.title }}</span>
          <svg v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </span>
      </nav>
    </div>

    <!-- 右侧区域 -->
    <div class="tabbar-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="search-clear" @click="clearSearch">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 通知按钮 -->
      <div class="notification-btn" @click="toggleNotifications">
        <button class="icon-btn" :class="{ 'has-notifications': hasNotifications }">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c-.89 0-1.74-.19-2.5-.54C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.46C10.26 6.19 11.11 6 12 6a6 6 0 0 1 6 6 6 6 0 0 1-6 6zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 2.8l1.4 1.4H16v2.4L17.2 8l-1.2 1.2V12l1.2 1.2L16 14.4v2.4h-2.6L12 17.2l-1.4-1.4H8v-2.4L6.8 12l1.2-1.2V8L6.8 6.8 8 5.6V3.2h2.6L12 2.8z"/>
          </svg>
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
      </div>

      <!-- 主题切换按钮 -->
      <div class="theme-switcher" @click="toggleThemeMenu">
        <button class="icon-btn" :class="{ 'active': showThemeMenu }" title="切换主题">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18c-.89 0-1.74-.19-2.5-.54C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.46C10.26 6.19 11.11 6 12 6a6 6 0 0 1 6 6 6 6 0 0 1-6 6zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 2.8l1.4 1.4H16v2.4L17.2 8l-1.2 1.2V12l1.2 1.2L16 14.4v2.4h-2.6L12 17.2l-1.4-1.4H8v-2.4L6.8 12l1.2-1.2V8L6.8 6.8 8 5.6V3.2h2.6L12 2.8z"/>
          </svg>
        </button>
        
        <!-- 主题选择下拉菜单 -->
        <div v-if="showThemeMenu" class="theme-menu">
          <div class="theme-menu-header">
            <span>选择主题</span>
          </div>
          <div class="theme-options">
            <div 
              v-for="theme in themes" 
              :key="theme.key"
              class="theme-option"
              :class="{ 'active': currentTheme === theme.key }"
              @click="switchTheme(theme.key)"
            >
              <div class="theme-preview" :style="{ backgroundColor: theme.primary }">
                <div class="theme-preview-accent" :style="{ backgroundColor: theme.accent }"></div>
              </div>
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-desc">{{ theme.description }}</span>
              </div>
              <svg v-if="currentTheme === theme.key" class="theme-check" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 全屏按钮 -->
      <button class="icon-btn" @click="toggleFullscreen" title="全屏">
        <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      </button>

      <!-- 用户菜单 -->
      <div class="user-menu" @click="toggleUserMenu">
        <div class="user-avatar">
          <img src="https://via.placeholder.com/32x32/6366f1/ffffff?text=U" alt="用户头像" />
        </div>
        <div class="user-info">
          <span class="user-name">管理员</span>
          <span class="user-role">超级管理员</span>
        </div>
        <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Props
interface Props {
  sidebarCollapsed: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  'toggle-sidebar': []
}>()

// 响应式数据
const searchQuery = ref('')
const isFullscreen = ref(false)
const notificationCount = ref(3)
const hasNotifications = computed(() => notificationCount.value > 0)

// 主题切换相关
const showThemeMenu = ref(false)
const currentTheme = ref(localStorage.getItem('demo-theme') || 'dark')

// 主题配置
const themes = ref([
  {
    key: 'dark',
    name: '暗黑主题',
    description: '深色背景，护眼舒适',
    primary: '#0f172a',
    accent: '#6366f1'
  },
  {
    key: 'light',
    name: '明亮主题', 
    description: '浅色背景，清新明亮',
    primary: 'var(--bg-primary-light)',
    accent: '#3b82f6'
  }
])

// 路由
const route = useRoute()

// 面包屑导航
interface BreadcrumbItem {
  title: string
  path: string | null
}

const breadcrumbs = computed((): BreadcrumbItem[] => {
  const pathSegments = route.path.split('/').filter(segment => segment)
  const crumbs: BreadcrumbItem[] = []
  
  // 添加首页
  crumbs.push({ title: '首页', path: '/demo/dashboard' })
  
  // 根据路径生成面包屑
  if (pathSegments.length > 1) {
    const currentPath = pathSegments[pathSegments.length - 1]
    const pathMap: Record<string, string> = {
      'dashboard': '仪表板',
      'users': '用户管理',
      'analytics': '数据分析',
      'settings': '系统设置',
      'logs': '系统日志'
    }
    
    if (pathMap[currentPath]) {
      crumbs.push({ title: pathMap[currentPath], path: null })
    }
  }
  
  return crumbs
})

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('搜索:', searchQuery.value)
    // 这里可以实现搜索逻辑
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

// 通知功能
const toggleNotifications = () => {
  console.log('切换通知面板')
  // 这里可以实现通知面板的显示/隐藏
}

// 全屏功能
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 用户菜单
const toggleUserMenu = () => {
  console.log('切换用户菜单')
  // 这里可以实现用户菜单的显示/隐藏
}

// 主题切换功能
const toggleThemeMenu = () => {
  showThemeMenu.value = !showThemeMenu.value
}

const switchTheme = (themeKey: string) => {
  currentTheme.value = themeKey
  localStorage.setItem('demo-theme', themeKey)
  showThemeMenu.value = false
  
  // 应用主题到根元素
  applyTheme(themeKey)
  
  console.log('切换主题到:', themeKey)
}

const applyTheme = (themeKey: string) => {
  // 移除所有主题类
  document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-purple', 'theme-green')
  
  // 添加新主题类
  document.documentElement.classList.add(`theme-${themeKey}`)
  
  // 设置主题属性
  document.documentElement.setAttribute('data-theme', themeKey)
}

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 初始化主题
  applyTheme(currentTheme.value)
  
  // 点击外部关闭主题菜单
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.theme-switcher')) {
      showThemeMenu.value = false
    }
  })
})
</script>

<style lang="scss" scoped>
.tabbar-layout {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: var(--border-width-base) solid var(--border-color);
}

.tabbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.menu-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  .breadcrumb-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  .breadcrumb-text {
    color: var(--text-primary);
    font-size: var(--text-sm);
    font-weight: 500;
  }
  
  .breadcrumb-separator {
    width: var(--spacing-md);
    height: var(--spacing-md);
    color: var(--text-muted);
  }
}

.tabbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-left: 40px;
  background: var(--bg-primary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  @media (max-width: 76var(--spacing-sm)) {
    width: 200px;
  }
}

.search-icon {
  position: absolute;
  left: 12px;
  width: var(--spacing-md);
  height: var(--spacing-md);
  color: var(--text-muted);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: var(--spacing-sm);
  width: 2var(--spacing-xs);
  height: 2var(--spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  svg {
    width: 1var(--spacing-xs);
    height: 1var(--spacing-xs);
  }
}

.notification-btn {
  position: relative;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  &.has-notifications {
    color: var(--primary-color);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--danger-color);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: var(--spacing-md);
  text-align: center;
  line-height: 1;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: var(--border-width-base) solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-color);
  }
}

.user-avatar {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  @media (max-width: 76var(--spacing-sm)) {
    display: none;
  }
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.2;
}

.dropdown-arrow {
  width: var(--spacing-md);
  height: var(--spacing-md);
  color: var(--text-muted);
  transition: transform var(--transition-fast);
  
  @media (max-width: 76var(--spacing-sm)) {
    display: none;
  }
}

// 主题切换器样式
.theme-switcher {
  position: relative;
  
  .icon-btn.active {
    background: var(--bg-hover);
    color: var(--primary-color);
  }
}

.theme-menu {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  background: var(--bg-primary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 280px;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.theme-menu-header {
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--border-color);
  
  span {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.theme-options {
  padding: var(--spacing-sm);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &.active {
    background: var(--bg-tertiary);
    border: var(--border-width-base) solid var(--primary-color);
  }
}

.theme-preview {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-md);
  position: relative;
  border: 2px solid var(--border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.theme-preview-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 0 var(--radius-md) 0 var(--radius-md);
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.theme-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.2;
}

.theme-check {
  width: var(--spacing-md);
  height: var(--spacing-md);
  color: var(--primary-color);
  flex-shrink: 0;
}
</style> 