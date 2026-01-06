/**
 * 仪表板路由配置
 * 
 * 功能说明：
 * - 主仪表板页面
 * - 校园概览
 * - 数据统计
 * - 重要通知
 * - 日程安排
 * - 分析报表（招生趋势、财务分析、学生表现、教师效果）
 * - 绩效管理（KPI仪表板、绩效概览）
 * 
 * 权限说明：
 * - 需要登录认证
 * - 部分分析功能需要特定权限
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

// 页面组件懒加载导入
const Profile = () => import('@/pages/Profile.vue')
const ProfileSettings = () => import('@/pages/ProfileSettings.vue')
const Notifications = () => import('@/pages/Notifications.vue')
const Messages = () => import('@/pages/Messages.vue')
const Search = () => import('@/pages/Search.vue')
const Help = () => import('@/pages/Help.vue')
const ImportantNotices = () => import('@/pages/dashboard/ImportantNotices.vue')

export const dashboardRoutes: RouteRecordRaw[] = [
  // 主应用路由（使用Layout包裹）
  {
    path: '//',
    name: 'MainLayout',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      preload: true
    },
    children: [
      // 仪表板模块 - 核心页面，高优先级
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: {
          title: '仪表板',
          icon: 'Dashboard',
          requiresAuth: true,
          preload: true,
          priority: 'high'
        }
      },

      // 待办事项管理页面
      {
        path: '/todo',
        name: 'TodoManagement',
        component: () => import('@/pages/todo/index.vue'),
        meta: {
          title: '待办事项',
          icon: 'List',
          requiresAuth: true,
          priority: 'high'
        }
      },

      // 用户档案页面
      {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人档案',
          icon: 'User',
          requiresAuth: true,
          priority: 'medium'
        }
      },

      // 个人设置页面
      {
        path: '/profile/settings',
        name: 'ProfileSettings',
        component: ProfileSettings,
        meta: {
          title: '个人设置',
          icon: 'Setting',
          requiresAuth: true,
          priority: 'medium'
        }
      },

      // 系统设置重定向 - 修复404问题
      {
        path: '/settings',
        redirect: '/system/settings',
        meta: {
          hideInMenu: true
        }
      },

      // 通知管理页面
      {
        path: '/notifications',
        name: 'Notifications',
        component: Notifications,
        meta: {
          title: '通知管理',
          icon: 'Bell',
          requiresAuth: true,
          priority: 'medium'
        }
      },

      // 消息中心页面
      {
        path: '/messages',
        name: 'Messages',
        component: Messages,
        meta: {
          title: '消息中心',
          icon: 'Message',
          requiresAuth: true,
          priority: 'medium'
        }
      },

      // 全局搜索页面
      {
        path: '/search',
        name: 'Search',
        component: Search,
        meta: {
          title: '全局搜索',
          icon: 'Search',
          requiresAuth: true,
          priority: 'medium'
        }
      },

      // 帮助中心页面
      {
        path: '/help',
        name: 'Help',
        component: Help,
        meta: {
          title: '帮助中心',
          icon: 'QuestionFilled',
          requiresAuth: true,
          priority: 'low'
        }
      },

      // Dashboard子页面
      {
        path: '/dashboard/campus-overview',
        name: 'CampusOverview',
        component: () => import('@/pages/dashboard/CampusOverview.vue'),
        meta: {
          title: '校园概览',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/data-statistics',
        name: 'DataStatistics',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: {
          title: '数据统计',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/important-notices',
        name: 'ImportantNotices',
        component: () => import('@/pages/dashboard/ImportantNotices.vue'),
        meta: {
          title: '重要通知',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low'
        }
      },
      {
        path: '/dashboard/schedule',
        name: 'Schedule',
        component: () => import('@/pages/dashboard/Schedule.vue'),
        meta: {
          title: '日程安排',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low'
        }
      },
      {
        path: '/dashboard/schedule/calendar',
        name: 'ScheduleCalendar',
        component: () => import('@/pages/dashboard/Schedule.vue'),
        meta: {
          title: '日历视图',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low'
        }
      },
      {
        path: '/dashboard/schedule/todo',
        name: 'ScheduleTodo',
        component: () => import('@/pages/dashboard/Schedule.vue'),
        meta: {
          title: '待办事项',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low'
        }
      },
      {
        path: '/dashboard/schedule-weekly-view',
        name: 'ScheduleWeeklyView',
        component: () => import('@/pages/dashboard/Schedule.vue'),
        meta: {
          title: '周视图日程',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low'
        }
      },
      {
        path: '/dashboard/notification-center',
        name: 'NotificationCenter',
        component: ImportantNotices,
        meta: {
          title: '通知中心',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/analytics/enrollment-trends',
        name: 'EnrollmentTrends',
        component: () => import('@/pages/dashboard/analytics/EnrollmentTrends.vue'),
        meta: {
          title: '招生趋势分析',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/analytics/financial-analysis',
        name: 'FinancialAnalysis',
        component: () => import('@/pages/dashboard/analytics/FinancialAnalysis.vue'),
        meta: {
          title: '财务分析',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/analytics/student-performance',
        name: 'StudentPerformanceAnalysis',
        component: () => import('@/pages/principal/Performance.vue'),
        meta: {
          title: '学生表现分析',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/analytics/teacher-effectiveness',
        name: 'TeacherEffectivenessAnalysis',
        component: () => import('@/pages/dashboard/analytics/TeacherEffectiveness.vue'),
        meta: {
          title: '教师效果分析',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/performance/kpi-dashboard',
        name: 'KPIDashboard',
        component: () => import('@/pages/class/students/id.vue'),
        meta: {
          title: 'KPI仪表板',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/performance/performance-overview',
        name: 'PerformanceOverview',
        component: () => import('@/pages/principal/Performance.vue'),
        meta: {
          title: '绩效概览',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/analytics',
        name: 'DashboardAnalytics',
        component: () => import('@/pages/dashboard/Analytics.vue'),
        meta: {
          title: '仪表板分析',
          requiresAuth: true,
          permission: 'DASHBOARD_ANALYTICS_VIEW',
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/performance',
        name: 'DashboardPerformance',
        component: () => import('@/pages/dashboard/Performance.vue'),
        meta: {
          title: '仪表板绩效',
          requiresAuth: true,
          permission: 'DASHBOARD_PERFORMANCE_VIEW',
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/class-list',
        name: 'DashboardClassList',
        component: () => import('@/pages/dashboard/ClassList.vue'),
        meta: {
          title: '班级列表',
          requiresAuth: true,
          permission: 'DASHBOARD_CLASSLIST',
          priority: 'medium'
        }
      },
      {
        path: '/dashboard/ClassList',
        redirect: { name: 'DashboardClassList' },
        meta: {
          hideInMenu: true
        }
      }
    ]
  }
]
