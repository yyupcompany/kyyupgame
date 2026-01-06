/**
 * 训练中心路由配置
 */

import { RouteRecordRaw } from 'vue-router'

// 训练中心模块组件
const TrainingCenter = () => import('@/pages/training-center/index.vue')
const TrainingActivities = () => import('@/pages/training-center/activities.vue')
const TrainingPlans = () => import('@/pages/training-center/plans.vue')
const TrainingRecords = () => import('@/pages/training-center/records.vue')
const TrainingAchievements = () => import('@/pages/training-center/achievements.vue')

// 训练活动相关路由
const ActivityDetail = () => import('@/pages/training-center/ActivityDetail.vue')
const ActivityStart = () => import('@/pages/training-center/ActivityStart.vue')

// 训练计划相关路由
const PlanDetail = () => import('@/pages/training-center/PlanDetail.vue')
const PlanCreate = () => import('@/pages/training-center/PlanCreate.vue')
const PlanEdit = () => import('@/pages/training-center/PlanEdit.vue')

// 训练记录相关路由
const RecordDetail = () => import('@/pages/training-center/RecordDetail.vue')

// 成就相关路由
const AchievementDetail = () => import('@/pages/training-center/AchievementDetail.vue')

export const trainingCenterRoutes: Array<RouteRecordRaw> = [
  // 训练中心主页
  {
    path: '/training-center',
    name: 'TrainingCenter',
    component: TrainingCenter,
    meta: {
      title: '训练中心',
      icon: 'TrendCharts',
      requiresAuth: true,
      permission: 'TRAINING_CENTER_VIEW',
      hideInMenu: false,
      priority: 'high',
      category: 'training',
      preload: true
    }
  },

  // 训练活动列表
  {
    path: '/training-center/activities',
    name: 'TrainingActivities',
    component: TrainingActivities,
    meta: {
      title: '训练活动',
      icon: 'Grid',
      requiresAuth: true,
      permission: 'TRAINING_ACTIVITY_VIEW',
      hideInMenu: false,
      priority: 'high',
      category: 'training',
      parent: 'TrainingCenter'
    }
  },

  // 活动详情页
  {
    path: '/training-center/activities/:id',
    name: 'ActivityDetail',
    component: ActivityDetail,
    meta: {
      title: '活动详情',
      requiresAuth: true,
      permission: 'TRAINING_ACTIVITY_VIEW',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  },

  // 开始训练活动
  {
    path: '/training-center/activity/:id/start',
    name: 'ActivityStart',
    component: ActivityStart,
    meta: {
      title: '开始训练',
      requiresAuth: true,
      permission: 'TRAINING_ACTIVITY_EXECUTE',
      hideInMenu: true,
      priority: 'high',
      category: 'training'
    }
  },

  // 训练计划管理
  {
    path: '/training-center/plans',
    name: 'TrainingPlans',
    component: TrainingPlans,
    meta: {
      title: '训练计划',
      icon: 'Document',
      requiresAuth: true,
      permission: 'TRAINING_PLAN_VIEW',
      hideInMenu: false,
      priority: 'high',
      category: 'training',
      parent: 'TrainingCenter'
    }
  },

  // 创建训练计划
  {
    path: '/training-center/plans/create',
    name: 'PlanCreate',
    component: PlanCreate,
    meta: {
      title: '创建训练计划',
      requiresAuth: true,
      permission: 'TRAINING_PLAN_CREATE',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  },

  // 训练计划详情
  {
    path: '/training-center/plans/:id',
    name: 'PlanDetail',
    component: PlanDetail,
    meta: {
      title: '计划详情',
      requiresAuth: true,
      permission: 'TRAINING_PLAN_VIEW',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  },

  // 编辑训练计划
  {
    path: '/training-center/plans/:id/edit',
    name: 'PlanEdit',
    component: PlanEdit,
    meta: {
      title: '编辑计划',
      requiresAuth: true,
      permission: 'TRAINING_PLAN_EDIT',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  },

  // 训练记录
  {
    path: '/training-center/records',
    name: 'TrainingRecords',
    component: TrainingRecords,
    meta: {
      title: '训练记录',
      icon: 'DataLine',
      requiresAuth: true,
      permission: 'TRAINING_RECORD_VIEW',
      hideInMenu: false,
      priority: 'high',
      category: 'training',
      parent: 'TrainingCenter'
    }
  },

  // 训练记录详情
  {
    path: '/training-center/records/:id',
    name: 'RecordDetail',
    component: RecordDetail,
    meta: {
      title: '记录详情',
      requiresAuth: true,
      permission: 'TRAINING_RECORD_VIEW',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  },

  // 成就系统
  {
    path: '/training-center/achievements',
    name: 'TrainingAchievements',
    component: TrainingAchievements,
    meta: {
      title: '成就系统',
      icon: 'Trophy',
      requiresAuth: true,
      permission: 'TRAINING_ACHIEVEMENT_VIEW',
      hideInMenu: false,
      priority: 'high',
      category: 'training',
      parent: 'TrainingCenter'
    }
  },

  // 成就详情
  {
    path: '/training-center/achievements/:id',
    name: 'AchievementDetail',
    component: AchievementDetail,
    meta: {
      title: '成就详情',
      requiresAuth: true,
      permission: 'TRAINING_ACHIEVEMENT_VIEW',
      hideInMenu: true,
      priority: 'medium',
      category: 'training'
    }
  }
]

// 训练中心菜单配置
export const trainingCenterMenu = {
  title: '训练中心',
  icon: 'TrendCharts',
  path: '/training-center',
  children: [
    {
      title: '训练活动',
      icon: 'Grid',
      path: '/training-center/activities'
    },
    {
      title: '训练计划',
      icon: 'Document',
      path: '/training-center/plans'
    },
    {
      title: '训练记录',
      icon: 'DataLine',
      path: '/training-center/records'
    },
    {
      title: '成就系统',
      icon: 'Trophy',
      path: '/training-center/achievements'
    }
  ]
}

// 训练中心权限配置
export const trainingCenterPermissions = [
  'TRAINING_CENTER_VIEW',
  'TRAINING_ACTIVITY_VIEW',
  'TRAINING_ACTIVITY_EXECUTE',
  'TRAINING_PLAN_VIEW',
  'TRAINING_PLAN_CREATE',
  'TRAINING_PLAN_EDIT',
  'TRAINING_PLAN_DELETE',
  'TRAINING_RECORD_VIEW',
  'TRAINING_RECORD_EXPORT',
  'TRAINING_ACHIEVEMENT_VIEW',
  'TRAINING_ACHIEVEMENT_SHARE'
]