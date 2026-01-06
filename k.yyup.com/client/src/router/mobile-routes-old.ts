import { RouteRecordRaw } from 'vue-router'

/**
 * 移动端路由配置
 * 所有移动端页面路径以 /mobile 开头
 * 已实现页面完整功能，未实现页面保留路由结构待后续开发
 */

// 通用页面
export const mobileRoutes: Array<RouteRecordRaw> = [
  {
    path: '/mobile',
    redirect: '/mobile/centers'
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
      title: '活动管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/ai-center',
    name: 'MobileAICenter',
    component: () => import('../pages/mobile/centers/ai-center/index.vue'),
    meta: {
      title: 'AI中心',
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
      role: ['admin', 'principal']
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
    path: '/mobile/centers/enrollment-center',
    name: 'MobileEnrollmentCenter',
    component: () => import('../pages/mobile/centers/enrollment-center/index.vue'),
    meta: {
      title: '招生管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/finance-center',
    name: 'MobileFinanceCenter',
    component: () => import('../pages/mobile/centers/finance-center/index.vue'),
    meta: {
      title: '财务管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/marketing-center',
    name: 'MobileMarketingCenter',
    component: () => import('../pages/mobile/centers/marketing-center/index.vue'),
    meta: {
      title: '营销中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/student-center',
    name: 'MobileStudentCenter',
    component: () => import('../pages/mobile/centers/student-center/index.vue'),
    meta: {
      title: '学生管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/centers/teacher-center',
    name: 'MobileCentersTeacherCenter',
    component: () => import('../pages/mobile/centers/teaching-center/index.vue'),
    meta: {
      title: '教师管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  // ===== Enrollment模块移动端路由 =====
  {
    path: '/mobile/enrollment',
    name: 'MobileEnrollmentHome',
    component: () => import('../pages/mobile/enrollment/index.vue'),
    meta: {
      title: '招生首页',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/create',
    name: 'MobileEnrollmentCreate',
    component: () => import('../pages/mobile/enrollment/create.vue'),
    meta: {
      title: '创建招生',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/detail',
    name: 'MobileEnrollmentDetail',
    component: () => import('../pages/mobile/enrollment/detail.vue'),
    meta: {
      title: '招生详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-list',
    name: 'MobileEnrollmentList',
    component: () => import('../pages/mobile/enrollment/enrollment-list/index.vue'),
    meta: {
      title: '招生列表',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-funnel',
    name: 'MobileEnrollmentFunnel',
    component: () => import('../pages/mobile/enrollment/enrollment-funnel/index.vue'),
    meta: {
      title: '漏斗分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-strategy',
    name: 'MobileEnrollmentStrategy',
    component: () => import('../pages/mobile/enrollment/enrollment-strategy/index.vue'),
    meta: {
      title: '个性化策略',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-automation',
    name: 'MobileEnrollmentAutomation',
    component: () => import('../pages/mobile/enrollment/enrollment-automation.vue'),
    meta: {
      title: '自动跟进',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-index',
    name: 'MobileEnrollmentPlanIndex',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-index.vue'),
    meta: {
      title: '招生计划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-create',
    name: 'MobileEnrollmentPlanCreate',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-create.vue'),
    meta: {
      title: '创建招生计划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-list',
    name: 'MobileEnrollmentPlanList',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-list.vue'),
    meta: {
      title: '招生计划列表',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-detail/:id',
    name: 'MobileEnrollmentPlanDetail',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-detail.vue'),
    meta: {
      title: '招生计划详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-edit/:id',
    name: 'MobileEnrollmentPlanEdit',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-edit.vue'),
    meta: {
      title: '编辑招生计划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-analytics',
    name: 'MobileEnrollmentPlanAnalytics',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-analytics/index.vue'),
    meta: {
      title: '招生计划分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-evaluation',
    name: 'MobileEnrollmentPlanEvaluation',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-evaluation/index.vue'),
    meta: {
      title: '招生计划评估',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-forecast',
    name: 'MobileEnrollmentPlanForecast',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-forecast/index.vue'),
    meta: {
      title: '招生计划预测',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-management',
    name: 'MobileEnrollmentPlanManagement',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-management/index.vue'),
    meta: {
      title: '招生计划管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-optimization',
    name: 'MobileEnrollmentPlanOptimization',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-optimization/index.vue'),
    meta: {
      title: '招生计划优化',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-quota',
    name: 'MobileEnrollmentPlanQuota',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-quota/index.vue'),
    meta: {
      title: '招生名额配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-simulation',
    name: 'MobileEnrollmentPlanSimulation',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-simulation.vue'),
    meta: {
      title: '招生计划模拟',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-smart-planning',
    name: 'MobileEnrollmentPlanSmartPlanning',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-smart-planning.vue'),
    meta: {
      title: '智能招生规划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-plan-statistics',
    name: 'MobileEnrollmentPlanStatistics',
    component: () => import('../pages/mobile/enrollment/enrollment-plan-statistics.vue'),
    meta: {
      title: '招生统计',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-application',
    name: 'MobileEnrollmentApplication',
    component: () => import('../pages/mobile/enrollment/enrollment-application.vue'),
    meta: {
      title: '入园申请',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-interview',
    name: 'MobileEnrollmentInterview',
    component: () => import('../pages/mobile/enrollment/enrollment-interview.vue'),
    meta: {
      title: '面试安排',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/enrollment/enrollment-review',
    name: 'MobileEnrollmentReview',
    component: () => import('../pages/mobile/enrollment/enrollment-review.vue'),
    meta: {
      title: '审核管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== 教师中心移动端路由 =====
  {
    path: '/mobile/teacher-center',
    name: 'MobileTeacherCenterHome',
    component: () => import('../pages/mobile/teacher-center/index.vue'),
    meta: {
      title: '教师中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/teacher-center/dashboard',
    name: 'MobileTeacherDashboard',
    component: () => import('../pages/mobile/teacher-center/dashboard/index.vue'),
    meta: {
      title: '教师工作台',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/teacher-center/attendance',
    name: 'MobileTeacherAttendance',
    component: () => import('../pages/mobile/teacher-center/attendance/index.vue'),
    meta: {
      title: '考勤管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/teacher-center/tasks',
    name: 'MobileTeacherTasks',
    component: () => import('../pages/mobile/teacher-center/tasks/index.vue'),
    meta: {
      title: '任务管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/teacher-center/notifications',
    name: 'MobileTeacherNotifications',
    component: () => import('../pages/mobile/teacher-center/notifications/index.vue'),
    meta: {
      title: '消息通知',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== 家长中心移动端路由 =====
  {
    path: '/mobile/parent-center',
    name: 'MobileParentCenterHome',
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
      title: '家长工作台',
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
    path: '/mobile/parent-center/children',
    name: 'MobileParentChildren',
    component: () => import('../pages/mobile/parent-center/children/index.vue'),
    meta: {
      title: '我的孩子',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/assessment',
    name: 'MobileParentAssessment',
    component: () => import('../pages/mobile/parent-center/assessment/index.vue'),
    meta: {
      title: '成长评估',
      requiresAuth: true,
      role: ['parent']
    }
  },
  {
    path: '/mobile/parent-center/activities',
    name: 'MobileParentActivities',
    component: () => import('../pages/mobile/parent-center/activities/index.vue'),
    meta: {
      title: '活动报名',
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
    path: '/mobile/parent-center/notifications',
    name: 'MobileParentNotifications',
    component: () => import('../pages/mobile/parent-center/notifications/index.vue'),
    meta: {
      title: '消息通知',
      requiresAuth: true,
      role: ['parent']
    }
  },
  // 新增家长端页面路由
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
    path: '/mobile/parent-center/profile',
    name: 'MobileParentProfile',
    component: () => import('../pages/mobile/parent-center/profile/index.vue'),
    meta: {
      title: '个人资料',
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
  // 新增教师端页面路由
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
    path: '/mobile/teacher-center/creative-curriculum',
    name: 'MobileTeacherCreativeCurriculum',
    component: () => import('../pages/mobile/teacher-center/creative-curriculum/index.vue'),
    meta: {
      title: '创意课程',
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
    path: '/mobile/teacher-center/enrollment',
    name: 'MobileTeacherEnrollment',
    component: () => import('../pages/mobile/teacher-center/enrollment/index.vue'),
    meta: {
      title: '招生管理',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/performance-rewards',
    name: 'MobileTeacherPerformanceRewards',
    component: () => import('../pages/mobile/teacher-center/performance-rewards/index.vue'),
    meta: {
      title: '绩效考核',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  {
    path: '/mobile/teacher-center/teaching',
    name: 'MobileTeacherTeaching',
    component: () => import('../pages/mobile/teacher-center/teaching/index.vue'),
    meta: {
      title: '教学管理',
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
      title: '班级通讯录',
      requiresAuth: true,
      role: ['teacher']
    }
  },
  // 新增centers页面路由
  {
    path: '/mobile/centers/ai-billing-center',
    name: 'MobileCentersAIBillingCenter',
    component: () => import('../pages/mobile/centers/ai-billing-center/index.vue'),
    meta: {
      title: 'AI计费中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/attendance-center',
    name: 'MobileCentersAttendanceCenter',
    component: () => import('../pages/mobile/centers/attendance-center/index.vue'),
    meta: {
      title: '考勤中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/call-center',
    name: 'MobileCentersCallCenter',
    component: () => import('../pages/mobile/centers/call-center/index.vue'),
    meta: {
      title: '呼叫中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/customer-pool-center',
    name: 'MobileCentersCustomerPoolCenter',
    component: () => import('../pages/mobile/centers/customer-pool-center/index.vue'),
    meta: {
      title: '客户池中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/document-center',
    name: 'MobileCentersDocumentCenter',
    component: () => import('../pages/mobile/centers/document-center/index.vue'),
    meta: {
      title: '文档中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/inspection-center',
    name: 'MobileCentersInspectionCenter',
    component: () => import('../pages/mobile/centers/inspection-center/index.vue'),
    meta: {
      title: '巡检中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/my-task-center',
    name: 'MobileCentersMyTaskCenter',
    component: () => import('../pages/mobile/centers/my-task-center/index.vue'),
    meta: {
      title: '我的任务',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/notification-center',
    name: 'MobileCentersNotificationCenter',
    component: () => import('../pages/mobile/centers/notification-center/index.vue'),
    meta: {
      title: '通知中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/permission-center',
    name: 'MobileCentersPermissionCenter',
    component: () => import('../pages/mobile/centers/permission-center/index.vue'),
    meta: {
      title: '权限中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/photo-album-center',
    name: 'MobileCentersPhotoAlbumCenter',
    component: () => import('../pages/mobile/centers/photo-album-center/index.vue'),
    meta: {
      title: '相册中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/principal-center',
    name: 'MobileCentersPrincipalCenter',
    component: () => import('../pages/mobile/centers/principal-center/index.vue'),
    meta: {
      title: '园长中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/schedule-center',
    name: 'MobileCentersScheduleCenter',
    component: () => import('../pages/mobile/centers/schedule-center/index.vue'),
    meta: {
      title: '排课中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/settings-center',
    name: 'MobileCentersSettingsCenter',
    component: () => import('../pages/mobile/centers/settings-center/index.vue'),
    meta: {
      title: '设置中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/system-center',
    name: 'MobileCentersSystemCenter',
    component: () => import('../pages/mobile/centers/system-center/index.vue'),
    meta: {
      title: '系统中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/system-log-center',
    name: 'MobileCentersSystemLogCenter',
    component: () => import('../pages/mobile/centers/system-log-center/index.vue'),
    meta: {
      title: '系统日志',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/teaching-center',
    name: 'MobileCentersTeachingCenter',
    component: () => import('../pages/mobile/centers/teaching-center/index.vue'),
    meta: {
      title: '教学中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/user-center',
    name: 'MobileCentersUserCenter',
    component: () => import('../pages/mobile/centers/user-center/index.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/centers/business-center',
    name: 'MobileCentersBusinessCenter',
    component: () => import('../pages/mobile/centers/business-center/index.vue'),
    meta: {
      title: '业务中心',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  // ===== 活动管理移动端路由 =====
  {
    path: '/mobile/activity/activity-index',
    name: 'MobileActivityActivityIndex',
    component: () => import('../pages/mobile/activity/activity-index/index.vue'),
    meta: {
      title: '活动首页',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-create',
    name: 'MobileActivityActivityCreate',
    component: () => import('../pages/mobile/activity/activity-create/index.vue'),
    meta: {
      title: '活动创建',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-detail/:id',
    name: 'MobileActivityActivityDetail',
    component: () => import('../pages/mobile/activity/activity-detail/index.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-edit/:id',
    name: 'MobileActivityActivityEdit',
    component: () => import('../pages/mobile/activity/activity-edit/index.vue'),
    meta: {
      title: '活动编辑',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-list',
    name: 'MobileActivityActivityList',
    component: () => import('../pages/mobile/activity/activity-list/index.vue'),
    meta: {
      title: '活动列表',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-register',
    name: 'MobileActivityActivityRegister',
    component: () => import('../pages/mobile/activity/activity-register/index.vue'),
    meta: {
      title: '活动报名',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-registrations',
    name: 'MobileActivityActivityRegistrations',
    component: () => import('../pages/mobile/activity/activity-registrations/index.vue'),
    meta: {
      title: '报名管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-checkin',
    name: 'MobileActivityActivityCheckin',
    component: () => import('../pages/mobile/activity/activity-checkin/index.vue'),
    meta: {
      title: '活动签到',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-analytics',
    name: 'MobileActivityActivityAnalytics',
    component: () => import('../pages/mobile/activity/activity-analytics/index.vue'),
    meta: {
      title: '活动分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-publish',
    name: 'MobileActivityActivityPublish',
    component: () => import('../pages/mobile/activity/activity-publish/index.vue'),
    meta: {
      title: '活动发布',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-template',
    name: 'MobileActivityActivityTemplate',
    component: () => import('../pages/mobile/activity/activity-template/index.vue'),
    meta: {
      title: '活动模板',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-participants',
    name: 'MobileActivityActivityParticipants',
    component: () => import('../pages/mobile/activity/activity-participants/index.vue'),
    meta: {
      title: '参与者管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-approval',
    name: 'MobileActivityActivityApproval',
    component: () => import('../pages/mobile/activity/activity-approval/index.vue'),
    meta: {
      title: '活动审核',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/activity/activity-evaluation',
    name: 'MobileActivityActivityEvaluation',
    component: () => import('../pages/mobile/activity/activity-evaluation/index.vue'),
    meta: {
      title: '活动评价',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-reports',
    name: 'MobileActivityActivityReports',
    component: () => import('../pages/mobile/activity/activity-reports/index.vue'),
    meta: {
      title: '活动报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/activity/activity-calendar',
    name: 'MobileActivityActivityCalendar',
    component: () => import('../pages/mobile/activity/activity-calendar/index.vue'),
    meta: {
      title: '活动日历',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-certificate',
    name: 'MobileActivityActivityCertificate',
    component: () => import('../pages/mobile/activity/activity-certificate/index.vue'),
    meta: {
      title: '活动证书',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-photos',
    name: 'MobileActivityActivityPhotos',
    component: () => import('../pages/mobile/activity/activity-photos/index.vue'),
    meta: {
      title: '活动相册',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-feedback',
    name: 'MobileActivityActivityFeedback',
    component: () => import('../pages/mobile/activity/activity-feedback/index.vue'),
    meta: {
      title: '活动反馈',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-statistics',
    name: 'MobileActivityActivityStatistics',
    component: () => import('../pages/mobile/activity/activity-statistics/index.vue'),
    meta: {
      title: '活动统计',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-comments',
    name: 'MobileActivityActivityComments',
    component: () => import('../pages/mobile/activity/activity-comments/index.vue'),
    meta: {
      title: '活动评论',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/activity/activity-tags',
    name: 'MobileActivityActivityTags',
    component: () => import('../pages/mobile/activity/activity-tags/index.vue'),
    meta: {
      title: '活动标签',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/activity/activity-search',
    name: 'MobileActivityActivitySearch',
    component: () => import('../pages/mobile/activity/activity-search/index.vue'),
    meta: {
      title: '活动搜索',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },

  // ===== AI模块移动端路由 =====
  {
    path: '/mobile/ai/ai-index',
    name: 'MobileAiAiIndex',
    component: () => import('../pages/mobile/ai/ai-index/index.vue'),
    meta: {
      title: 'AI首页',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-assistant',
    name: 'MobileAiAiAssistant',
    component: () => import('../pages/mobile/ai/ai-assistant/index.vue'),
    meta: {
      title: 'AI助手',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/ai/ai-chat',
    name: 'MobileAiAiChat',
    component: () => import('../pages/mobile/ai/ai-chat/index.vue'),
    meta: {
      title: 'AI对话',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/ai/ai-query',
    name: 'MobileAiAiQuery',
    component: () => import('../pages/mobile/ai/ai-query/index.vue'),
    meta: {
      title: 'AI查询',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-analytics',
    name: 'MobileAiAiAnalytics',
    component: () => import('../pages/mobile/ai/ai-analytics/index.vue'),
    meta: {
      title: 'AI分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-automation',
    name: 'MobileAiAiAutomation',
    component: () => import('../pages/mobile/ai/ai-automation/index.vue'),
    meta: {
      title: 'AI自动化',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-tools',
    name: 'MobileAiAiTools',
    component: () => import('../pages/mobile/ai/ai-tools/index.vue'),
    meta: {
      title: 'AI工具',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-memory',
    name: 'MobileAiAiMemory',
    component: () => import('../pages/mobile/ai/ai-memory/index.vue'),
    meta: {
      title: 'AI记忆管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-models',
    name: 'MobileAiAiModels',
    component: () => import('../pages/mobile/ai/ai-models/index.vue'),
    meta: {
      title: 'AI模型管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-monitoring',
    name: 'MobileAiAiMonitoring',
    component: () => import('../pages/mobile/ai/ai-monitoring/index.vue'),
    meta: {
      title: 'AI监控中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-nlp',
    name: 'MobileAiAiNlp',
    component: () => import('../pages/mobile/ai/ai-nlp/index.vue'),
    meta: {
      title: 'AI自然语言处理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-deep-learning',
    name: 'MobileAiAiDeepLearning',
    component: () => import('../pages/mobile/ai/ai-deep-learning/index.vue'),
    meta: {
      title: 'AI深度学习',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-predictions',
    name: 'MobileAiAiPredictions',
    component: () => import('../pages/mobile/ai/ai-predictions/index.vue'),
    meta: {
      title: 'AI预测',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-visualization',
    name: 'MobileAiAiVisualization',
    component: () => import('../pages/mobile/ai/ai-visualization/index.vue'),
    meta: {
      title: 'AI可视化',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-website-automation',
    name: 'MobileAiAiWebsiteAutomation',
    component: () => import('../pages/mobile/ai/ai-website-automation/index.vue'),
    meta: {
      title: 'AI网站自动化',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-document',
    name: 'MobileAiAiDocument',
    component: () => import('../pages/mobile/ai/ai-document/index.vue'),
    meta: {
      title: '文档导入',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-expert',
    name: 'MobileAiAiExpert',
    component: () => import('../pages/mobile/ai/ai-expert/index.vue'),
    meta: {
      title: '专家咨询',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher', 'parent']
    }
  },
  {
    path: '/mobile/ai/ai-settings',
    name: 'MobileAiAiSettings',
    component: () => import('../pages/mobile/ai/ai-settings/index.vue'),
    meta: {
      title: 'AI设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-website-elements',
    name: 'MobileAiAiWebsiteElements',
    component: () => import('../pages/mobile/ai/ai-website-elements/index.vue'),
    meta: {
      title: 'AI网站元素识别',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-website-screenshots',
    name: 'MobileAiAiWebsiteScreenshots',
    component: () => import('../pages/mobile/ai/ai-website-screenshots/index.vue'),
    meta: {
      title: 'AI网站截图分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-website-tasks',
    name: 'MobileAiAiWebsiteTasks',
    component: () => import('../pages/mobile/ai/ai-website-tasks/index.vue'),
    meta: {
      title: 'AI网站任务执行',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-training',
    name: 'MobileAiAiTraining',
    component: () => import('../pages/mobile/ai/ai-training/index.vue'),
    meta: {
      title: 'AI模型训练',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-3d',
    name: 'MobileAiAi3d',
    component: () => import('../pages/mobile/ai/ai-3d/index.vue'),
    meta: {
      title: 'AI 3D分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-intelligent',
    name: 'MobileAiAiIntelligent',
    component: () => import('../pages/mobile/ai/ai-intelligent/index.vue'),
    meta: {
      title: 'AI智能化中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-evaluation',
    name: 'MobileAiAiEvaluation',
    component: () => import('../pages/mobile/ai/ai-evaluation/index.vue'),
    meta: {
      title: 'AI评估中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-optimizer',
    name: 'MobileAiAiOptimizer',
    component: () => import('../pages/mobile/ai/ai-optimizer/index.vue'),
    meta: {
      title: 'AI优化器',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/ai/ai-planner',
    name: 'MobileAiAiPlanner',
    component: () => import('../pages/mobile/ai/ai-planner/index.vue'),
    meta: {
      title: 'AI规划师',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Finance模块移动端路由 =====
  {
    path: '/mobile/finance/finance-index',
    name: 'MobileFinanceFinanceIndex',
    component: () => import('../pages/mobile/finance/finance-index.vue'),
    meta: {
      title: '财务首页',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-billing',
    name: 'MobileFinanceFinanceBilling',
    component: () => import('../pages/mobile/finance/finance-billing.vue'),
    meta: {
      title: '账单管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-invoice',
    name: 'MobileFinanceFinanceInvoice',
    component: () => import('../pages/mobile/finance/finance-invoice.vue'),
    meta: {
      title: '发票管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-payment',
    name: 'MobileFinanceFinancePayment',
    component: () => import('../pages/mobile/finance/finance-payment.vue'),
    meta: {
      title: '收款管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-expense',
    name: 'MobileFinanceFinanceExpense',
    component: () => import('../pages/mobile/finance/finance-expense.vue'),
    meta: {
      title: '支出管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-budget',
    name: 'MobileFinanceFinanceBudget',
    component: () => import('../pages/mobile/finance/finance-budget.vue'),
    meta: {
      title: '预算管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  // ===== Finance模块第3批：财务报表、分析、预测 =====
  {
    path: '/mobile/finance/finance-reports',
    name: 'MobileFinanceFinanceReports',
    component: () => import('../pages/mobile/finance/finance-reports/index.vue'),
    meta: {
      title: '财务报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-reports/generate',
    name: 'MobileFinanceReportsGenerate',
    component: () => import('../pages/mobile/finance/finance-reports/generate.vue'),
    meta: {
      title: '生成报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-reports/preview',
    name: 'MobileFinanceReportsPreview',
    component: () => import('../pages/mobile/finance/finance-reports/preview.vue'),
    meta: {
      title: '预览报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-reports/edit',
    name: 'MobileFinanceReportsEdit',
    component: () => import('../pages/mobile/finance/finance-reports/edit.vue'),
    meta: {
      title: '编辑报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-reports/view',
    name: 'MobileFinanceReportsView',
    component: () => import('../pages/mobile/finance/finance-reports/view.vue'),
    meta: {
      title: '查看报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-reports/schedule',
    name: 'MobileFinanceReportsSchedule',
    component: () => import('../pages/mobile/finance/finance-reports/schedule.vue'),
    meta: {
      title: '定时报表',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  {
    path: '/mobile/finance/finance-analytics',
    name: 'MobileFinanceFinanceAnalytics',
    component: () => import('../pages/mobile/finance/finance-analytics/index.vue'),
    meta: {
      title: '财务分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/project-detail/:projectId',
    name: 'MobileFinanceAnalyticsProjectDetail',
    component: () => import('../pages/mobile/finance/finance-analytics/project-detail.vue'),
    meta: {
      title: '项目分析详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/customer-detail/:customerId',
    name: 'MobileFinanceAnalyticsCustomerDetail',
    component: () => import('../pages/mobile/finance/finance-analytics/customer-detail.vue'),
    meta: {
      title: '客户分析详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/ratio-detail',
    name: 'MobileFinanceAnalyticsRatioDetail',
    component: () => import('../pages/mobile/finance/finance-analytics/ratio-detail.vue'),
    meta: {
      title: '财务比率详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/trend-analysis',
    name: 'MobileFinanceAnalyticsTrendAnalysis',
    component: () => import('../pages/mobile/finance/finance-analytics/trend-analysis.vue'),
    meta: {
      title: '趋势分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/department-analysis',
    name: 'MobileFinanceAnalyticsDepartmentAnalysis',
    component: () => import('../pages/mobile/finance/finance-analytics/department-analysis.vue'),
    meta: {
      title: '部门分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-analytics/breakeven-analysis',
    name: 'MobileFinanceAnalyticsBreakevenAnalysis',
    component: () => import('../pages/mobile/finance/finance-analytics/breakeven-analysis.vue'),
    meta: {
      title: '盈亏平衡分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  {
    path: '/mobile/finance/finance-forecast',
    name: 'MobileFinanceFinanceForecast',
    component: () => import('../pages/mobile/finance/finance-forecast/index.vue'),
    meta: {
      title: '财务预测',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/config',
    name: 'MobileFinanceForecastConfig',
    component: () => import('../pages/mobile/finance/finance-forecast/config.vue'),
    meta: {
      title: '预测配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/config-detail/:configId',
    name: 'MobileFinanceForecastConfigDetail',
    component: () => import('../pages/mobile/finance/finance-forecast/config-detail.vue'),
    meta: {
      title: '配置详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/config-edit/:configId',
    name: 'MobileFinanceForecastConfigEdit',
    component: () => import('../pages/mobile/finance/finance-forecast/config-edit.vue'),
    meta: {
      title: '编辑配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/scenario-comparison',
    name: 'MobileFinanceForecastScenarioComparison',
    component: () => import('../pages/mobile/finance/finance-forecast/scenario-comparison.vue'),
    meta: {
      title: '场景对比',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/model-config',
    name: 'MobileFinanceForecastModelConfig',
    component: () => import('../pages/mobile/finance/finance-forecast/model-config.vue'),
    meta: {
      title: '模型配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/report',
    name: 'MobileFinanceForecastReport',
    component: () => import('../pages/mobile/finance/finance-forecast/report.vue'),
    meta: {
      title: '预测报告',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/cashflow-analysis',
    name: 'MobileFinanceForecastCashflowAnalysis',
    component: () => import('../pages/mobile/finance/finance-forecast/cashflow-analysis.vue'),
    meta: {
      title: '现金流分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-forecast/history-detail/:historyId',
    name: 'MobileFinanceForecastHistoryDetail',
    component: () => import('../pages/mobile/finance/finance-forecast/history-detail.vue'),
    meta: {
      title: '预测历史详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  // ===== Finance模块第4批：财务审核审批功能 =====
  {
    path: '/mobile/finance/audit',
    name: 'MobileFinanceAudit',
    component: () => import('../pages/mobile/finance/audit/index.vue'),
    meta: {
      title: '财务审计',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/plan/create',
    name: 'MobileFinanceAuditPlanCreate',
    component: () => import('../pages/mobile/finance/audit/plan-create.vue'),
    meta: {
      title: '创建审计计划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/plan/:id',
    name: 'MobileFinanceAuditPlanDetail',
    component: () => import('../pages/mobile/finance/audit/plan-detail.vue'),
    meta: {
      title: '审计计划详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/plan/:id/edit',
    name: 'MobileFinanceAuditPlanEdit',
    component: () => import('../pages/mobile/finance/audit/plan-edit.vue'),
    meta: {
      title: '编辑审计计划',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/project/create',
    name: 'MobileFinanceAuditProjectCreate',
    component: () => import('../pages/mobile/finance/audit/project-create.vue'),
    meta: {
      title: '创建审计项目',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/project/:id',
    name: 'MobileFinanceAuditProjectDetail',
    component: () => import('../pages/mobile/finance/audit/project-detail.vue'),
    meta: {
      title: '审计项目详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/project/:id/continue',
    name: 'MobileFinanceAuditProjectContinue',
    component: () => import('../pages/mobile/finance/audit/project-continue.vue'),
    meta: {
      title: '继续审计',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/project/:id/work-papers',
    name: 'MobileFinanceAuditWorkPapers',
    component: () => import('../pages/mobile/finance/audit/work-papers.vue'),
    meta: {
      title: '审计工作底稿',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/finding/create',
    name: 'MobileFinanceAuditFindingCreate',
    component: () => import('../pages/mobile/finance/audit/finding-create.vue'),
    meta: {
      title: '记录审计发现',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/finding/:id',
    name: 'MobileFinanceAuditFindingDetail',
    component: () => import('../pages/mobile/finance/audit/finding-detail.vue'),
    meta: {
      title: '审计发现详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/finding/:id/rectification',
    name: 'MobileFinanceAuditFindingRectification',
    component: () => import('../pages/mobile/finance/audit/finding-rectification.vue'),
    meta: {
      title: '整改跟踪',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/finding/:id/evidence',
    name: 'MobileFinanceAuditFindingEvidence',
    component: () => import('../pages/mobile/finance/audit/finding-evidence.vue'),
    meta: {
      title: '审计证据',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/report/generate',
    name: 'MobileFinanceAuditReportGenerate',
    component: () => import('../pages/mobile/finance/audit/report-generate.vue'),
    meta: {
      title: '生成审计报告',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/report/:id',
    name: 'MobileFinanceAuditReportDetail',
    component: () => import('../pages/mobile/finance/audit/report-detail.vue'),
    meta: {
      title: '审计报告详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/report/:id/share',
    name: 'MobileFinanceAuditReportShare',
    component: () => import('../pages/mobile/finance/audit/report-share.vue'),
    meta: {
      title: '分享审计报告',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/audit/risk-assessment',
    name: 'MobileFinanceAuditRiskAssessment',
    component: () => import('../pages/mobile/finance/audit/risk-assessment.vue'),
    meta: {
      title: '风险评估',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  {
    path: '/mobile/finance/approval',
    name: 'MobileFinanceApproval',
    component: () => import('../pages/mobile/finance/approval/index.vue'),
    meta: {
      title: '财务审批',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/detail/:id',
    name: 'MobileFinanceApprovalDetail',
    component: () => import('../pages/mobile/finance/approval/detail.vue'),
    meta: {
      title: '审批详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/my-applications',
    name: 'MobileFinanceApprovalMyApplications',
    component: () => import('../pages/mobile/finance/approval/my-applications.vue'),
    meta: {
      title: '我的申请',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/expense/create',
    name: 'MobileFinanceApprovalExpenseCreate',
    component: () => import('../pages/mobile/finance/approval/expense-create.vue'),
    meta: {
      title: '新建报销申请',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/batch-settings',
    name: 'MobileFinanceApprovalBatchSettings',
    component: () => import('../pages/mobile/finance/approval/batch-settings.vue'),
    meta: {
      title: '批量审批设置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/templates',
    name: 'MobileFinanceApprovalTemplates',
    component: () => import('../pages/mobile/finance/approval/templates.vue'),
    meta: {
      title: '审批模板管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/process-config',
    name: 'MobileFinanceApprovalProcessConfig',
    component: () => import('../pages/mobile/finance/approval/process-config.vue'),
    meta: {
      title: '流程配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/approval/statistics',
    name: 'MobileFinanceApprovalStatistics',
    component: () => import('../pages/mobile/finance/approval/statistics.vue'),
    meta: {
      title: '审批统计',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  {
    path: '/mobile/finance/tax',
    name: 'MobileFinanceTax',
    component: () => import('../pages/mobile/finance/tax/index.vue'),
    meta: {
      title: '税务管理',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/calendar',
    name: 'MobileFinanceTaxCalendar',
    component: () => import('../pages/mobile/finance/tax/calendar.vue'),
    meta: {
      title: '税务申报日历',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/type/create',
    name: 'MobileFinanceTaxTypeCreate',
    component: () => import('../pages/mobile/finance/tax/type-create.vue'),
    meta: {
      title: '添加税种',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/type/:id',
    name: 'MobileFinanceTaxTypeDetail',
    component: () => import('../pages/mobile/finance/tax/type-detail.vue'),
    meta: {
      title: '税种详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/type/:id/edit',
    name: 'MobileFinanceTaxTypeEdit',
    component: () => import('../pages/mobile/finance/tax/type-edit.vue'),
    meta: {
      title: '编辑税种',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/rate-settings',
    name: 'MobileFinanceTaxRateSettings',
    component: () => import('../pages/mobile/finance/tax/rate-settings.vue'),
    meta: {
      title: '税率配置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/declare/:id',
    name: 'MobileFinanceTaxDeclare',
    component: () => import('../pages/mobile/finance/tax/declare.vue'),
    meta: {
      title: '纳税申报',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/declaration/create',
    name: 'MobileFinanceTaxDeclarationCreate',
    component: () => import('../pages/mobile/finance/tax/declaration-create.vue'),
    meta: {
      title: '新建纳税申报',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/declaration/batch',
    name: 'MobileFinanceTaxDeclarationBatch',
    component: () => import('../pages/mobile/finance/tax/declaration-batch.vue'),
    meta: {
      title: '批量申报',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/declaration/:id',
    name: 'MobileFinanceTaxDeclarationDetail',
    component: () => import('../pages/mobile/finance/tax/declaration-detail.vue'),
    meta: {
      title: '申报详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/invoice/scan',
    name: 'MobileFinanceTaxInvoiceScan',
    component: () => import('../pages/mobile/finance/tax/invoice-scan.vue'),
    meta: {
      title: '扫描发票',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/invoice/import',
    name: 'MobileFinanceTaxInvoiceImport',
    component: () => import('../pages/mobile/finance/tax/invoice-import.vue'),
    meta: {
      title: '导入发票',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/invoice/verify-batch',
    name: 'MobileFinanceTaxInvoiceVerifyBatch',
    component: () => import('../pages/mobile/finance/tax/invoice-verify-batch.vue'),
    meta: {
      title: '批量认证发票',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/invoice/:id',
    name: 'MobileFinanceTaxInvoiceDetail',
    component: () => import('../pages/mobile/finance/tax/invoice-detail.vue'),
    meta: {
      title: '发票详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/planning/create',
    name: 'MobileFinanceTaxPlanningCreate',
    component: () => import('../pages/mobile/finance/tax/planning-create.vue'),
    meta: {
      title: '创建筹划方案',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/planning/:id',
    name: 'MobileFinanceTaxPlanningDetail',
    component: () => import('../pages/mobile/finance/tax/planning-detail.vue'),
    meta: {
      title: '筹划方案详情',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/planning/:id/analysis',
    name: 'MobileFinanceTaxPlanningAnalysis',
    component: () => import('../pages/mobile/finance/tax/planning-analysis.vue'),
    meta: {
      title: '效益分析',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/tax/calculator',
    name: 'MobileFinanceTaxCalculator',
    component: () => import('../pages/mobile/finance/tax/calculator.vue'),
    meta: {
      title: '税费计算器',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },

  // ===== Marketing营销模块 =====
  {
    path: '/mobile/marketing',
    name: 'MobileMarketingHome',
    redirect: '/mobile/marketing/marketing-index'
  },
  {
    path: '/mobile/marketing/marketing-index',
    name: 'MobileMarketingIndex',
    component: () => import('../pages/mobile/marketing/marketing-index/index.vue'),
    meta: {
      title: '营销首页',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-campaign',
    name: 'MobileMarketingCampaign',
    component: () => import('../pages/mobile/marketing/marketing-campaign/index.vue'),
    meta: {
      title: '营销活动',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-campaign/:id',
    name: 'MobileMarketingCampaignDetail',
    component: () => import('../pages/mobile/marketing/marketing-campaign/detail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-campaign/:id/edit',
    name: 'MobileMarketingCampaignEdit',
    component: () => import('../pages/mobile/marketing/marketing-campaign/edit.vue'),
    meta: {
      title: '编辑活动',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-template',
    name: 'MobileMarketingTemplate',
    component: () => import('../pages/mobile/marketing/marketing-template/index.vue'),
    meta: {
      title: '营销模板',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-template/:id',
    name: 'MobileMarketingTemplateDetail',
    component: () => import('../pages/mobile/marketing/marketing-template/detail.vue'),
    meta: {
      title: '模板详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-template/:id/edit',
    name: 'MobileMarketingTemplateEdit',
    component: () => import('../pages/mobile/marketing/marketing-template/edit.vue'),
    meta: {
      title: '编辑模板',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Marketing模块第2批：营销渠道和内容管理 =====
  {
    path: '/mobile/marketing/marketing-channel',
    name: 'MobileMarketingChannel',
    component: () => import('../pages/mobile/marketing/marketing-channel/index.vue'),
    meta: {
      title: '营销渠道',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/types',
    name: 'MobileMarketingChannelTypes',
    component: () => import('../pages/mobile/marketing/marketing-channel/types.vue'),
    meta: {
      title: '渠道类型管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/config',
    name: 'MobileMarketingChannelConfig',
    component: () => import('../pages/mobile/marketing/marketing-channel/config.vue'),
    meta: {
      title: '渠道配置设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/tracking',
    name: 'MobileMarketingChannelTracking',
    component: () => import('../pages/mobile/marketing/marketing-channel/tracking.vue'),
    meta: {
      title: '渠道效果追踪',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/optimization',
    name: 'MobileMarketingChannelOptimization',
    component: () => import('../pages/mobile/marketing/marketing-channel/optimization.vue'),
    meta: {
      title: '渠道优化建议',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/comparison',
    name: 'MobileMarketingChannelComparison',
    component: () => import('../pages/mobile/marketing/marketing-channel/comparison.vue'),
    meta: {
      title: '渠道对比分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/budget',
    name: 'MobileMarketingChannelBudget',
    component: () => import('../pages/mobile/marketing/marketing-channel/budget.vue'),
    meta: {
      title: '渠道预算管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/performance',
    name: 'MobileMarketingChannelPerformance',
    component: () => import('../pages/mobile/marketing/marketing-channel/performance.vue'),
    meta: {
      title: '渠道绩效评估',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/integration',
    name: 'MobileMarketingChannelIntegration',
    component: () => import('../pages/mobile/marketing/marketing-channel/integration.vue'),
    meta: {
      title: '渠道集成管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/guide',
    name: 'MobileMarketingChannelGuide',
    component: () => import('../pages/mobile/marketing/marketing-channel/guide.vue'),
    meta: {
      title: '渠道使用指南',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/create',
    name: 'MobileMarketingChannelCreate',
    component: () => import('../pages/mobile/marketing/marketing-channel/create.vue'),
    meta: {
      title: '创建渠道',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/import',
    name: 'MobileMarketingChannelImport',
    component: () => import('../pages/mobile/marketing/marketing-channel/import.vue'),
    meta: {
      title: '批量导入',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/analytics',
    name: 'MobileMarketingChannelAnalytics',
    component: () => import('../pages/mobile/marketing/marketing-channel/analytics.vue'),
    meta: {
      title: '渠道数据分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-channel/detail/:id',
    name: 'MobileMarketingChannelDetail',
    component: () => import('../pages/mobile/marketing/marketing-channel/detail.vue'),
    meta: {
      title: '渠道详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-content',
    name: 'MobileMarketingContent',
    component: () => import('../pages/mobile/marketing/marketing-content/index.vue'),
    meta: {
      title: '营销内容',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/create',
    name: 'MobileMarketingContentCreate',
    component: () => import('../pages/mobile/marketing/marketing-content/create.vue'),
    meta: {
      title: '创建内容',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/templates',
    name: 'MobileMarketingContentTemplates',
    component: () => import('../pages/mobile/marketing/marketing-content/templates.vue'),
    meta: {
      title: '内容模板',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/schedule',
    name: 'MobileMarketingContentSchedule',
    component: () => import('../pages/mobile/marketing/marketing-content/schedule.vue'),
    meta: {
      title: '定时发布',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/analytics',
    name: 'MobileMarketingContentAnalytics',
    component: () => import('../pages/mobile/marketing/marketing-content/analytics.vue'),
    meta: {
      title: '效果分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/approval',
    name: 'MobileMarketingContentApproval',
    component: () => import('../pages/mobile/marketing/marketing-content/approval.vue'),
    meta: {
      title: '审核流程',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/library',
    name: 'MobileMarketingContentLibrary',
    component: () => import('../pages/mobile/marketing/marketing-content/library.vue'),
    meta: {
      title: '素材库',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/detail/:id',
    name: 'MobileMarketingContentDetail',
    component: () => import('../pages/mobile/marketing/marketing-content/detail.vue'),
    meta: {
      title: '内容详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-content/edit/:id',
    name: 'MobileMarketingContentEdit',
    component: () => import('../pages/mobile/marketing/marketing-content/edit.vue'),
    meta: {
      title: '编辑内容',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/promotion-codes',
    name: 'MobilePromotionCodes',
    component: () => import('../pages/mobile/marketing/promotion-codes/index.vue'),
    meta: {
      title: '优惠券码',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/create',
    name: 'MobilePromotionCodesCreate',
    component: () => import('../pages/mobile/marketing/promotion-codes/create.vue'),
    meta: {
      title: '创建优惠券',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/batch',
    name: 'MobilePromotionCodesBatch',
    component: () => import('../pages/mobile/marketing/promotion-codes/batch.vue'),
    meta: {
      title: '批量生成',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/templates',
    name: 'MobilePromotionCodesTemplates',
    component: () => import('../pages/mobile/marketing/promotion-codes/templates.vue'),
    meta: {
      title: '模板管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/analytics',
    name: 'MobilePromotionCodesAnalytics',
    component: () => import('../pages/mobile/marketing/promotion-codes/analytics.vue'),
    meta: {
      title: '效果分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/import',
    name: 'MobilePromotionCodesImport',
    component: () => import('../pages/mobile/marketing/promotion-codes/import.vue'),
    meta: {
      title: '导入优惠券',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/export',
    name: 'MobilePromotionCodesExport',
    component: () => import('../pages/mobile/marketing/promotion-codes/export.vue'),
    meta: {
      title: '导出数据',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/rules',
    name: 'MobilePromotionCodesRules',
    component: () => import('../pages/mobile/marketing/promotion-codes/rules.vue'),
    meta: {
      title: '规则配置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/detail/:id',
    name: 'MobilePromotionCodesDetail',
    component: () => import('../pages/mobile/marketing/promotion-codes/detail.vue'),
    meta: {
      title: '优惠券详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/edit/:id',
    name: 'MobilePromotionCodesEdit',
    component: () => import('../pages/mobile/marketing/promotion-codes/edit.vue'),
    meta: {
      title: '编辑优惠券',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/promotion-codes/distribute/:id',
    name: 'MobilePromotionCodesDistribute',
    component: () => import('../pages/mobile/marketing/promotion-codes/distribute.vue'),
    meta: {
      title: '分发优惠券',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Marketing模块第3批：营销分析和自动化功能 =====
  {
    path: '/mobile/marketing/marketing-analytics',
    name: 'MobileMarketingAnalytics',
    component: () => import('../pages/mobile/marketing/marketing-analytics.vue'),
    meta: {
      title: '营销分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/dimension-analysis',
    name: 'MobileMarketingAnalyticsDimensionAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/dimension-analysis.vue'),
    meta: {
      title: '多维分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/comparison-analysis',
    name: 'MobileMarketingAnalyticsComparisonAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/comparison-analysis.vue'),
    meta: {
      title: '效果对比',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/behavior-analysis',
    name: 'MobileMarketingAnalyticsBehaviorAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/behavior-analysis.vue'),
    meta: {
      title: '行为分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/content-analysis',
    name: 'MobileMarketingAnalyticsContentAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/content-analysis.vue'),
    meta: {
      title: '内容分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/heatmap-analysis',
    name: 'MobileMarketingAnalyticsHeatmapAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/heatmap-analysis.vue'),
    meta: {
      title: '热力图分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/prediction-analysis',
    name: 'MobileMarketingAnalyticsPredictionAnalysis',
    component: () => import('../pages/mobile/marketing/analytics/prediction-analysis.vue'),
    meta: {
      title: '预测分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-analytics/custom-reports',
    name: 'MobileMarketingAnalyticsCustomReports',
    component: () => import('../pages/mobile/marketing/analytics/custom-reports.vue'),
    meta: {
      title: '自定义报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-automation',
    name: 'MobileMarketingAutomation',
    component: () => import('../pages/mobile/marketing/marketing-automation.vue'),
    meta: {
      title: '营销自动化',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/rules/create',
    name: 'MobileMarketingAutomationRulesCreate',
    component: () => import('../pages/mobile/marketing/automation/rules-create.vue'),
    meta: {
      title: '创建自动化规则',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/rules/:id',
    name: 'MobileMarketingAutomationRulesDetail',
    component: () => import('../pages/mobile/marketing/automation/rules-detail.vue'),
    meta: {
      title: '规则详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/journey/create',
    name: 'MobileMarketingAutomationJourneyCreate',
    component: () => import('../pages/mobile/marketing/automation/journey-create.vue'),
    meta: {
      title: '设计客户旅程',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/journey/:id',
    name: 'MobileMarketingAutomationJourneyDetail',
    component: () => import('../pages/mobile/marketing/automation/journey-detail.vue'),
    meta: {
      title: '旅程详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/outreach/create',
    name: 'MobileMarketingAutomationOutreachCreate',
    component: () => import('../pages/mobile/marketing/automation/outreach-create.vue'),
    meta: {
      title: '创建触达策略',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/outreach/:id',
    name: 'MobileMarketingAutomationOutreachDetail',
    component: () => import('../pages/mobile/marketing/automation/outreach-detail.vue'),
    meta: {
      title: '策略详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/abtest/create',
    name: 'MobileMarketingAutomationABTestCreate',
    component: () => import('../pages/mobile/marketing/automation/abtest-create.vue'),
    meta: {
      title: '创建A/B测试',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/abtest/:id',
    name: 'MobileMarketingAutomationABTestDetail',
    component: () => import('../pages/mobile/marketing/automation/abtest-detail.vue'),
    meta: {
      title: '测试详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-automation/reports',
    name: 'MobileMarketingAutomationReports',
    component: () => import('../pages/mobile/marketing/automation/reports.vue'),
    meta: {
      title: '自动化报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-funnel',
    name: 'MobileMarketingFunnel',
    component: () => import('../pages/mobile/marketing/marketing-funnel.vue'),
    meta: {
      title: '营销漏斗',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-funnel/comparison/add',
    name: 'MobileMarketingFunnelComparisonAdd',
    component: () => import('../pages/mobile/marketing/funnel/comparison-add.vue'),
    meta: {
      title: '添加漏斗对比',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-funnel/segment/create',
    name: 'MobileMarketingFunnelSegmentCreate',
    component: () => import('../pages/mobile/marketing/funnel/segment-create.vue'),
    meta: {
      title: '创建客户分层',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-funnel/custom/create',
    name: 'MobileMarketingFunnelCustomCreate',
    component: () => import('../pages/mobile/marketing/funnel/custom-create.vue'),
    meta: {
      title: '创建自定义漏斗',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-funnel/custom/:id/edit',
    name: 'MobileMarketingFunnelCustomEdit',
    component: () => import('../pages/mobile/marketing/funnel/custom-edit.vue'),
    meta: {
      title: '编辑自定义漏斗',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Marketing模块第4批：营销预算、报告和集成功能 =====
  {
    path: '/mobile/marketing/marketing-budget',
    name: 'MobileMarketingBudget',
    component: () => import('../pages/mobile/marketing/marketing-budget/index.vue'),
    meta: {
      title: '营销预算',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/create',
    name: 'MobileMarketingBudgetCreate',
    component: () => import('../pages/mobile/marketing/marketing-budget/create.vue'),
    meta: {
      title: '创建预算',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/adjust',
    name: 'MobileMarketingBudgetAdjust',
    component: () => import('../pages/mobile/marketing/marketing-budget/adjust.vue'),
    meta: {
      title: '调整预算',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/analytics',
    name: 'MobileMarketingBudgetAnalytics',
    component: () => import('../pages/mobile/marketing/marketing-budget/analytics.vue'),
    meta: {
      title: '预算分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/reports',
    name: 'MobileMarketingBudgetReports',
    component: () => import('../pages/mobile/marketing/marketing-budget/reports.vue'),
    meta: {
      title: '预算报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/multi-dimension',
    name: 'MobileMarketingBudgetMultiDimension',
    component: () => import('../pages/mobile/marketing/marketing-budget/multi-dimension.vue'),
    meta: {
      title: '多维度预算管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/execution',
    name: 'MobileMarketingBudgetExecution',
    component: () => import('../pages/mobile/marketing/marketing-budget/execution.vue'),
    meta: {
      title: '预算执行监控',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/optimization',
    name: 'MobileMarketingBudgetOptimization',
    component: () => import('../pages/mobile/marketing/marketing-budget/optimization.vue'),
    meta: {
      title: '预算优化建议',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/version',
    name: 'MobileMarketingBudgetVersion',
    component: () => import('../pages/mobile/marketing/marketing-budget/version.vue'),
    meta: {
      title: '预算版本管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/permission',
    name: 'MobileMarketingBudgetPermission',
    component: () => import('../pages/mobile/marketing/marketing-budget/permission.vue'),
    meta: {
      title: '预算权限控制',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-budget/template',
    name: 'MobileMarketingBudgetTemplate',
    component: () => import('../pages/mobile/marketing/marketing-budget/template.vue'),
    meta: {
      title: '预算模板管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-reports',
    name: 'MobileMarketingReports',
    component: () => import('../pages/mobile/marketing/marketing-reports/index.vue'),
    meta: {
      title: '营销报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/create',
    name: 'MobileMarketingReportsCreate',
    component: () => import('../pages/mobile/marketing/marketing-reports/create.vue'),
    meta: {
      title: '创建报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/custom',
    name: 'MobileMarketingReportsCustom',
    component: () => import('../pages/mobile/marketing/marketing-reports/custom.vue'),
    meta: {
      title: '自定义报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/templates',
    name: 'MobileMarketingReportsTemplates',
    component: () => import('../pages/mobile/marketing/marketing-reports/templates.vue'),
    meta: {
      title: '模板管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/schedule',
    name: 'MobileMarketingReportsSchedule',
    component: () => import('../pages/mobile/marketing/marketing-reports/schedule.vue'),
    meta: {
      title: '定期设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/list',
    name: 'MobileMarketingReportsList',
    component: () => import('../pages/mobile/marketing/marketing-reports/list.vue'),
    meta: {
      title: '报告列表',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/view/:id',
    name: 'MobileMarketingReportsView',
    component: () => import('../pages/mobile/marketing/marketing-reports/view.vue'),
    meta: {
      title: '查看报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/preview/:id',
    name: 'MobileMarketingReportsPreview',
    component: () => import('../pages/mobile/marketing/marketing-reports/preview.vue'),
    meta: {
      title: '预览报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/share/:id',
    name: 'MobileMarketingReportsShare',
    component: () => import('../pages/mobile/marketing/marketing-reports/share.vue'),
    meta: {
      title: '分享报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/scheduled',
    name: 'MobileMarketingReportsScheduled',
    component: () => import('../pages/mobile/marketing/marketing-reports/scheduled.vue'),
    meta: {
      title: '定期报告设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/subscriptions',
    name: 'MobileMarketingReportsSubscriptions',
    component: () => import('../pages/mobile/marketing/marketing-reports/subscriptions.vue'),
    meta: {
      title: '报告订阅',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-reports/delivery',
    name: 'MobileMarketingReportsDelivery',
    component: () => import('../pages/mobile/marketing/marketing-reports/delivery.vue'),
    meta: {
      title: '发送设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-integration',
    name: 'MobileMarketingIntegration',
    component: () => import('../pages/mobile/marketing/marketing-integration/index.vue'),
    meta: {
      title: '营销集成',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/add-platform',
    name: 'MobileMarketingIntegrationAddPlatform',
    component: () => import('../pages/mobile/marketing/marketing-integration/add-platform.vue'),
    meta: {
      title: '添加平台',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/platform/:id',
    name: 'MobileMarketingIntegrationPlatformDetail',
    component: () => import('../pages/mobile/marketing/marketing-integration/platform-detail.vue'),
    meta: {
      title: '平台详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/monitor',
    name: 'MobileMarketingIntegrationMonitor',
    component: () => import('../pages/mobile/marketing/marketing-integration/monitor.vue'),
    meta: {
      title: '监控中心',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/settings',
    name: 'MobileMarketingIntegrationSettings',
    component: () => import('../pages/mobile/marketing/marketing-integration/settings.vue'),
    meta: {
      title: '集成设置',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/sync-rules',
    name: 'MobileMarketingIntegrationSyncRules',
    component: () => import('../pages/mobile/marketing/marketing-integration/sync-rules.vue'),
    meta: {
      title: '同步规则',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/sync-frequency',
    name: 'MobileMarketingIntegrationSyncFrequency',
    component: () => import('../pages/mobile/marketing/marketing-integration/sync-frequency.vue'),
    meta: {
      title: '同步频率',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/conflict-resolution',
    name: 'MobileMarketingIntegrationConflictResolution',
    component: () => import('../pages/mobile/marketing/marketing-integration/conflict-resolution.vue'),
    meta: {
      title: '冲突处理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/api-docs',
    name: 'MobileMarketingIntegrationApiDocs',
    component: () => import('../pages/mobile/marketing/marketing-integration/api-docs.vue'),
    meta: {
      title: 'API文档',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/api-test',
    name: 'MobileMarketingIntegrationApiTest',
    component: () => import('../pages/mobile/marketing/marketing-integration/api-test.vue'),
    meta: {
      title: 'API测试',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/api-monitor',
    name: 'MobileMarketingIntegrationApiMonitor',
    component: () => import('../pages/mobile/marketing/marketing-integration/api-monitor.vue'),
    meta: {
      title: 'API监控',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/api-keys',
    name: 'MobileMarketingIntegrationApiKeys',
    component: () => import('../pages/mobile/marketing/marketing-integration/api-keys.vue'),
    meta: {
      title: 'API密钥',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/logs',
    name: 'MobileMarketingIntegrationLogs',
    component: () => import('../pages/mobile/marketing/marketing-integration/logs.vue'),
    meta: {
      title: '集成日志',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/encryption',
    name: 'MobileMarketingIntegrationEncryption',
    component: () => import('../pages/mobile/marketing/marketing-integration/encryption.vue'),
    meta: {
      title: '数据加密',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/access-control',
    name: 'MobileMarketingIntegrationAccessControl',
    component: () => import('../pages/mobile/marketing/marketing-integration/access-control.vue'),
    meta: {
      title: '访问控制',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-integration/security-audit',
    name: 'MobileMarketingIntegrationSecurityAudit',
    component: () => import('../pages/mobile/marketing/marketing-integration/security-audit.vue'),
    meta: {
      title: '安全审计',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Marketing模块第6批：竞品分析、客户分析、市场洞察 =====
  {
    path: '/mobile/marketing/marketing-competitor',
    name: 'MobileMarketingCompetitor',
    component: () => import('../pages/mobile/marketing/marketing-competitor.vue'),
    meta: {
      title: '竞品分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/create',
    name: 'MobileMarketingCompetitorCreate',
    component: () => import('../pages/mobile/marketing/competitor/create.vue'),
    meta: {
      title: '添加竞品',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/:id',
    name: 'MobileMarketingCompetitorDetail',
    component: () => import('../pages/mobile/marketing/competitor/detail.vue'),
    meta: {
      title: '竞品详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/:id/edit',
    name: 'MobileMarketingCompetitorEdit',
    component: () => import('../pages/mobile/marketing/competitor/edit.vue'),
    meta: {
      title: '编辑竞品',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/comparison',
    name: 'MobileMarketingCompetitorComparison',
    component: () => import('../pages/mobile/marketing/competitor/comparison.vue'),
    meta: {
      title: '竞品对比',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/swot',
    name: 'MobileMarketingCompetitorSwot',
    component: () => import('../pages/mobile/marketing/competitor/swot.vue'),
    meta: {
      title: 'SWOT分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-competitor/alerts',
    name: 'MobileMarketingCompetitorAlerts',
    component: () => import('../pages/mobile/marketing/competitor/alerts.vue'),
    meta: {
      title: '竞品预警',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-customer',
    name: 'MobileMarketingCustomer',
    component: () => import('../pages/mobile/marketing/marketing-customer.vue'),
    meta: {
      title: '客户分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/segment/create',
    name: 'MobileMarketingCustomerSegmentCreate',
    component: () => import('../pages/mobile/marketing/customer/segment-create.vue'),
    meta: {
      title: '创建客户分群',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/segment/:id',
    name: 'MobileMarketingCustomerSegmentDetail',
    component: () => import('../pages/mobile/marketing/customer/segment-detail.vue'),
    meta: {
      title: '分群详情',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/lifecycle',
    name: 'MobileMarketingCustomerLifecycle',
    component: () => import('../pages/mobile/marketing/customer/lifecycle.vue'),
    meta: {
      title: '生命周期管理',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/value-analysis',
    name: 'MobileMarketingCustomerValueAnalysis',
    component: () => import('../pages/mobile/marketing/customer/value-analysis.vue'),
    meta: {
      title: '价值分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/churn-prediction',
    name: 'MobileMarketingCustomerChurnPrediction',
    component: () => import('../pages/mobile/marketing/customer/churn-prediction.vue'),
    meta: {
      title: '流失预测',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/behavior-tracking',
    name: 'MobileMarketingCustomerBehaviorTracking',
    component: () => import('../pages/mobile/marketing/customer/behavior-tracking.vue'),
    meta: {
      title: '行为跟踪',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-customer/personas',
    name: 'MobileMarketingCustomerPersonas',
    component: () => import('../pages/mobile/marketing/customer/personas.vue'),
    meta: {
      title: '客户画像',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  {
    path: '/mobile/marketing/marketing-insights',
    name: 'MobileMarketingInsights',
    component: () => import('../pages/mobile/marketing/marketing-insights.vue'),
    meta: {
      title: '市场洞察',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/trends',
    name: 'MobileMarketingInsightsTrends',
    component: () => import('../pages/mobile/marketing/insights/trends.vue'),
    meta: {
      title: '趋势分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/industry-dynamics',
    name: 'MobileMarketingInsightsIndustryDynamics',
    component: () => import('../pages/mobile/marketing/insights/industry-dynamics.vue'),
    meta: {
      title: '行业动态',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/consumer-behavior',
    name: 'MobileMarketingInsightsConsumerBehavior',
    component: () => import('../pages/mobile/marketing/insights/consumer-behavior.vue'),
    meta: {
      title: '消费行为',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/opportunity-identification',
    name: 'MobileMarketingInsightsOpportunityIdentification',
    component: () => import('../pages/mobile/marketing/insights/opportunity-identification.vue'),
    meta: {
      title: '机会识别',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/ai-analysis',
    name: 'MobileMarketingInsightsAiAnalysis',
    component: () => import('../pages/mobile/marketing/insights/ai-analysis.vue'),
    meta: {
      title: 'AI智能分析',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/forecast',
    name: 'MobileMarketingInsightsForecast',
    component: () => import('../pages/mobile/marketing/insights/forecast.vue'),
    meta: {
      title: '市场预测',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },
  {
    path: '/mobile/marketing/marketing-insights/reports',
    name: 'MobileMarketingInsightsReports',
    component: () => import('../pages/mobile/marketing/insights/reports.vue'),
    meta: {
      title: '洞察报告',
      requiresAuth: true,
      role: ['admin', 'principal', 'teacher']
    }
  },

  // ===== Finance模块第5批：系统配置功能 =====
  {
    path: '/mobile/finance/finance-settings',
    name: 'MobileFinanceFinanceSettings',
    component: () => import('../pages/mobile/finance/finance-settings.vue'),
    meta: {
      title: '财务设置',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-export',
    name: 'MobileFinanceFinanceExport',
    component: () => import('../pages/mobile/finance/finance-export.vue'),
    meta: {
      title: '数据导出',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  },
  {
    path: '/mobile/finance/finance-integration',
    name: 'MobileFinanceFinanceIntegration',
    component: () => import('../pages/mobile/finance/finance-integration.vue'),
    meta: {
      title: '系统集成',
      requiresAuth: true,
      role: ['admin', 'principal']
    }
  }
]

export default mobileRoutes
