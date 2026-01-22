import { RouteRecordRaw } from 'vue-router'

/**
 * 移动端 Centers 模块分级路由配置
 * 按照 PC 端的分级架构设计，使用嵌套路由结构
 * 最多3层嵌套，支持懒加载和权限控制
 *
 * 路由层级说明：
 * 第1层：/mobile/centers - 主模块
 * 第2层：/mobile/centers/{center} - 具体中心
 * 第3层：/mobile/centers/{center}/{action} - 具体操作页面
 *
 * 更新记录（第2批新开发页面）：
 * - enrollment-center: 招生中心（已存在，3层嵌套）
 * - finance-center: 财务中心（升级为3层嵌套）
 * - marketing-center: 营销中心（升级为3层嵌套）
 * - teaching-center: 教学中心（已存在，3层嵌套）
 *
 * 更新记录（第3批新开发页面）：
 * - assessment-center: 评估中心（升级为3层嵌套）
 * - attendance-center: 考勤中心（升级为3层嵌套）
 * - personnel-center: 人事中心（升级为3层嵌套）
 * - system-center: 系统中心（升级为3层嵌套）
 *
 * 更新记录（第4批新开发页面）：
 * - document-center: 文档中心（升级为3层嵌套）
 * - media-center: 媒体中心（新增3层嵌套）
 * - task-center: 任务中心（新增3层嵌套）
 * - inspection-center: 检查中心（升级为3层嵌套）
 *
 * 更新记录（第6批新开发页面）：
 * - document-template-center: 文档模板中心（新增3层嵌套）
 * - document-collaboration: 文档协作（新增3层嵌套）
 *
 * 更新记录（第7批新开发页面）：
 * - document-editor: 文档编辑器（新增3层嵌套）
 * - document-instance-list: 文档实例列表（新增3层嵌套）
 * - document-statistics: 文档统计（新增3层嵌套）
 * - task-form: 任务表单（新增3层嵌套）
 * - template-detail: 模板详情（新增3层嵌套）
 * - system-center-unified: 系统中心统一（新增3层嵌套）
 */

export const centersRoutes: Array<RouteRecordRaw> = [
  // ===== Centers 主模块 =====
  {
    path: '/mobile/centers',
    name: 'MobileCentersRoot',
    redirect: '/mobile/centers/index',
    meta: {
      title: '管理中心',
      requiresAuth: true,
      roles: ['admin', 'principal', 'teacher'],
      hideInMenu: false
    },
    children: [
      // 中心目录索引页 - 统一导航入口
      {
        path: 'index',
        name: 'MobileCentersIndex',
        component: () => import('@/pages/mobile/centers/index.vue'),
        meta: {
          title: '中心目录',
          icon: 'Grid',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high',
          description: '统一的管理中心导航入口'
        }
      },

      // ===== 活动管理模块（3层嵌套示例）=====
      {
        path: 'activity-center',
        name: 'MobileActivityCenterRoot',
        redirect: '/mobile/centers/activity-center/index',
        meta: {
          title: '活动中心',
          icon: 'Calendar',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileActivityCenter',
            component: () => import('@/pages/mobile/centers/activity-center/index.vue'),
            meta: {
              title: '活动管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '活动创建、编辑、发布等功能'
            }
          },
          {
            path: 'detail/:id',
            name: 'MobileActivityDetail',
            component: () => import('@/pages/mobile/centers/activity-center/components/MobileDetailPanel.vue'),
            meta: {
              title: '活动详情',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true, // 详情页在菜单中隐藏
              priority: 'medium'
            }
          },
          {
            path: 'create',
            name: 'MobileActivityCreate',
            component: () => import('@/pages/mobile/centers/activity-center/index.vue'),
            meta: {
              title: '创建活动',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'edit/:id',
            name: 'MobileActivityEdit',
            component: () => import('@/pages/mobile/centers/activity-center/index.vue'),
            meta: {
              title: '编辑活动',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== AI 智能中心模块（3层嵌套示例）=====
      {
        path: 'ai-center',
        name: 'MobileAiCenterRoot',
        redirect: '/mobile/centers/ai-center/index',
        meta: {
          title: 'AI智能中心',
          icon: 'MagicStick',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileAiCenter',
            component: () => import('@/pages/mobile/centers/ai-center/index.vue'),
            meta: {
              title: 'AI助手',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: 'AI智能助手和咨询服务'
            }
          },
          {
            path: 'chat',
            name: 'MobileAiChat',
            component: () => import('@/pages/mobile/centers/ai-center/index.vue'),
            meta: {
              title: 'AI对话',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'expert-consultation',
            name: 'MobileAiExpertConsultation',
            component: () => import('@/pages/mobile/centers/ai-center/index.vue'),
            meta: {
              title: '专家咨询',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 数据分析中心模块（3层嵌套示例）=====
      {
        path: 'analytics-center',
        name: 'MobileAnalyticsCenterRoot',
        redirect: '/mobile/centers/analytics-center/index',
        meta: {
          title: '数据分析',
          icon: 'DataAnalysis',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileAnalyticsCenter',
            component: () => import('@/pages/mobile/centers/analytics-center/index.vue'),
            meta: {
              title: '数据概览',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '业务数据分析和报表功能'
            }
          },
          {
            path: 'reports',
            name: 'MobileAnalyticsReports',
            component: () => import('@/pages/mobile/centers/analytics-center/index.vue'),
            meta: {
              title: '报表管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'charts/:type?',
            name: 'MobileAnalyticsCharts',
            component: () => import('@/pages/mobile/centers/analytics-center/index.vue'),
            meta: {
              title: '图表分析',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 招生中心模块（3层嵌套）=====
      {
        path: 'enrollment-center',
        name: 'MobileEnrollmentCenterRoot',
        redirect: '/mobile/centers/enrollment-center/index',
        meta: {
          title: '招生中心',
          icon: 'School',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileEnrollmentCenter',
            component: () => import('@/pages/mobile/centers/enrollment-center/index.vue'),
            meta: {
              title: '招生管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '招生计划、申请管理、咨询跟踪'
            }
          },
          {
            path: 'applications',
            name: 'MobileEnrollmentApplications',
            component: () => import('@/pages/mobile/centers/enrollment-center/index.vue'),
            meta: {
              title: '申请管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'interviews',
            name: 'MobileEnrollmentInterviews',
            component: () => import('@/pages/mobile/centers/enrollment-center/index.vue'),
            meta: {
              title: '面试安排',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 学生中心模块（3层嵌套）=====
      {
        path: 'student-center',
        name: 'MobileStudentCenterRoot',
        redirect: '/mobile/centers/student-center/index',
        meta: {
          title: '学生中心',
          icon: 'Avatar',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileStudentCenter',
            component: () => import('@/pages/mobile/centers/student-center/index.vue'),
            meta: {
              title: '学生管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '学生信息、档案、成绩管理'
            }
          },
          {
            path: 'detail/:id',
            name: 'MobileStudentDetail',
            component: () => import('@/pages/mobile/centers/student-center/index.vue'),
            meta: {
              title: '学生详情',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'health',
            name: 'MobileStudentHealth',
            component: () => import('@/pages/mobile/centers/student-center/index.vue'),
            meta: {
              title: '健康管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 教学中心模块（3层嵌套）=====
      {
        path: 'teaching-center',
        name: 'MobileTeachingCenterRoot',
        redirect: '/mobile/centers/teaching-center/index',
        meta: {
          title: '教学中心',
          icon: 'Reading',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileTeachingCenter',
            component: () => import('@/pages/mobile/centers/teaching-center/index.vue'),
            meta: {
              title: '教学管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '课程管理、教学计划、资源管理'
            }
          },
          {
            path: 'curriculum',
            name: 'MobileTeachingCurriculum',
            component: () => import('@/pages/mobile/centers/teaching-center/index.vue'),
            meta: {
              title: '课程管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'resources',
            name: 'MobileTeachingResources',
            component: () => import('@/pages/mobile/centers/teaching-center/index.vue'),
            meta: {
              title: '教学资源',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 评估中心模块（3层嵌套）=====
      {
        path: 'assessment-center',
        name: 'MobileAssessmentCenterRoot',
        redirect: '/mobile/centers/assessment-center/index',
        meta: {
          title: '评估中心',
          icon: 'Document',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileAssessmentCenter',
            component: () => import('@/pages/mobile/centers/assessment-center/index.vue'),
            meta: {
              title: '评估管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '学生评估、成绩分析、能力测评'
            }
          },
          {
            path: 'student-assessment',
            name: 'MobileAssessmentStudent',
            component: () => import('@/pages/mobile/centers/assessment-center/index.vue'),
            meta: {
              title: '学生评估',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'development-report',
            name: 'MobileAssessmentDevelopment',
            component: () => import('@/pages/mobile/centers/assessment-center/index.vue'),
            meta: {
              title: '发展报告',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'analysis/:type?',
            name: 'MobileAssessmentAnalysis',
            component: () => import('@/pages/mobile/centers/assessment-center/index.vue'),
            meta: {
              title: '评估分析',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 考勤中心模块（3层嵌套）=====
      {
        path: 'attendance-center',
        name: 'MobileAttendanceCenterRoot',
        redirect: '/mobile/centers/attendance-center/index',
        meta: {
          title: '考勤中心',
          icon: 'Clock',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileAttendanceCenter',
            component: () => import('@/pages/mobile/centers/attendance-center/index.vue'),
            meta: {
              title: '考勤管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '学生考勤、教师考勤、考勤统计'
            }
          },
          {
            path: 'student-attendance',
            name: 'MobileAttendanceStudent',
            component: () => import('@/pages/mobile/centers/attendance-center/index.vue'),
            meta: {
              title: '学生考勤',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'teacher-attendance',
            name: 'MobileAttendanceTeacher',
            component: () => import('@/pages/mobile/centers/attendance-center/index.vue'),
            meta: {
              title: '教师考勤',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'statistics/:period?',
            name: 'MobileAttendanceStatistics',
            component: () => import('@/pages/mobile/centers/attendance-center/index.vue'),
            meta: {
              title: '考勤统计',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 人事中心模块（3层嵌套）=====
      {
        path: 'personnel-center',
        name: 'MobilePersonnelCenterRoot',
        redirect: '/mobile/centers/personnel-center/index',
        meta: {
          title: '人事中心',
          icon: 'UserFilled',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobilePersonnelCenter',
            component: () => import('@/pages/mobile/centers/personnel-center/index.vue'),
            meta: {
              title: '人事管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '员工管理、招聘管理、培训发展'
            }
          },
          {
            path: 'employees',
            name: 'MobilePersonnelEmployees',
            component: () => import('@/pages/mobile/centers/personnel-center/index.vue'),
            meta: {
              title: '员工管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'recruitment',
            name: 'MobilePersonnelRecruitment',
            component: () => import('@/pages/mobile/centers/personnel-center/index.vue'),
            meta: {
              title: '招聘管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'training',
            name: 'MobilePersonnelTraining',
            component: () => import('@/pages/mobile/centers/personnel-center/index.vue'),
            meta: {
              title: '培训发展',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'performance/:type?',
            name: 'MobilePersonnelPerformance',
            component: () => import('@/pages/mobile/centers/personnel-center/index.vue'),
            meta: {
              title: '绩效考核',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 财务中心模块（3层嵌套）=====
      {
        path: 'finance-center',
        name: 'MobileFinanceCenterRoot',
        redirect: '/mobile/centers/finance-center/index',
        meta: {
          title: '财务中心',
          icon: 'Money',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileFinanceCenter',
            component: () => import('@/pages/mobile/centers/finance-center/index.vue'),
            meta: {
              title: '财务管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '财务概览、收支管理、报表分析'
            }
          },
          {
            path: 'revenue',
            name: 'MobileFinanceRevenue',
            component: () => import('@/pages/mobile/centers/finance-center/index.vue'),
            meta: {
              title: '收入管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'expense',
            name: 'MobileFinanceExpense',
            component: () => import('@/pages/mobile/centers/finance-center/index.vue'),
            meta: {
              title: '支出管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 营销中心模块（3层嵌套）=====
      {
        path: 'marketing-center',
        name: 'MobileMarketingCenterRoot',
        redirect: '/mobile/centers/marketing-center/index',
        meta: {
          title: '营销中心',
          icon: 'Promotion',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileMarketingCenter',
            component: () => import('@/pages/mobile/centers/marketing-center/index.vue'),
            meta: {
              title: '营销管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '营销活动、广告投放、客户分析'
            }
          },
          {
            path: 'campaigns',
            name: 'MobileMarketingCampaigns',
            component: () => import('@/pages/mobile/centers/marketing-center/index.vue'),
            meta: {
              title: '营销活动',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'advertisements',
            name: 'MobileMarketingAdvertisements',
            component: () => import('@/pages/mobile/centers/marketing-center/index.vue'),
            meta: {
              title: '广告管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      {
        path: 'notification-center',
        name: 'MobileNotificationCenter',
        component: () => import('@/pages/mobile/centers/notification-center/index.vue'),
        meta: {
          title: '通知中心',
          icon: 'Bell',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      // ===== 文档中心模块（3层嵌套）=====
      {
        path: 'document-center',
        name: 'MobileDocumentCenterRoot',
        redirect: '/mobile/centers/document-center/index',
        meta: {
          title: '文档中心',
          icon: 'Folder',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentCenter',
            component: () => import('@/pages/mobile/centers/document-center/index.vue'),
            meta: {
              title: '文档管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '文档上传、分类、共享、版本管理'
            }
          },
          {
            path: 'upload',
            name: 'MobileDocumentUpload',
            component: () => import('@/pages/mobile/centers/document-center/index.vue'),
            meta: {
              title: '文档上传',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'library',
            name: 'MobileDocumentLibrary',
            component: () => import('@/pages/mobile/centers/document-center/index.vue'),
            meta: {
              title: '文档库',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'detail/:id',
            name: 'MobileDocumentDetail',
            component: () => import('@/pages/mobile/centers/document-center/index.vue'),
            meta: {
              title: '文档详情',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 媒体中心模块（3层嵌套）=====
      {
        path: 'media-center',
        name: 'MobileMediaCenterRoot',
        redirect: '/mobile/centers/media-center/index',
        meta: {
          title: '媒体中心',
          icon: 'PictureRounded',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileMediaCenter',
            component: () => import('@/pages/mobile/centers/media-center/index.vue'),
            meta: {
              title: '媒体管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '图片、视频、音频等多媒体资源管理'
            }
          },
          {
            path: 'gallery',
            name: 'MobileMediaGallery',
            component: () => import('@/pages/mobile/centers/media-center/index.vue'),
            meta: {
              title: '媒体图库',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'upload',
            name: 'MobileMediaUpload',
            component: () => import('@/pages/mobile/centers/media-center/index.vue'),
            meta: {
              title: '媒体上传',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'detail/:id',
            name: 'MobileMediaDetail',
            component: () => import('@/pages/mobile/centers/media-center/index.vue'),
            meta: {
              title: '媒体详情',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 任务中心模块（3层嵌套）=====
      {
        path: 'task-center',
        name: 'MobileTaskCenterRoot',
        redirect: '/mobile/centers/task-center/index',
        meta: {
          title: '任务中心',
          icon: 'List',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileTaskCenter',
            component: () => import('@/pages/mobile/centers/task-center/index.vue'),
            meta: {
              title: '任务管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '任务创建、分配、跟踪、完成管理'
            }
          },
          {
            path: 'my-tasks',
            name: 'MobileTaskMyTasks',
            component: () => import('@/pages/mobile/centers/task-center/index.vue'),
            meta: {
              title: '我的任务',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'assigned',
            name: 'MobileTaskAssigned',
            component: () => import('@/pages/mobile/centers/task-center/index.vue'),
            meta: {
              title: '分配任务',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'completed',
            name: 'MobileTaskCompleted',
            component: () => import('@/pages/mobile/centers/task-center/index.vue'),
            meta: {
              title: '已完成任务',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'detail/:id',
            name: 'MobileTaskDetail',
            component: () => import('@/pages/mobile/centers/task-center/index.vue'),
            meta: {
              title: '任务详情',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      {
        path: 'settings-center',
        name: 'MobileSettingsCenter',
        component: () => import('@/pages/mobile/centers/settings-center/index.vue'),
        meta: {
          title: '设置中心',
          icon: 'Setting',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'low'
        }
      },

      // ===== 管理员专用中心 =====
      {
        path: 'business-center',
        name: 'MobileBusinessCenter',
        component: () => import('@/pages/mobile/centers/business-center/index.vue'),
        meta: {
          title: '业务中心',
          icon: 'Briefcase',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'call-center',
        name: 'MobileCallCenter',
        component: () => import('@/pages/mobile/centers/call-center/index.vue'),
        meta: {
          title: '呼叫中心',
          icon: 'Phone',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'customer-pool-center',
        name: 'MobileCustomerPoolCenter',
        component: () => import('@/pages/mobile/centers/customer-pool-center/index.vue'),
        meta: {
          title: '客户池中心',
          icon: 'UserFilled',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'permission-center',
        name: 'MobilePermissionCenter',
        component: () => import('@/pages/mobile/centers/permission-center/index.vue'),
        meta: {
          title: '权限中心',
          icon: 'Lock',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'principal-center',
        name: 'MobilePrincipalCenter',
        component: () => import('@/pages/mobile/centers/principal-center/index.vue'),
        meta: {
          title: '园长中心',
          icon: 'Avatar',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

    // ===== 系统中心模块（3层嵌套）=====
      {
        path: 'system-center',
        name: 'MobileSystemCenterRoot',
        redirect: '/mobile/centers/system-center/index',
        meta: {
          title: '系统中心',
          icon: 'Monitor',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileSystemCenter',
            component: () => import('@/pages/mobile/centers/system-center/index.vue'),
            meta: {
              title: '系统管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '系统设置、权限管理、日志监控'
            }
          },
          {
            path: 'settings',
            name: 'MobileSystemSettings',
            component: () => import('@/pages/mobile/centers/system-center/index.vue'),
            meta: {
              title: '系统设置',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'permissions',
            name: 'MobileSystemPermissions',
            component: () => import('@/pages/mobile/centers/system-center/index.vue'),
            meta: {
              title: '权限管理',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'logs',
            name: 'MobileSystemLogs',
            component: () => import('@/pages/mobile/centers/system-center/index.vue'),
            meta: {
              title: '系统日志',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'monitoring/:type?',
            name: 'MobileSystemMonitoring',
            component: () => import('@/pages/mobile/centers/system-center/index.vue'),
            meta: {
              title: '系统监控',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 检查中心模块（3层嵌套）=====
      {
        path: 'inspection-center',
        name: 'MobileInspectionCenterRoot',
        redirect: '/mobile/centers/inspection-center/index',
        meta: {
          title: '检查中心',
          icon: 'View',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileInspectionCenter',
            component: () => import('@/pages/mobile/centers/inspection-center/index.vue'),
            meta: {
              title: '检查管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '安全检查、质量检查、合规检查管理'
            }
          },
          {
            path: 'safety',
            name: 'MobileInspectionSafety',
            component: () => import('@/pages/mobile/centers/inspection-center/index.vue'),
            meta: {
              title: '安全检查',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'quality',
            name: 'MobileInspectionQuality',
            component: () => import('@/pages/mobile/centers/inspection-center/index.vue'),
            meta: {
              title: '质量检查',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'compliance',
            name: 'MobileInspectionCompliance',
            component: () => import('@/pages/mobile/centers/inspection-center/index.vue'),
            meta: {
              title: '合规检查',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'reports',
            name: 'MobileInspectionReports',
            component: () => import('@/pages/mobile/centers/inspection-center/index.vue'),
            meta: {
              title: '检查报告',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 文档模板中心模块（第6批，3层嵌套）=====
      {
        path: 'document-template-center',
        name: 'MobileDocumentTemplateCenterRoot',
        redirect: '/mobile/centers/document-template-center/index',
        meta: {
          title: '文档模板中心',
          icon: 'Memo',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentTemplateCenter',
            component: () => import('@/pages/mobile/centers/document-template-center/index.vue'),
            meta: {
              title: '模板中心',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '文档模板管理、模板应用、模板分享'
            }
          },
          {
            path: 'categories',
            name: 'MobileDocumentTemplateCategories',
            component: () => import('@/pages/mobile/centers/document-template-center/index.vue'),
            meta: {
              title: '模板分类',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'create',
            name: 'MobileDocumentTemplateCreate',
            component: () => import('@/pages/mobile/centers/document-template-center/index.vue'),
            meta: {
              title: '创建模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'preview/:id',
            name: 'MobileDocumentTemplatePreview',
            component: () => import('@/pages/mobile/centers/document-template-center/index.vue'),
            meta: {
              title: '模板预览',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 文档协作模块（第6批，3层嵌套）=====
      {
        path: 'document-collaboration',
        name: 'MobileDocumentCollaborationRoot',
        redirect: '/mobile/centers/document-collaboration/index',
        meta: {
          title: '文档协作',
          icon: 'Connection',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentCollaboration',
            component: () => import('@/pages/mobile/centers/document-collaboration/index.vue'),
            meta: {
              title: '协作管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '文档协作、多人编辑、版本控制'
            }
          },
          {
            path: 'shared-docs',
            name: 'MobileDocumentShared',
            component: () => import('@/pages/mobile/centers/document-collaboration/index.vue'),
            meta: {
              title: '共享文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'edit/:id',
            name: 'MobileDocumentCollaborativeEdit',
            component: () => import('@/pages/mobile/centers/document-collaboration/index.vue'),
            meta: {
              title: '协作编辑',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'history/:id?',
            name: 'MobileDocumentVersionHistory',
            component: () => import('@/pages/mobile/centers/document-collaboration/index.vue'),
            meta: {
              title: '版本历史',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'comments/:id?',
            name: 'MobileDocumentComments',
            component: () => import('@/pages/mobile/centers/document-collaboration/index.vue'),
            meta: {
              title: '评论协作',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 文档编辑器模块（第7批，3层嵌套）=====
      {
        path: 'document-editor',
        name: 'MobileDocumentEditorRoot',
        redirect: '/mobile/centers/document-editor/index',
        meta: {
          title: '文档编辑器',
          icon: 'EditPen',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentEditor',
            component: () => import('@/pages/mobile/centers/document-editor/index.vue'),
            meta: {
              title: '文档编辑',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '富文本编辑器、格式化、文档编辑功能'
            }
          },
          {
            path: 'new/:templateId?',
            name: 'MobileDocumentNew',
            component: () => import('@/pages/mobile/centers/document-editor/index.vue'),
            meta: {
              title: '新建文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'edit/:id',
            name: 'MobileDocumentEdit',
            component: () => import('@/pages/mobile/centers/document-editor/index.vue'),
            meta: {
              title: '编辑文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'preview/:id',
            name: 'MobileDocumentPreview',
            component: () => import('@/pages/mobile/centers/document-editor/index.vue'),
            meta: {
              title: '预览文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'autosave/:id?',
            name: 'MobileDocumentAutosave',
            component: () => import('@/pages/mobile/centers/document-editor/index.vue'),
            meta: {
              title: '自动保存',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'low'
            }
          }
        ]
      },

      // ===== 文档实例列表模块（第7批，3层嵌套）=====
      {
        path: 'document-instance-list',
        name: 'MobileDocumentInstanceListRoot',
        redirect: '/mobile/centers/document-instance-list/index',
        meta: {
          title: '文档实例列表',
          icon: 'Files',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentInstanceList',
            component: () => import('@/pages/mobile/centers/document-instance-list/index.vue'),
            meta: {
              title: '实例列表',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '文档实例管理、实例搜索、实例操作'
            }
          },
          {
            path: 'my-docs',
            name: 'MobileDocumentMyInstances',
            component: () => import('@/pages/mobile/centers/document-instance-list/index.vue'),
            meta: {
              title: '我的文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'shared',
            name: 'MobileDocumentSharedInstances',
            component: () => import('@/pages/mobile/centers/document-instance-list/index.vue'),
            meta: {
              title: '共享文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'recent',
            name: 'MobileDocumentRecentInstances',
            component: () => import('@/pages/mobile/centers/document-instance-list/index.vue'),
            meta: {
              title: '最近文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'favorites',
            name: 'MobileDocumentFavoriteInstances',
            component: () => import('@/pages/mobile/centers/document-instance-list/index.vue'),
            meta: {
              title: '收藏文档',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 文档统计模块（第7批，3层嵌套）=====
      {
        path: 'document-statistics',
        name: 'MobileDocumentStatisticsRoot',
        redirect: '/mobile/centers/document-statistics/index',
        meta: {
          title: '文档统计',
          icon: 'DataBoard',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileDocumentStatistics',
            component: () => import('@/pages/mobile/centers/document-statistics/index.vue'),
            meta: {
              title: '统计分析',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '文档使用统计、访问分析、性能监控'
            }
          },
          {
            path: 'usage',
            name: 'MobileDocumentUsageStats',
            component: () => import('@/pages/mobile/centers/document-statistics/index.vue'),
            meta: {
              title: '使用统计',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'access',
            name: 'MobileDocumentAccessStats',
            component: () => import('@/pages/mobile/centers/document-statistics/index.vue'),
            meta: {
              title: '访问统计',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'collaboration',
            name: 'MobileDocumentCollaborationStats',
            component: () => import('@/pages/mobile/centers/document-statistics/index.vue'),
            meta: {
              title: '协作统计',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'reports',
            name: 'MobileDocumentReports',
            component: () => import('@/pages/mobile/centers/document-statistics/index.vue'),
            meta: {
              title: '统计报表',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 任务表单模块（第7批，3层嵌套）=====
      {
        path: 'task-form',
        name: 'MobileTaskFormRoot',
        redirect: '/mobile/centers/task-form/index',
        meta: {
          title: '任务表单',
          icon: 'Edit',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileTaskForm',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '表单管理',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '任务表单设计、表单配置、表单管理'
            }
          },
          {
            path: 'create/:taskId?',
            name: 'MobileTaskFormCreate',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '创建表单',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'edit/:id',
            name: 'MobileTaskFormEdit',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '编辑表单',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'fill/:id',
            name: 'MobileTaskFormFill',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '填写表单',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'templates',
            name: 'MobileTaskFormTemplates',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '表单模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'submissions/:id?',
            name: 'MobileTaskFormSubmissions',
            component: () => import('@/pages/mobile/centers/task-form/index.vue'),
            meta: {
              title: '提交记录',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 模板详情模块（第7批，3层嵌套）=====
      {
        path: 'template-detail',
        name: 'MobileTemplateDetailRoot',
        redirect: '/mobile/centers/template-detail/index',
        meta: {
          title: '模板详情',
          icon: 'Document',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileTemplateDetail',
            component: () => import('@/pages/mobile/centers/template-detail/index.vue'),
            meta: {
              title: '模板查看',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: false,
              priority: 'high',
              description: '模板详情查看、模板信息管理'
            }
          },
          {
            path: 'view/:id',
            name: 'MobileTemplateView',
            component: () => import('@/pages/mobile/centers/template-detail/index.vue'),
            meta: {
              title: '查看模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'apply/:id',
            name: 'MobileTemplateApply',
            component: () => import('@/pages/mobile/centers/template-detail/index.vue'),
            meta: {
              title: '应用模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'download/:id',
            name: 'MobileTemplateDownload',
            component: () => import('@/pages/mobile/centers/template-detail/index.vue'),
            meta: {
              title: '下载模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'share/:id?',
            name: 'MobileTemplateShare',
            component: () => import('@/pages/mobile/centers/template-detail/index.vue'),
            meta: {
              title: '分享模板',
              requiresAuth: true,
              roles: ['admin', 'principal', 'teacher'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 用量中心模块（新增，对齐PC端）=====
      {
        path: 'usage-center',
        name: 'MobileUsageCenterRoot',
        redirect: '/mobile/centers/usage-center/index',
        meta: {
          title: '用量中心',
          icon: 'DataBoard',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileUsageCenter',
            component: () => import('@/pages/mobile/centers/usage-center/index.vue'),
            meta: {
              title: '用量统计',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: 'AI使用量统计、资源用量监控、用量分析'
            }
          },
          {
            path: 'ai-usage',
            name: 'MobileUsageAi',
            component: () => import('@/pages/mobile/centers/usage-center/index.vue'),
            meta: {
              title: 'AI用量',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'resource',
            name: 'MobileUsageResource',
            component: () => import('@/pages/mobile/centers/usage-center/index.vue'),
            meta: {
              title: '资源用量',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'analysis',
            name: 'MobileUsageAnalysis',
            component: () => import('@/pages/mobile/centers/usage-center/index.vue'),
            meta: {
              title: '用量分析',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 集团中心模块（新增，对齐PC端）=====
      {
        path: 'group-center',
        name: 'MobileGroupCenterRoot',
        redirect: '/mobile/centers/group-center/index',
        meta: {
          title: '集团中心',
          icon: 'OfficeBuilding',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileGroupCenter',
            component: () => import('@/pages/mobile/centers/group-center/index.vue'),
            meta: {
              title: '集团管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '集团信息管理、园区管理、集团统计'
            }
          },
          {
            path: 'kindergartens',
            name: 'MobileGroupKindergartens',
            component: () => import('@/pages/mobile/centers/group-center/index.vue'),
            meta: {
              title: '园区管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'overview',
            name: 'MobileGroupOverview',
            component: () => import('@/pages/mobile/centers/group-center/index.vue'),
            meta: {
              title: '集团概览',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'reports',
            name: 'MobileGroupReports',
            component: () => import('@/pages/mobile/centers/group-center/index.vue'),
            meta: {
              title: '集团报告',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      // ===== 系统中心统一模块（第7批，3层嵌套）=====
      {
        path: 'system-center-unified',
        name: 'MobileSystemCenterUnifiedRoot',
        // NOTE: 临时重定向到system-center，system-center-unified组件有加载问题
        redirect: '/mobile/centers/system-center',
        meta: {
          title: '系统中心统一',
          icon: 'Setting',
          requiresAuth: true,
          roles: ['admin', 'principal'],
          hideInMenu: false,
          priority: 'high'
        },
        children: [
          {
            path: 'index',
            name: 'MobileSystemCenterUnified',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统统一管理',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: false,
              priority: 'high',
              description: '系统设置统一管理、系统监控、系统维护'
            }
          },
          {
            path: 'overview',
            name: 'MobileSystemOverview',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统概览',
              requiresAuth: true,
              roles: ['admin', 'principal'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'configuration',
            name: 'MobileSystemConfiguration',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统配置',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'maintenance',
            name: 'MobileSystemMaintenance',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统维护',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'backup',
            name: 'MobileSystemBackup',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统备份',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          },
          {
            path: 'upgrade',
            name: 'MobileSystemUpgrade',
            component: () => import('@/pages/mobile/centers/system-center-unified/index.vue'),
            meta: {
              title: '系统升级',
              requiresAuth: true,
              roles: ['admin'],
              hideInMenu: true,
              priority: 'medium'
            }
          }
        ]
      },

      {
        path: 'my-task-center',
        name: 'MobileMyTaskCenter',
        component: () => import('@/pages/mobile/centers/my-task-center/index.vue'),
        meta: {
          title: '我的任务',
          icon: 'Check',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'photo-album-center',
        name: 'MobilePhotoAlbumCenter',
        component: () => import('@/pages/mobile/centers/photo-album-center/index.vue'),
        meta: {
          title: '相册中心',
          icon: 'Picture',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'schedule-center',
        name: 'MobileScheduleCenter',
        component: () => import('@/pages/mobile/centers/schedule-center/index.vue'),
        meta: {
          title: '日程中心',
          icon: 'Calendar',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'medium'
        }
      },

      {
        path: 'user-center',
        name: 'MobileUserCenter',
        component: () => import('@/pages/mobile/centers/user-center/index.vue'),
        meta: {
          title: '用户中心',
          icon: 'UserFilled',
          requiresAuth: true,
          roles: ['admin', 'principal', 'teacher'],
          hideInMenu: false,
          priority: 'medium'
        }
      }
    ]
  },

  // ===== 兼容性路由（保持现有单层路由结构） =====
  // 这些路由确保现有功能不受影响，提供向后兼容
  {
    path: '/mobile/centers/:center',
    name: 'MobileCenterRedirect',
    redirect: to => {
      // 动态重定向到对应的index页面
      const centerName = to.params.center as string
      return `/mobile/centers/${centerName}/index`
    },
    meta: {
      hideInMenu: true
    }
  }
]

export default centersRoutes