<template>
  <div class="app-container cls-final-fix-2025 cls-ultimate-fix-2025 cls-performance-fix">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !sidebarCollapsed"
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- 侧边栏 -->
    <ImprovedSidebar
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      @toggle="toggleSidebar"
      @menu-click="handleSidebarMenuClick"
    />

    <!-- 主内容区域 -->
    <div class="main-container" :class="{
      'main-expanded': sidebarCollapsed,
      'ai-sidebar-open': aiAssistantVisible
    }">
      <!-- 现代化顶部导航栏 -->
      <header class="app-header">
        <div class="header-section header-left">
          <!-- 侧边栏切换按钮 -->
          <button
            class="header-icon-btn sidebar-toggle"
            @click="toggleSidebar"
            :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          >
            <UnifiedIcon
              name="menu"
              :size="20"
            />
          </button>

          <!-- 面包屑导航 -->
          <nav class="breadcrumb-nav">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </nav>
        </div>

        <div class="header-section header-right">
          <!-- AI助手按钮 -->
          <div
            class="ai-avatar"
            @click="toggleAIAssistant"
            :class="{ 'active': aiAssistantVisible }"
            title="AI助手"
          >
            <span>AI</span>
            <div class="status-dot" :class="aiStatus"></div>
          </div>

          <!-- 主题选择按钮 -->
          <div class="theme-selector" v-click-outside="closeThemeDropdown">
            <button
              class="header-action-btn theme-btn"
              @click="toggleThemeDropdown"
              :class="{ 'active': showThemeDropdown }"
            >
              <UnifiedIcon
                name="design"
                :size="18"
              />
              <span class="btn-label">主题</span>
            </button>

            <!-- 主题下拉列表 -->
            <transition name="dropdown">
              <div v-if="showThemeDropdown" class="theme-dropdown">
                <div
                  v-for="theme in availableThemes"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ active: currentTheme === theme.value }"
                  @click="changeTheme(theme.value)"
                >
                  <div class="theme-preview" :data-theme="theme.value"></div>
                  <span class="theme-name">{{ theme.name }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- 图标系统选择器 -->
          <div class="icon-system-selector" v-click-outside="closeIconSystemDropdown">
            <button
              class="header-action-btn icon-system-btn"
              @click="toggleIconSystemDropdown"
              :class="{ 'active': showIconSystemDropdown }"
            >
              <UnifiedIcon
                name="menu"
                :size="18"
              />
              <span class="btn-label">图标</span>
            </button>

            <!-- 图标系统下拉列表 -->
            <transition name="dropdown">
              <div v-if="showIconSystemDropdown" class="icon-system-dropdown">
                <div
                  v-for="system in iconSystems"
                  :key="system.id"
                  class="icon-system-option"
                  :class="{ active: currentIconSystem === system.id }"
                  @click="switchIconSystem(system.id)"
                >
                  <div class="icon-system-preview">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="system.id === 'colorful' ? 'none' : 'currentColor'" :stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path v-if="system.id === 'modern'" :d="system.preview"/>
                      <path v-else-if="system.id === 'colorful'" :d="system.preview" :fill="currentIconSystem === 'colorful' ? '#4CAF50' : '#9E9E9E'"/>
                      <path v-else :d="system.preview" :style="system.id === 'handdrawn' ? { filter: 'url(#roughPaper)' } : {}"/>
                    </svg>
                    <!-- 手绘效果滤镜 -->
                    <svg v-if="system.id === 'handdrawn'" style="position: absolute; width: 0; height: 0;">
                      <defs>
                        <filter id="roughPaper">
                          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                  <div class="icon-system-info">
                    <span class="icon-system-name">{{ system.name }}</span>
                    <span class="icon-system-desc">{{ system.description }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 用户信息 -->
          <div
            class="user-profile"
            @click="openUserProfile"
            title="个人资料设置"
          >
            <div class="user-avatar">
              <span v-if="userDisplayName">{{ userDisplayName.charAt(0).toUpperCase() }}</span>
              <span v-else>U</span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ userDisplayName || '家长' }}</span>
            </div>
          </div>

          <!-- 退出按钮 -->
          <button
            class="header-action-btn logout-btn"
            @click="handleLogout"
            title="退出登录"
          >
            <UnifiedIcon
              name="close"
              :size="16"
            />
            <span class="btn-label">退出</span>
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content" :class="{ 'full-bleed': isFullBleedPage }">
        <router-view />
      </div>
    </div>



    <!-- 测试组件 (仅开发环境) - 暂时禁用以避免覆盖AI窗口 -->
    <!-- <RoleSwitcher v-if="isDevelopment" /> -->
    <!-- <PerformanceMonitor v-model="showPerformanceMonitor" v-if="isDevelopment" /> -->
    <!-- <MobileTestSuite v-model="showMobileTestSuite" v-if="isDevelopment" /> -->

    <!-- AI助手侧边栏（插槽模式） -->
    <div v-if="aiAssistantVisible" class="ai-sidebar-slot">
      <AIAssistant
        v-model:visible="aiAssistantVisible"
        :mode="aiAssistantMode"
        @update:visible="handleAIVisibilityChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

import { PERMISSIONS, ROLES } from '../utils/permission'
import UnifiedIcon from '../components/icons/UnifiedIcon.vue'
import ImprovedSidebar from '../components/layout/ImprovedSidebar.vue'
import { useAIAssistantStore } from '../stores/ai-assistant'
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue'
import { useIconSystemStore, type IconSystem } from '../stores/icon-system'

// v-click-outside 指令
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutside)
  }
}

import RoleSwitcher from '../components/testing/RoleSwitcher.vue'
import PerformanceMonitor from '../components/testing/PerformanceMonitor.vue'
import MobileTestSuite from '../components/testing/MobileTestSuite.vue'
import { mobileNavigationManager, touchOptimizer } from '../utils/navigation-fix'
import { workflowTransparency } from '../utils/workflow-transparency'

// 路由和状态
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const aiStore = useAIAssistantStore()

// 图标系统状态
const iconSystemStore = useIconSystemStore()
const currentIconSystem = computed(() => iconSystemStore.currentSystem)
const iconSystems = computed(() => iconSystemStore.getAllSystems())
const showIconSystemDropdown = ref(false)

// 提供图标系统给子组件
provide('iconSystem', currentIconSystem)



// 测试组件状态
const showRoleSwitcher = ref(false)
const showPerformanceMonitor = ref(false)
const showMobileTestSuite = ref(false)

// 开发环境检查
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' ||
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true')
})

// 响应式状态
const sidebarCollapsed = ref(window.innerWidth < 768)
const windowWidth = ref(window.innerWidth)
const isFullscreen = ref(false)
const showThemeDropdown = ref(false)
const currentTheme = ref('theme-light')
const currentSidebarStyle = ref('modern')

// 可用主题配置 - 与全局主题系统保持一致
const availableThemes = ref([
  { name: '明亮主题', value: 'theme-light', color: 'var(--primary-color)' },
  { name: '暗黑主题', value: 'theme-dark', color: 'var(--primary-color)' },
  { name: '霓虹主题', value: 'glass-neon', color: 'var(--ai-primary)' },
  { name: '渐变主题', value: 'glass-gradient', color: '#ec4899' }
])

// AI助手状态
const aiAssistantVisible = computed({
  get: () => aiStore.panelVisible,
  set: (value: boolean) => {
    if (value) {
      aiStore.showPanel()
    } else {
      aiStore.hidePanel()
    }
  }
})

// AI助手显示模式：sidebar（侧边栏）或 fullscreen（全屏）
const aiAssistantMode = ref<'sidebar' | 'fullscreen'>('sidebar')

const aiStatus = computed(() => {
  // 根据AI连接状态返回不同的状态类
  if (aiStore.panelVisible) return 'active'
  return 'idle'
})

// 计算属性
const isMobile = computed(() => windowWidth.value < 768)

// 是否需要页面铺满（去除内边距）- 现在工作台页面也需要正常边距
const isFullBleedPage = computed(() => false) // 暂时禁用全屏模式，让所有页面都有边距

const currentPageTitle = computed(() => {
  const pathMap: Record<string, string> = {
    // 工作台
    '/dashboard': '数据概览',
    '/dashboard/schedule': '日程管理',
    '/dashboard/important-notices': '消息通知',
    '/dashboard/campus-overview': '园区概览',
    '/dashboard/data-statistics': '数据统计',

    // 招生管理
    '/enrollment-plan': '招生计划',
    '/enrollment': '招生活动',
    '/enrollment-plan/statistics': '招生统计',
    '/enrollment-plan/quota-manage': '名额管理',

    // 中心页面
    '/centers/dashboard': '仪表板中心',
    '/centers/personnel': '人事中心',
    '/centers/activity': '活动中心',
    '/centers/enrollment': '招生中心',
    '/centers/marketing': '营销中心',
    '/centers/ai': 'AI中心',
    '/centers/system': '系统中心',

    // 客户管理
    '/customer': '客户列表',
    '/principal/customer-pool': '客户池',

    // 学生管理
    '/student': '学生管理',
    '/class': '班级管理',
    '/application': '入园申请',

    // 活动管理
    '/activity': '活动列表',
    '/activity/create': '创建活动',
    '/principal/activities': '园长活动',

    // 家长服务
    '/parent': '家长列表',
    '/parent/children': '孩子列表',

    // 教师管理
    '/teacher': '教师列表',

    // 营销管理
    '/marketing': '营销管理',
    '/marketing/coupons': '优惠券管理',
    '/marketing/consultations': '咨询管理',
    '/marketing/intelligent-engine/marketing-engine': '智能营销引擎',

    // 营销工具
    '/principal/poster-editor': '海报编辑',
    '/principal/poster-generator': '海报生成器',
    '/chat': '在线咨询',
    '/ai': 'AI助手',

    // AI相关页面
    '/ai/query': 'AI智能查询',
    '/ai/model': 'AI模型管理',
    '/ai-services': 'AI服务',
    '/ai-services/ExpertConsultationPage': '专家咨询',

    '/ai-center/expert-consultation': 'AI专家咨询',

    // 数据分析
    '/statistics': '统计报表',
    '/principal/performance': '绩效管理',
    '/principal/marketing-analysis': '经营分析',
    '/principal/dashboard': '园长仪表盘',
    '/principal/intelligent-dashboard': '智能决策支持',
    '/principal/basic-info': '基本资料',

    '/principal/PosterGenerator': '海报生成器',
    '/principal/PosterTemplates': '海报模板',
    '/principal/PosterEditor': '海报编辑器',

    // 系统管理
    '/system': '系统设置',
    '/system/users': '用户管理',
    '/system/roles': '角色管理',
    '/system/permissions': '权限管理',
    '/system/logs': '系统日志',
    '/system/backup': '数据备份',
    '/system/settings': '系统配置',
    '/system/ai-model-config': 'AI模型配置'
  }

  // 精确匹配
  if (pathMap[route.path]) {
    return pathMap[route.path]
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(pathMap)) {
    if (route.path.startsWith(key)) {
      return value
    }
  }

  return '当前页面'
})

const userDisplayName = computed(() => {
  // 根据用户角色显示不同的名称
  const role = userStore.userInfo?.role
  if (role === 'parent' || role === '家长') {
    return userStore.userInfo?.realName || userStore.userInfo?.username || '家长'
  }
  return userStore.userInfo?.realName || userStore.userInfo?.username || '管理员'
})

const userRoleDisplay = computed(() => {
  const roleMap: Record<string, string> = {
    'admin': '系统管理员',
    'ADMIN': '系统管理员',
    'super_admin': '超级管理员',
    'SUPER_ADMIN': '超级管理员',
    'teacher': '教师',
    'TEACHER': '教师',
    'principal': '园长',
    'PRINCIPAL': '园长',
    'parent': '家长',
    'PARENT': '家长',
    'user': '普通用户',
    'USER': '普通用户'
  }

  // 优先使用 role 字段，如果不存在则使用 roles 数组的第一个元素的 code
  const userRole = userStore.userInfo?.role || (userStore.userInfo?.roles && userStore.userInfo.roles[0]?.code) || 'user'
  return roleMap[userRole] || roleMap['user']
})

// 方法
const toggleSidebar = () => {
  if (isMobile.value) {
    // 移动端使用导航管理器
    mobileNavigationManager.toggleSidebar()
  } else {
    // 桌面端传统方式
    sidebarCollapsed.value = !sidebarCollapsed.value
    // 持久化侧边栏状态
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }
}

// 处理侧边栏菜单点击
const handleSidebarMenuClick = () => {
  // 移动端点击菜单后自动收起侧边栏
  if (isMobile.value) {
    mobileNavigationManager.closeSidebar()
  }
}

// AI助手切换
const toggleAIAssistant = () => {
  // 切换侧边栏显示状态
  aiAssistantVisible.value = !aiAssistantVisible.value
}

// 处理AI助手可见性变化
const handleAIVisibilityChange = (visible: boolean) => {
  if (visible) {
    aiStore.showPanel()
  } else {
    aiStore.hidePanel()
  }
}

// 切换AI助手模式（侧边栏 ↔ 全屏）
const toggleAIAssistantMode = () => {
  if (aiAssistantMode.value === 'sidebar') {
    // 切换到全屏模式：跳转到 /ai 页面
    router.push('/ai')
  } else {
    // 切换到侧边栏模式：返回上一页并显示侧边栏
    router.back()
    aiAssistantVisible.value = true
    aiAssistantMode.value = 'sidebar'
  }
}








// 打开用户资料设置
const openUserProfile = () => {
  // 使用路由导航到用户资料页面
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    // 清除localStorage中的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('kindergarten_token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userInfo')

    // 重置用户store
    userStore.clearUserInfo()

    // 重置侧边栏状态
    sidebarCollapsed.value = false
    localStorage.removeItem('sidebarCollapsed')

    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 全屏功能
const toggleFullscreen = async () => {
  try {
    console.log('🖥️ 全屏切换开始，当前状态:', !!document.fullscreenElement)

    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
      // 进入全屏
      const docEl = document.documentElement

      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen()
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen()
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen()
      } else {
        throw new Error('浏览器不支持全屏功能')
      }

      console.log('✅ 进入全屏成功')
      isFullscreen.value = true
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }

      console.log('✅ 退出全屏成功')
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('❌ 全屏切换失败:', error)

    // 提供用户友好的错误提示
    if (error.message.includes('not granted') || error.message.includes('denied')) {
      console.warn('⚠️ 全屏权限被拒绝，这通常是浏览器安全策略导致的')
    } else if (error.message.includes('not supported')) {
      console.warn('⚠️ 当前浏览器不支持全屏功能')
    }

    // 确保状态同步
    isFullscreen.value = !!(document.fullscreenElement ||
                           document.webkitFullscreenElement ||
                           document.msFullscreenElement)
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(document.fullscreenElement ||
                                  document.webkitFullscreenElement ||
                                  document.msFullscreenElement)

  console.log('🔄 全屏状态变化:', isCurrentlyFullscreen)
  isFullscreen.value = isCurrentlyFullscreen
}

// 主题切换功能
const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
}

const closeThemeDropdown = () => {
  showThemeDropdown.value = false
}

const changeTheme = (theme: string) => {
  currentTheme.value = theme
  showThemeDropdown.value = false

  console.log('MainLayout switching theme to:', theme)

  // 移除所有主题类 - 支持玻璃主题
  const allThemes = ['theme-light', 'theme-dark', 'glass-light', 'glass-dark', 'glass-neon', 'glass-gradient']
  document.documentElement.classList.remove(...allThemes)
  document.body.classList.remove(...allThemes)
  document.documentElement.removeAttribute('data-theme')
  document.body.removeAttribute('data-theme')

  // 玻璃主题使用data-theme属性，其他主题使用class
  if (theme.startsWith('glass-')) {
    // 玻璃主题：设置data-theme属性
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    // 同时添加class以确保兼容性
    document.documentElement.classList.add(theme)
    document.body.classList.add(theme)
  } else {
    // 传统主题：使用class
    document.documentElement.classList.add(theme)
    document.body.classList.add(theme)
  }

  // 添加调试日志
  console.log('Theme switched to:', theme)
  console.log('Current root classes:', document.documentElement.className)
  console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'))

  // 持久化主题设置
  localStorage.setItem('theme', theme)
}

// 侧边栏样式切换功能
const changeSidebarStyle = (style: string) => {
  currentSidebarStyle.value = style

  console.log('MainLayout switching sidebar style to:', style)

  // 移除所有侧边栏样式类
  document.body.classList.remove(
    'sidebar-style-traditional',
    'sidebar-style-modern',
    'sidebar-style-glass',
    'sidebar-style-fashion'
  )

  // 应用新的侧边栏样式类
  document.body.classList.add(`sidebar-style-${style}`)

  // 添加调试日志
  console.log('Sidebar style switched to:', style)
  console.log('Current body classes:', document.body.className)

  // 持久化样式设置
  localStorage.setItem('sidebarStyle', style)
}

// 点击外部关闭主题下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.theme-selector')) {
    showThemeDropdown.value = false
  }
  if (!target.closest('.icon-system-selector')) {
    showIconSystemDropdown.value = false
  }
}

// 图标系统相关方法
const toggleIconSystemDropdown = () => {
  showIconSystemDropdown.value = !showIconSystemDropdown.value
  showThemeDropdown.value = false // 关闭主题下拉菜单
}

const closeIconSystemDropdown = () => {
  showIconSystemDropdown.value = false
}

const switchIconSystem = (system: IconSystem) => {
  iconSystemStore.switchIconSystem(system)
  showIconSystemDropdown.value = false

  console.log('MainLayout switching icon system to:', system)

  // 强制重新渲染所有图标组件
  window.dispatchEvent(new CustomEvent('icon-system-changed', {
    detail: { system }
  }))
}

const handleResize = () => {
  windowWidth.value = window.innerWidth

  // 移动端自动收起侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}



// 键盘快捷键处理
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // 仅在开发环境启用
  if (!isDevelopment.value) return

  // Ctrl/Cmd + Shift + 组合键
  if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
    switch (event.key) {
      case 'R': // 角色切换器
        event.preventDefault()
        showRoleSwitcher.value = !showRoleSwitcher.value
        break
      case 'P': // 性能监控
        event.preventDefault()
        showPerformanceMonitor.value = !showPerformanceMonitor.value
        break
      case 'M': // 移动端测试
        event.preventDefault()
        showMobileTestSuite.value = !showMobileTestSuite.value
        break
    }
  }
}

// 生命周期
onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userInfo) {
    userStore.tryRestoreFromLocalStorage()
  }



  // 恢复侧边栏状态
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState !== null) {
    sidebarCollapsed.value = savedSidebarState === 'true'
  }

  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && availableThemes.value.some(t => t.value === savedTheme)) {
    changeTheme(savedTheme)
  } else {
    // 默认使用明亮主题
    changeTheme('theme-light')
  }

  // 恢复侧边栏样式设置
  const savedStyle = localStorage.getItem('sidebarStyle')
  if (savedStyle) {
    changeSidebarStyle(savedStyle)
  } else {
    // 默认使用现代样式
    changeSidebarStyle('modern')
  }

  // 初始化图标系统
  iconSystemStore.initializeIconSystem()
  console.log('Available icon systems:', iconSystems.value.length)
  console.log('Icon systems:', iconSystems.value.map(sys => sys.name))
  console.log('Current icon system:', iconSystemStore.getCurrentSystem())

  // 添加调试日志
  console.log('MainLayout mounted')
  console.log('Available themes:', availableThemes.value.length)
  console.log('Themes:', availableThemes.value.map(t => t.name))
  console.log('Current theme:', currentTheme.value)

  // 初始化全屏状态
  isFullscreen.value = !!document.fullscreenElement

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // 监听点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)

  // 添加键盘事件监听（开发环境）
  if (isDevelopment.value) {
    document.addEventListener('keydown', handleKeyboardShortcuts)
  }

  // 为侧边栏切换按钮和其他按钮添加触摸优化
  nextTick(() => {
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn')
    const headerActionBtns = document.querySelectorAll('.header-action-btn')

    if (sidebarToggleBtn) {
      touchOptimizer.addTouchFeedback(sidebarToggleBtn as HTMLElement)
      touchOptimizer.preventDoubleTap(sidebarToggleBtn as HTMLElement)
    }

    headerActionBtns.forEach(btn => {
      touchOptimizer.addTouchFeedback(btn as HTMLElement)
      touchOptimizer.preventDoubleTap(btn as HTMLElement)
    })
  })

  // 清理函数
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('click', handleClickOutside)
    if (isDevelopment.value) {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }

  // 在组件卸载时清理事件监听器
  return cleanup
})
</script>

<style lang="scss" scoped>

.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

/* 侧边栏组件样式调整 */

/* 主内容区域 - 修复布局 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  min-height: 100vh;
  position: relative;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 允许flex子项在需要时收缩，避免子内容撑破 */
  min-width: 0;
  /* 移除固定宽度设置，交由flex布局自适应 */
  /* 确保内容区域能够完全响应式缩放 */
  width: auto;
  max-width: none;

  /* AI侧边栏打开时，主内容区域缩小 */
  &.ai-sidebar-open {
    margin-right: 400px;
  }
}

/* 侧边栏收起时的主内容区域 */
.main-expanded {
  // 不再需要margin-left调整
}

/* AI助手侧边栏插槽 */
.ai-sidebar-slot {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: var(--el-bg-color);
  border-left: var(--border-width-base) solid var(--el-border-color);
  box-shadow: -2px 0 var(--spacing-sm) var(--shadow-light);
  z-index: 1000;
  transition: transform 0.3s ease;

  /* 暗黑模式适配 */
  .dark & {
    background: var(--el-bg-color);
    border-left-color: var(--el-border-color-darker);
    box-shadow: -2px 0 var(--spacing-sm) var(--shadow-heavy);
  }
}

/* 侧边栏收起状态：不再强制设置主内容宽度，交由flex布局自适应 */

/* AI助手全屏模式：主内容区域缩小为0 */
.main-container.ai-fullscreen-mode {
  width: 0;
  min-width: 0;
  max-width: 0;
  overflow: hidden;
  margin-right: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* AI助手全屏模式：隐藏侧边栏 */
.sidebar.ai-fullscreen-hidden {
  display: none !important;
}

/* 响应式主内容区域调整 */
@media (max-width: var(--breakpoint-xl)) {
  .main-container {
    // 使用flex布局，不需要margin-left
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .main-container {
    // 使用flex布局，不需要margin-left
  }
}

@media (max-width: var(--breakpoint-md)) {
  .main-container {
    /* 移动端特殊处理：侧边栏覆盖显示，主内容区域占满宽度 */
    margin-left: 0;

    /* AI面板使用fixed定位，移动端不需要特殊处理 */
  }

  .sidebar-collapsed .main-container {
    margin-left: 0;
  }
}

/* ==================== 现代化应用头部 ==================== */
.app-header {
  height: var(--app-header-height, 6var(--spacing-xs));
  background: var(--app-header-bg, var(--white-alpha-95));
  backdrop-filter: var(--app-header-backdrop, blur(var(--text-2xl)) saturate(180%));
  border-bottom: var(--border-width-base) solid var(--app-header-border, var(--black-alpha-6));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--app-header-padding-x, var(--spacing-lg));
  position: sticky;
  top: 0;
  z-index: var(--app-header-z-index, 100);
  transition: var(--app-header-transition, all 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  box-shadow: var(--app-header-shadow, 0 var(--border-width-base) 3px var(--shadow-light), 0 var(--border-width-base) 2px var(--black-alpha-6));
}

.header-section {
  display: flex;
  align-items: center;
  gap: var(--header-section-gap, var(--spacing-md));
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--header-right-gap, var(--spacing-sm));
}

/* ==================== 头部按钮样式 ==================== */
.header-icon-btn,
.header-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--header-btn-height, 40px);
  padding: 0 var(--header-btn-padding-x, var(--spacing-sm));
  border: var(--border-width-base) solid var(--header-btn-border, transparent);
  border-radius: var(--header-btn-radius, var(--radius-lg));
  background: var(--header-btn-bg, transparent);
  color: var(--header-btn-color, var(--text-regular));
  font-size: var(--header-btn-font-size, var(--text-sm));
  font-weight: var(--header-btn-font-weight, 500);
  cursor: pointer;
  transition: var(--header-btn-transition, all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
  position: relative;
  overflow: hidden;
  text-decoration: none;
  outline: none;
  user-select: none;

  &:hover {
    background: var(--header-btn-hover-bg, var(--bg-hover));
    color: var(--header-btn-hover-color, var(--primary-color));
    border-color: var(--header-btn-hover-border, var(--primary-color));
    transform: var(--header-btn-hover-transform, translateY(-var(--border-width-base)));
    box-shadow: var(--header-btn-hover-shadow, 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.15));
  }

  &:active {
    transform: var(--header-btn-active-transform, translateY(0) scale(0.98));
  }

  &:focus-visible {
    outline: 2px solid var(--header-btn-focus-outline, var(--primary-color));
    outline-offset: 2px;
  }

  .unified-icon {
    transition: var(--header-icon-transition, all 0.2s ease);
  }
}

/* 带标签的按钮 */
.header-action-btn {
  gap: var(--header-action-btn-gap, var(--spacing-xs));
  min-width: var(--header-action-btn-min-width, auto);

  .btn-label {
    font-size: var(--text-sm, 13px);
    font-weight: 500;
    color: var(--header-btn-label-color, var(--text-primary));
    white-space: nowrap;
  }
}

/* AI助手按钮特殊样式 */
.ai-assistant-btn {
  background: var(--ai-btn-bg, linear-gradient(135deg, var(--accent-ai) 0%, var(--accent-ai-hover) 100%));
  color: var(--ai-btn-color, white);
  border-color: var(--ai-btn-border, transparent);
  box-shadow: var(--ai-btn-shadow, 0 var(--spacing-xs) var(--text-sm) rgba(14, 165, 233, 0.3));

  .btn-label {
    color: var(--ai-btn-label-color, white);
  }

  &:hover {
    background: var(--ai-btn-hover-bg, linear-gradient(135deg, var(--accent-ai-hover) 0%, var(--accent-ai) 100%));
    color: var(--ai-btn-hover-color, white);
    box-shadow: var(--ai-btn-hover-shadow, 0 6px var(--text-2xl) rgba(14, 165, 233, 0.4));
    transform: var(--ai-btn-hover-transform, translateY(-2px));

    .btn-label {
      color: var(--ai-btn-hover-label-color, white);
    }
  }

  &.active {
    background: var(--ai-btn-active-bg, linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%));
    box-shadow: var(--ai-btn-active-shadow, 0 6px var(--text-2xl) rgba(103, 194, 58, 0.4));
  }

  .status-dot {
    width: var(--status-dot-size, 6px);
    height: var(--status-dot-size, 6px);
    border-radius: var(--radius-full);
    background: var(--status-dot-bg, var(--success-color));
    margin-left: var(--status-dot-margin-left, var(--spacing-xs));
    transition: var(--status-dot-transition, all 0.3s ease);
    box-shadow: var(--status-dot-shadow, 0 0 0 2px var(--white-alpha-80));

    &.active {
      animation: var(--status-dot-active-animation, pulse 2s infinite);
      box-shadow: var(--status-dot-active-shadow, 0 0 0 2px var(--white-alpha-80), 0 0 var(--spacing-sm) var(--success-color));
    }

    &.idle {
      background: var(--status-dot-idle-bg, var(--info-color));
    }

    &.error {
      background: var(--status-dot-error-bg, var(--danger-color));
      animation: var(--status-dot-error-animation, blink 1s infinite);
    }
  }
}

/* 主题选择器 */
.theme-selector {
  position: relative;
}

/* 图标系统选择器 */
.icon-system-selector {
  position: relative;
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + var(--theme-dropdown-top-offset, var(--spacing-sm)));
  right: 0;
  min-width: var(--theme-dropdown-width, 180px);
  background: var(--theme-dropdown-bg, var(--bg-card));
  border: var(--border-width-base) solid var(--theme-dropdown-border, var(--border-color-light));
  border-radius: var(--theme-dropdown-radius, var(--radius-lg));
  box-shadow: var(--theme-dropdown-shadow, var(--shadow-xl));
  padding: var(--theme-dropdown-padding, var(--spacing-xs));
  z-index: var(--theme-dropdown-z-index, 1000);
  backdrop-filter: var(--theme-dropdown-backdrop, blur(var(--text-2xl)));
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--theme-option-gap, var(--spacing-sm));
  padding: var(--theme-option-padding, var(--spacing-sm));
  border-radius: var(--theme-option-radius, var(--radius-md));
  cursor: pointer;
  transition: var(--theme-option-transition, all 0.2s ease);

  &:hover {
    background: var(--theme-option-hover-bg, var(--bg-hover));
  }

  &.active {
    background: var(--theme-option-active-bg, var(--primary-light-bg));
    color: var(--theme-option-active-color, var(--primary-color));
  }

  .theme-preview {
    width: var(--theme-preview-size, var(--text-3xl));
    height: var(--theme-preview-size, var(--text-3xl));
    border-radius: var(--theme-preview-radius, var(--radius-sm));
    border: var(--border-width-base) solid var(--theme-preview-border, var(--border-color-light));

    &[data-theme="theme-light"] {
      background: linear-gradient(135deg, var(--bg-white) 0%, #f3f4f6 100%);
    }

    &[data-theme="theme-dark"] {
      background: linear-gradient(135deg, var(--text-primary) 0%, var(--color-gray-900) 100%);
    }

    &[data-theme="glass-neon"] {
      background: linear-gradient(135deg, var(--ai-primary) 0%, var(--primary-color) 100%);
      box-shadow: 0 0 var(--text-sm) var(--accent-marketing-heavy);
    }

    &[data-theme="glass-gradient"] {
      background: linear-gradient(135deg, #ec4899 0%, var(--ai-primary) 100%);
      box-shadow: 0 0 var(--text-sm) rgba(236, 72, 153, 0.5);
    }
  }

  .theme-name {
    font-size: var(--theme-name-font-size, var(--text-sm));
    font-weight: var(--theme-name-font-weight, 500);
  }
}

/* 图标系统下拉菜单 */
.icon-system-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  min-width: 200px;
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xs);
  z-index: 1000;
  backdrop-filter: blur(var(--text-2xl));
}

.icon-system-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }

  &.active {
    background: var(--primary-light-bg);
    color: var(--primary-color);

    .icon-system-preview {
      border-color: var(--primary-color);
      box-shadow: 0 0 var(--spacing-sm) rgba(var(--primary-color-rgb), 0.2);
    }
  }

  .icon-system-preview {
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
    border-radius: var(--radius-sm);
    border: var(--border-width-base) solid var(--border-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    transition: all 0.2s ease;
  }

  .icon-system-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .icon-system-name {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-primary);
    }

    .icon-system-desc {
      font-size: var(--text-2xs);
      color: var(--text-muted);
      line-height: 1.3;
    }
  }
}

/* 用户信息 */
.user-profile {
  display: flex;
  align-items: center;
  gap: var(--user-profile-gap, var(--spacing-sm));
  padding: var(--user-profile-padding, var(--spacing-xs) var(--spacing-sm));
  background: var(--user-profile-bg, var(--white-alpha-80));
  border: var(--border-width-base) solid var(--user-profile-border, var(--black-alpha-6));
  border-radius: var(--user-profile-radius, var(--radius-xl));
  height: var(--user-profile-height, 40px);
  transition: var(--user-profile-transition, all 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  backdrop-filter: var(--user-profile-backdrop, blur(10px));
  cursor: pointer;

  &:hover {
    background: var(--user-profile-hover-bg, var(--white-alpha-95));
    border-color: var(--user-profile-hover-border, var(--primary-color));
    transform: var(--user-profile-hover-transform, translateY(-var(--border-width-base)));
    box-shadow: var(--user-profile-hover-shadow, 0 var(--spacing-xs) var(--text-sm) var(--shadow-light));
  }
}

.user-avatar {
  width: var(--user-avatar-size, var(--spacing-3xl));
  height: var(--user-avatar-size, var(--spacing-3xl));
  border-radius: var(--user-avatar-radius, 50%);
  background: var(--user-avatar-bg, var(--gradient-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--user-avatar-color, white);
  font-weight: var(--user-avatar-font-weight, 600);
  font-size: var(--user-avatar-font-size, var(--text-base));
  transition: var(--user-avatar-transition, all 0.2s ease);
  box-shadow: var(--user-avatar-shadow, var(--shadow-sm));

  &:hover {
    transform: var(--user-avatar-hover-transform, scale(1.05));
    box-shadow: var(--user-avatar-hover-shadow, var(--shadow-md));
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--user-details-gap, 2px);

  .user-name {
    font-size: var(--user-name-font-size, var(--text-base));
    font-weight: var(--user-name-font-weight, 600);
    color: var(--user-name-color, var(--text-primary));
    line-height: var(--user-name-line-height, 1.2);
    white-space: nowrap;
  }
}

/* 退出按钮 */
.logout-btn {
  color: var(--logout-btn-color, var(--danger-color));
  border-color: var(--logout-btn-border, transparent);

  .btn-label {
    color: var(--logout-btn-label-color, var(--danger-color));
  }

  &:hover {
    background: var(--logout-btn-hover-bg, var(--danger-color));
    color: var(--logout-btn-hover-color, white);
    border-color: var(--logout-btn-hover-border, var(--danger-color));
    box-shadow: var(--logout-btn-hover-shadow, 0 var(--spacing-xs) var(--text-sm) rgba(245, 108, 108, 0.3));

    .btn-label {
      color: var(--logout-btn-hover-label-color, white);
    }
  }
}

/* 面包屑导航 */
.breadcrumb-nav {
  margin-left: var(--breadcrumb-nav-margin-left, var(--spacing-md));

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: var(--breadcrumb-color, var(--text-secondary));
      font-size: var(--breadcrumb-font-size, var(--text-base));
      font-weight: var(--breadcrumb-font-weight, 500);

      &:hover {
        color: var(--breadcrumb-hover-color, var(--primary-color));
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--breadcrumb-active-color, var(--text-primary));
      font-weight: var(--breadcrumb-active-font-weight, 600);
    }
  }
}

/* ==================== 动画和过渡效果 ==================== */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
}

/* 下拉菜单过渡 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: var(--dropdown-transition, all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
}

.dropdown-enter-from {
  opacity: 0;
  transform: var(--dropdown-enter-transform, translateY(-10px) scale(0.95));
}

.dropdown-leave-to {
  opacity: 0;
  transform: var(--dropdown-leave-transform, translateY(-10px) scale(0.95));
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .app-header {
    padding: 0 var(--app-header-padding-x-mobile, var(--spacing-md));
    height: var(--app-header-height-mobile, 56px);
  }

  .header-right {
    gap: var(--header-right-gap-mobile, var(--spacing-xs));
  }

  .header-action-btn .btn-label {
    display: none; /* 移动端隐藏文字标签 */
  }

  .theme-dropdown {
    right: var(--theme-dropdown-right-mobile, 0);
    min-width: var(--theme-dropdown-width-mobile, 160px);
  }

  .user-profile {
    .user-details {
      display: none; /* 移动端隐藏用户详情 */
    }
  }

  .breadcrumb-nav {
    display: none; /* 移动端隐藏面包屑 */
  }
}

/* 页面内容 - 优化布局 */
.page-content {
  flex: 1;
  /* 使用自适应高度，避免过度撑高产生留白 */
  min-height: calc(100vh - var(--app-header-height, 6var(--spacing-xs))); /* 使用新的头部高度 */
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-primary);
  position: relative;

  /* 统一滚动条样式 */
  &::-webkit-scrollbar {
    width: var(--border-width-base) !important;
    height: var(--border-width-base) !important;
  }

  &::-webkit-scrollbar-track {
    background: transparent !important;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--shadow-light) !important;
    border-radius: 0 !important;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--shadow-medium) !important;
  }

  /* 优化内部容器样式，减少空白 */
  > * {
    /* 移除max-width限制，让内容完全响应式 */
    /* max-width: 100%; */
    margin: 0;
    /* 允许页面级覆盖内边距 */
    padding: var(--page-inner-padding, var(--text-lg) var(--text-2xl));
    /* 确保内容区域能够完全填充可用空间 */
    width: 100%;
    min-width: 0;
  }

  /* 特殊处理：centers页面移除内边距并设置白色背景 */
  &:has(.center-container) {
    padding: 0 !important;
    background: var(--bg-primary) !important;

    > * {
      padding: 0 !important;
    }
  }

  /* 营销中心现在使用 CenterContainer，不需要特殊处理 */

  /* 系统中心现在使用 CenterContainer，不需要特殊处理 */

  /* 特殊处理：话术中心页面 */
  &:has(.script-center) {
    background: var(--bg-card, var(--bg-white)) !important;
  }

  /* 仪表板中心现在使用 CenterContainer，不需要特殊处理 */

  /* 特殊处理：工作台页面使用主题背景 */
  &:has(.dashboard-container) {
    background: var(--bg-primary) !important;
  }



  /* 移除dashboard容器的强制样式，让组件自己控制样式 */

  /* 铺满布局：去掉page-content级别的默认内边距影响，并让背景为纯白 */
  &.full-bleed {
    background: var(--bg-color, var(--bg-white));
    > * { padding: 0 !important; }
  }


}

/* 主题切换和功能按钮样式 */
.theme-selector {
  position: relative;
}

.logout-btn {
  &:hover {
    background-color: var(--primary-color) !important;
    color: var(--bg-color) !important;
    border-color: var(--primary-color) !important;
    transform: translateY(-var(--border-width-base));
    box-shadow: 0 var(--spacing-xs) var(--text-lg) rgba(99, 102, 241, 0.3) !important;
  }

  &:active {
    transform: scale(0.95);
  }

  .el-icon {
    color: inherit !important;
  }
}

/* 统一头部图标样式 - 使用设计tokens */
.navbar-right .header-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--header-action-button-size, 40px);
  height: var(--header-action-button-size, 40px);
  min-width: var(--header-action-button-size, 40px);
  min-height: var(--header-action-button-size, 40px);
  border: var(--header-action-button-border-width, 2px) solid var(--header-action-button-border, var(--primary-color));
  border-radius: var(--header-action-button-radius, var(--radius-lg));
  background: var(--header-action-button-bg, var(--bg-card));
  color: var(--header-action-button-color, var(--primary-color));
  cursor: pointer;
  transition: var(--header-action-button-transition, all var(--transition-base, 0.3s) ease);
  font-size: var(--header-action-button-font-size, var(--text-sm));
  box-shadow: var(--header-action-button-shadow, var(--shadow-sm));
  backdrop-filter: var(--header-action-button-backdrop, blur(10px));
  position: relative;
  overflow: hidden;

  /* 添加光泽效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--white-alpha-20), transparent);
    transition: left var(--header-action-button-shimmer-duration, 0.6s) ease;
  }

  &:hover {
    background: var(--header-action-button-hover-bg, var(--primary-color));
    color: var(--header-action-button-hover-color, var(--text-on-primary));
    border-color: var(--header-action-button-hover-border, var(--primary-hover, var(--primary-dark)));
    transform: var(--header-action-button-hover-transform, translateY(-2px));
    box-shadow: var(--header-action-button-hover-shadow, 0 var(--spacing-sm) 25px rgba(64, 158, 255, 0.25));

    /* 悬停时触发光泽效果 */
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: var(--header-action-button-active-transform, scale(0.95));
  }

  /* UnifiedIcon 图标样式 */
  .unified-icon {
    font-size: var(--header-action-icon-size, var(--text-xl));
    color: inherit;
    transition: var(--header-action-icon-transition, all var(--transition-fast, 0.2s) ease);
  }
}

/* AI助手按钮 - 参考用户头像设计 */
.ai-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
  color: white;
  font-weight: 600;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px var(--spacing-sm) rgba(156, 39, 176, 0.3);
  position: relative;

  .ai-status-indicator {
    width: var(--ai-status-indicator-size, var(--spacing-sm));
    height: var(--ai-status-indicator-size, var(--spacing-sm));
    border-radius: var(--radius-full);
    background-color: var(--ai-status-indicator-bg, var(--success-color));
    transition: var(--ai-status-indicator-transition, all 0.3s ease);
    box-shadow: var(--ai-status-indicator-shadow, 0 0 var(--spacing-xs) var(--success-color));

    &.idle {
      background-color: var(--ai-status-indicator-idle-bg, var(--info-color));
      box-shadow: var(--ai-status-indicator-idle-shadow, 0 0 var(--spacing-xs) var(--info-color));
    }

    &.active {
      background-color: var(--ai-status-indicator-active-bg, var(--success-color));
      box-shadow: var(--ai-status-indicator-active-shadow, 0 0 var(--text-sm) var(--success-color));
      animation: var(--ai-status-indicator-active-animation, ai-pulse 2s infinite);
    }

    &.error {
      background-color: var(--ai-status-indicator-error-bg, var(--danger-color));
      box-shadow: var(--ai-status-indicator-error-shadow, 0 0 var(--spacing-xs) var(--danger-color));
      animation: var(--ai-status-indicator-error-animation, ai-blink 1s infinite);
    }
  }

  &:hover {
    background: linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(156, 39, 176, 0.4);
    transform: scale(1.05);
  }

  &.active {
    background: linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%);
    box-shadow: 0 6px var(--text-lg) rgba(156, 39, 176, 0.5);

    .ai-status-indicator {
      background-color: white;
      box-shadow: 0 0 var(--spacing-sm) white;
    }
  }
}

/* AI助手状态指示器动画 */
@keyframes ai-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@keyframes ai-blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
}

/* 主题切换按钮样式（已隐藏） */
.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  background-color: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  padding: var(--spacing-sm);
  min-width: 160px;
  z-index: 1000;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-primary);

  &:hover {
    background-color: var(--bg-hover);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.theme-color {
  width: var(--text-sm);
  height: var(--text-sm);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
}



/* 响应式调整 */
@media screen and (max-width: 76var(--spacing-sm)) {
  .main-container {
    margin-left: 0 !important;

    &.main-expanded {
      margin-left: 0 !important;
    }
  }

  .navbar {
    padding: 0 var(--text-lg);
  }

  .navbar-right {
    gap: var(--spacing-sm);
  }

  .user-name,
  .user-role {
    display: none;
  }

  .logo-icon {
    width: var(--icon-size); height: var(--icon-size);

    .logo-image {
      width: 100%;
      height: 100%;
    }
  }
}

/* 移动端样式 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  z-index: 1040;
  transition: opacity 0.3s ease;
}

.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--button-height-md);
  height: var(--button-height-md);
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  cursor: pointer;
  margin-right: var(--spacing-md);
  transition: all var(--transition-base);
  position: relative;

  &:hover {
    background: var(--bg-tertiary);
    transform: translateY(-var(--border-width-base));
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: scale(0.95);
  }

  /* 添加一个小的视觉指示器来显示当前状态 */
  &::after {
    content: '';
    position: absolute;
    bottom: var(--spacing-xs);
    left: 50%;
    transform: translateX(-50%);
    width: var(--spacing-xs);
    height: var(--spacing-xs);
    border-radius: var(--radius-full);
    background: var(--primary-color);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  &:hover::after {
    opacity: 0.6;
  }
}

/* 保持移动端兼容性 */
.mobile-menu-btn {
  @extend .sidebar-toggle-btn;
}

@media (max-width: var(--breakpoint-md)) {
  .navbar-left {
    display: flex;
    align-items: center;
  }

  .navbar-right {
    .user-info {
      display: none;
    }
  }

  .main-container {
    margin-left: 0 !important;
  }
}

@media screen and (max-width: 480px) {
  .logo-icon {
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
  }

  .logo-text {
    font-size: var(--text-base);
  }
}

/* CLS优化动画 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}












</style>
