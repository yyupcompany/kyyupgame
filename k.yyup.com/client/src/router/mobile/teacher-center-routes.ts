import { RouteRecordRaw } from 'vue-router'

/**
 * 移动端教师中心路由配置
 *
 * 特性：
 * - 与PC端1:1对应，支持分级嵌套结构
 * - 最多3层嵌套：主模块 → 子页面 → 详情页面
 * - 使用懒加载优化性能
 * - 统一的权限控制和meta信息
 *
 * 路由层级：
 * Level 1: /mobile/teacher-center (主入口)
 * Level 2: dashboard, activities, teaching等 (功能模块)
 * Level 3: detail, create等 (操作页面)
 */

// 移动端Layout组件引用
const MobileLayout = () => import('../../layouts/MobileLayout.vue')

const mobileTeacherCenterRoutes: RouteRecordRaw[] = [
  {
    path: '/mobile/teacher-center',
    name: 'MobileTeacherCenter',
    component: MobileLayout,
    redirect: '/mobile/teacher-center/dashboard',
    meta: {
      title: '教师中心',
      requiresAuth: true,
      roles: ['teacher'],
      icon: 'User'
    },
    children: [
      // 教师中心主页
      {
        path: 'index',
        name: 'MobileTeacherCenterIndex',
        component: () => import('../../pages/mobile/teacher-center/index.vue'),
        meta: {
          title: '教师中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'User'
        }
      },
      // 教师工作台
      {
        path: 'dashboard',
        name: 'MobileTeacherDashboard',
        component: () => import('../../pages/mobile/teacher-center/dashboard/index.vue'),
        meta: {
          title: '教师工作台',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Monitor'
        }
      },

      // 通知中心
      {
        path: 'notifications',
        name: 'MobileTeacherNotifications',
        component: () => import('../../pages/mobile/teacher-center/notifications/index.vue'),
        meta: {
          title: '通知中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Bell'
        },
        children: [
          {
            path: ':id',
            name: 'MobileTeacherNotificationDetail',
            component: () => import('../../pages/mobile/teacher-center/notifications/components/NotificationDetail.vue'),
            meta: {
              title: '通知详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/notifications'
            }
          }
        ]
      },

      // 任务中心
      {
        path: 'tasks',
        name: 'MobileTeacherTasks',
        component: () => import('../../pages/mobile/teacher-center/tasks/index.vue'),
        meta: {
          title: '任务中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'CheckSquare'
        },
        children: [
          {
            path: 'create',
            name: 'MobileTeacherTaskCreate',
            component: () => import('../../pages/mobile/teacher-center/tasks/components/TaskDetail.vue'),
            meta: {
              title: '创建任务',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/tasks'
            }
          },
          {
            path: ':id',
            name: 'MobileTeacherTaskDetail',
            component: () => import('../../pages/mobile/teacher-center/tasks/components/TaskDetail.vue'),
            meta: {
              title: '任务详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/tasks'
            }
          }
        ]
      },

      // 活动中心
      {
        path: 'activities',
        name: 'MobileTeacherActivities',
        component: () => import('../../pages/mobile/teacher-center/activities/index.vue'),
        meta: {
          title: '活动中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Calendar'
        },
        children: [
          {
            path: ':id',
            name: 'MobileTeacherActivityDetail',
            component: () => import('../../pages/mobile/teacher-center/activities/components/ActivityDetail.vue'),
            meta: {
              title: '活动详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/activities'
            }
          },
          {
            path: ':id/signin',
            name: 'MobileTeacherActivitySignin',
            component: () => import('../../pages/mobile/teacher-center/activities/components/ActivitySignin.vue'),
            meta: {
              title: '活动签到',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/activities'
            }
          }
        ]
      },

      // 招生中心
      {
        path: 'enrollment',
        name: 'MobileTeacherEnrollment',
        component: () => import('../../pages/mobile/teacher-center/enrollment/index.vue'),
        meta: {
          title: '招生中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'GraduationCap'
        },
        children: [
          {
            path: 'customers/:id',
            name: 'MobileTeacherCustomerDetail',
            component: () => import('../../pages/mobile/teacher-center/enrollment/components/CustomerDetail.vue'),
            meta: {
              title: '客户详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/enrollment'
            }
          }
        ]
      },

      // 教学中心
      {
        path: 'teaching',
        name: 'MobileTeacherTeaching',
        component: () => import('../../pages/mobile/teacher-center/teaching/index.vue'),
        meta: {
          title: '教学中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'BookOpen'
        },
        children: [
          {
            path: 'course/:id',
            name: 'MobileTeacherCourseDetail',
            component: () => import('../../pages/mobile/teacher-center/teaching/components/TeachingRecord.vue'),
            meta: {
              title: '课程详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/teaching'
            }
          },
          {
            path: 'media-upload',
            name: 'MobileTeacherMediaUpload',
            component: () => import('../../pages/mobile/teacher-center/teaching/components/MediaUpload.vue'),
            meta: {
              title: '媒体上传',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/teaching'
            }
          },
          {
            path: 'schedule',
            name: 'MobileTeacherSchedule',
            component: () => import('../../pages/mobile/teacher-center/teaching/components/ClassManagement.vue'),
            meta: {
              title: '课程表',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/teaching'
            }
          }
        ]
      },

      // 创意课程生成器
      {
        path: 'creative-curriculum',
        name: 'MobileCreativeCurriculum',
        component: () => import('../../pages/mobile/teacher-center/creative-curriculum/index.vue'),
        meta: {
          title: '创意课程生成器',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Sparkles'
        },
        children: [
          {
            path: 'interactive',
            name: 'MobileInteractiveCurriculum',
            component: () => import('../../pages/mobile/teacher-center/creative-curriculum/interactive-curriculum.vue'),
            meta: {
              title: '互动多媒体课程生成器',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: false
            }
          }
        ]
      },

      // 客户跟踪
      {
        path: 'customer-tracking',
        name: 'MobileTeacherCustomerTracking',
        component: () => import('../../pages/mobile/teacher-center/customer-tracking/index.vue'),
        meta: {
          title: '客户跟踪',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'UserCheck'
        },
        children: [
          {
            path: ':id',
            name: 'MobileTeacherCustomerTrackingDetail',
            component: () => import('../../pages/mobile/teacher-center/customer-tracking/detail-simple.vue'),
            meta: {
              title: 'SOP跟踪详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true,
              backPath: '/mobile/teacher-center/customer-tracking'
            }
          }
        ]
      },

      // 考勤管理
      {
        path: 'attendance',
        name: 'MobileTeacherAttendance',
        component: () => import('../../pages/mobile/teacher-center/attendance/index.vue'),
        meta: {
          title: '考勤管理',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Calendar'
        }
      },

      // 绩效中心
      {
        path: 'performance-rewards',
        name: 'MobileTeacherPerformanceRewards',
        component: () => import('../../pages/mobile/teacher-center/performance-rewards/index.vue'),
        meta: {
          title: '绩效中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Trophy'
        }
      },

      // 预约管理
      {
        path: 'appointment-management',
        name: 'MobileTeacherAppointmentManagement',
        component: () => import('../../pages/mobile/teacher-center/appointment-management/index.vue'),
        meta: {
          title: '预约管理',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Timer'
        }
      },

      // 班级联系
      {
        path: 'class-contacts',
        name: 'MobileTeacherClassContacts',
        component: () => import('../../pages/mobile/teacher-center/class-contacts/index.vue'),
        meta: {
          title: '班级联系',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Message'
        }
      },

      // 客户池
      {
        path: 'customer-pool',
        name: 'MobileTeacherCustomerPool',
        component: () => import('../../pages/mobile/teacher-center/customer-pool/index.vue'),
        meta: {
          title: '客户池',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'UserFilled'
        }
      }
    ]
  }
]

export { mobileTeacherCenterRoutes }
export default mobileTeacherCenterRoutes