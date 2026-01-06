<template>
  <div class="tabbar-layout">
    <!-- 左侧区域 -->
    <div class="tabbar-left">
      <!-- 菜单切换按钮 -->
      <button 
        class="menu-toggle-btn"
        @click="handleToggleSidebar"
        :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <div class="menu-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </div>
      </button>

      <!-- 面包屑导航 -->
      <nav class="breadcrumb-nav" v-if="!isMobile">
        <div class="breadcrumb-list">
          <router-link to="/dashboard" class="breadcrumb-item">
            <div class="breadcrumb-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span class="breadcrumb-text">首页</span>
          </router-link>
          
          <div v-for="(item, index) in breadcrumbs" :key="index" class="breadcrumb-separator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/>
            </svg>
            <span class="breadcrumb-item">{{ item.title }}</span>
          </div>
        </div>
      </nav>
    </div>

    <!-- 右侧区域 -->
    <div class="tabbar-right">
      <!-- 搜索框 -->
      <div class="search-container" v-if="!isMobile">
        <div class="search-input-wrapper">
          <div class="search-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="搜索..." 
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- 通知按钮 -->
      <div class="notification-btn-wrapper">
        <button class="icon-btn notification-btn" @click="handleNotificationClick">
          <div class="icon-wrapper">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <div v-if="notificationCount > 0" class="notification-badge">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </div>
          </div>
        </button>
      </div>

      <!-- 主题切换器 -->
      <div class="theme-switcher-wrapper">
        <div class="theme-switcher">
          <button 
            class="theme-toggle-btn"
            @click="toggleThemeMenu"
            :title="'当前主题: ' + currentTheme.name"
          >
            <div class="theme-preview" :style="{ backgroundColor: currentTheme.color }"></div>
            <div class="theme-arrow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </button>
          
          <div v-if="showThemeMenu" class="theme-menu" @click.stop>
            <div 
              v-for="theme in themes" 
              :key="theme.key"
              class="theme-option"
              :class="{ 'theme-option-active': currentThemeKey === theme.key }"
              @click="switchTheme(theme.key)"
            >
              <div class="theme-color" :style="{ backgroundColor: theme.color }"></div>
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-desc">{{ theme.description }}</div>
              </div>
              <div v-if="currentThemeKey === theme.key" class="theme-check">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全屏切换 -->
      <div class="fullscreen-btn-wrapper" v-if="!isMobile">
        <button class="icon-btn fullscreen-btn" @click="toggleFullscreen">
          <div class="icon-wrapper">
            <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          </div>
        </button>
      </div>

      <!-- 用户菜单 -->
      <div class="user-menu-wrapper">
        <div class="user-menu">
          <button class="user-info-btn" @click="toggleUserMenu">
            <div class="user-avatar">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像" 
                   width="32" height="32" 
                   style="object-fit: cover; border-radius: var(--radius-full);"
                   loading="lazy" />
              <div v-else class="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
            <div v-if="!isMobile" class="user-details">
              <div class="user-name">{{ username }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
            <div class="user-arrow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </button>
          
          <div v-if="showUserMenu" class="user-dropdown" @click.stop>
            <div class="user-menu-item" @click="handleUserCommand('profile')">
              <div class="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span>个人资料</span>
            </div>
            
            <div class="user-menu-item" @click="handleUserCommand('settings')">
              <div class="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </div>
              <span>系统设置</span>
            </div>
            
            <div class="user-menu-divider"></div>
            
            <div class="user-menu-item logout-item" @click="handleUserCommand('logout')">
              <div class="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </div>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Props
interface Props {
  sidebarCollapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  isMobile: false
})

// Emits
const emit = defineEmits<{
  'toggle-sidebar': []
  command: [command: string]
}>()

const route = useRoute()
const userStore = useUserStore()

// 响应式状态
const searchQuery = ref('')
const notificationCount = ref(3)
const isFullscreen = ref(false)
const showThemeMenu = ref(false)
const showUserMenu = ref(false)
const currentThemeKey = ref('dark')

// 用户信息 - 从store获取
const username = computed(() => {
  const user = userStore.userInfo
  return user?.realName || user?.username || '未知用户'
})

const userRole = computed(() => {
  const user = userStore.userInfo
  const role = user?.role || (user?.roles && user.roles[0]?.code)
  
  // 角色映射
  const roleMap: Record<string, string> = {
    'admin': '系统管理员',
    'super_admin': '超级管理员',
    'principal': '园长',
    'teacher': '教师',
    'parent': '家长',
    'user': '普通用户'
  }
  
  return roleMap[role || ''] || roleMap['user']
})

const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || ''
})

// 主题配置
const themes = ref([
  { key: 'dark', name: '暗黑主题', description: '深色背景，护眼舒适', color: 'var(--primary-color)' },
  { key: 'light', name: '明亮主题', description: '浅色背景，清新明亮', color: 'var(--primary-color)' }
])

// 计算属性
const currentTheme = computed(() => {
  return themes.value.find(theme => theme.key === currentThemeKey.value) || themes.value[0]
})

const breadcrumbs = computed(() => {
  const items: Array<{ title: string; path?: string }> = []
  const matched = route.matched
  
  if (matched.length > 1) {
    matched.slice(1).forEach(item => {
      if (item.meta && item.meta.title && item.path !== '/') {
        items.push({
          title: item.meta.title as string,
          path: item.path
        })
      }
    })
  }
  
  return items
})

// 方法
const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('搜索:', searchQuery.value)
  }
}

const handleNotificationClick = () => {
  console.log('打开通知中心')
}

const toggleFullscreen = async () => {
  try {
    console.log('🖥️ 切换全屏状态，当前全屏元素:', document.fullscreenElement)

    if (!document.fullscreenElement) {
      // 进入全屏
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        console.log('✅ 成功进入全屏模式')
      } else if (document.documentElement.webkitRequestFullscreen) {
        // Safari 兼容
        await document.documentElement.webkitRequestFullscreen()
        console.log('✅ 成功进入全屏模式 (webkit)')
      } else if (document.documentElement.msRequestFullscreen) {
        // IE/Edge 兼容
        await document.documentElement.msRequestFullscreen()
        console.log('✅ 成功进入全屏模式 (ms)')
      } else {
        console.warn('⚠️ 浏览器不支持全屏API')
        return
      }
      isFullscreen.value = true
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        await document.exitFullscreen()
        console.log('✅ 成功退出全屏模式')
      } else if (document.webkitExitFullscreen) {
        // Safari 兼容
        await document.webkitExitFullscreen()
        console.log('✅ 成功退出全屏模式 (webkit)')
      } else if (document.msExitFullscreen) {
        // IE/Edge 兼容
        await document.msExitFullscreen()
        console.log('✅ 成功退出全屏模式 (ms)')
      }
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('❌ 全屏切换失败:', error)

    // 重置状态
    isFullscreen.value = false

    // 根据错误类型提供不同的提示
    if (error.name === 'NotAllowedError') {
      console.warn('⚠️ 用户拒绝了全屏请求')
      // 可以在这里添加用户友好的提示
    } else if (error.message && error.message.includes('not granted')) {
      console.warn('⚠️ 浏览器阻止了全屏请求，这是正常的安全机制')
      // 在自动化测试环境中，全屏请求通常会被阻止
    } else {
      console.warn('⚠️ 全屏功能可能被浏览器阻止，请检查浏览器设置')
    }
  }
}

const toggleThemeMenu = () => {
  showThemeMenu.value = !showThemeMenu.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showThemeMenu.value = false
}

const switchTheme = (themeKey: string) => {
  currentThemeKey.value = themeKey
  document.documentElement.className = `theme-${themeKey}`
  localStorage.setItem('theme', themeKey)
  showThemeMenu.value = false
}

const handleUserCommand = (command: string) => {
  showUserMenu.value = false
  emit('command', command)
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.theme-switcher') && !target.closest('.user-menu')) {
    showThemeMenu.value = false
    showUserMenu.value = false
  }
}

onMounted(() => {
  // 确保用户信息被正确加载
  if (!userStore.userInfo && userStore.token) {
    // 如果有token但没有用户信息，尝试恢复
    userStore.tryRestoreFromLocalStorage()
  }
  
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themes.value.find(t => t.key === savedTheme)) {
    currentThemeKey.value = savedTheme
    document.documentElement.className = `theme-${savedTheme}`
  }
  
  // 监听点击外部事件
  document.addEventListener('click', handleClickOutside)
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 清理函数将在组件卸载时自动调用
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;
.tabbar-layout {
  height: var(--header-height, 60px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--app-gap);
  background: var(--bg-primary);
  border-bottom: var(--border-width-base) solid var(--border-color);

.tabbar-left {
  display: flex;
  align-items: center;
  gap: var(--app-gap);
  flex: 1;
  min-width: 0;
}

.menu-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size); height: var(--icon-size);
  background: transparent;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-duration);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    color: var(--text-primary);
    
    .menu-icon {
      color: var(--primary-color);
    }
  }
}

.menu-icon {
  width: var(--text-2xl);
  height: var(--text-2xl);
  transition: color var(--transition-duration);
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.breadcrumb-nav {
  flex: 1;
  min-width: 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  white-space: nowrap;
  transition: color var(--transition-duration);
  
  &:hover {
    color: var(--primary-color);
  }
}

.breadcrumb-icon {
  width: var(--text-lg);
  height: var(--text-lg);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
  color: var(--text-placeholder);
  font-size: var(--text-sm);
  
  svg {
    width: var(--text-lg);
    height: var(--text-lg);
  }
}

.tabbar-right {
  display: flex;
  align-items: center;
  gap: var(--app-gap-md);
  flex-shrink: 0;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--app-gap-sm);
  width: var(--text-lg);
  height: var(--text-lg);
  color: var(--text-placeholder);
  z-index: 1;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.search-input {
  max-width: 240px; width: 100%;
  height: var(--button-height-md);
  padding: 0 var(--app-gap-sm) 0 36px;
  background: var(--bg-secondary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--transition-duration);
  
  &::placeholder {
    color: var(--text-placeholder);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color-light);
  }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size); height: var(--icon-size);
  background: transparent;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-duration);
  position: relative;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    color: var(--text-primary);
  }
}

.icon-wrapper {
  width: var(--text-2xl);
  height: var(--text-2xl);
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--danger-color);
  color: var(--text-white);
  font-size: var(--spacing-sm);
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  min-width: var(--text-lg);
  height: var(--text-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.theme-switcher {
  position: relative;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
  height: var(--button-height-lg);
  padding: 0 var(--app-gap-sm);
  background: transparent;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-duration);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    color: var(--text-primary);
  }
}

.theme-preview {
  width: var(--text-lg);
  height: var(--text-lg);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color-light);
}

.theme-arrow {
  width: var(--text-lg);
  height: var(--text-lg);
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.theme-menu {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  min-max-max-width: 200px; width: 100%; width: 100%;
  background: var(--bg-primary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-dark);
  z-index: 1000;
  overflow: hidden;

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm);
  padding: var(--app-gap-sm);
  cursor: pointer;
  transition: background var(--transition-duration);
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &.theme-option-active {
    background: var(--bg-hover);
  }
}

.theme-color {
  width: var(--text-2xl);
  height: var(--text-2xl);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color-light);
  flex-shrink: 0;
}

.theme-info {
  flex: 1;
  min-width: 0;
}

.theme-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.theme-desc {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
}

.theme-check {
  width: var(--text-lg);
  height: var(--text-lg);
  color: var(--primary-color);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.user-menu {
  position: relative;
}

.user-info-btn {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm);
  height: var(--button-height-lg);
  padding: 0 var(--app-gap-sm);
  background: transparent;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-duration);
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    color: var(--text-primary);
  }
}

.user-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  
  svg {
    width: var(--text-lg);
    height: var(--text-lg);
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--text-placeholder);
  line-height: 1.2;
}

.user-arrow {
  width: var(--text-lg);
  height: var(--text-lg);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  min-max-width: 180px; width: 100%;
  background: var(--bg-primary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-dark);
  z-index: 1000;
  overflow: hidden;

.user-menu-item {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm);
  padding: var(--app-gap-sm);
  cursor: pointer;
  transition: background var(--transition-duration);
  font-size: var(--text-sm);
  color: var(--text-primary);
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &.logout-item {
    color: var(--danger-color);
    
    &:hover {
      background: var(--danger-color-light);
    }
  }
}

.menu-item-icon {
  width: var(--text-lg);
  height: var(--text-lg);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.user-menu-divider {
  height: var(--border-width-base);
  background: var(--border-color);
  margin: var(--app-gap-xs) 0;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .tabbar-layout {
    padding: 0 var(--app-gap-md);
  }
  
  .tabbar-left {
    gap: var(--app-gap-md);
  }
  
  .tabbar-right {
    gap: var(--app-gap-sm);
  }
  
  .search-input {
    width: 200px;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .search-input {
    max-width: 160px; width: 100%;
  }
  
  .user-details {
    display: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .menu-toggle-btn,
  .icon-btn,
  .theme-toggle-btn,
  .user-info-btn {
    border-width: auto;
  }
  
  .search-input {
    border-width: auto;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .menu-toggle-btn,
  .icon-btn,
  .theme-toggle-btn,
  .user-info-btn,
  .search-input,
  .theme-option,
  .user-menu-item {
    transition: none;
  }
}

// Element Plus 组件主题化
:deep(.el-input) {
  --el-input-bg-color: var(--bg-secondary);
  --el-input-border-color: var(--border-color);
  --el-input-focus-border-color: var(--primary-color);
  --el-input-text-color: var(--text-primary);
  --el-input-placeholder-color: var(--text-placeholder);
}

:deep(.el-button) {
  --el-button-bg-color: var(--bg-secondary);
  --el-button-border-color: var(--border-color);
  --el-button-text-color: var(--text-primary);
  --el-button-hover-bg-color: var(--bg-hover);
  --el-button-hover-border-color: var(--primary-color);
  --el-button-hover-text-color: var(--text-primary);
}