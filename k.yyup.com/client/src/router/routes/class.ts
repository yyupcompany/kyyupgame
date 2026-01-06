/**
 * 班级管理路由模块
 * @description 包含班级管理、班级统计、班级详情等相关页面
 * @module routes/class
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

/**
 * 班级管理路由配置
 * @priority high - 核心业务模块，高频使用
 */
export const classRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有班级管理路由都应该嵌套在 MainLayout 中
  {
    path: '/class',
    component: Layout,
    redirect: '/class/index',
    meta: {
      title: '班级管理',
      icon: 'School',
      requiresAuth: true
    },
    children: [
      // 班级管理主页
      {
        path: 'index',
        name: 'ClassManagement',
        component: () => import('@/pages/class/index.vue'),
        meta: {
          title: '班级管理',
          icon: 'School',
          requiresAuth: true,
          permission: 'CLASS_VIEW',
          preload: true,
          priority: 'high'
        }
      },

      // 班级统计
      {
        path: 'statistics',
        name: 'ClassStatistics',
        component: () => import('@/pages/class/ClassStatistics.vue'),
        meta: {
          title: '班级统计',
          requiresAuth: true,
          permission: 'CLASS_STATISTICS_VIEW',
          priority: 'medium'
        }
      },

      // 班级教师详情
      {
        path: 'teachers/id',
        name: 'ClassTeacherDetail',
        component: () => import('@/pages/class/teachers/id.vue'),
        meta: {
          title: '教师详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_VIEW',
          priority: 'medium'
        }
      },

      // 班级学生管理
      {
        path: 'students/id',
        name: 'ClassStudentDetail',
        component: () => import('@/pages/class/students/id.vue'),
        meta: {
          title: '班级学生管理',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'STUDENT_VIEW',
          priority: 'medium'
        }
      },

      // 班级分析
      {
        path: 'analytics/class-analytics',
        name: 'ClassAnalytics',
        component: () => import('@/pages/class/analytics/ClassAnalytics.vue'),
        meta: {
          title: '班级分析',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CLASS_ANALYTICS_VIEW',
          priority: 'medium'
        }
      },

      // 班级优化
      {
        path: 'optimization/class-optimization',
        name: 'ClassOptimization',
        component: () => import('@/pages/class/optimization/ClassOptimization.vue'),
        meta: {
          title: '班级优化',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CLASS_OPTIMIZATION_USE',
          priority: 'medium'
        }
      },

      // 班级详情（带参数）
      {
        path: 'detail/:id',
        name: 'ClassDetail',
        component: () => import('@/pages/class/detail/ClassDetail.vue'),
        meta: {
          title: '班级详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CLASS_VIEW',
          priority: 'medium'
        }
      },

      // 班级智能管理
      {
        path: 'smart-management/:id',
        name: 'ClassSmartManagement',
        component: () => import('@/pages/class/smart-management/SmartManagement.vue'),
        meta: {
          title: '班级智能管理',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'CLASS_SMART_MANAGEMENT',
          priority: 'medium'
        }
      }
    ]
  }
]

export default classRoutes
