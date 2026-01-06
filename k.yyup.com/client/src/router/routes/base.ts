/**
 * 基础路由配置
 * 
 * 功能说明：
 * - 登录和注册页面
 * - 错误页面 (404, 403)
 * - 关于我们、联系我们等公共页面
 * 
 * 权限说明：
 * - 无需登录即可访问
 * - 部分页面需要认证后访问
 */

import { RouteRecordRaw } from 'vue-router'

// 页面组件懒加载导入
const Login = () => import('@/pages/Login/index.vue')
const Register = () => import('@/pages/Register.vue')
const Contact = () => import('@/pages/Contact.vue')
const About = () => import('@/pages/About.vue')
const Error = () => import('@/pages/Error.vue')
const LoginDemo = () => import('@/pages/demo/LoginSplitDemo.vue')

export const baseRoutes: RouteRecordRaw[] = [
  // 登录页面（不需要Layout包裹）
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '用户登录',
      requiresAuth: false,
      hideInMenu: true,
      preload: true
    }
  },

  // 登录Demo页面（不需要Layout包裹）
  {
    path: '/login-demo',
    name: 'LoginDemo',
    component: LoginDemo,
    meta: {
      title: '登录页Demo',
      requiresAuth: false,
      hideInMenu: true,
      preload: false
    }
  },

  // 注册页面（不需要Layout包裹）
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '用户注册',
      requiresAuth: false,
      hideInMenu: true,
      preload: true
    }
  },

  // 联系我们页面
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: '联系我们',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'low'
    }
  },

  // 关于我们页面
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'low'
    }
  },

  // 403权限不足页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/pages/403.vue'),
    meta: {
      title: '权限不足',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  },

  // 错误页面
  {
    path: '/error',
    name: 'Error',
    component: Error,
    meta: {
      title: '错误页面',
      icon: 'Warning',
      requiresAuth: false,
      priority: 'low',
      hideInMenu: true
    }
  }
]
