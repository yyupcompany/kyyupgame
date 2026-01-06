/**
 * 教师管理路由模块
 * @description 包含教师管理、教师详情、教师统计、教师绩效等相关页面
 * @module routes/teacher
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

/**
 * 教师管理路由配置
 * @priority high - 核心业务模块，高频使用
 */
export const teacherRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有教师管理路由都应该嵌套在 MainLayout 中
  {
    path: '/teacher',
    component: Layout,
    redirect: '/teacher/list',
    meta: {
      title: '教师管理',
      icon: 'UserFilled',
      requiresAuth: true
    },
    children: [
      // 教师列表
      {
        path: 'list',
        name: 'TeacherList',
        component: () => import('@/pages/teacher/TeacherList.vue'),
        meta: {
          title: '教师列表',
          requiresAuth: true,
          permission: 'TEACHER_VIEW',
          priority: 'high'
        }
      },

      // 教师详情
      {
        path: 'detail/:id',
        name: 'TeacherDetail',
        component: () => import('@/pages/teacher/TeacherDetail.vue'),
        meta: {
          title: '教师详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_VIEW',
          priority: 'medium'
        }
      },

      // 编辑教师
      {
        path: 'edit/:id',
        name: 'TeacherEdit',
        component: () => import('@/pages/teacher/TeacherEdit.vue'),
        meta: {
          title: '编辑教师',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_EDIT',
          priority: 'low'
        }
      },

      // 添加教师
      {
        path: 'add',
        name: 'TeacherAdd',
        component: () => import('@/pages/teacher/add.vue'),
        meta: {
          title: '添加教师',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_CREATE',
          priority: 'low'
        }
      },

      // 教师绩效
      {
        path: 'performance/:id',
        name: 'TeacherPerformance',
        component: () => import('@/pages/teacher/performance/TeacherPerformance.vue'),
        meta: {
          title: '教师绩效',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'TEACHER_PERFORMANCE_VIEW',
          priority: 'medium'
        }
      },

      // 教师发展
      {
        path: 'development/teacher-development',
        name: 'TeacherDevelopment',
        component: () => import('@/pages/teacher/development/TeacherDevelopment.vue'),
        meta: {
          title: '教师发展',
          requiresAuth: true,
          permission: 'TEACHER_DEVELOPMENT_VIEW',
          priority: 'medium'
        }
      },

      // 教师评估
      {
        path: 'evaluation/teacher-evaluation',
        name: 'TeacherEvaluation',
        component: () => import('@/pages/teacher/evaluation/TeacherEvaluation.vue'),
        meta: {
          title: '教师评估',
          requiresAuth: true,
          permission: 'TEACHER_EVALUATION_VIEW',
          priority: 'medium'
        }
      },

      // 我的客户
      {
        path: 'customers',
        name: 'TeacherCustomers',
        component: () => import('@/pages/teacher/customers.vue'),
        meta: {
          title: '我的客户',
          requiresAuth: true,
          permission: 'TEACHER_CUSTOMERS_VIEW',
          priority: 'medium'
        }
      },

      // 教师统计
      {
        path: 'statistics',
        name: 'TeacherStatistics',
        component: () => import('@/pages/teacher/TeacherStatistics.vue'),
        meta: {
          title: '教师统计',
          requiresAuth: true,
          permission: 'TEACHER_STATISTICS_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default teacherRoutes
