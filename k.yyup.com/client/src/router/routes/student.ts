/**
 * 学生管理路由模块
 * @description 包含学生管理、学生统计、学生详情、学生分析等相关页面
 * @module routes/student
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

/**
 * 学生管理路由配置
 * @priority high - 核心业务模块，高频使用
 */
export const studentRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有学生管理路由都应该嵌套在 MainLayout 中
  {
    path: '/student',
    component: Layout,
    redirect: '/student/index',
    meta: {
      title: '学生管理',
      icon: 'User',
      requiresAuth: true
    },
    children: [
      // 学生管理主页
      {
        path: 'index',
        name: 'StudentManagement',
        component: () => import('@/pages/student/index.vue'),
        meta: {
          title: '学生管理',
          icon: 'User',
          requiresAuth: true,
          permission: 'STUDENT_VIEW',
          priority: 'high'
        }
      },

      // 学生统计页面
      {
        path: 'statistics',
        name: 'StudentStatistics',
        component: () => import('@/pages/student/StudentStatistics.vue'),
        meta: {
          title: '学生统计',
          icon: 'DataAnalysis',
          requiresAuth: true,
          permission: 'STUDENT_STATISTICS_VIEW',
          priority: 'medium'
        }
      },

      // 学生搜索页面
      {
        path: 'search',
        name: 'StudentSearch',
        component: () => import('@/pages/student/StudentSearch.vue'),
        meta: {
          title: '学生搜索',
          icon: 'Search',
          requiresAuth: true,
          permission: 'STUDENT_SEARCH_VIEW',
          priority: 'medium'
        }
      },
      
      // 学生详细页面
      {
        path: 'detail/:id',
        name: 'StudentDetail',
        component: () => import('@/pages/student/detail/StudentDetail.vue'),
        meta: {
          title: '学生详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'STUDENT_VIEW',
          priority: 'medium'
        }
      },

      // 学生分析
      {
        path: 'analytics/:id',
        name: 'StudentAnalytics',
        component: () => import('@/pages/student/analytics/[id].vue'),
        meta: {
          title: '学生分析',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'STUDENT_ANALYTICS_VIEW',
          priority: 'medium'
        }
      },

      // 学生成长
      {
        path: 'growth/:id',
        name: 'StudentGrowth',
        component: () => import('@/pages/student/growth/StudentGrowth.vue'),
        meta: {
          title: '学生成长',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'STUDENT_GROWTH_VIEW',
          priority: 'medium'
        }
      },

      // 学生评估
      {
        path: 'assessment',
        name: 'StudentAssessment',
        component: () => import('@/pages/student/assessment/StudentAssessment.vue'),
        meta: {
          title: '学生评估',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'STUDENT_ASSESSMENT_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default studentRoutes
