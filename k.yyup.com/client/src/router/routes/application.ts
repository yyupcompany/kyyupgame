/**
 * 申请管理模块路由配置
 * 
 * 功能范围：
 * - 申请列表
 * - 申请详情
 * - 申请审核
 * - 申请面试
 * 
 * 注意：这个文件与 activity.ts 中的申请管理路由重复，
 * 如果同时导入会出现路由名冲突，建议只使用其中一个
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const applicationRoutes: RouteRecordRaw[] = [
  // 🔧 修复：申请管理模块嵌套在 MainLayout 中
  {
    path: '/application',
    component: Layout,
    redirect: { name: 'ApplicationList' },
    meta: {
      title: '申请管理',
      icon: 'Document',
      requiresAuth: true,
      permission: 'APPLICATION_VIEW',
      priority: 'medium'
    },
    children: [
      {
        path: '',
        name: 'ApplicationList',
        component: () => import('@/pages/application/ApplicationList.vue'),
        meta: {
          title: '申请列表',
          requiresAuth: true,
          permission: 'APPLICATION_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'detail/:id',
        name: 'ApplicationDetail',
        component: () => import('@/pages/application/ApplicationDetail.vue'),
        meta: {
          title: '申请详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'APPLICATION_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'review',
        name: 'ApplicationReview',
        component: () => import('@/pages/application/review/ApplicationReview.vue'),
        meta: {
          title: '申请审核',
          requiresAuth: true,
          permission: 'APPLICATION_REVIEW',
          priority: 'medium'
        }
      },
      {
        path: 'interview',
        name: 'ApplicationInterview',
        component: () => import('@/pages/application/interview/ApplicationInterview.vue'),
        meta: {
          title: '申请面试',
          requiresAuth: true,
          permission: 'APPLICATION_INTERVIEW',
          priority: 'medium'
        }
      }
    ]
  }
]
