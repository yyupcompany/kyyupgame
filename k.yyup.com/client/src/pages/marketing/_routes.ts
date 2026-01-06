import type { RouteRecordRaw } from 'vue-router'

const MarketingRoutes: RouteRecordRaw = {
  path: '/marketing',
  name: 'MarketingRoot',
  component: () => import('@/layouts/MainLayout.vue'),
  redirect: '/marketing/channels',
  children: [
    {
      path: 'channels',
      name: 'MarketingChannels',
      component: () => import('./channels/index.vue'),
      meta: { title: '渠道', requiresAuth: true, permission: 'MARKETING_CHANNELS_MANAGE' }
    },
    {
      path: 'referrals',
      name: 'MarketingReferrals',
      component: () => import('./referrals/index.vue'),
      meta: { title: '老带新', requiresAuth: true, permission: 'MARKETING_REFERRALS_MANAGE' }
    },
    {
      path: 'conversions',
      name: 'MarketingConversions',
      component: () => import('./conversions/index.vue'),
      meta: { title: '转换统计', requiresAuth: true, permission: 'MARKETING_STATS_VIEW' }
    },
    {
      path: 'funnel',
      name: 'MarketingFunnel',
      component: () => import('./funnel/index.vue'),
      meta: { title: '销售漏斗', requiresAuth: true, permission: 'MARKETING_FUNNEL_VIEW' }
    }
  ]
}

export default MarketingRoutes

