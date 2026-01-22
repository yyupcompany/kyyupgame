/**
 * 园长功能路由配置
 * 
 * 功能说明:
 * - 园长仪表板、活动管理、客户池
 * - 营销分析、绩效管理
 * - 海报编辑器、海报生成器
 * - 绩效规则、海报模板、媒体中心
 * - 决策支持、报告
 * 
 * 权限说明:
 * - 需要园长权限
 * - 部分功能需要特定权限
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// 园长功能模块组件懒加载导入
const PrincipalDashboard = () => import('@/pages/principal/Dashboard.vue')
const PrincipalReports = () => import('@/pages/principal/PrincipalReports.vue')
const PrincipalMediaCenter = () => import('@/pages/principal/MediaCenter.vue')
const PrincipalPerformance = () => import('@/pages/principal/Performance.vue')
const PrincipalPosterGenerator = () => import('@/pages/principal/PosterGenerator.vue')
const PrincipalPosterTemplates = () => import('@/pages/principal/PosterTemplates.vue')
const PrincipalParentPermissionManagement = () => import('@/pages/principal/ParentPermissionManagement.vue')
const PrincipalIntelligentDashboard = () => import('@/pages/principal/decision-support/intelligent-dashboard.vue')
const PrincipalCustomerPool = () => import('@/pages/principal/CustomerPool.vue')
const PrincipalActivities = () => import('@/pages/principal/Activities.vue')
const PrincipalMarketingAnalysis = () => import('@/pages/principal/MarketingAnalysis.vue')

export const principalRoutes: RouteRecordRaw[] = [
  // 🔧 修复：园长功能模块嵌套在 MainLayout 中
  {
    path: '/principal',
    component: Layout,
    redirect: { name: 'PrincipalDashboard' },
    meta: {
      title: '园长功能',
      icon: 'UserFilled',
      requiresAuth: true,
      permission: 'PRINCIPAL_MANAGE',
      priority: 'medium'
    },
    children: [
      {
        path: 'dashboard',
        name: 'PrincipalDashboard',
        component: PrincipalDashboard,
        meta: {
          title: '园长仪表板',
          requiresAuth: true,
          permission: 'PRINCIPAL_DASHBOARD_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'reports',
        name: 'PrincipalReports',
        component: PrincipalReports,
        meta: {
          title: '园长报告',
          requiresAuth: true,
          permission: 'PRINCIPAL_REPORT_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'media-center',
        name: 'PrincipalMediaCenter',
        component: PrincipalMediaCenter,
        meta: {
          title: '新媒体中心',
          requiresAuth: true,
          permission: 'PRINCIPAL_MEDIA_CENTER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'performance',
        name: 'PrincipalPerformance',
        component: PrincipalPerformance,
        meta: {
          title: '招生业绩统计',
          requiresAuth: true,
          permission: 'PRINCIPAL_PERFORMANCE_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'poster-generator',
        name: 'PrincipalPosterGenerator',
        component: PrincipalPosterGenerator,
        meta: {
          title: '海报生成器',
          requiresAuth: true,
          permission: 'PRINCIPAL_POSTER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'poster-templates',
        name: 'PrincipalPosterTemplates',
        component: PrincipalPosterTemplates,
        meta: {
          title: '海报模板',
          requiresAuth: true,
          permission: 'PRINCIPAL_POSTER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'parent-permission-management',
        name: 'PrincipalParentPermissionManagement',
        component: PrincipalParentPermissionManagement,
        meta: {
          title: '家长权限管理',
          requiresAuth: true,
          permission: 'PRINCIPAL_PERMISSION_MANAGE',
          priority: 'medium'
        }
      },
      {
        path: 'decision-support/intelligent-dashboard',
        name: 'PrincipalIntelligentDashboard',
        component: PrincipalIntelligentDashboard,
        meta: {
          title: '智能决策仪表板',
          requiresAuth: true,
          permission: 'PRINCIPAL_DECISION_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'customer-pool',
        name: 'PrincipalCustomerPool',
        component: PrincipalCustomerPool,
        meta: {
          title: '客户池管理',
          requiresAuth: true,
          permission: 'PRINCIPAL_CUSTOMER_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'activities',
        name: 'PrincipalActivities',
        component: PrincipalActivities,
        meta: {
          title: '活动管理',
          requiresAuth: true,
          permission: 'PRINCIPAL_ACTIVITY_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'marketing-analysis',
        name: 'PrincipalMarketingAnalysis',
        component: PrincipalMarketingAnalysis,
        meta: {
          title: '营销分析',
          requiresAuth: true,
          permission: 'PRINCIPAL_MARKETING_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default principalRoutes
