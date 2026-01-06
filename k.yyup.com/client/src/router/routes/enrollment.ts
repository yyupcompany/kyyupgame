/**
 * 招生管理路由模块
 * @description 包含招生计划、招生管理、名额管理、智能规划等相关页面
 * @module routes/enrollment
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// 导入高频组件
const EnrollmentPlanList = () => import('@/pages/enrollment-plan/PlanList.vue')
const QuotaManage = () => import('@/pages/enrollment-plan/QuotaManage.vue')
// 注意: 以下组件文件不存在，已注释掉
// const SmartPlanning = () => import('@/pages/enrollment-plan/smart-planning/SmartPlanning.vue')
// const EnrollmentForecast = () => import('@/pages/enrollment-plan/forecast/EnrollmentForecast.vue')
// const EnrollmentStrategy = () => import('@/pages/enrollment-plan/strategy/EnrollmentStrategy.vue')
// const CapacityOptimization = () => import('@/pages/enrollment-plan/optimization/CapacityOptimization.vue')
const TrendAnalysis = () => import('@/pages/enrollment-plan/trends/trend-analysis.vue')
// const EnrollmentSimulation = () => import('@/pages/enrollment-plan/simulation/EnrollmentSimulation.vue')
// const PlanEvaluation = () => import('@/pages/enrollment-plan/evaluation/PlanEvaluation.vue')
// const EnrollmentAnalytics = () => import('@/pages/enrollment-plan/analytics/EnrollmentAnalytics.vue')
const EnrollmentIndex = () => import('@/pages/enrollment/index.vue')

/**
 * 招生管理路由配置
 * @priority high - 核心业务模块，招生相关功能
 */
export const enrollmentRoutes: RouteRecordRaw[] = [
  // 🔧 修复：招生计划模块嵌套在 MainLayout 中
  {
    path: '/enrollment-plan',
    component: Layout,
    redirect: { name: 'PlanList' },
    meta: {
      title: '招生计划',
      icon: 'Calendar',
      requiresAuth: true,
      permission: 'ENROLLMENT_PLAN_VIEW',
      priority: 'high'
    },
    children: [
      {
        path: '',
        name: 'PlanList',
        component: EnrollmentPlanList,
        meta: {
          title: '计划列表',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_VIEW',
          priority: 'high'
        }
      },
      {
        path: 'create',
        name: 'EnrollmentPlanCreate',
        component: () => import('@/pages/enrollment-plan/PlanEdit.vue'),
        meta: {
          title: '创建计划',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_CREATE',
          priority: 'high'
        }
      },
      {
        path: 'quota-manage',
        name: 'QuotaManage',
        component: QuotaManage,
        meta: {
          title: '名额管理',
          requiresAuth: true,
          permission: 'ENROLLMENT_QUOTA_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'quota/:id',
        name: 'EnrollmentQuotaManage',
        component: QuotaManage,
        meta: {
          title: '名额管理',
          requiresAuth: true,
          permission: 'ENROLLMENT_QUOTA_MANAGE',
          priority: 'medium',
          hidden: true
        },
        props: (route) => ({ 
          planId: route.params.id && !isNaN(Number(route.params.id)) ? Number(route.params.id) : 1 
        })
      },
      {
        path: 'statistics',
        name: 'EnrollmentStatistics',
        component: () => import('@/pages/enrollment-plan/Statistics.vue'),
        meta: {
          title: '招生统计',
          requiresAuth: true,
          permission: 'ENROLLMENT_STATISTICS_VIEW',
          priority: 'medium'
        }
      },
      // AI招生功能路由
      // 注意: 以下组件文件不存在，已注释掉相关路由
      /*
      {
        path: 'smart-planning/smart-planning',
        name: 'SmartPlanning',
        component: SmartPlanning,
        meta: {
          title: '智能规划',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'forecast/enrollment-forecast',
        name: 'EnrollmentForecast',
        component: EnrollmentForecast,
        meta: {
          title: '招生预测',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'strategy/enrollment-strategy',
        name: 'EnrollmentStrategy',
        component: EnrollmentStrategy,
        meta: {
          title: '招生策略',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'optimization/capacity-optimization',
        name: 'CapacityOptimization',
        component: CapacityOptimization,
        meta: {
          title: '容量优化',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      */
      {
        path: 'trends/trend-analysis',
        name: 'TrendAnalysis',
        component: TrendAnalysis,
        meta: {
          title: '趋势分析',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      /*
      {
        path: 'simulation/enrollment-simulation',
        name: 'EnrollmentSimulation',
        component: EnrollmentSimulation,
        meta: {
          title: '招生仿真',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'evaluation/plan-evaluation',
        name: 'PlanEvaluation',
        component: PlanEvaluation,
        meta: {
          title: '计划评估',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'analytics/enrollment-analytics',
        name: 'EnrollmentAnalytics',
        component: EnrollmentAnalytics,
        meta: {
          title: '招生分析',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      },
      */
      {
        path: 'management/plan-management',
        name: 'PlanManagement',
        component: () => import('@/pages/enrollment-plan/management/PlanManagement.vue'),
        meta: {
          title: '计划管理',
          requiresAuth: true,
          permission: 'ENROLLMENT_PLAN_MANAGE',
          priority: 'medium'
        }
      }
    ]
  },

  // 🔧 修复：招生管理模块嵌套在 MainLayout 中
  {
    path: '/enrollment',
    component: Layout,
    redirect: { name: 'EnrollmentIndex' },
    meta: {
      title: '招生管理',
      icon: 'Promotion',
      requiresAuth: true,
      permission: 'ENROLLMENT_VIEW',
      priority: 'high'
    },
    children: [
      {
        path: '',
        name: 'EnrollmentIndex',
        component: EnrollmentIndex,
        meta: {
          title: '招生管理',
          requiresAuth: true,
          permission: 'ENROLLMENT_VIEW',
          priority: 'high'
        }
      }
    ]
  }
]

export default enrollmentRoutes
