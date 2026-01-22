/**
 * 活动管理路由模块
 * @description 包含活动列表、活动发布、活动详情、活动分析等相关页面
 * @module routes/activity
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// 导入组件
const ActivityList = () => import('@/pages/activity/ActivityList.vue')
const ActivityDetail = () => import('@/pages/activity/ActivityDetail.vue')
// 注意: ExperienceSchedule.vue文件不存在，已注释掉
// const ExperienceSchedule = () => import('@/pages/activity/experience/ExperienceSchedule.vue')

/**
 * 活动管理路由配置
 * @priority medium - 核心业务模块
 */
export const activityRoutes: RouteRecordRaw[] = [
  // 🔧 修复：活动管理模块嵌套在 MainLayout 中
  {
    path: '/activity',
    component: Layout,
    redirect: { name: 'ActivityList' },
    meta: {
      title: '活动管理',
      icon: 'Trophy',
      requiresAuth: true,
      permission: 'ACTIVITY_VIEW',
      priority: 'medium'
    },
    children: [
      {
        path: '',
        name: 'ActivityList',
        component: ActivityList,
        meta: {
          title: '活动列表',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'publish',
        name: 'ActivityPublish',
        component: () => import('@/pages/activity/ActivityPublish.vue'),
        meta: {
          title: '活动发布',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'poster-preview',
        name: 'ActivityPosterPreview',
        component: () => import('@/pages/activity/ActivityPosterPreview.vue'),
        meta: {
          title: '海报预览',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'registration-page-generator',
        name: 'RegistrationPageGenerator',
        component: () => import('@/pages/activity/RegistrationPageGenerator.vue'),
        meta: {
          title: '报名页面生成器',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'registrations',
        name: 'ActivityRegistrations',
        component: () => import('@/pages/activity/ActivityRegistrations.vue'),
        meta: {
          title: '报名审核',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'checkin',
        name: 'ActivityCheckin',
        component: () => import('@/pages/activity/ActivityCheckin.vue'),
        meta: {
          title: '活动签到',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'create',
        name: 'ActivityCreate',
        component: () => import('@/pages/activity/ActivityCreate.vue'),
        meta: {
          title: '创建活动',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'ACTIVITY_CREATE',
          priority: 'low'
        }
      },
      {
        path: 'detail/:id',
        name: 'ActivityDetail',
        component: ActivityDetail,
        meta: {
          title: '活动详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'edit/:id',
        name: 'ActivityEdit',
        component: () => import('@/pages/activity/ActivityEdit.vue'),
        meta: {
          title: '编辑活动',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'ACTIVITY_UPDATE',
          priority: 'low'
        }
      },
      {
        path: 'plan/activity-planner',
        name: 'ActivityPlanner',
        component: () => import('@/pages/activity/plan/ActivityPlanner.vue'),
        meta: {
          title: '活动策划',
          requiresAuth: true,
          permission: 'ACTIVITY_CREATE',
          priority: 'medium'
        }
      },
      {
        path: 'template',
        name: 'ActivityTemplate',
        component: () => import('@/pages/activity/ActivityTemplate.vue'),
        meta: {
          title: '活动模板',
          requiresAuth: true,
          permission: 'ACTIVITY_TEMPLATE_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'analytics/activity-analytics',
        name: 'ActivityAnalytics',
        component: () => import('@/pages/activity/analytics/ActivityAnalytics.vue'),
        meta: {
          title: '活动分析',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'statistics',
        name: 'ActivityStatisticsRedirect',
        redirect: { name: 'ActivityAnalytics' },
        meta: {
          title: '活动统计',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'optimization/activity-optimizer',
        name: 'ActivityOptimizer',
        component: () => import('@/pages/activity/optimization/ActivityOptimizer.vue'),
        meta: {
          title: '活动优化',
          requiresAuth: true,
          permission: 'ACTIVITY_UPDATE',
          priority: 'medium'
        }
      },
      {
        path: 'registration/registration-dashboard',
        name: 'RegistrationDashboard',
        component: () => import('@/pages/activity/registration/RegistrationDashboard.vue'),
        meta: {
          title: '报名仪表板',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'registration',
        name: 'ActivityRegistrationRedirect',
        redirect: { name: 'RegistrationDashboard' },
        meta: {
          title: '活动报名',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'management',
        name: 'ActivityManagementRedirect',
        redirect: { name: 'ActivityList' },
        meta: {
          title: '活动管理',
          requiresAuth: true,
          hideInMenu: true
        }
      },
      {
        path: 'evaluation/activity-evaluation',
        name: 'ActivityEvaluation',
        component: () => import('@/pages/activity/evaluation/ActivityEvaluation.vue'),
        meta: {
          title: '活动评估',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'analytics/intelligent-analysis',
        name: 'IntelligentAnalysis',
        component: () => import('@/pages/activity/analytics/intelligent-analysis.vue'),
        meta: {
          title: '智能分析',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      }
      // 注意: ExperienceSchedule.vue文件不存在，已注释掉相关路由
      /*
      ,
      {
        path: '/experience/schedule',
        name: 'ExperienceSchedule',
        component: ExperienceSchedule,
        meta: {
          title: '体验课表',
          requiresAuth: true,
          permission: 'EXPERIENCE_VIEW',
          priority: 'medium'
        }
      }
      */
    ]
  },

  // 🔧 修复：申请管理模块嵌套在 MainLayout 中
  {
    path: '/application',
    component: Layout,
    redirect: { name: 'ApplicationList' },
    meta: {
      title: '申请管理',
      icon: 'Document',
      requiresAuth: true,
      permission: 'APPLICATION_VIEW',
      priority: 'medium'
    },
    children: [
      {
        path: '',
        name: 'ApplicationList',
        component: () => import('@/pages/application/ApplicationList.vue'),
        meta: {
          title: '申请列表',
          requiresAuth: true,
          permission: 'APPLICATION_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'detail/:id',
        name: 'ApplicationDetail',
        component: () => import('@/pages/application/ApplicationDetail.vue'),
        meta: {
          title: '申请详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'APPLICATION_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'review',
        name: 'ApplicationReview',
        component: () => import('@/pages/application/review/ApplicationReview.vue'),
        meta: {
          title: '申请审核',
          requiresAuth: true,
          permission: 'APPLICATION_REVIEW',
          priority: 'medium'
        }
      },
      {
        path: 'interview',
        name: 'ApplicationInterview',
        component: () => import('@/pages/application/interview/ApplicationInterview.vue'),
        meta: {
          title: '申请面试',
          requiresAuth: true,
          permission: 'APPLICATION_INTERVIEW',
          priority: 'medium'
        }
      }
    ]
  },

  // 活动首页（已合并到上面的活动管理模块中）

  // 活动管理主页面路由
  {
    path: '/activities',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Activities',
        component: () => import('@/pages/activity/index.vue'),
        meta: {
          title: '活动管理',
          requiresAuth: true,
          permission: 'ACTIVITY_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default activityRoutes
