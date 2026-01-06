/**
 * 分析报告模块路由配置
 * 
 * 功能范围：
 * - 分析仪表板
 * - 报告构建器
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const analyticsRoutes: RouteRecordRaw[] = [
  // 🔧 修复：分析报告模块嵌套在 MainLayout 中
  {
    path: '/analytics',
    component: Layout,
    redirect: { name: 'AnalyticsDashboard' },
    meta: {
      title: '分析报告',
      icon: 'DataLine',
      requiresAuth: true,
      permission: 'ANALYTICS_VIEW',
      priority: 'medium'
    },
    children: [
      {
        path: '',
        name: 'AnalyticsDashboard',
        component: () => import('@/pages/analytics/index.vue'),
        meta: {
          title: '分析仪表板',
          requiresAuth: true,
          permission: 'ANALYTICS_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'report-builder',
        name: 'ReportBuilder',
        component: () => import('@/pages/analytics/ReportBuilder.vue'),
        meta: {
          title: '报告构建器',
          requiresAuth: true,
          permission: 'ANALYTICS_REPORT_BUILD',
          priority: 'medium'
        }
      }
    ]
  }
]
