import { RouteRecordRaw } from 'vue-router'

// 扩展Vue路由的元数据类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    activeMenu?: string
    hidden?: boolean
    hideInMenu?: boolean
    roles?: string[]
    permissions?: string[]
    keepAlive?: boolean
  }
}

// 路由参数类型
export interface RouteParams {
  id?: string | number
  [key: string]: any
}

// 自定义路由类型
export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: {
    title?: string
    icon?: string
    requiresAuth?: boolean
    activeMenu?: string
    hidden?: boolean
    hideInMenu?: boolean
    roles?: string[]
    permissions?: string[]
    keepAlive?: boolean
    [key: string]: any
  }
  children?: AppRouteRecordRaw[]
  props?: boolean | ((route: any) => Record<string, any>) | Record<string, any>
}

// 路由类型守卫
export function isAppRouteRecordRaw(route: any): route is AppRouteRecordRaw {
  return route && typeof route === 'object' && ('path' in route)
} 