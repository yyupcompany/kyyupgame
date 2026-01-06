/**
 * 集团管理路由配置
 * 
 * 功能说明:
 * - 集团列表
 * - 集团创建
 * - 集团编辑
 * - 集团详情
 * 
 * 权限说明:
 * - 需要集团管理权限
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const groupRoutes: RouteRecordRaw[] = [
  // 🔧 修复：集团管理模块嵌套在 MainLayout 中
  {
    path: '/group',
    component: Layout,
    redirect: '/group/list',
    meta: {
      title: '集团中心',
      icon: 'OfficeBuilding',
      requiresAuth: true,
      permission: 'GROUP_MANAGEMENT_VIEW',
      priority: 'high'
    },
    children: [
      {
        path: 'list',
        name: 'GroupManagement',
        component: () => import('@/pages/group/group-list.vue'),
        meta: {
          title: '集团列表',
          requiresAuth: true,
          permission: 'GROUP_MANAGEMENT_VIEW',
          priority: 'high'
        }
      },
      {
        path: 'create',
        name: 'GroupCreate',
        component: () => import('@/pages/group/group-form.vue'),
        meta: {
          title: '创建集团',
          requiresAuth: true,
          permission: 'GROUP_MANAGEMENT_CREATE',
          hideInMenu: true,
          priority: 'high'
        }
      },
      {
        path: ':id/edit',
        name: 'GroupEdit',
        component: () => import('@/pages/group/group-form.vue'),
        meta: {
          title: '编辑集团',
          requiresAuth: true,
          permission: 'GROUP_MANAGEMENT_EDIT',
          hideInMenu: true,
          priority: 'high'
        }
      },
      {
        path: ':id',
        name: 'GroupDetail',
        component: () => import('@/pages/group/group-detail.vue'),
        meta: {
          title: '集团详情',
          requiresAuth: true,
          permission: 'GROUP_MANAGEMENT_VIEW',
          hideInMenu: true,
          priority: 'high'
        }
      }
    ]
  }
]

export default groupRoutes
