/**
 * 移动端路由配置
 * 
 * 功能范围：
 * - 移动端登录
 * - 移动端活动详情
 * - 移动端AI聊天
 */

import { RouteRecordRaw } from 'vue-router'

export const mobileRoutes: RouteRecordRaw[] = [
  // 移动端默认路由
  {
    path: '/mobile',
    name: 'MobileHome',
    redirect: '/mobile/login',
    meta: {
      title: '移动端',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'high'
    }
  },

  // 移动端登录页面
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: () => import('@/pages/Login/index.vue'),
    meta: {
      title: '移动端登录',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'high'
    }
  },

  // 移动端活动详情路由 - activity-plan
  {
    path: '/mobile/activity-plan/:id',
    name: 'MobileActivityPlan',
    component: () => import('@/pages/activity/ActivityDetail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'high'
    }
  },

  // 移动端活动详情路由 - activity-detail
  {
    path: '/mobile/activity-detail/:id',
    name: 'MobileActivityDetail',
    component: () => import('@/pages/activity/ActivityDetail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'high'
    }
  },

  // 移动端AI聊天路由
  {
    path: '/mobile/ai-chat',
    name: 'MobileAIChat',
    component: () => import('../../../aimobile/pages/MobileAIChat.vue'),
    meta: {
      title: 'AI智能助手',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'high'
    }
  }
]
