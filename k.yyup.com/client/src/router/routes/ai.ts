/**
 * AI功能路由配置
 * 
 * 功能说明:
 * - AI助手、AI智能查询
 * - AI分析、AI模型管理
 * - 专家咨询、记忆管理
 * - NLP分析、文本分析
 * - 预测引擎、3D分析
 * 
 * 权限说明:
 * - 大部分功能需要登录
 * - 部分功能需要特定权限
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件
const Layout = () => import('@/layouts/MainLayout.vue')

// AI模块页面组件懒加载导入
const AIQueryInterface = () => import('@/pages/ai/AIQueryInterface.vue')
const AIAssistantPage = () => import('@/pages/ai/index.vue')
const ExpertConsultationPage = () => import('@/pages/ai/ExpertConsultationPage.vue')

export const aiRoutes: RouteRecordRaw[] = [
  // 🎯 AI助手页面（独立全屏页面，不使用Layout包裹）
  {
    path: '/ai',
    name: 'AI',
    component: AIAssistantPage,
    meta: {
      title: 'AI助手',
      icon: 'ChatDotRound',
      requiresAuth: true,
      hideInMenu: false,
      priority: 'medium',
      preload: false
    }
  },

  // 🎯 AI助手页面（备用路由，向后兼容）
  {
    path: '/aiassistant',
    name: 'AIAssistant',
    component: () => import('@/components/ai-assistant/AIAssistantFullPage.vue'),
    meta: {
      title: 'AI助手',
      icon: 'ChatDotRound',
      requiresAuth: true,
      hideInMenu: false,
      priority: 'medium',
      preload: false
    }
  },

  // 🤖 AI助手页面（主应用内嵌路由）- 嵌套在 MainLayout 中
  {
    path: '/ai/assistant',
    component: Layout,
    children: [
      {
        path: '',
        name: 'AIAssistantEmbedded',
        component: () => import('@/pages/ai/assistant.vue'),
        meta: {
          title: 'AI助手',
          icon: 'ChatDotRound',
          requiresAuth: true,
          preload: false,
          priority: 'medium'
        }
      }
    ]
  },

  // 🤖 AI智能查询页面 - 嵌套在 MainLayout 中
  {
    path: '/ai/query',
    component: Layout,
    children: [
      {
        path: '',
        name: 'AIQuery',
        component: AIQueryInterface,
        meta: {
          title: 'AI智能查询',
          icon: 'Search',
          requiresAuth: true,
          preload: false,
          priority: 'medium'
        }
      }
    ]
  },

  // 🔧 AI助手子路由（保留子功能路由）- 嵌套在 MainLayout 中
  {
    path: '/ai',
    component: Layout,
    meta: {
      title: 'AI助手',
      requiresAuth: true
    },
    children: [
      {
        path: 'query-interface',
        name: 'AIQueryInterface',
        component: AIQueryInterface,
        meta: {
          title: 'AI智能查询',
          requiresAuth: true,
          permission: 'AI_QUERY_EXECUTE',
          priority: 'high'
        }
      },
      {
        path: 'model',
        name: 'AIModelManagement',
        component: () => import('@/pages/ai/ModelManagementPage.vue'),
        meta: {
          title: 'AI模型管理',
          requiresAuth: true,
          permission: 'AI_MODEL_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        // 添加 /models 作为 /model 的别名（复数形式，更符合RESTful习惯）
        path: 'models',
        name: 'AIModelManagementAlias',
        redirect: { name: 'AIModelManagement' },
        meta: {
          title: 'AI模型管理',
          requiresAuth: true,
          permission: 'AI_MODEL_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'analytics',
        name: 'AIAnalytics',
        component: () => import('@/pages/ai/analytics/index.vue'),
        meta: {
          title: 'AI数据分析',
          requiresAuth: true,
          permission: 'AI_ANALYTICS_VIEW',
          priority: 'medium'
        }
      },
      {
        path: 'model-management',
        name: 'AIModelManagementPage',
        component: () => import('@/pages/ai/ModelManagementPage.vue'),
        meta: {
          title: 'AI模型管理页面',
          requiresAuth: true,
          permission: 'AI_MODEL_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'expert-consultation',
        name: 'AIExpertConsultationPage',
        component: () => import('@/pages/ai/ExpertConsultationPage.vue'),
        meta: {
          title: 'AI专家咨询页面',
          requiresAuth: true,
          permission: 'AI_EXPERT_CONSULTATION',
          priority: 'medium'
        }
      },
      {
        path: 'memory',
        name: 'AIMemoryManagementPage',
        component: () => import('@/pages/ai/MemoryManagementPage.vue'),
        meta: {
          title: 'AI记忆管理',
          requiresAuth: true,
          permission: 'AI_MEMORY_MANAGEMENT',
          priority: 'medium'
        }
      },
      {
        path: 'conversation/nlp-analytics',
        name: 'NLPAnalytics',
        component: () => import('@/pages/ai/conversation/nlp-analytics.vue'),
        meta: {
          title: 'NLP分析',
          requiresAuth: true,
          permission: 'AI_NLP_ANALYTICS',
          priority: 'medium'
        }
      },
      {
        path: 'nlp/text-analysis',
        name: 'TextAnalysis',
        component: () => import('@/pages/ai/nlp/TextAnalysis.vue'),
        meta: {
          title: 'AI文本分析',
          requiresAuth: true,
          permission: 'AI_TEXT_ANALYSIS',
          priority: 'medium'
        }
      },
      {
        path: 'machine-learning/model-training',
        name: 'ModelTraining',
        component: () => import('@/pages/ai/machine-learning/ModelTraining.vue'),
        meta: {
          title: 'AI模型训练',
          requiresAuth: true,
          permission: 'AI_MODEL_TRAINING',
          priority: 'high'
        }
      },
      {
        path: 'deep-learning/prediction-engine',
        name: 'PredictionEngine',
        component: () => import('@/pages/ai/deep-learning/prediction-engine.vue'),
        meta: {
          title: '预测引擎',
          requiresAuth: true,
          permission: 'AI_PREDICTION_ENGINE',
          priority: 'medium'
        }
      },
      {
        path: 'visualization/3d-analytics',
        name: 'ThreeDAnalytics',
        component: () => import('@/pages/ai/visualization/3d-analytics.vue'),
        meta: {
          title: '3D分析可视化',
          requiresAuth: true,
          permission: 'AI_3D_ANALYTICS',
          priority: 'low'
        }
      }
    ]
  },

  // 🔧 AI服务路由 - 嵌套在 MainLayout 中
  {
    path: '/ai-services',
    component: Layout,
    redirect: { name: 'ExpertConsultationPage' },
    meta: {
      title: 'AI服务',
      icon: 'Service',
      requiresAuth: true,
      permission: 'AI_SERVICES_USE',
      priority: 'medium'
    },
    children: [
      {
        path: 'expert-consultation',
        name: 'ExpertConsultationPage',
        component: ExpertConsultationPage,
        meta: {
          title: '专家咨询',
          requiresAuth: true,
          permission: 'AI_EXPERT_CONSULTATION',
          priority: 'medium'
        }
      }
    ]
  },

  // 🔧 AI中心专家咨询路由 - 已经嵌套在 MainLayout 中
  {
    path: '/ai-center',
    component: Layout,
    name: 'AICenterRoot',
    redirect: '/centers/ai',
    children: [
      {
        path: 'expert-consultation',
        name: 'ExpertConsultation',
        component: () => import('@/pages/ai/ExpertConsultationPage.vue'),
        meta: {
          title: 'AI专家咨询',
          requiresAuth: true,
          permission: 'AI_EXPERT_CONSULTATION',
          priority: 'medium'
        }
      }
    ]
  }
]

export default aiRoutes
