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

    // ========== 检查项3：设备检测优化 - 缓存结果 ==========
    let deviceType = sessionStorage.getItem('device_type')
    if (!deviceType) {
      deviceType = getActualDeviceType()
      sessionStorage.setItem('device_type', deviceType)
      console.log('📱 设备类型已缓存:', deviceType)
    }
    const isOnMobile = to.path.startsWith('/mobile')

    const userStore = useUserStore()
    const permissionsStore = usePermissionsStore()

    // ========== 检查项4：白名单路由直接通过 ==========
    const whiteListRoutes = ['/', '/login', '/register', '/403', '/404', '/500', '/forgot-password', '/mobile/login', '/mobile-demo']
    if (whiteListRoutes.includes(to.path) || to.name === 'DeviceSelect') {
      console.log('✅ 白名单路由，直接通过:', to.path)
      return next()
    }

    // ========== 检查项5优化：登录检查（localStorage恢复已前置到main.ts） ==========
    if (!userStore.isLoggedIn) {
      console.log('🔒 用户未登录，重定向到登录页')
      const loginPath = to.path.startsWith('/mobile') ? '/mobile/login' : '/login'
      return next({
        path: loginPath,
        query: { redirect: to.fullPath }
      })
    }

    // ========== 检查项6优化：权限初始化检查（初始化已前置到main.ts） ==========
    // 如果用户已登录但权限未初始化，尝试初始化权限（而不是直接重定向到登录页）
    if (!permissionsStore.hasMenuItems) {
      const userRole = userStore.user?.role
      if (userRole) {
        console.log('⏳ 权限未初始化，正在初始化权限系统...')
        try {
          await permissionsStore.initializePermissions(userRole)
          console.log('✅ 权限系统初始化完成')
        } catch (error) {
          console.error('❌ 权限初始化失败:', error)
          return next('/login')
        }
      } else {
        console.log('⚠️ 用户角色不存在，重定向到登录页')
        return next('/login')
      }
    }
    
    // ========== 检查项7优化：智能重定向（仅对特定路由执行） ==========
    const userRole = userStore.user?.role as UserRole
    if (userRole && (to.path === '/' || to.path === '/dashboard')) {
      const redirectPath = smartRedirect(to, userRole)
      
      if (redirectPath && redirectPath !== to.path) {
        console.log(`🔀 智能路由重定向: ${to.path} → ${redirectPath}`)
        return next(redirectPath)
      }
    }

    // ========== 检查项8：路由权限验证（必须保留） ==========
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