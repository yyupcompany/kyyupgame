import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { pcRoutes } from './routes/index'
import { mobileRoutes } from './mobile-routes'
import { usePermissionsStore } from '../stores/permissions-simple'
import { useUserStore } from '../stores/user'
import { smartRedirect } from './smart-redirect'
import { getActualDeviceType } from '@/utils/device-detect'
import type { UserRole } from './smart-redirect'

// 防止循环跳转的标记
let isNavigating = false
const navigationLock = new Map<string, number>()
const NAVIGATION_LOCK_TIMEOUT = 1000 // 1秒后自动清除锁

// 使用静态路由配置（基础路由优先加载）
const routes: Array<RouteRecordRaw> = [
  // 设备选择页面（优先级最高）
  {
    path: '/',
    name: 'DeviceSelect',
    component: () => import('../pages/device-select/index.vue'),
    meta: {
      title: '选择设备类型',
      requiresAuth: false,
      hideNavigation: true
    }
  },
  ...pcRoutes,  // pcRoutes 现在是已解析的路由数组
  ...mobileRoutes.filter(route => route && route.path)
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 防止循环跳转
  if (isNavigating) {
    console.log('🚫 检测到循环跳转，阻止导航')
    return next(false)
  }

  const navigationKey = `${from.path}->${to.path}`
  const now = Date.now()
  const lastNavigationTime = navigationLock.get(navigationKey)
  
  // 如果在短时间内重复相同的导航，阻止
  if (lastNavigationTime && (now - lastNavigationTime) < 500) {
    console.log('🚫 检测到重复导航（500ms内），阻止:', navigationKey)
    return next(false)
  }

  try {
    isNavigating = true

    console.log('🚀 路由导航:', from.path, '->', to.path)
    console.log('📍 目标路由信息:', {
      path: to.path,
      name: to.name,
      meta: to.meta,
      params: to.params,
      query: to.query
    })

    // ========== 1. 设备检测（仅用于日志，不进行自动重定向）==========
    const deviceType = getActualDeviceType()
    const isOnMobile = to.path.startsWith('/mobile')

    console.log('📱 设备检测（仅供参考）:', {
      deviceType,
      currentPath: to.path,
      isOnMobile,
      note: '❌ 已禁用自动重定向 - 用户可根据链接自由访问移动端或PC端'
    })

    // ✏️ 已移除设备类型自动重定向逻辑
    // 用户可以直接通过链接访问任意版本的页面
    // 移动设备可以访问PC端页面，PC设备也可以访问移动端页面

    const userStore = useUserStore()
    const permissionsStore = usePermissionsStore()

    // ========== 2. 白名单路由直接通过 ==========
    const whiteListRoutes = ['/', '/login', '/register', '/403', '/404', '/forgot-password', '/mobile/login']
    if (whiteListRoutes.includes(to.path) || to.name === 'DeviceSelect') {
      console.log('✅ 白名单路由，直接通过:', to.path)
      return next()
    }

    // 检查用户登录状态（增强调试信息）
    console.log('🔐 检查登录状态:', {
      isLoggedIn: userStore.isLoggedIn,
      hasToken: !!userStore.token,
      tokenLength: userStore.token?.length || 0,
      hasUserInfo: !!userStore.user,
      username: userStore.user?.username || 'undefined',
      role: userStore.user?.role || 'undefined'
    })
    
    if (!userStore.isLoggedIn) {
      // 🔧 尝试从 localStorage 恢复用户信息
      console.log('🔄 尝试从 localStorage 恢复用户状态...')
      userStore.tryRestoreFromLocalStorage()
      
      // 再次检查登录状态
      if (!userStore.isLoggedIn) {
        console.log('🔒 用户未登录（恢复尝试后仍然无效），重定向到登录页')
        console.log('📊 详细状态:', {
          localStorageToken: !!localStorage.getItem('kindergarten_token'),
          localStorageUserInfo: !!localStorage.getItem('kindergarten_user_info')
        })

        // 根据当前访问路径决定登录页类型
        const loginPath = to.path.startsWith('/mobile') ? '/mobile/login' : '/login'
        console.log(`🔀 重定向到登录页: ${loginPath}`)

        return next({
          path: loginPath,
          query: { redirect: to.fullPath }
        })
      }
      console.log('✅ 从 localStorage 恢复用户状态成功')
    }

    // 初始化权限系统（必须先初始化，确保userRole可用）
    if (!permissionsStore.hasMenuItems) {
      console.log('🔐 初始化权限系统...')
      await permissionsStore.initializePermissions(userStore.user?.role || 'admin')
    }
    
    // 智能路由重定向（在权限系统初始化之后）
    const userRole = userStore.user?.role as UserRole
    if (userRole && (to.path === '/' || to.path === '/dashboard')) {
      const redirectPath = smartRedirect(to, userRole)
      
      if (redirectPath && redirectPath !== to.path) {
        console.log(`🔀 智能路由重定向: ${to.path} → ${redirectPath}`)
        return next(redirectPath)
      }
    }

    // 检查路由权限
    const hasPermission = permissionsStore.canAccessMenu(to.path)
    if (!hasPermission) {
      console.log('❌ 用户无权限访问:', to.path)
      return next('/403')
    }

    console.log('✅ 路由权限验证通过:', to.path)
    return next()

  } catch (error) {
    console.error('❌ 路由守卫执行失败:', error)
    return next(false)
  } finally {
    isNavigating = false
    // 记录本次导航时间
    navigationLock.set(navigationKey, Date.now())
    
    // 自动清理过期的导航锁
    setTimeout(() => {
      navigationLock.delete(navigationKey)
    }, NAVIGATION_LOCK_TIMEOUT)
  }
})

router.afterEach((to, from) => {
  console.log('🎯 路由导航完成:', from.path, '->', to.path)
})

export default router