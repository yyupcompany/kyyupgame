<template>
  <div class="app-container">
    <!-- 侧边栏 - 使用虚拟化优化 -->
    <div 
      class="sidebar" 
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    >
      <!-- Logo区域 -->
      <div class="sidebar-logo">
        <div class="logo-content">
          <div class="logo-icon">LOGO</div>
          <div class="logo-text" v-show="!sidebarCollapsed">幼儿园管理</div>
        </div>
      </div>

      <!-- 导航菜单 - 懒加载菜单项 -->
      <el-menu
        :default-active="$route.path"
        :collapse="sidebarCollapsed"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <!-- 高频菜单项 - 立即渲染 -->
        <template v-for="item in highPriorityMenuItems" :key="item.index">
          <MenuItemComponent 
            :item="item" 
            :collapsed="sidebarCollapsed"
            @preload="handleMenuPreload"
          />
        </template>

        <!-- 低频菜单项 - 懒加载 -->
        <template v-if="showAllMenuItems">
          <template v-for="item in lowPriorityMenuItems" :key="item.index">
            <MenuItemComponent 
              :item="item" 
              :collapsed="sidebarCollapsed"
              @preload="handleMenuPreload"
            />
          </template>
        </template>
      </el-menu>

      <!-- 收起/展开按钮 -->
      <div class="sidebar-toggle" @click="toggleSidebar">
        <UnifiedIcon name="default" />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-container" :class="{ 'main-expanded': sidebarCollapsed }">
      <!-- 顶部导航栏 - 简化版本 -->
      <div class="navbar">
        <div class="navbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="navbar-right">
          <!-- 性能优化：简化按钮组 -->
          <OptimizedHeaderActions />
          
          <div class="user-info">
            <div class="user-avatar">
              <span>{{ userDisplayName }}</span>
            </div>
            <span class="user-name">{{ userDisplayName }}</span>
            <span class="user-role">({{ userRoleDisplay }})</span>
          </div>
          
          <el-button type="primary" size="small" @click="handleLogout">
            <UnifiedIcon name="default" />
            退出登录
          </el-button>
        </div>
      </div>

      <!-- 页面内容 - 使用KeepAlive缓存 -->
      <div class="page-content">
        <router-view v-slot="{ Component, route }">
          <transition 
            name="fade" 
            mode="out-in"
            @before-enter="beforePageEnter"
            @after-enter="afterPageEnter"
          >
            <keep-alive 
              :include="cachedComponents" 
              :max="maxCacheSize"
            >
              <component 
                :is="Component" 
                :key="route.path"
                @performance-data="handlePerformanceData"
              />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !sidebarCollapsed" 
      class="mobile-overlay"
      @click="sidebarCollapsed = true"
    ></div>

    <!-- 性能监控面板（开发环境） -->
    <PerformancePanel 
      v-if="isDev && showPerformancePanel" 
      @close="showPerformancePanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { PERMISSIONS, ROLES } from '../utils/permission'
import { 
  House, User, Calendar, TrendCharts, Avatar, Setting, 
  Expand, Fold, SwitchButton, Sunny, FullScreen, Aim,
  UserFilled, Promotion
} from '@element-plus/icons-vue'
import { performanceMonitor } from '../utils/performance-monitor'
import { routePreloader } from '../utils/route-preloader'

// 懒加载组件
const MenuItemComponent = defineAsyncComponent({
  loader: () => import('../components/layout/MenuItemComponent.vue'),
  loadingComponent: () => import('../components/common/LoadingSpinner.vue'),
  delay: 200,
  timeout: 10000, // 增加超时时间到10秒
  errorComponent: () => import('../components/common/ErrorFallback.vue')
})

const OptimizedHeaderActions = defineAsyncComponent({
  loader: () => import('../components/layout/OptimizedHeaderActions.vue'),
  loadingComponent: () => import('../components/common/LoadingSpinner.vue'),
  delay: 100,
  timeout: 10000, // 增加超时时间到10秒
  errorComponent: () => import('../components/common/ErrorFallback.vue')
})

const PerformancePanel = defineAsyncComponent({
  loader: () => import('../components/common/PerformancePanel.vue'),
  loadingComponent: () => import('../components/common/LoadingSpinner.vue'),
  delay: 100,
  timeout: 10000, // 增加超时时间到10秒
  errorComponent: () => import('../components/common/ErrorFallback.vue')
})

// 路由和状态
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式状态
const sidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)
const showAllMenuItems = ref(false)
const showPerformancePanel = ref(false)
const pageLoadStartTime = ref(0)

// 性能优化配置
const maxCacheSize = ref(5)
const cachedComponents = ref(['Dashboard', 'ClassManagement', 'TeacherList'])
const isDev = process.env.NODE_ENV === 'development'

// 计算属性 - 使用缓存优化
const isMobile = computed(() => windowWidth.value < 768)

const currentPageTitle = computed(() => {
  // 使用缓存的路径映射，避免每次重新计算
  return getPageTitleFromCache(route.path)
})

const userDisplayName = computed(() => {
  return userStore.userInfo?.username || '用户'
})

const userRoleDisplay = computed(() => {
  const roleMap: Record<string, string> = {
    'admin': '管理员',
    'teacher': '教师',
    'principal': '园长'
  }
  const userRoles = userStore.userInfo?.roles || []
  const firstRole = userRoles[0] || ''
  return roleMap[firstRole] || '普通用户'
})

// 菜单项分组 - 性能优化
const highPriorityMenuItems = computed(() => {
  return getMenuItemsByPriority('high')
})

const lowPriorityMenuItems = computed(() => {
  return getMenuItemsByPriority('low')
})

// 权限检查计算属性 - 使用缓存
const permissions = computed(() => {
  return {
    hasAIPermission: userStore.hasPermission(PERMISSIONS.AI_ASSISTANT_USE),
    hasChatPermission: userStore.hasPermission(PERMISSIONS.CHAT_USE),
    hasStatisticsPermission: userStore.hasPermission(PERMISSIONS.STATISTICS_VIEW),
    hasEnrollmentPermission: userStore.hasPermission(PERMISSIONS.ENROLLMENT_VIEW) || 
                            userStore.hasPermission(PERMISSIONS.ENROLLMENT_MANAGE),
    hasStudentPermission: userStore.hasPermission(PERMISSIONS.STUDENT_VIEW) || 
                         userStore.hasPermission(PERMISSIONS.STUDENT_MANAGE),
    hasTeacherPermission: userStore.hasPermission(PERMISSIONS.TEACHER_VIEW) || 
                         userStore.hasPermission(PERMISSIONS.TEACHER_MANAGE),
    hasClassPermission: userStore.hasPermission(PERMISSIONS.CLASS_VIEW) || 
                       userStore.hasPermission(PERMISSIONS.CLASS_MANAGE),
    hasActivityPermission: userStore.hasPermission(PERMISSIONS.ACTIVITY_VIEW) || 
                          userStore.hasPermission(PERMISSIONS.ACTIVITY_MANAGE),
    hasParentPermission: userStore.hasPermission(PERMISSIONS.PARENT_VIEW) || 
                        userStore.hasPermission(PERMISSIONS.PARENT_MANAGE),
    hasUserManagePermission: userStore.hasPermission(PERMISSIONS.USER_VIEW) || 
                            userStore.hasPermission(PERMISSIONS.USER_MANAGE),
    hasRoleManagePermission: userStore.hasPermission(PERMISSIONS.ROLE_VIEW) || 
                            userStore.hasPermission(PERMISSIONS.ROLE_MANAGE),
    hasSystemPermission: userStore.hasPermission(PERMISSIONS.SYSTEM_MANAGE) || 
                        userStore.hasPermission(PERMISSIONS.SYSTEM_CONFIG) ||
                        userStore.hasPermission(PERMISSIONS.SYSTEM_LOG_VIEW),
    isPrincipal: userStore.hasRole(ROLES.PRINCIPAL) || userStore.hasRole(ROLES.ADMIN),
    isAdminOrPrincipal: userStore.hasRole(ROLES.ADMIN) || userStore.hasRole(ROLES.PRINCIPAL)
  }
})

// 页面标题缓存
const pageTitleCache = new Map<string, string>()

/**
 * 从缓存获取页面标题
 */
function getPageTitleFromCache(path: string): string {
  if (pageTitleCache.has(path)) {
    return pageTitleCache.get(path)!
  }
  
  const pathMap: Record<string, string> = {
    '/dashboard': '数据概览',
    '/dashboard/schedule': '日程管理',
    '/dashboard/important-notices': '消息通知',
    '/dashboard/campus-overview': '园区概览',
    '/dashboard/data-statistics': '数据统计',
    '/enrollment-plan': '招生计划',
    '/enrollment': '招生活动',
    '/enrollment-plan/statistics': '招生统计',
    '/enrollment-plan/quota-manage': '名额管理',
    '/customer': '客户列表',
    '/principal/customer-pool': '客户池',
    '/class': '班级管理',
    '/application': '入园申请',
    '/activity': '活动列表',
    '/activity/create': '创建活动',
    '/principal/activities': '园长活动',
    '/parent': '家长列表',
    '/parent/children': '孩子列表',
    '/teacher': '教师列表',
    '/principal/poster-editor': '海报编辑',
    '/principal/poster-generator': '海报生成器',
    '/chat': '在线咨询',
    '/ai': 'AI助手',
    '/statistics': '统计报表',
    '/principal/performance': '绩效管理',
    '/principal/marketing-analysis': '经营分析',
    '/principal/dashboard': '园长仪表盘',
    '/system/users': '用户管理',
    '/system/roles': '角色管理',
    '/system/permissions': '权限管理',
    '/system/logs': '系统日志',
    '/system/backup': '数据备份',
    '/system/settings': '系统配置',
    '/system/ai-model-config': 'AI模型配置'
  }
  
  const title = pathMap[path] || '未知页面'
  pageTitleCache.set(path, title)
  return title
}

/**
 * 根据优先级获取菜单项
 */
function getMenuItemsByPriority(priority: 'high' | 'low') {
  const allMenuItems = generateMenuItems()
  return allMenuItems.filter(item => 
    priority === 'high' ? item.priority <= 2 : item.priority > 2
  )
}

/**
 * 生成菜单项 - 优化版本
 */
function generateMenuItems() {
  const items = []
  const perms = permissions.value
  
  // 工作台 - 高优先级
  items.push({
    index: 'dashboard',
    title: '工作台',
    icon: House,
    priority: 1,
    children: [
      { index: '/dashboard', title: '数据概览', priority: 1 },
      { index: '/dashboard/schedule', title: '日程管理', priority: 3 },
      { index: '/dashboard/important-notices', title: '消息通知', priority: 3 },
      { index: '/dashboard/campus-overview', title: '园区概览', priority: 2 },
      { index: '/dashboard/data-statistics', title: '数据统计', priority: 2 }
    ]
  })
  
  // 招生管理 - 高优先级
  if (perms.hasEnrollmentPermission) {
    items.push({
      index: 'enrollment',
      title: '招生管理',
      icon: UserFilled,
      priority: 1,
      children: [
        { index: '/enrollment-plan', title: '招生计划', priority: 1 },
        { index: '/enrollment', title: '招生活动', priority: 2 },
        { index: '/enrollment-plan/statistics', title: '招生统计', priority: 2, visible: perms.hasStatisticsPermission },
        { index: '/enrollment-plan/quota-manage', title: '名额管理', priority: 2, visible: perms.isAdminOrPrincipal }
      ]
    })
  }
  
  // 只在必要时添加其他菜单项
  // 这样可以减少初始渲染的复杂度
  
  return items
}

/**
 * 页面进入前的性能监控
 */
function beforePageEnter(): void {
  pageLoadStartTime.value = performance.now()
}

/**
 * 页面进入后的性能监控
 */
function afterPageEnter(): void {
  const endTime = performance.now()
  const loadTime = endTime - pageLoadStartTime.value
  
  // 上报性能数据
  performanceMonitor.trackAPICall(`page:${route.path}`, pageLoadStartTime.value, endTime)
  
  console.log(`📊 页面加载完成: ${route.path} (${loadTime.toFixed(2)}ms)`)
  
  // 如果加载时间超过阈值，添加到缓存组件列表
  if (loadTime > 1000 && !cachedComponents.value.includes(route.name as string)) {
    cachedComponents.value.push(route.name as string)
    
    // 限制缓存组件数量
    if (cachedComponents.value.length > maxCacheSize.value) {
      cachedComponents.value.shift()
    }
  }
}

/**
 * 处理菜单预加载
 */
function handleMenuPreload(menuPath: string): void {
  routePreloader.manualPreload(menuPath)
}

/**
 * 处理性能数据
 */
function handlePerformanceData(data: any): void {
  console.log('📈 组件性能数据:', data)
}

/**
 * 切换侧边栏状态
 */
const toggleSidebar = (): void => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
}

/**
 * 处理登出
 */
const handleLogout = async (): Promise<void> => {
  try {
    // 清除localStorage中的认证信息
    localStorage.removeItem('kindergarten_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userInfo')
    
    // 重置用户store
    userStore.token = ''
    userStore.userInfo = null
    
    // 清理性能监控数据
    performanceMonitor.destroy()
    routePreloader.clearCache()
    
    // 重置侧边栏状态
    sidebarCollapsed.value = false
    localStorage.removeItem('sidebarCollapsed')
    
    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

/**
 * 窗口大小变化处理
 */
const handleResize = (): void => {
  windowWidth.value = window.innerWidth
  
  // 移动端自动收起侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

/**
 * 延迟加载低优先级菜单
 */
const loadLowPriorityMenus = async (): Promise<void> => {
  // 延迟2秒后加载低优先级菜单
  await new Promise(resolve => setTimeout(resolve, 2000))
  showAllMenuItems.value = true
  
  console.log('📋 低优先级菜单已加载')
}

// 生命周期
onMounted(async () => {
  // 恢复侧边栏状态
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState !== null) {
    sidebarCollapsed.value = savedSidebarState === 'true'
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 初始化路由预加载器
  routePreloader.init(router)
  
  // 延迟加载低优先级菜单
  nextTick(() => {
    loadLowPriorityMenus()
  })
  
  // 开发环境显示性能面板快捷键
  if (isDev) {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        showPerformancePanel.value = !showPerformancePanel.value
      }
    })
  }
  
  console.log('🚀 OptimizedMainLayout 已加载')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  routePreloader.destroy()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-secondary);
  contain: layout style; /* CSS Containment for performance */
}

/* 侧边栏样式 - 优化版本 */
.sidebar {
  width: var(--sidebar-width, 200px);
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal) ease;
  position: relative;
  z-index: 1000px;
  border-right: var(--z-index-dropdown) solid var(--sidebar-border);
  will-change: width; /* 优化动画性能 */

  &.sidebar-collapsed {
    width: var(--sidebar-collapsed-width, 6var(--spacing-xs));
  }
}

.sidebar-logo {
  height: var(--header-height, 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: var(--z-index-dropdown) solid var(--sidebar-border);
  padding: 0 var(--spacing-md);
  background-color: var(--sidebar-bg);
  contain: layout; /* 性能优化 */
}

.logo-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-icon {
  font-size: var(--text-2xl);
  flex-shrink: 0;
  color: var(--sidebar-text-hover);
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: 600;
  white-space: nowrap;
  color: var(--sidebar-text-hover);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  contain: style; /* 性能优化 */
  
  /* 使用全局极细滚动条样式 */
}

.sidebar-toggle {
  height: calc(var(--spacing-lg) * 1.67);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: var(--z-index-dropdown) solid var(--sidebar-border);
  color: var(--sidebar-text);
  transition: all var(--transition-fast);
  background-color: var(--sidebar-bg);
  
  &:hover {
    background-color: var(--sidebar-item-hover);
    color: var(--sidebar-text-hover);
  }
}

/* 主内容区域 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: margin-left var(--transition-normal) ease;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  contain: layout; /* 性能优化 */
}

/* 顶部导航栏 */
.navbar {
  height: var(--header-height, 60px);
  background-color: var(--bg-card);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  box-shadow: var(--shadow-md);
  contain: layout style; /* 性能优化 */
}

.navbar-left {
  flex: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--text-sm);
}

.user-name {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: 500;
}

.user-role {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 页面内容 */
.page-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  contain: layout style; /* 性能优化 */
}

/* 页面切换动画 - 优化版本 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端样式 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay-bg);
  z-index: var(--z-index-always-on-top);
}

/* 响应式调整 */
@media screen and (max-width: 76var(--spacing-sm)) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000px;
    transform: translateX(-100%);
    
    &:not(.sidebar-collapsed) {
      transform: translateX(0);
    }
  }
  
  .main-container {
    margin-left: 0;
  }
  
  .navbar {
    padding: 0 var(--spacing-md);
  }
  
  .navbar-right {
    gap: var(--spacing-sm);
  }
  
  .user-name,
  .user-role {
    display: none;
  }
}

/* 性能优化：减少重绘 */
* {
  box-sizing: border-box;
}

/* GPU加速 */
.sidebar,
.main-container,
.navbar {
  transform: translateZ(0);
}
</style>