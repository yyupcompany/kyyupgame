/**
 * 广告管理模块路由配置
 * 
 * 功能范围：
 * - 广告列表
 * - 广告管理
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const advertisementRoutes: RouteRecordRaw[] = [
  // 🔧 修复：广告管理模块嵌套在 MainLayout 中
  {
    path: '/advertisement',
    component: Layout,
    redirect: { name: 'AdvertisementList' },
    meta: {
      title: '广告管理',
      icon: 'Picture',
      requiresAuth: true,
      permission: 'ADVERTISEMENT_MANAGE',
      priority: 'low'
    },
    children: [
      {
        path: '',
        name: 'AdvertisementList',
        component: () => import('@/pages/advertisement/index.vue'),
        meta: {
          title: '广告列表',
          requiresAuth: true,
          permission: 'ADVERTISEMENT_MANAGE',
          priority: 'low'
        }
      }
    ]
  }
]
