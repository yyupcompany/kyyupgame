/**
 * 家长管理路由模块
 * @description 包含家长管理、家长详情、家长沟通、家长反馈等相关页面
 * @module routes/parent
 */

import type { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

/**
 * 家长管理路由配置
 * @priority medium - 核心业务模块
 */
export const parentRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有家长管理路由都应该嵌套在 MainLayout 中
  {
    path: '/parent',
    component: Layout,
    redirect: '/parent/list',
    meta: {
      title: '家长管理',
      icon: 'Avatar',
      requiresAuth: true
    },
    children: [
      // 家长列表
      {
        path: 'list',
        name: 'ParentList',
        component: () => import('@/pages/parent/ParentList.vue'),
        meta: {
          title: '家长列表',
          requiresAuth: true,
          permission: 'PARENT_VIEW',
          priority: 'medium'
        }
      },

      // 家长首页
      {
        path: 'index',
        name: 'ParentIndex',
        component: () => import('@/pages/parent/index.vue'),
        meta: {
          title: '家长首页',
          requiresAuth: true,
          permission: 'PARENT_VIEW',
          hideInMenu: true
        }
      },

      // 家长详情
      {
        path: 'detail/:id',
        name: 'ParentDetail',
        component: () => import('@/pages/parent/ParentDetail.vue'),
        meta: {
          title: '家长详情',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'PARENT_VIEW',
          priority: 'low'
        }
      },

      // 儿童列表
      {
        path: 'children',
        name: 'ChildrenList',
        component: () => import('@/pages/parent/ChildrenList.vue'),
        meta: {
          title: '儿童列表',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'PARENT_VIEW',
          priority: 'medium'
        }
      },

      // 添加家长
      {
        path: 'create',
        name: 'ParentCreate',
        component: () => import('@/pages/parent/ParentEdit.vue'),
        meta: {
          title: '添加家长',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'PARENT_CREATE',
          priority: 'medium'
        }
      },

      // 编辑家长
      {
        path: 'edit/:id',
        name: 'ParentEdit',
        component: () => import('@/pages/parent/ParentEdit.vue'),
        meta: {
          title: '编辑家长',
          requiresAuth: true,
          hideInMenu: true,
          permission: 'PARENT_EDIT',
          priority: 'medium'
        }
      },

      // 家长跟进
      {
        path: 'FollowUp',
        name: 'ParentFollowUp',
        component: () => import('@/pages/parent/FollowUp.vue'),
        meta: {
          title: '家长跟进',
          requiresAuth: true,
          permission: 'PARENT_FOLLOWUP',
          priority: 'medium'
        }
      },

      // 家长沟通中心
      {
        path: 'communication/smart-hub',
        name: 'ParentCommunicationHub',
        component: () => import('@/pages/parent/communication/SmartHub.vue'),
        meta: {
          title: '家长沟通中心',
          requiresAuth: true,
          permission: 'PARENT_COMMUNICATION',
          priority: 'medium'
        }
      },

      // 儿童成长
      {
        path: 'ChildGrowth',
        name: 'ParentChildGrowth',
        component: () => import('@/pages/parent/ChildGrowth.vue'),
        meta: {
          title: '儿童成长',
          requiresAuth: true,
          permission: 'PARENT_CHILD_GROWTH',
          priority: 'medium'
        }
      },

      // 分配活动
      {
        path: 'AssignActivity',
        name: 'ParentAssignActivity',
        component: () => import('@/pages/parent/AssignActivity.vue'),
        meta: {
          title: '分配活动',
          requiresAuth: true,
          permission: 'PARENT_ASSIGN_ACTIVITY',
          priority: 'medium'
        }
      },

      // 家长反馈
      {
        path: 'feedback/parent-feedback',
        name: 'ParentFeedback',
        component: () => import('@/pages/parent/feedback/ParentFeedback.vue'),
        meta: {
          title: '家长反馈',
          requiresAuth: true,
          permission: 'PARENT_FEEDBACK',
          priority: 'medium'
        }
      },

      // 家长统计
      {
        path: 'statistics',
        name: 'ParentStatistics',
        component: () => import('@/pages/parent/ParentStatistics.vue'),
        meta: {
          title: '家长统计',
          requiresAuth: true,
          permission: 'PARENT_STATISTICS_VIEW',
          priority: 'medium'
        }
      }
    ]
  }
]

export default parentRoutes
