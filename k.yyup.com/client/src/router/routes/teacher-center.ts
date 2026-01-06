/**
 * 教师工作台路由配置
 * 
 * 功能说明:
 * - 教师角色的专属工作台
 * - 教师日常工作: 课程、考勤、学生测评、活动、通知、任务
 * - 客户池管理和客户跟踪
 * - AI互动课堂和学生测评功能
 * 
 * 权限说明:
 * - 需要教师角色 (teacher)
 * - 管理员也可以访问
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

// 教师工作台组件懒加载导入
const AttendanceCenter = () => import('@/pages/centers/AttendanceCenter.vue')
const TeacherStudentAssessment = () => import('@/pages/teacher-center/student-assessment/index.vue')
const TeacherStudentDetail = () => import('@/pages/teacher-center/student-assessment/student-detail.vue')

export const teacherCenterRoutes: RouteRecordRaw[] = [
  // 🔧 修复：修正路径（去掉重复斜杠）和子路由使用相对路径
  {
    path: '/teacher-center',
    component: Layout,
    name: 'TeacherCenter',
    redirect: '/teacher-center/dashboard',
    meta: {
      title: '教师中心',
      requiresAuth: true,
      roles: ['teacher'],
      icon: 'User',
      priority: 'high'
    },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/pages/teacher-center/dashboard/index.vue'),
        meta: {
          title: '教师工作台',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Monitor',
          priority: 'high'
        }
      },
      {
        path: 'notifications',
        name: 'TeacherNotifications',
        component: () => import('@/pages/teacher-center/notifications/index.vue'),
        meta: {
          title: '通知中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Bell',
          priority: 'medium'
        }
      },
      {
        path: 'activities',
        name: 'TeacherActivities',
        component: () => import('@/pages/teacher-center/activities/index.vue'),
        meta: {
          title: '活动',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Trophy',
          priority: 'medium'
        }
      },
      {
        path: 'teaching',
        name: 'TeacherTeaching',
        component: () => import('@/pages/teacher-center/teaching/index.vue'),
        meta: {
          title: '课程',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'School',
          priority: 'medium'
        }
      },
      {
        path: 'attendance',
        name: 'TeacherAttendance',
        component: AttendanceCenter,
        meta: {
          title: '考勤',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Calendar',
          priority: 'medium'
        }
      },
      {
        path: 'tasks',
        name: 'TeacherTasks',
        component: () => import('@/pages/teacher-center/tasks/index.vue'),
        meta: {
          title: '任务',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'List',
          priority: 'medium'
        }
      },
      {
        path: 'enrollment',
        name: 'TeacherEnrollment',
        component: () => import('@/pages/teacher-center/enrollment/index.vue'),
        meta: {
          title: '客户池',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'UserPlus',
          priority: 'medium'
        }
      },
      {
        path: 'customer-tracking',
        name: 'TeacherCustomerTracking',
        component: () => import('@/pages/teacher-center/customer-tracking/index.vue'),
        meta: {
          title: '客户跟踪',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Connection',
          priority: 'medium'
        }
      },
      {
        path: 'creative-curriculum',
        name: 'CreativeCurriculum',
        component: () => import('@/pages/teacher-center/creative-curriculum/index.vue'),
        meta: {
          title: 'AI互动课堂',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Sparkles',
          priority: 'medium'
        }
      },
      {
        path: 'creative-curriculum-interactive',
        name: 'InteractiveCurriculum',
        component: () => import('@/pages/teacher-center/creative-curriculum/interactive-curriculum.vue'),
        meta: {
          title: '互动多媒体课程生成器',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Sparkles',
          priority: 'medium'
        }
      },
      {
        path: 'student-assessment',
        name: 'TeacherStudentAssessment',
        component: TeacherStudentAssessment,
        meta: {
          title: '学生测评',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'DataAnalysis',
          priority: 'medium'
        }
      },
      {
        path: 'student-assessment/detail/:id',
        name: 'TeacherStudentAssessmentDetail',
        component: TeacherStudentDetail,
        meta: {
          title: '学生测评详情',
          requiresAuth: true,
          roles: ['teacher'],
          hideInMenu: true,
          priority: 'medium'
        }
      }
    ]
  }
]

export default teacherCenterRoutes
