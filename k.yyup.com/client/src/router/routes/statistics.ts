/**
 * 统计分析路由模块
 * @description 包含统计分析、分析报告等相关页面
 * @module routes/statistics
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// 导入组件
const Statistics = () => import('@/pages/statistics/index.vue')

/**
 * 统计分析路由配置
 * @priority medium - 数据分析模块
 */
export const statisticsRoutes: RouteRecordRaw[] = [
  // 🔧 修复：统计分析嵌套在 MainLayout 中
  {
    path: '/statistics',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Statistics',
        component: Statistics,
        meta: {
          title: '统计分析',
          icon: 'DataAnalysis',
          requiresAuth: true,
          permission: 'STATISTICS_VIEW',
          priority: 'medium'
        }
      }
    ]
  },

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

export default statisticsRoutes
