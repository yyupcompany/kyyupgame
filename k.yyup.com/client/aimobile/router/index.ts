/**
 * 🧭 移动端路由配置
 * 
 * 专门为移动端设计的路由系统
 * 支持页面转场动画、手势导航、深度链接等移动端特性
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由组件懒加载
const MobileHome = () => import('../pages/MobileHome.vue')
const ExpertWorkflow = () => import('../pages/ExpertWorkflow.vue')
const ExpertChat = () => import('../pages/ExpertChat.vue')
const ExpertList = () => import('../pages/ExpertList.vue')
const WorkflowHistory = () => import('../pages/WorkflowHistory.vue')
const Settings = () => import('../pages/Settings.vue')
const Profile = () => import('../pages/Profile.vue')
const Notifications = () => import('../pages/Notifications.vue')
const Help = () => import('../pages/Help.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: MobileHome,
    meta: {
      title: 'AI专家助手',
      keepAlive: true,
      showTabBar: true,
      transition: 'slide-right'
    }
  },
  {
    path: '/workflow',
    name: 'ExpertWorkflow',
    component: ExpertWorkflow,
    meta: {
      title: '专家工作流',
      keepAlive: false,
      showTabBar: true,
      transition: 'slide-left',
      requiresAuth: false
    }
  },
  {
    path: '/chat',
    name: 'ExpertChat',
    component: ExpertChat,
    meta: {
      title: '专家聊天',
      keepAlive: true,
      showTabBar: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/chat/:expertId',
    name: 'ExpertChatDetail',
    component: ExpertChat,
    props: true,
    meta: {
      title: '专家对话',
      keepAlive: false,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/experts',
    name: 'ExpertList',
    component: ExpertList,
    meta: {
      title: '专家团队',
      keepAlive: true,
      showTabBar: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/history',
    name: 'WorkflowHistory',
    component: WorkflowHistory,
    meta: {
      title: '历史记录',
      keepAlive: true,
      showTabBar: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
      keepAlive: true,
      showTabBar: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心',
      keepAlive: true,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: '消息通知',
      keepAlive: false,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
      title: '帮助中心',
      keepAlive: true,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/workflow/:workflowId',
    name: 'WorkflowDetail',
    component: () => import('../pages/WorkflowDetail.vue'),
    props: true,
    meta: {
      title: '工作流详情',
      keepAlive: false,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/expert/:expertId/detail',
    name: 'ExpertDetail',
    component: () => import('../pages/ExpertDetail.vue'),
    props: true,
    meta: {
      title: '专家详情',
      keepAlive: false,
      showTabBar: false,
      transition: 'slide-up'
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: '页面未找到',
      keepAlive: false,
      showTabBar: false,
      transition: 'fade'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory('/aimobile/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 移动端滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI专家助手`
  }
  
  // 检查认证状态
  if (to.meta.requiresAuth) {
    const isAuthenticated = checkAuthStatus()
    if (!isAuthenticated) {
      // 重定向到登录页面或显示登录弹窗
      console.log('需要登录')
    }
  }
  
  // 移动端特定处理
  handleMobileNavigation(to, from)
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面转场动画处理
  handlePageTransition(to, from)
  
  // 统计页面访问
  trackPageView(to)
  
  // 移动端状态栏处理
  handleStatusBar(to)
})

// ==================== 辅助函数 ====================

/**
 * 检查认证状态
 */
function checkAuthStatus(): boolean {
  // 检查本地存储的认证信息
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  return !!token
}

/**
 * 处理移动端导航
 */
function handleMobileNavigation(to: any, from: any) {
  // 处理返回按钮
  if (to.meta.showBackButton !== false) {
    // 显示返回按钮
  }
  
  // 处理底部导航栏
  const tabBarVisible = to.meta.showTabBar !== false
  // 更新底部导航栏状态
  
  // 处理手势导航
  if (window.history.length > 1) {
    // 启用手势返回
  }
}

/**
 * 处理页面转场动画
 */
function handlePageTransition(to: any, from: any) {
  const transition = to.meta.transition || 'slide-left'
  
  // 设置转场动画类
  const app = document.getElementById('app')
  if (app) {
    app.setAttribute('data-transition', transition)
  }
  
  // 移动端特定的转场效果
  if (isMobile()) {
    // 添加移动端转场类
    document.body.classList.add('page-transitioning')
    
    setTimeout(() => {
      document.body.classList.remove('page-transitioning')
    }, 300)
  }
}

/**
 * 统计页面访问
 */
function trackPageView(to: any) {
  // 发送页面访问统计
  console.log(`📊 页面访问: ${to.name} - ${to.path}`)
  
  // 可以集成第三方统计服务
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path,
      page_title: to.meta.title
    })
  }
}

/**
 * 处理移动端状态栏
 */
function handleStatusBar(to: any) {
  // 设置状态栏样式
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const themeColor = to.meta.themeColor || '#007bff'
    metaThemeColor.setAttribute('content', themeColor)
  }
  
  // 设置状态栏文字颜色
  const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (metaStatusBar) {
    const statusBarStyle = to.meta.statusBarStyle || 'default'
    metaStatusBar.setAttribute('content', statusBarStyle)
  }
}

/**
 * 检查是否为移动端
 */
function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// ==================== 路由工具函数 ====================

/**
 * 编程式导航 - 移动端优化
 */
export const mobileNavigate = {
  // 前进到新页面
  push(to: string | object, options?: { transition?: string; replace?: boolean }) {
    const route = typeof to === 'string' ? { path: to } : to
    
    if (options?.replace) {
      router.replace(route)
    } else {
      router.push(route)
    }
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  },
  
  // 返回上一页
  back() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  },
  
  // 替换当前页面
  replace(to: string | object) {
    const route = typeof to === 'string' ? { path: to } : to
    router.replace(route)
  },
  
  // 前进到指定页面并清空历史
  reset(to: string | object) {
    const route = typeof to === 'string' ? { path: to } : to
    
    // 清空历史记录
    window.history.replaceState(null, '', route.path || to)
    router.replace(route)
  }
}

/**
 * 获取当前路由信息
 */
export const getCurrentRoute = () => {
  return router.currentRoute.value
}

/**
 * 检查当前路由是否匹配
 */
export const isCurrentRoute = (name: string): boolean => {
  return router.currentRoute.value.name === name
}

/**
 * 获取路由参数
 */
export const getRouteParams = () => {
  return router.currentRoute.value.params
}

/**
 * 获取查询参数
 */
export const getRouteQuery = () => {
  return router.currentRoute.value.query
}

// ==================== 深度链接支持 ====================

/**
 * 处理深度链接
 */
export const handleDeepLink = (url: string) => {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.replace('/aimobile', '')
    const query = Object.fromEntries(urlObj.searchParams)
    
    router.push({
      path,
      query
    })
    
    console.log(`🔗 处理深度链接: ${path}`)
  } catch (error) {
    console.error('深度链接处理失败:', error)
  }
}

/**
 * 生成分享链接
 */
export const generateShareLink = (routeName: string, params?: object, query?: object) => {
  const route = router.resolve({
    name: routeName,
    params,
    query
  })
  
  const baseUrl = window.location.origin
  return `${baseUrl}${route.href}`
}

// ==================== 路由缓存管理 ====================

/**
 * 清除路由缓存
 */
export const clearRouteCache = (routeName?: string) => {
  if (routeName) {
    // 清除特定路由缓存
    console.log(`🗑️ 清除路由缓存: ${routeName}`)
  } else {
    // 清除所有路由缓存
    console.log('🗑️ 清除所有路由缓存')
  }
}

/**
 * 预加载路由组件
 */
export const preloadRoute = async (routeName: string) => {
  try {
    const route = routes.find(r => r.name === routeName)
    if (route && typeof route.component === 'function') {
      await route.component()
      console.log(`⚡ 预加载路由组件: ${routeName}`)
    }
  } catch (error) {
    console.error(`预加载路由组件失败: ${routeName}`, error)
  }
}

export default router
