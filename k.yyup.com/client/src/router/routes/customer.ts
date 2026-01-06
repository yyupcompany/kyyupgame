/**
 * 客户管理路由模块
 * @description 包含客户列表、客户详情、客户分析、客户统计等相关页面
 * @module routes/customer
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// 导入组件
const CustomerStatistics = () => import('@/pages/customer/CustomerStatistics.vue')
const CustomerSearch = () => import('@/pages/customer/CustomerSearch.vue')

/**
 * 客户管理路由配置
 * @priority medium - 核心业务模块
 */
export const customerRoutes: RouteRecordRaw[] = [
  // 🔧 修复：客户管理嵌套在 MainLayout 中
  {
    path: '/customer',
    component: Layout,
    redirect: { name: 'CustomerList' },
    meta: {
      title: '客户管理',
      icon: 'Postcard',
      requiresAuth: true,
      permission: 'CUSTOMER_VIEW',
      priority: 'medium'
    },
    children: [
      {
        path: '',
        name: 'CustomerList',
        component: () => import('@/pages/customer/index.vue'),
        meta: {
          title: '客户列表',
          requiresAuth: true,
          permission: 'CUSTOMER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'detail/:id',
        name: 'CustomerDetail',
        component: () => import('@/pages/customer/detail/CustomerDetail.vue'),
        meta: {
          title: '客户详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CUSTOMER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'analytics/customer-analytics',
        name: 'CustomerAnalytics',
        component: () => import('@/pages/customer/analytics/CustomerAnalytics.vue'),
        meta: {
          title: '客户分析',
          requiresAuth: true,
          permission: 'CUSTOMER_ANALYTICS_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'statistics',
        name: 'CustomerStatistics',
        component: CustomerStatistics,
        meta: {
          title: '客户统计',
          requiresAuth: true,
          permission: 'CUSTOMER_STATISTICS_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'search',
        name: 'CustomerSearch',
        component: CustomerSearch,
        meta: {
          title: '客户搜索',
          requiresAuth: true,
          permission: 'CUSTOMER_SEARCH_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default customerRoutes
