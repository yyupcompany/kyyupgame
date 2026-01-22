/**
 * 中心化页面路由配置
 * 
 * 功能说明:
 * - 面向管理员的统一工作台
 * - 包含20+个中心页面：招生中心、人员中心、活动中心、系统中心、任务中心、
 *   检查中心、招商中心、财务中心、通话中心、客户中心、教学中心、文档中心、
 *   相册中心、考勤中心、评估中心等
 * - 将分散的功能聚合到统一页面
 * - 提供快捷操作入口和数据概览
 * 
 * 权限说明:
 * - 需要管理员权限
 * - 每个中心有独立的权限控制
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

// 中心化页面组件懒加载导入
const CentersIndex = () => import('@/pages/centers/index.vue')
const EnrollmentCenter = () => import('@/pages/centers/EnrollmentCenter.vue')
const PersonnelCenter = () => import('@/pages/centers/PersonnelCenter.vue')
const ActivityCenter = () => import('@/pages/centers/ActivityCenter.vue')
const TaskCenter = () => import('@/pages/centers/TaskCenter.vue')
const TaskForm = () => import('@/pages/centers/TaskForm.vue')
const MarketingCenter = () => import('@/pages/centers/MarketingCenter.vue')
const AICenter = () => import('@/pages/centers/AICenter.vue')
const SystemCenter = () => import('@/pages/centers/SystemCenter.vue')
const CustomerPoolCenter = () => import('@/pages/centers/CustomerPoolCenter.vue')
const AnalyticsCenter = () => import('@/pages/centers/AnalyticsCenter.vue')
const InspectionCenter = () => import('@/pages/centers/InspectionCenter.vue')
const BusinessCenter = () => import('@/pages/centers/BusinessCenter.vue')
const FinanceCenter = () => import('@/pages/centers/FinanceCenter.vue')
const CallCenter = () => import('@/pages/centers/CallCenter.vue')
// 保留旧的教学中心作为备份
const TeachingCenter = () => import('@/pages/centers/TeachingCenter.vue')
const MediaCenter = () => import('@/pages/centers/PhotoAlbumCenter.vue')
const AttendanceCenter = () => import('@/pages/centers/AttendanceCenter.vue')
const AssessmentCenter = () => import('@/pages/centers/AssessmentCenter.vue')
const DocumentCollaboration = () => import('@/pages/centers/DocumentCollaboration.vue')
const DocumentEditor = () => import('@/pages/centers/DocumentEditor.vue')
const DocumentCenter = () => import('@/pages/centers/DocumentCenter.vue')
const DocumentTemplateCenter = () => import('@/pages/centers/DocumentTemplateCenter.vue')
const DocumentInstanceList = () => import('@/pages/centers/DocumentInstanceList.vue')
const DocumentStatistics = () => import('@/pages/centers/DocumentStatistics.vue')
const UsageCenter = () => import('@/pages/centers/UsageCenter.vue')
const GrowthRecordsCenter = () => import('@/pages/centers/GrowthRecordsCenter.vue')
const CommunicationCenter = () => import('@/pages/parent-center/communication/smart-hub.vue')
const ScriptCenter = () => import('@/pages/centers/ScriptCenter.vue')

export const centersRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有中心页面路由都应该嵌套在 MainLayout 中
  {
    path: '/centers',
    component: Layout,
    redirect: '/centers/index',
    meta: {
      title: '中心管理',
      requiresAuth: true
    },
    children: [
      // 中心目录索引页 - 统一导航入口
      {
        path: 'index',
        name: 'CentersIndex',
        component: CentersIndex,
        meta: {
          title: '中心目录',
          icon: 'Grid',
          requiresAuth: true,
          preload: false,
          priority: 'high',
          centerKey: 'grid'
        }
      },

      // 中心化页面 - 招生中心
      {
        path: 'enrollment',
        name: 'EnrollmentCenter',
        component: EnrollmentCenter,
        meta: {
          title: '招生中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'School',
          description: '统一的招生管理工作台，包含计划管理、申请管理、咨询管理等功能'
        }
      },

      // 中心化页面 - 人员中心
      {
        path: 'personnel',
        name: 'PersonnelCenter',
        component: PersonnelCenter,
        meta: {
          title: '人员中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'UserFilled',
          description: '统一的人员管理工作台，包含学生管理、家长管理、教师管理、班级管理等功能'
        }
      },

      // 中心化页面 - 活动中心
      {
        path: 'activity',
        name: 'ActivityCenter',
        component: ActivityCenter,
        meta: {
          title: '活动中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Trophy',
          description: '统一的活动管理工作台，包含活动策划、活动管理、活动报名、活动统计等功能'
        }
      },

      // 中心化页面 - 系统中心
      {
        path: 'system',
        name: 'SystemCenter',
        component: SystemCenter,
        meta: {
          title: '系统管理',
          requiresAuth: true,
          permission: 'SYSTEM_CENTER_VIEW',
          priority: 'low'
        }
      },

      // 中心化页面 - 任务中心
      {
        path: 'task',
        name: 'TaskCenter',
        component: TaskCenter,
        meta: {
          title: '任务中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'List',
          description: '统一的任务管理工作台，包含任务发布、任务跟进、任务统计、任务提醒等功能'
        }
      },

      // 中心化页面 - 任务表单
      {
        path: 'task/form',
        name: 'TaskForm',
        component: TaskForm,
        meta: {
          title: '任务表单',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'medium'
        }
      },

      // 中心化页面 - 模板详情
      {
        path: 'template/detail',
        name: 'TemplateDetail',
        component: () => import('@/pages/centers/TemplateDetail.vue'),
        meta: {
          title: '模板详情',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low',
          icon: 'Document',
          description: '文档模板详情查看和编辑'
        }
      },

      // 中心化页面 - 检查中心
      {
        path: 'inspection',
        name: 'InspectionCenter',
        component: InspectionCenter,
        meta: {
          title: '检查中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'View',
          description: '统一的检查管理工作台，包含检查计划、检查记录、检查统计、整改跟进等功能'
        }
      },

      // 中心化页面 - 招商中心（营销中心）
      {
        path: 'marketing',
        name: 'MarketingCenter',
        component: MarketingCenter,
        meta: {
          title: '营销中心',
          requiresAuth: true,
          permission: 'MARKETING_CENTER_VIEW',
          priority: 'medium'
        }
      },

      // 中心化页面 - 财务中心
      {
        path: 'finance',
        name: 'FinanceCenter',
        component: FinanceCenter,
        meta: {
          title: '财务中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Money',
          description: '统一的财务管理工作台，包含收费管理、支出管理、财务统计、财务报表等功能'
        }
      },

      // 中心化页面 - 通话中心
      {
        path: 'call',
        name: 'CallCenter',
        component: CallCenter,
        meta: {
          title: '通话中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'medium',
          icon: 'Phone',
          description: '统一的通话管理工作台，包含通话记录、通话统计、外呼管理、客服管理等功能'
        }
      },

      // 中心化页面 - 客户中心
      {
        path: 'customer-pool',
        name: 'CustomerPoolCenter',
        component: CustomerPoolCenter,
        meta: {
          title: '客户池中心',
          requiresAuth: true,
          permission: 'CUSTOMER_POOL_CENTER_VIEW',
          priority: 'medium',
          icon: 'User',
          description: '统一的客户管理工作台，包含客户信息、跟进记录、客户分析、客户服务等功能'
        }
      },

      // 中心化页面 - 教学中心（目前使用旧的TeachingCenter，新的AdminTeachingCenter待修复）
      {
        path: 'teaching',
        name: 'TeachingCenter',
        component: () => import('@/pages/centers/TeachingCenter.vue'),
        meta: {
          title: '教学中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Reading',
          description: '统一的教学管理工作台，包含课程管理、教学记录、教学评估、教学资源等功能'
        }
      },

      // 中心化页面 - 文档管理中心
      {
        path: 'document-center',
        name: 'DocumentCenter',
        component: DocumentCenter,
        meta: {
          title: '文档管理中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'medium',
          icon: 'FolderOpened',
          description: '统一的文档模板和实例管理平台，支持模板创建、实例管理、版本控制'
        }
      },

      // 中心化页面 - 文档协作
      {
        path: 'document-collaboration',
        name: 'DocumentCollaboration',
        component: DocumentCollaboration,
        meta: {
          title: '文档协作',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'medium',
          icon: 'Document',
          description: '文档协作平台，支持多人实时编辑、版本管理和文档共享'
        }
      },

      // 中心化页面 - 文档编辑器
      {
        path: 'document-editor',
        name: 'DocumentEditor',
        component: DocumentEditor,
        meta: {
          title: '文档编辑器',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low',
          icon: 'Edit',
          description: '富文本文档编辑器'
        }
      },

      // 中心化页面 - 文档模板中心
      {
        path: 'document-template',
        name: 'DocumentTemplateCenter',
        component: DocumentTemplateCenter,
        meta: {
          title: '文档模板中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'medium',
          icon: 'Grid',
          description: '文档模板管理，提供各类文档模板'
        }
      },

      // 中心化页面 - 文档实例列表
      {
        path: 'document-instances',
        name: 'DocumentInstanceList',
        component: DocumentInstanceList,
        meta: {
          title: '文档实例列表',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low',
          icon: 'List',
          description: '文档实例管理'
        }
      },

      // 中心化页面 - 文档统计
      {
        path: 'document-statistics',
        name: 'DocumentStatistics',
        component: DocumentStatistics,
        meta: {
          title: '文档统计',
          requiresAuth: true,
          hideInMenu: true,
          priority: 'low',
          icon: 'TrendCharts',
          description: '文档使用统计分析'
        }
      },

      // 中心化页面 - 相册中心（原媒体中心）
      {
        path: 'media',
        name: 'MediaCenter',
        component: MediaCenter,
        meta: {
          title: '相册中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Picture',
          description: '统一的媒体管理工作台，包含媒体资源、素材管理、媒体发布、媒体分析等功能'
        }
      },

      // 中心化页面 - 考勤中心
      {
        path: 'attendance',
        name: 'AttendanceCenter',
        component: AttendanceCenter,
        meta: {
          title: '考勤中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Clock',
          description: '统一的考勤管理工作台，包含考勤记录、考勤统计、异常处理、考勤报表等功能'
        }
      },

      // 中心化页面 - 评估中心
      {
        path: 'assessment',
        name: 'AssessmentCenter',
        component: AssessmentCenter,
        meta: {
          title: '评估中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'DocumentChecked',
          description: '统一的评估管理工作台，包含评估任务、评估记录、评估分析、评估报表等功能'
        }
      },

      // 中心化页面 - AI中心
      {
        path: 'ai',
        name: 'AICenter',
        component: AICenter,
        meta: {
          title: 'AI中心',
          requiresAuth: true,
          permission: 'AI_CENTER_VIEW',
          priority: 'medium'
        }
      },

      // 中心化页面 - 数据分析中心
      {
        path: 'analytics',
        name: 'AnalyticsCenter',
        component: AnalyticsCenter,
        meta: {
          title: '数据分析中心',
          requiresAuth: true,
          permission: 'ANALYTICS_CENTER_VIEW',
          priority: 'medium'
        }
      },

      // 中心化页面 - 用量中心
      {
        path: 'usage',
        name: 'UsageCenter',
        component: UsageCenter,
        meta: {
          title: '用量中心',
          requiresAuth: true,
          permission: 'USAGE_CENTER_VIEW',
          hideInMenu: false,
          priority: 'medium',
          icon: 'TrendCharts',
          description: '系统用量统计、资源监控、使用分析'
        }
      },

      // 中心化页面 - 成长档案中心
      {
        path: 'growth-records',
        name: 'GrowthRecordsCenter',
        component: GrowthRecordsCenter,
        meta: {
          title: '成长档案中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'TrendCharts',
          description: '学生身高、体重、体能等成长数据管理，包含成长曲线、评估报告、同龄对比等功能'
        }
      },

      // 中心化页面 - 沟通中心
      {
        path: 'communication',
        name: 'CommunicationCenter',
        component: CommunicationCenter,
        meta: {
          title: '沟通中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'ChatDotRound',
          description: 'AI驱动的家长沟通平台，包含智能内容生成、回复建议、沟通分析等功能'
        }
      },

      // 中心化页面 - 话术管理
      {
        path: 'script',
        name: 'ScriptCenter',
        component: ScriptCenter,
        meta: {
          title: '话术管理',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'medium',
          icon: 'ChatDotRound',
          description: '统一的话术管理平台，包含招生话术、电话话术、接待话术、跟进话术等功能'
        }
      },

      // 中心化页面 - 业务中心
      {
        path: 'business',
        name: 'BusinessCenter',
        component: BusinessCenter,
        meta: {
          title: '业务中心',
          requiresAuth: true,
          hideInMenu: false,
          priority: 'high',
          icon: 'Briefcase',
          description: '统一的业务管理工作台，包含业务流程、业务数据、业务分析等功能'
        }
      },

      // 仪表盘中心
      {
        path: 'dashboard',
        name: 'DashboardCenter',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: {
          title: '仪表盘中心',
          requiresAuth: true,
          permission: 'DASHBOARD_CENTER_VIEW',
          priority: 'high'
        }
      },

      // 营销子路由
      {
        path: 'marketing/channels',
        name: 'MarketingChannels',
        component: () => import('@/pages/marketing/channels/index.vue'),
        meta: { title: '渠道管理', requiresAuth: true, permission: 'MARKETING_CHANNELS_MANAGE', hideInMenu: true }
      },
      {
        path: 'marketing/referrals',
        name: 'MarketingReferrals',
        component: () => import('@/pages/marketing/referrals/index.vue'),
        meta: { title: '老带新', requiresAuth: true, permission: 'MARKETING_REFERRALS_MANAGE', hideInMenu: true }
      },
      {
        path: 'marketing/conversions',
        name: 'MarketingConversions',
        component: () => import('@/pages/marketing/conversions/index.vue'),
        meta: { title: '转换统计', requiresAuth: true, permission: 'MARKETING_STATS_VIEW', hideInMenu: true }
      },
      {
        path: 'marketing/funnel',
        name: 'MarketingFunnel',
        component: () => import('@/pages/marketing/funnel/index.vue'),
        meta: { title: '销售漏斗', requiresAuth: true, permission: 'MARKETING_FUNNEL_VIEW', hideInMenu: true }
      },
      {
        path: 'marketing/performance',
        name: 'MarketingPerformance',
        component: () => import('@/pages/centers/marketing/performance.vue'),
        meta: {
          title: '营销业绩',
          requiresAuth: true,
          permission: 'MARKETING_PERFORMANCE_VIEW',
          hideInMenu: true,
          priority: 'low'
        }
      }
    ]
  }
]

export default centersRoutes
