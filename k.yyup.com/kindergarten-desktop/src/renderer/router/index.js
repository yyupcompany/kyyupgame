import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 懒加载页面组件
const Login = () => import('@/pages/Login.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const UserManagement = () => import('@/pages/UserManagement.vue')
const StudentManagement = () => import('@/pages/StudentManagement.vue')
const ClassManagement = () => import('@/pages/ClassManagement.vue')
const ActivityManagement = () => import('@/pages/ActivityManagement.vue')
const AttendanceManagement = () => import('@/pages/AttendanceManagement.vue')
const SystemSettings = () => import('@/pages/SystemSettings.vue')
const NotFound = () => import('@/pages/NotFound.vue')

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      icon: 'DataBoard'
    }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      title: '用户管理',
      requiresAuth: true,
      icon: 'User',
      roles: ['admin']
    }
  },
  {
    path: '/students',
    name: 'StudentManagement',
    component: StudentManagement,
    meta: {
      title: '学生管理',
      requiresAuth: true,
      icon: 'UserFilled'
    }
  },
  {
    path: '/classes',
    name: 'ClassManagement',
    component: ClassManagement,
    meta: {
      title: '班级管理',
      requiresAuth: true,
      icon: 'School'
    }
  },
  {
    path: '/activities',
    name: 'ActivityManagement',
    component: ActivityManagement,
    meta: {
      title: '活动管理',
      requiresAuth: true,
      icon: 'Trophy'
    }
  },
  {
    path: '/attendance',
    name: 'AttendanceManagement',
    component: AttendanceManagement,
    meta: {
      title: '考勤管理',
      requiresAuth: true,
      icon: 'Calendar'
    }
  },
  {
    path: '/settings',
    name: 'SystemSettings',
    component: SystemSettings,
    meta: {
      title: '系统设置',
      requiresAuth: true,
      icon: 'Setting',
      roles: ['admin']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 幼儿园管理系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查角色权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      const hasRole = to.meta.roles.includes(authStore.user?.role)
      if (!hasRole) {
        // 权限不足
        next('/dashboard')
        return
      }
    }
  }

  // 已登录用户访问登录页，重定向到仪表板
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 路由切换完成
  console.log(`路由切换: ${from.path} -> ${to.path}`)
})

export default router