import { RouteRecordRaw } from 'vue-router'

// 教师中心路由配置
const teacherCenterRoutes: RouteRecordRaw[] = [
  {
    path: '/teacher-center',
    name: 'TeacherCenter',
    redirect: '/teacher-center/dashboard',
    meta: {
      title: '教师中心',
      requiresAuth: true,
      roles: ['teacher'],
      icon: 'User'
    },
    children: [
      // 教师工作台
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/pages/teacher-center/dashboard/index.vue'),
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
        name: 'TeacherNotifications',
        component: () => import('@/pages/teacher-center/notifications/index.vue'),
        meta: {
          title: '通知中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Bell'
        },
        children: [
          {
            path: ':id',
            name: 'TeacherNotificationDetail',
            component: () => import('@/pages/teacher-center/notifications/components/NotificationDetail.vue'),
            meta: {
              title: '通知详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },
      
      // 任务中心
      {
        path: 'tasks',
        name: 'TeacherTasks',
        component: () => import('@/pages/teacher-center/tasks/index.vue'),
        meta: {
          title: '任务中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'CheckSquare'
        },
        children: [
          {
            path: 'create',
            name: 'TeacherTaskCreate',
            component: () => import('@/pages/teacher-center/tasks/components/TaskDetail.vue'),
            meta: {
              title: '创建任务',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          },
          {
            path: ':id',
            name: 'TeacherTaskDetail',
            component: () => import('@/pages/teacher-center/tasks/components/TaskDetail.vue'),
            meta: {
              title: '任务详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },
      
      // 活动中心
      {
        path: 'activities',
        name: 'TeacherActivities',
        component: () => import('@/pages/teacher-center/activities/index.vue'),
        meta: {
          title: '活动中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Calendar'
        },
        children: [
          {
            path: ':id',
            name: 'TeacherActivityDetail',
            component: () => import('@/pages/teacher-center/activities/components/ActivityDetail.vue'),
            meta: {
              title: '活动详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          },
          {
            path: ':id/signin',
            name: 'TeacherActivitySignin',
            component: () => import('@/pages/teacher-center/activities/components/ActivitySignin.vue'),
            meta: {
              title: '活动签到',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },
      
      // 招生中心
      {
        path: 'enrollment',
        name: 'TeacherEnrollment',
        component: () => import('@/pages/teacher-center/enrollment/index.vue'),
        meta: {
          title: '招生中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'GraduationCap'
        },
        children: [
          {
            path: 'customers/:id',
            name: 'TeacherCustomerDetail',
            component: () => import('@/pages/teacher-center/appointment-management/components/CustomerDetail.vue'),
            meta: {
              title: '客户详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },
      
      // 教学中心
      {
        path: 'teaching',
        name: 'TeacherTeaching',
        component: () => import('@/pages/teacher-center/teaching/index.vue'),
        meta: {
          title: '教学中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'BookOpen'
        },
        children: [
          {
            path: 'course/:id',
            name: 'TeacherCourseDetail',
            component: () => import('@/pages/teacher-center/teaching/components/TeachingRecord.vue'),
            meta: {
              title: '课程详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          },
          {
            path: 'media-upload',
            name: 'TeacherMediaUpload',
            component: () => import('@/pages/teacher-center/teaching/components/MediaUpload.vue'),
            meta: {
              title: '媒体上传',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          },
          {
            path: 'schedule',
            name: 'TeacherSchedule',
            component: () => import('@/pages/teacher-center/teaching/components/ClassManagement.vue'),
            meta: {
              title: '课程表',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },

      // AI互动课堂
      {
        path: 'creative-curriculum',
        name: 'CreativeCurriculum',
        component: () => import('@/pages/teacher-center/creative-curriculum/index.vue'),
        meta: {
          title: 'AI互动课堂',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Sparkles'
        }
      },

      // AI互动课程生成器（独立路由）
      {
        path: 'creative-curriculum-interactive',
        name: 'InteractiveCurriculum',
        component: () => import('@/pages/teacher-center/creative-curriculum/interactive-curriculum.vue'),
        meta: {
          title: '互动多媒体课程生成器',
          requiresAuth: true,
          roles: ['teacher'],
          hideInMenu: false,
          icon: 'Sparkles'
        }
      },
      
      // 客户跟踪
      {
        path: 'customer-tracking',
        name: 'TeacherCustomerTracking',
        component: () => import('@/pages/teacher-center/customer-tracking/index.vue'),
        meta: {
          title: '客户跟踪',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'UserCheck'
        },
        children: [
          {
            path: ':id',
            name: 'TeacherCustomerTrackingDetail',
            component: () => import('@/pages/teacher-center/customer-tracking/detail-simple.vue'),
            meta: {
              title: 'SOP跟踪详情',
              requiresAuth: true,
              roles: ['teacher'],
              hideInMenu: true
            }
          }
        ]
      },

      // 考勤管理
      {
        path: 'attendance',
        name: 'TeacherAttendance',
        component: () => import('@/pages/teacher-center/attendance/index.vue'),
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
        name: 'TeacherPerformanceRewards',
        component: () => import('@/pages/teacher-center/performance-rewards/index.vue'),
        meta: {
          title: '绩效中心',
          requiresAuth: true,
          roles: ['teacher'],
          icon: 'Trophy'
        }
      }
    ]
  }
]

export default teacherCenterRoutes
