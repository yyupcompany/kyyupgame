/**
 * 测试演示路由配置
 * 
 * 功能说明:
 * - 所有测试页面
 * - 所有演示页面
 * - AI演示、快捷查询、API测试
 * - 组件测试、物理电路、专家团队
 * - Markdown演示等
 * 
 * 权限说明:
 * - 大部分页面不需要登录
 * - 用于开发测试和功能演示
 */

import { RouteRecordRaw } from 'vue-router'

// 测试演示模块组件懒加载导入
const ComponentTest = () => import('@/views/test/ComponentTest.vue')
const PageOperationToolsTest = () => import('@/views/test/PageOperationToolsTest.vue')
const KindergartenAIDemo = () => import('@/pages/demo/KindergartenAIDemo.vue')
const MarkdownDemo = () => import('@/pages/demo/MarkdownDemo.vue')
const LoginDemo = () => import('@/pages/demo/LoginSplitDemo.vue')
const QuickQueryDemo = () => import('@/views/demo/QuickQueryDemo.vue')
const ApiTest = () => import('@/views/debug/ApiTest.vue')
const ImageReplacementManager = () => import('@/pages/admin/ImageReplacementManager.vue')

export const demoTestRoutes: RouteRecordRaw[] = [
  // 测试页面 - 组件测试
  {
    path: '//test/components',
    name: 'ComponentTest',
    component: ComponentTest,
    meta: {
      title: '组件测试',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  },

  // 测试页面路由 - 用于调试组件问题
  {
    path: '//test/simple-form-modal-test',
    name: 'SimpleFormModalTest',
    component: () => import('@/pages/test/SimpleFormModalTest.vue'),
    meta: {
      title: 'SimpleFormModal测试',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  },

  // 页面操作工具测试页面
  {
    path: '//test/page-operation-tools',
    name: 'PageOperationToolsTest',
    component: PageOperationToolsTest,
    meta: {
      title: '页面操作工具测试',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  },

  // 表单测试页面
  {
    path: '//test/form-modal-test',
    name: 'FormModalTest',
    component: () => import('@/pages/test/FormModalTest.vue'),
    meta: {
      title: 'FormModal测试',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  },

  // AI图片管理页面
  {
    path: '//admin/image-replacement',
    name: 'ImageReplacementManager',
    component: ImageReplacementManager,
    meta: {
      title: 'AI自动配图管理',
      requiresAuth: true,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 幼儿园AI演示页面
  {
    path: '//demo/kindergarten-ai',
    name: 'KindergartenAIDemo',
    component: KindergartenAIDemo,
    meta: {
      title: '幼儿园AI配图演示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 快捷查询演示页面
  {
    path: '//demo/quick-query',
    name: 'QuickQueryDemo',
    component: QuickQueryDemo,
    meta: {
      title: '⚡ 快捷查询演示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 物理电路演示页面
  {
    path: '//demo/circuit',
    name: 'CircuitDemo',
    component: () => import('@/pages/demo/CircuitDemo.vue'),
    meta: {
      title: '⚡ 物理电路演示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 专家团队演示页面
  {
    path: '//demo/expert-team',
    name: 'ExpertTeamDemo',
    component: () => import('@/pages/demo/ExpertTeamDemo.vue'),
    meta: {
      title: '👨‍🏫 专家团队展示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 智能专家调度系统演示页面
  {
    path: '//demo/smart-expert',
    name: 'SmartExpertDemo',
    component: () => import('@/pages/demo/SmartExpertDemo.vue'),
    meta: {
      title: '智能专家调度系统',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // Markdown图文混排演示页面
  {
    path: '//demo/markdown',
    name: 'MarkdownDemo',
    component: MarkdownDemo,
    meta: {
      title: '📝 图文混排演示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 增强样式演示页面路由
  {
    path: '//demo/enhanced',
    name: 'EnhancedDemo',
    component: () => import('@/demo/EnhancedDemoPage.vue'),
    meta: {
      title: '增强样式演示',
      requiresAuth: false,
      hideInMenu: false,
      priority: 'medium'
    }
  },

  // 登录页Demo
  {
    path: '//login-demo',
    name: 'LoginDemo',
    component: LoginDemo,
    meta: {
      title: '登录页Demo',
      requiresAuth: false,
      hideInMenu: true,
      preload: false
    }
  },

  // 主题测试页面路由
  {
    path: '//theme-test',
    name: 'ThemeTest',
    component: () => import('@/pages/ThemeTest.vue'),
    meta: {
      title: '主题测试',
      requiresAuth: false,
      hideInMenu: true,
      priority: 'low'
    }
  }
]

export default demoTestRoutes
