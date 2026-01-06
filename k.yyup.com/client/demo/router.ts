import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from './layouts/BaseLayout.vue'
import Dashboard from './views/Dashboard.vue'

const routes = [
  {
    path: '/demo',
    component: BaseLayout,
    redirect: '/demo/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表板'
        }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('./views/Users.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('./views/Analytics.vue'),
        meta: {
          title: '数据分析'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('./views/Settings.vue'),
        meta: {
          title: '系统设置'
        }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('./views/Logs.vue'),
        meta: {
          title: '系统日志'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 