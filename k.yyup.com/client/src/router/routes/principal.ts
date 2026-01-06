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
      }
    ]
  }
]

export default principalRoutes
