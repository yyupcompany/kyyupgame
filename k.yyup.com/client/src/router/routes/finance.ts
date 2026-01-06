/**
 * 财务管理模块路由配置
 * 
 * 功能范围：
 * - 财务管理主页
 * - 收费管理
 * - 支付管理
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const financeRoutes: RouteRecordRaw[] = [
  // 🔧 修复：财务管理模块嵌套在 MainLayout 中
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/index',
    meta: {
      title: '财务管理',
      icon: 'Money',
      requiresAuth: true,
      priority: 'high'
    },
    children: [
      {
        path: 'index',
        name: 'Finance',
        component: () => import('@/pages/Finance.vue'),
        meta: {
          title: '财务管理',
          requiresAuth: true,
          priority: 'high'
        }
      },
      {
        path: 'fee-management',
        name: 'FeeManagement',
        component: () => import('@/pages/finance/FeeManagement.vue'),
        meta: {
          title: '收费管理',
          icon: 'Money',
          requiresAuth: true,
          priority: 'high'
        }
      },
      {
        path: 'payment-management',
        name: 'PaymentManagement',
        component: () => import('@/pages/finance/PaymentManagement.vue'),
        meta: {
          title: '支付管理',
          requiresAuth: true,
          permission: 'FINANCE_PAYMENT_VIEW',
          priority: 'high'
        }
      }
    ]
  }
]
