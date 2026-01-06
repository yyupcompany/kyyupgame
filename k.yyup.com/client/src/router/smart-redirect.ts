/**
 * 智能路由重定向系统
 * 根据设备类型和用户角色，自动跳转到对应的页面
 */

import { RouteLocationNormalized } from 'vue-router'
import { getActualDeviceType } from '@/utils/device-detect'

// 导出UserRole类型
export type UserRole = 'admin' | 'principal' | 'teacher' | 'parent'

/**
 * 根据角色获取默认路由
 */
export function getDefaultRouteByRole(role: UserRole, deviceType: 'pc' | 'mobile' | 'tablet' = 'pc'): string {
  // 平板当作PC处理
  const device = deviceType === 'tablet' ? 'pc' : deviceType
  
  // 角色对应的默认路由
  const routeMap: Record<UserRole, { pc: string; mobile: string }> = {
    admin: {
      pc: '/dashboard',
      mobile: '/mobile/centers'
    },
    principal: {
      pc: '/dashboard',
      mobile: '/mobile/centers'
    },
    teacher: {
      pc: '/teacher-center/dashboard',
      mobile: '/mobile/teacher-center/dashboard'
    },
    parent: {
      pc: '/parent-center/dashboard',
      mobile: '/mobile/parent-center/dashboard'
    }
  }
  
  return routeMap[role]?.[device] || (device === 'mobile' ? '/mobile/centers' : '/dashboard')
}

/**
 * 智能重定向
 * @param to 目标路由
 * @param userRole 用户角色
 * @returns 重定向路径，如果不需要重定向则返回null
 */
export function smartRedirect(to: RouteLocationNormalized, userRole: UserRole | null): string | null {
  // 如果没有角色，不处理
  if (!userRole) {
    console.log('⚠️ 智能路由: userRole为null，跳过重定向')
    return null
  }
  
  // 获取当前设备类型
  const deviceType = getActualDeviceType()
  console.log(`🔍 智能路由检测: 设备=${deviceType}, 角色=${userRole}, 路径=${to.path}`)
  
  // 1. 登录后的重定向（从/login、根路径或dashboard）
  if (to.path === '/login' || to.path === '/' || to.path === '' || to.path === '/dashboard') {
    const defaultRoute = getDefaultRouteByRole(userRole, deviceType)
    console.log(`🔀 智能路由: 重定向到 ${defaultRoute} (设备: ${deviceType}, 角色: ${userRole})`)
    return defaultRoute
  }
  
  // 不需要重定向
  return null
}

/**
 * 检查路由是否需要认证
 */
export function requiresAuth(to: RouteLocationNormalized): boolean {
  return to.meta.requiresAuth !== false
}

/**
 * 获取登录后重定向路径
 */
export function getLoginRedirectPath(userRole: UserRole): string {
  const deviceType = getActualDeviceType()
  return getDefaultRouteByRole(userRole, deviceType)
}
