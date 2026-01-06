/**
 * 营销管理模块路由配置
 * 
 * 功能范围：
 * - 渠道管理
 * - 老带新
 * - 转换统计
 * - 销售漏斗
 * 
 * 注意：营销中心路由已在 centers.ts 中定义
 * 这里只包含营销中心的子路由
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

export const marketingRoutes: RouteRecordRaw[] = [
  // 🔧 修复：营销管理子路由嵌套在 MainLayout 中
  {
    path: '/marketing',
    component: Layout,
    meta: {
      title: '营销管理',
      requiresAuth: true
    },
    children: [
      {
        path: 'channels',
        name: 'MarketingChannels',
        component: () => import('@/pages/marketing/channels/index.vue'),
        meta: { 
          title: '渠道管理', 
          requiresAuth: true, 
          permission: 'MARKETING_CHANNELS_MANAGE',
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: 'referrals',
        name: 'MarketingReferrals',
        component: () => import('@/pages/marketing/referrals/index.vue'),
        meta: { 
          title: '老带新', 
          requiresAuth: true, 
          permission: 'MARKETING_REFERRALS_MANAGE',
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: 'conversions',
        name: 'MarketingConversions',
        component: () => import('@/pages/marketing/conversions/index.vue'),
        meta: { 
          title: '转换统计', 
          requiresAuth: true, 
          permission: 'MARKETING_STATS_VIEW',
          hideInMenu: true,
          priority: 'medium'
        }
      },
      {
        path: 'funnel',
        name: 'MarketingFunnel',
        component: () => import('@/pages/marketing/funnel/index.vue'),
        meta: { 
          title: '销售漏斗', 
          requiresAuth: true, 
          permission: 'MARKETING_FUNNEL_VIEW',
          hideInMenu: true,
          priority: 'medium'
        }
      }
    ]
  }
]
