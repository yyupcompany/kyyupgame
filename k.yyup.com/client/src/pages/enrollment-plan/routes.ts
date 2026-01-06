import { AppRouteRecordRaw } from '../../types/router';

// 招生计划模块路由
const enrollmentPlanRoutes: AppRouteRecordRaw = {
  path: '/enrollment-plan',
  name: 'EnrollmentPlan',
  component: () => import('../../layouts/default/index.vue'),
  meta: {
    title: '招生计划管理',
    icon: 'el-icon-s-flag',
    requiresAuth: true,
    permissions: ['admin', 'principal']
  },
  children: [
    {
      path: 'list',
      name: 'EnrollmentPlanList',
      component: () => import('./PlanList.vue'),
      meta: {
        title: '计划列表',
        icon: 'ticket',
        keepAlive: true
      }
    },
    {
      path: 'create',
      name: 'EnrollmentPlanCreate',
      component: () => import('./PlanEdit.vue'),
      meta: {
        title: '创建计划',
        icon: 'plus',
        activeMenu: '/enrollment-plan/list'
      }
    },
    {
      path: 'edit/:id',
      name: 'EnrollmentPlanEdit',
      component: () => import('./PlanEdit.vue'),
      meta: {
        title: '编辑计划',
        activeMenu: '/enrollment-plan/list',
        hidden: true
      },
      props: (route: any) => ({ planId: Number(route.params.id) })
    },
    {
      path: 'detail/:id',
      name: 'EnrollmentPlanDetail',
      component: () => import('./PlanDetail.vue'),
      meta: {
        title: '计划详情',
        activeMenu: '/enrollment-plan/list',
        hidden: true
      },
      props: (route: any) => ({ planId: Number(route.params.id) })
    },
    {
      path: 'quota/:id',
      name: 'EnrollmentQuotaManage',
      component: () => import('./QuotaManage.vue'),
      meta: {
        title: '名额管理',
        activeMenu: '/enrollment-plan/list',
        hidden: true
      },
      props: (route: any) => ({
        planId: route.params.id && !isNaN(Number(route.params.id)) && Number(route.params.id) > 0 ? Number(route.params.id) : undefined 
      })
    },
    {
      path: 'quota-management/:id',
      name: 'QuotaManagement',
      component: () => import('./QuotaManagement.vue'),
      meta: {
        title: '名额管理(新)',
        activeMenu: '/enrollment-plan/list',
        hidden: true
      },
      props: (route: any) => ({ planId: Number(route.params.id) })
    },
    {
      path: 'statistics',
      name: 'EnrollmentStatistics',
      component: () => import('./Statistics.vue'),
      meta: {
        title: '招生统计',
        icon: 'bar-chart-3',
        keepAlive: true
      }
    }
  ]
};

export default enrollmentPlanRoutes; 