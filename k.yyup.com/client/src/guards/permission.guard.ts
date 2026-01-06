/**
 * 简化的权限守卫
 * 基于静态菜单和角色权限
 */

import { RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  PERMISSION_GUARD_CONFIG,
  filterMenuByRole,
  hasPermission
} from '@/config/static-menu'

/**
 * 权限守卫
 * @param to 目标路由
 * @param from 来源路由
 * @param next 下一步回调
 */
export async function permissionGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: any
) {
  const userStore = useUserStore()

  // 公开路由直接通过
  if (PERMISSION_GUARD_CONFIG.publicRoutes.includes(to.path)) {
    return next()
  }

  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    console.log('用户未登录，重定向到登录页')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 检查用户是否有访问权限
  const userRole = userStore.user?.role
  if (!userRole) {
    console.log('用户角色无效，重定向到403页')
    next(PERMISSION_GUARD_CONFIG.noPermissionRoute)
    return
  }

  // 这里可以根据需要添加更细粒度的权限检查
  // 目前只是确保用户已登录且有角色
  next()
}

/**
 * 菜单过滤函数
 * @param menus 原始菜单
 * @param userRole 用户角色
 * @returns 过滤后的菜单
 */
export function filterMenus(menus: any[], userRole: string) {
  return filterMenuByRole(menus, userRole)
}

/**
 * 权限检查函数
 * @param permission 权限代码
 * @returns 是否有权限
 */
export function checkPermission(permission: string): boolean {
  const userStore = useUserStore()
  const userRole = userStore.user?.role
  return hasPermission(userRole, permission)
}

/**
 * 按钮权限指令函数
 * @param permission 权限代码
 * @returns 是否显示按钮
 */
export function hasButtonPermission(permission: string): boolean {
  return checkPermission(permission)
}