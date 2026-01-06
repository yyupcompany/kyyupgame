import { RouteRecordRaw } from 'vue-router'

/**
 * 移动端路由配置 - 清理版本
 * 只保留PC端实际存在的页面路由
 */

export const mobileRoutes: Array<RouteRecordRaw> = [
  {
    path: '/mobile',
    redirect: '/mobile/centers'
  },

  // ===== 认证相关 =====
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: () => import('../pages/mobile/login/index.vue'),
    meta: {
      title: '移动端登录',
      requiresAuth: false,
      hideNavigation: true
    }
  },

  // ===== 核心功能页面 =====
  {
    path: '/mobile/search',
    name: 'MobileSearch',
    component: () => import('../pages/mobile/global-search/index.vue'),
    meta: {
      title: '搜索',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/error',
    name: 'MobileError',
    component: () => import('../pages/mobile/error/index.vue'),
    meta: {
      title: '错误页面',
      requiresAuth: false
    }
  },
  // 消息中心重定向（根据角色重定向到对应页面）
  {
    path: '/mobile/messages',
    name: 'MobileMessages',
    redirect: (to: any) => {
      const userRole = localStorage.getItem('user_role')
      if (userRole === 'parent') {
        return '/mobile/parent-center/notifications'
      } else if (userRole === 'teacher') {
        return '/mobile/teacher-center/notifications'
      } else {
        return '/mobile/centers/notification-center'
      }
    },
    meta: {
      title: '消息中心',
      requiresAuth: true
    }
  },
  // 通知中心重定向（根据角色重定向到对应页面）
  {
    path: '/mobile/notifications',
    name: 'MobileNotifications',
    redirect: (to: any) => {
      const userRole = localStorage.getItem('user_role')
      if (userRole === 'parent') {
        return '/mobile/parent-center/notifications'
      } else if (userRole === 'teacher') {
        return '/mobile/teacher-center/notifications'
      } else {
        return '/mobile/centers/notification-center'
      }
    },
    meta: {
      title: '通知中心',
      requiresAuth: true
    }
  },

  // ===== 聚合页面（5个核心Tab对应的聚合页） =====
  {
    path: '/mobile/dashboard',
    name: 'MobileDashboard',
    component: () => import('../pages/mobile/dashboard/index.vue'),
    meta: {
      title: '首页',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/business-hub',
    name: 'MobileBusinessHub',
    component: () => import('../pages/mobile/centers/business-hub/index.vue'),
    meta: {
      title: '业务中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/analytics-hub',
    name: 'MobileAnalyticsHub',
    component: () => import('../pages/mobile/centers/analytics-hub/index.vue'),
    meta: {
      title: '数据分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/more',
    name: 'MobileMore',
    component: () => import('../pages/mobile/more/index.vue'),
    meta: {
      title: '更多功能',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },

  // ===== 中心模块页面 =====
  {
    path: '/mobile/centers',
    name: 'MobileCenters',
    component: () => import('../pages/mobile/centers/index.vue'),
    meta: {
      title: '管理中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/activity-center',
    name: 'MobileActivityCenter',
    component: () => import('../pages/mobile/centers/activity-center/index.vue'),
    meta: {
      title: '活动中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/analytics-center',
    name: 'MobileAnalyticsCenter',
    component: () => import('../pages/mobile/centers/analytics-center/index.vue'),
    meta: {
      title: '数据分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/assessment-center',
    name: 'MobileAssessmentCenter',
    component: () => import('../pages/mobile/centers/assessment-center/index.vue'),
    meta: {
      title: '评估中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/attendance-center',
    name: 'MobileAttendanceCenter',
    component: () => import('../pages/mobile/centers/attendance-center/index.vue'),
    meta: {
      title: '考勤中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/business-center',
    name: 'MobileBusinessCenter',
    component: () => import('../pages/mobile/centers/business-center/index.vue'),
    meta: {
      title: '业务中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/call-center',
    name: 'MobileCallCenter',
    component: () => import('../pages/mobile/centers/call-center/index.vue'),
    meta: {
      title: '呼叫中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/customer-pool-center',
    name: 'MobileCustomerPoolCenter',
    component: () => import('../pages/mobile/centers/customer-pool-center/index.vue'),
    meta: {
      title: '客户池中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/document-center',
    name: 'MobileDocumentCenter',
    component: () => import('../pages/mobile/centers/document-center/index.vue'),
    meta: {
      title: '文档中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/document-collaboration',
    name: 'MobileDocumentCollaboration',
    component: () => import('../pages/mobile/centers/document-collaboration/index.vue'),
    meta: {
      title: '文档协作',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/document-instance-list',
    name: 'MobileDocumentInstanceList',
    component: () => import('../pages/mobile/centers/document-instance-list/index.vue'),
    meta: {
      title: '我的文档',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== 文档实例相关页面 =====
  {
    path: '/mobile/document-instance/:id',
    name: 'MobileDocumentInstanceDetail',
    component: () => import('../pages/mobile/document-instance/detail/index.vue'),
    meta: {
      title: '文档详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/document-instance/:id/edit',
    name: 'MobileDocumentInstanceEdit',
    component: () => import('../pages/mobile/document-instance/edit/index.vue'),
    meta: {
      title: '编辑文档',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/document-template-center/use/:id',
    name: 'MobileDocumentTemplateUse',
    component: () => import('../pages/mobile/centers/document-template-center/use.vue'),
    meta: {
      title: '使用模板',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/template-detail/:id',
    name: 'MobileTemplateDetail',
    component: () => import('../pages/mobile/centers/template-detail/index.vue'),
    meta: {
      title: '模板详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/enrollment-center',
    name: 'MobileEnrollmentCenter',
    component: () => import('../pages/mobile/centers/enrollment-center/index.vue'),
    meta: {
      title: '招生中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/finance-center',
    name: 'MobileFinanceCenter',
    component: () => import('../pages/mobile/centers/finance-center/index.vue'),
    meta: {
      title: '财务中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/inspection-center',
    name: 'MobileInspectionCenter',
    component: () => import('../pages/mobile/centers/inspection-center/index.vue'),
    meta: {
      title: '检查中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/marketing-center',
    name: 'MobileMarketingCenter',
    component: () => import('../pages/mobile/centers/marketing-center/index.vue'),
    meta: {
      title: '营销中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/task-center',
    name: 'MobileTaskCenter',
    component: () => import('../pages/mobile/centers/task-center/index.vue'),
    meta: {
      title: '任务中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/task-form',
    name: 'MobileTaskForm',
    component: () => import('../pages/mobile/centers/task-form/index.vue'),
    meta: {
      title: '任务表单',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher'],
      backPath: '/mobile/centers/task-center'
    }
  },
  {
    path: '/mobile/centers/my-task-center',
    name: 'MobileMyTaskCenter',
    component: () => import('../pages/mobile/centers/my-task-center/index.vue'),
    meta: {
      title: '我的任务',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/usage-center',
    name: 'MobileUsageCenter',
    component: () => import('../pages/mobile/centers/usage-center/index.vue'),
    meta: {
      title: '用量中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/notification-center',
    name: 'MobileNotificationCenter',
    component: () => import('../pages/mobile/centers/notification-center/index.vue'),
    meta: {
      title: '通知中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/permission-center',
    name: 'MobilePermissionCenter',
    component: () => import('../pages/mobile/centers/permission-center/index.vue'),
    meta: {
      title: '权限中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/photo-album-center',
    name: 'MobilePhotoAlbumCenter',
    component: () => import('../pages/mobile/centers/photo-album-center/index.vue'),
    meta: {
      title: '相册中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/principal-center',
    name: 'MobilePrincipalCenter',
    component: () => import('../pages/mobile/centers/principal-center/index.vue'),
    meta: {
      title: '园长中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/schedule-center',
    name: 'MobileScheduleCenter',
    component: () => import('../pages/mobile/centers/schedule-center/index.vue'),
    meta: {
      title: '日程中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/settings-center',
    name: 'MobileSettingsCenter',
    component: () => import('../pages/mobile/centers/settings-center/index.vue'),
    meta: {
      title: '设置中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/personnel-center',
    name: 'MobilePersonnelCenter',
    component: () => import('../pages/mobile/centers/personnel-center/index.vue'),
    meta: {
      title: '人员中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/personnel-center/teacher/:id',
    name: 'MobileTeacherDetail',
    component: () => import('../pages/mobile/centers/personnel-center/teacher-detail.vue'),
    meta: {
      title: '教师详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/student-center',
    name: 'MobileStudentCenter',
    component: () => import('../pages/mobile/centers/student-center/index.vue'),
    meta: {
      title: '学生中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/student-center/detail/:id',
    name: 'MobileStudentDetail',
    component: () => import('../pages/mobile/centers/student-management/detail.vue'),
    meta: {
      title: '学生详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/student-management',
    name: 'MobileStudentManagement',
    component: () => import('../pages/mobile/centers/student-management/index.vue'),
    meta: {
      title: '学生管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/system-center',
    name: 'MobileSystemCenter',
    component: () => import('../pages/mobile/centers/system-center/index.vue'),
    meta: {
      title: '系统中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/teaching-center',
    name: 'MobileTeachingCenter',
    component: () => import('../pages/mobile/centers/teaching-center/index.vue'),
    meta: {
      title: '教学中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/user-center',
    name: 'MobileUserCenter',
    component: () => import('../pages/mobile/centers/user-center/index.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/ai-center',
    name: 'MobileAiCenter',
    component: () => import('../pages/mobile/centers/ai-center/index.vue'),
    meta: {
      title: 'AI智能中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/ai-billing-center',
    name: 'MobileAiBillingCenter',
    component: () => import('../pages/mobile/centers/ai-billing-center/index.vue'),
    meta: {
      title: 'AI计费中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/media-center',
    name: 'MobileMediaCenter',
    component: () => import('../pages/mobile/centers/media-center/index.vue'),
    meta: {
      title: '相册中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/new-media-center',
    name: 'MobileNewMediaCenter',
    component: () => import('../pages/mobile/centers/new-media-center/index.vue'),
    meta: {
      title: '新媒体中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== 家长端页面 =====
  {
    path: '/mobile/parent-center',
    name: 'MobileParentCenter',
    component: () => import('../pages/mobile/parent-center/index.vue'),
    meta: {
      title: '家长中心',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/dashboard',
    name: 'MobileParentDashboard',
    component: () => import('../pages/mobile/parent-center/dashboard/index.vue'),
    meta: {
      title: '家长仪表板',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/activities',
    name: 'MobileParentActivities',
    component: () => import('../pages/mobile/parent-center/activities/index.vue'),
    meta: {
      title: '活动列表',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/activities/:id',
    name: 'MobileParentActivityDetail',
    component: () => import('../pages/mobile/parent-center/activities/detail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/activity-registration',
    name: 'MobileParentActivityRegistration',
    component: () => import('../pages/mobile/parent-center/activities/registration.vue'),
    meta: {
      title: '活动报名',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/children',
    name: 'MobileParentChildren',
    component: () => import('../pages/mobile/parent-center/children/index.vue'),
    meta: {
      title: '孩子信息',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/child-growth',
    name: 'MobileParentChildGrowth',
    component: () => import('../pages/mobile/parent-center/child-growth/index.vue'),
    meta: {
      title: '成长记录',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/assessment',
    name: 'MobileParentAssessment',
    component: () => import('../pages/mobile/parent-center/assessment/index.vue'),
    meta: {
      title: '能力评估',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/assessment/development-assessment',
    name: 'MobileParentDevelopmentAssessment',
    component: () => import('../pages/mobile/parent-center/assessment/development-assessment.vue'),
    meta: {
      title: '发育测评',
      requiresAuth: true,
      role: ['parent'],
      backPath: '/mobile/parent-center/assessment'
    }
  },
  {
    path: '/mobile/parent-center/assessment/start',
    name: 'MobileParentAssessmentStart',
    component: () => import('../pages/mobile/parent-center/assessment/start.vue'),
    meta: {
      title: '开始测评',
      requiresAuth: true,
      role: ['parent'],
      backPath: '/mobile/parent-center/assessment'
    }
  },
  {
    path: '/mobile/parent-center/assessment/doing/:recordId',
    name: 'MobileParentAssessmentDoing',
    component: () => import('../pages/mobile/parent-center/assessment/doing.vue'),
    meta: {
      title: '测评进行中',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/games',
    name: 'MobileParentGames',
    component: () => import('../pages/mobile/parent-center/games/index.vue'),
    meta: {
      title: '亲子游戏',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/photo-album',
    name: 'MobileParentPhotoAlbum',
    component: () => import('../pages/mobile/parent-center/photo-album/index.vue'),
    meta: {
      title: '成长相册',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/communication',
    name: 'MobileParentCommunication',
    component: () => import('../pages/mobile/parent-center/communication/index.vue'),
    meta: {
      title: '家园沟通',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/communication/smart-hub',
    name: 'MobileParentCommunicationSmartHub',
    component: () => import('../pages/mobile/parent-center/communication/smart-hub.vue'),
    meta: {
      title: '智能沟通中心',
      requiresAuth: true,
      role: ['parent'],
      backPath: '/mobile/parent-center/communication'
    }
  },
  {
    path: '/mobile/parent-center/notifications',
    name: 'MobileParentNotifications',
    component: () => import('../pages/mobile/parent-center/notifications/index.vue'),
    meta: {
      title: '通知消息',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/notifications/detail',
    name: 'MobileParentNotificationDetail',
    component: () => import('../pages/mobile/parent-center/notifications/detail.vue'),
    meta: {
      title: '通知详情',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/ai-assistant',
    name: 'MobileParentAIAssistant',
    component: () => import('../pages/mobile/parent-center/ai-assistant/index.vue'),
    meta: {
      title: 'AI助手',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/promotion-center',
    name: 'MobileParentPromotionCenter',
    component: () => import('../pages/mobile/parent-center/promotion-center/index.vue'),
    meta: {
      title: '推广中心',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/share-stats',
    name: 'MobileParentShareStats',
    component: () => import('../pages/mobile/parent-center/share-stats/index.vue'),
    meta: {
      title: '分享统计',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/feedback',
    name: 'MobileParentFeedback',
    component: () => import('../pages/mobile/parent-center/feedback/index.vue'),
    meta: {
      title: '意见反馈',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/profile',
    name: 'MobileParentProfile',
    component: () => import('../pages/mobile/parent-center/profile/index.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/assessment/report',
    name: 'MobileParentAssessmentReport',
    component: () => import('../pages/mobile/parent-center/assessment/report.vue'),
    meta: {
      title: '测评报告',
      requiresAuth: true,
      role: ['parent'],
      hideInMenu: true
    }
  },
  {
    path: '/mobile/parent-center/assessment/growth-trajectory',
    name: 'MobileParentGrowthTrajectory',
    component: () => import('../pages/mobile/parent-center/assessment/growth-trajectory.vue'),
    meta: {
      title: '成长轨迹',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/children/followup',
    name: 'MobileParentChildrenFollowup',
    component: () => import('../pages/mobile/parent-center/children/followup.vue'),
    meta: {
      title: '孩子跟进',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/children/growth',
    name: 'MobileParentChildrenGrowth',
    component: () => import('../pages/mobile/parent-center/children/growth.vue'),
    meta: {
      title: '孩子成长',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/games/records',
    name: 'MobileParentGamesRecords',
    component: () => import('../pages/mobile/parent-center/games/records.vue'),
    meta: {
      title: '游戏记录',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/games/achievements',
    name: 'MobileParentGamesAchievements',
    component: () => import('../pages/mobile/parent-center/games/achievements.vue'),
    meta: {
      title: '游戏成就',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/kindergarten-rewards',
    name: 'MobileParentKindergartenRewards',
    component: () => import('../pages/mobile/parent-center/kindergarten-rewards.vue'),
    meta: {
      title: '园所奖励',
      requiresAuth: true,
      role: ['parent']
    }
  },

  // ===== 教师端页面 =====
  {
    path: '/mobile/teacher-center',
    name: 'MobileTeacherCenter',
    component: () => import('../pages/mobile/teacher-center/index.vue'),
    meta: {
      title: '教师中心',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/dashboard',
    name: 'MobileTeacherDashboard',
    component: () => import('../pages/mobile/teacher-center/dashboard/index.vue'),
    meta: {
      title: '教师仪表板',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/activities',
    name: 'MobileTeacherActivities',
    component: () => import('../pages/mobile/teacher-center/activities/index.vue'),
    meta: {
      title: '活动管理',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/teaching',
    name: 'MobileTeacherTeaching',
    component: () => import('../pages/mobile/teacher-center/teaching/index.vue'),
    meta: {
      title: '教学工作',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/attendance',
    name: 'MobileTeacherAttendance',
    component: () => import('../pages/mobile/teacher-center/attendance/index.vue'),
    meta: {
      title: '考勤管理',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/customer-pool',
    name: 'MobileTeacherCustomerPool',
    component: () => import('../pages/mobile/teacher-center/customer-pool/index.vue'),
    meta: {
      title: '客户池',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/customer-tracking',
    name: 'MobileTeacherCustomerTracking',
    component: () => import('../pages/mobile/teacher-center/customer-tracking/index.vue'),
    meta: {
      title: '客户跟进',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/tasks',
    name: 'MobileTeacherTasks',
    component: () => import('../pages/mobile/teacher-center/tasks/index.vue'),
    meta: {
      title: '任务管理',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/tasks/create',
    name: 'MobileTeacherTaskCreate',
    component: () => import('../pages/mobile/teacher-center/tasks/create.vue'),
    meta: {
      title: '新建任务',
      requiresAuth: true,
      role: ['teacher'],
      backPath: '/mobile/teacher-center/tasks'
    }
  },
  {
    path: '/mobile/teacher-center/tasks/detail',
    name: 'MobileTeacherTaskDetail',
    component: () => import('../pages/mobile/teacher-center/tasks/detail.vue'),
    meta: {
      title: '任务详情',
      requiresAuth: true,
      role: ['teacher'],
      backPath: '/mobile/teacher-center/tasks'
    }
  },
  {
    path: '/mobile/teacher-center/tasks/edit',
    name: 'MobileTeacherTaskEdit',
    component: () => import('../pages/mobile/teacher-center/tasks/edit.vue'),
    meta: {
      title: '编辑任务',
      requiresAuth: true,
      role: ['teacher'],
      backPath: '/mobile/teacher-center/tasks'
    }
  },
  {
    path: '/mobile/teacher-center/performance-rewards',
    name: 'MobileTeacherPerformanceRewards',
    component: () => import('../pages/mobile/teacher-center/performance-rewards/index.vue'),
    meta: {
      title: '绩效奖励',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/notifications',
    name: 'MobileTeacherNotifications',
    component: () => import('../pages/mobile/teacher-center/notifications/index.vue'),
    meta: {
      title: '通知消息',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/enrollment',
    name: 'MobileTeacherEnrollment',
    component: () => import('../pages/mobile/teacher-center/enrollment/index.vue'),
    meta: {
      title: '招生协助',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/appointment-management',
    name: 'MobileTeacherAppointmentManagement',
    component: () => import('../pages/mobile/teacher-center/appointment-management/index.vue'),
    meta: {
      title: '预约管理',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/class-contacts',
    name: 'MobileTeacherClassContacts',
    component: () => import('../pages/mobile/teacher-center/class-contacts/index.vue'),
    meta: {
      title: '班级联系',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/creative-curriculum',
    name: 'MobileTeacherCreativeCurriculum',
    component: () => import('../pages/mobile/teacher-center/creative-curriculum/index.vue'),
    meta: {
      title: '创意课程',
      requiresAuth: true,
      role: ['teacher']
    }
  }
]

export default mobileRoutes