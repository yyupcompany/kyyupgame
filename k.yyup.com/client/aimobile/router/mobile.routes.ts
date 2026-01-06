/**
 * 🤖 移动端AI助手路由配置
 *
 * 单页面AI交互应用 - 所有功能通过AI对话和Function Call实现
 * 各角色登录后都进入同一个AI聊天界面，无页面跳转
 */

import { RouteRecordRaw } from 'vue-router'

// 移动端布局
const MobileLayout = () => import('../layouts/MobileLayout.vue')

// 移动端登录页面
const MobileLogin = () => import('../pages/MobileLogin.vue')

// 移动端注册页面
const MobileRegister = () => import('../pages/MobileRegister.vue')

// AI聊天主页面 - 单页面AI交互核心组件
const MobileAIChat = () => import('../pages/MobileAIChat.vue')

// 个人中心页面（移动端）
const MobileProfile = () => import('../pages/MobileProfile.vue')

// 移动端仪表盘页面
const MobileDashboard = () => import('../pages/MobileDashboard.vue')

/**
 * 移动端AI助手路由配置
 * 核心理念：单页面AI交互 + Function Tools
 */
export const mobileRoutes: RouteRecordRaw[] = [
  // 移动端登录页面 - 独立路由
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: MobileLogin,
    meta: {
      title: 'AI智能助手登录',
      requiresAuth: false,
      hideHeader: true,
      hideTabbar: true
    }
  },

  // 移动端注册页面 - 独立路由
  {
    path: '/mobile/register',
    name: 'MobileRegister',
    component: MobileRegister,
    meta: {
      title: '用户注册',
      requiresAuth: false,
      hideHeader: true,
      hideTabbar: true
    }
  },

  // 移动端主应用 - 单页面AI交互
  {
    path: '/mobile',
    name: 'MobileAI',
    component: MobileLayout,
    redirect: '/mobile/ai-chat',
    meta: {
      title: 'AI智能助手',
      requiresAuth: true,
      keepAlive: true
    },
    children: [
      // 唯一的AI聊天页面 - 所有角色统一入口
      {
        path: 'ai-chat',
        name: 'MobileAIChat',
        component: MobileAIChat,
        meta: {
          title: 'AI智能助手',
          icon: '🤖',
          keepAlive: true,
          showInTabbar: false,
          hideTabbar: true,
          hideHeader: true,
          roles: ['admin', 'principal', 'teacher', 'parent']
        }
      }
      ,
      {
        path: 'profile',
        name: 'MobileProfile',
        component: MobileProfile,
        meta: {
          title: '个人中心',
          keepAlive: false,
          showInTabbar: false,
          hideTabbar: true,
          roles: ['admin', 'principal', 'teacher', 'parent']
        }
      }
    ]
  }
]

/**
 * 根据用户角色过滤路由 (移动端所有角色都使用相同的AI界面)
 */
export function filterRoutesByRole(routes: RouteRecordRaw[], userRole: string): RouteRecordRaw[] {
  return routes.filter(route => {
    // 检查路由权限
    if (route.meta?.roles && !route.meta.roles.includes(userRole)) {
      return false
    }

    // 递归处理子路由
    if (route.children) {
      route.children = filterRoutesByRole(route.children, userRole)
    }

    return true
  })
}

/**
 * 路由元信息类型扩展
 */
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    roles?: string[]
    requiresAuth?: boolean
    keepAlive?: boolean
    showInTabbar?: boolean
    hideTabbar?: boolean
    hideHeader?: boolean
  }
}

export default mobileRoutes