/**
 * 完整的4角色侧边栏配置 - 基于全面扫描结果
 * 包含所有发现的页面和功能模块
 */

export interface CompleteNavigationItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  component?: string;
  children?: CompleteNavigationItem[];
  meta?: {
    requiresAuth?: boolean;
    keepAlive?: boolean;
    breadcrumb?: string[];
  };
}

export interface CompleteNavigationSection {
  id: string;
  title: string;
  items: CompleteNavigationItem[];
  order: number;
  collapsed?: boolean;
}

export interface CompleteRoleNavigationConfig {
  role: string;
  sections: CompleteNavigationSection[];
}

// 📱 管理员 (Admin) - 超级权限配置
export const completeAdminNavigation: CompleteRoleNavigationConfig = {
  role: 'admin',
  sections: [
    {
      id: 'dashboard',
      title: '🏠 工作台',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'Dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'campus-overview',
          title: '校园概览',
          route: '/dashboard/campus-overview',
          icon: 'School',
          component: '/dashboard/CampusOverview.vue'
        },
        {
          id: 'data-statistics',
          title: '数据统计',
          route: '/dashboard/data-statistics',
          icon: 'TrendingUp',
          component: '/dashboard/DataStatistics.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'Notification',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'Calendar',
          component: '/dashboard/Schedule.vue'
        },
        {
          id: 'new-dashboard',
          title: '新仪表板',
          route: '/dashboard/new-dashboard',
          icon: 'Monitor',
          component: '/dashboard/NewDashboard.vue'
        },
        {
          id: 'custom-layout',
          title: '自定义布局',
          route: '/dashboard/custom-layout',
          icon: 'Grid',
          component: '/dashboard/CustomLayout.vue'
        }
      ]
    },
    {
      id: 'enrollment-management',
      title: '🎓 招生管理',
      order: 2,
      items: [
        {
          id: 'enrollment-overview',
          title: '招生概览',
          route: '/enrollment',
          icon: 'UserPlus',
          component: '/enrollment/index.vue'
        },
        {
          id: 'enrollment-plan',
          title: '招生计划',
          route: '/enrollment-plan',
          icon: 'FileText',
          component: '/enrollment-plan.vue',
          children: [
            {
              id: 'plan-detail',
              title: '计划详情',
              route: '/enrollment-plan/detail',
              icon: 'Info',
              component: '/enrollment-plan/PlanDetail.vue'
            },
            {
              id: 'plan-edit',
              title: '计划编辑',
              route: '/enrollment-plan/edit',
              icon: 'Edit',
              component: '/enrollment-plan/PlanEdit.vue'
            },
            {
              id: 'quota-management',
              title: '名额管理',
              route: '/enrollment-plan/quota-management',
              icon: 'Users',
              component: '/enrollment-plan/QuotaManagement.vue'
            },
            {
              id: 'enrollment-statistics',
              title: '招生统计',
              route: '/enrollment-plan/statistics',
              icon: 'BarChart',
              component: '/enrollment-plan/Statistics.vue'
            }
          ]
        },
        {
          id: 'ai-enrollment-strategy',
          title: '🤖 AI招生策略',
          route: '/enrollment-plan/ai-forecasting',
          icon: 'Brain',
          component: '/enrollment-plan/ai-forecasting.vue'
        },
        {
          id: 'enrollment-analytics',
          title: '招生分析',
          route: '/enrollment-plan/analytics',
          icon: 'Analytics',
          children: [
            {
              id: 'enrollment-analytics-overview',
              title: '招生数据分析',
              route: '/enrollment-plan/analytics/enrollment-analytics',
              icon: 'Analytics',
              component: '/enrollment-plan/analytics/enrollment-analytics.vue'
            },
            {
              id: 'enrollment-forecast',
              title: '招生预测',
              route: '/enrollment-plan/forecast/enrollment-forecast',
              icon: 'TrendingUp',
              component: '/enrollment-plan/forecast/enrollment-forecast.vue'
            },
            {
              id: 'enrollment-simulation',
              title: '招生模拟',
              route: '/enrollment-plan/simulation/enrollment-simulation',
              icon: 'PlayCircle',
              component: '/enrollment-plan/simulation/enrollment-simulation.vue'
            },
            {
              id: 'smart-planning',
              title: '智能规划',
              route: '/enrollment-plan/smart-planning/smart-planning',
              icon: 'Brain',
              component: '/enrollment-plan/smart-planning/smart-planning.vue'
            },
            {
              id: 'enrollment-strategy',
              title: '招生策略',
              route: '/enrollment-plan/strategy/enrollment-strategy',
              icon: 'Target',
              component: '/enrollment-plan/strategy/enrollment-strategy.vue'
            },
            {
              id: 'trend-analysis',
              title: '趋势分析',
              route: '/enrollment-plan/trends/trend-analysis',
              icon: 'TrendingUp',
              component: '/enrollment-plan/trends/trend-analysis.vue'
            }
          ]
        },
        {
          id: 'automated-follow-up',
          title: '自动化跟进',
          route: '/enrollment/automated-follow-up',
          icon: 'Repeat',
          component: '/enrollment/automated-follow-up.vue'
        },
        {
          id: 'funnel-analytics',
          title: '漏斗分析',
          route: '/enrollment/funnel-analytics',
          icon: 'Filter',
          component: '/enrollment/funnel-analytics.vue'
        },
        {
          id: 'personalized-strategy',
          title: '个性化策略',
          route: '/enrollment/personalized-strategy',
          icon: 'Target',
          component: '/enrollment/personalized-strategy.vue'
        }
      ]
    },
    {
      id: 'marketing-management',
      title: '📢 营销管理',
      order: 3,
      items: [
        {
          id: 'marketing-overview',
          title: '营销概览',
          route: '/marketing',
          icon: 'Megaphone',
          component: '/marketing.vue'
        },
        {
          id: 'intelligent-marketing',
          title: '智能营销引擎',
          route: '/marketing/automation/intelligent-engine',
          icon: 'Brain',
          component: '/marketing/automation/intelligent-engine.vue'
        },
        {
          id: 'advertisement-management',
          title: '广告管理',
          route: '/advertisement',
          icon: 'AdUnits',
          component: '/advertisement/index.vue'
        }
      ]
    },
    {
      id: 'poster-management',
      title: '🎨 海报管理',
      order: 4,
      items: [
        {
          id: 'poster-editor',
          title: '海报编辑器',
          route: '/principal/poster-editor',
          icon: 'Edit',
          component: '/principal/PosterEditor.vue'
        },
        {
          id: 'poster-generator',
          title: '海报生成器',
          route: '/principal/poster-generator',
          icon: 'AutoAwesome',
          component: '/principal/PosterGenerator.vue'
        },
        {
          id: 'poster-templates',
          title: '海报模板',
          route: '/principal/poster-templates',
          icon: 'Template',
          component: '/principal/PosterTemplates.vue'
        }
      ]
    },
    {
      id: 'activity-management',
      title: '🎯 活动管理',
      order: 5,
      items: [
        {
          id: 'activity-overview',
          title: '活动概览',
          route: '/activity',
          icon: 'Event',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-create',
          title: '创建活动',
          route: '/activity/create',
          icon: 'Add',
          component: '/activity/ActivityCreate.vue'
        },
        {
          id: 'activity-list',
          title: '活动列表',
          route: '/activity/list',
          icon: 'List',
          component: '/activity/ActivityList.vue'
        },
        {
          id: 'activity-intelligent-analysis',
          title: '🤖 智能活动分析',
          route: '/activity/analytics/intelligent-analysis',
          icon: 'Analytics',
          component: '/activity/analytics/intelligent-analysis.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: '🤖 AI功能',
      order: 6,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'SmartToy',
          component: '/ai.vue'
        },
        {
          id: 'ai-assistant-page',
          title: 'AI助手页面',
          route: '/ai/assistant',
          icon: 'Assistant',
          component: '/ai/AIAssistantPage.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天',
          route: '/ai/chat',
          icon: 'Chat',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'ai-expert-consultation',
          title: 'AI专家咨询',
          route: '/ai/expert-consultation',
          icon: 'Psychology',
          component: '/ai/ExpertConsultationPage.vue'
        },
        {
          id: 'ai-memory-management',
          title: 'AI记忆管理',
          route: '/ai/memory-management',
          icon: 'Memory',
          component: '/ai/MemoryManagementPage.vue'
        },
        {
          id: 'ai-model-management',
          title: 'AI模型管理',
          route: '/ai/model-management',
          icon: 'Settings',
          component: '/ai/ModelManagementPage.vue'
        },
        {
          id: 'ai-advanced-features',
          title: 'AI高级功能',
          route: '/ai/advanced',
          icon: 'AutoAwesome',
          children: [
            {
              id: 'nlp-analytics',
              title: 'NLP分析',
              route: '/ai/conversation/nlp-analytics',
              icon: 'Psychology',
              component: '/ai/conversation/nlp-analytics.vue'
            },
            {
              id: 'prediction-engine',
              title: '预测引擎',
              route: '/ai/deep-learning/prediction-engine',
              icon: 'TrendingUp',
              component: '/ai/deep-learning/prediction-engine.vue'
            },
            {
              id: 'maintenance-optimizer',
              title: '预测性维护',
              route: '/ai/predictive/maintenance-optimizer',
              icon: 'Build',
              component: '/ai/predictive/maintenance-optimizer.vue'
            },
            {
              id: '3d-analytics',
              title: '3D分析可视化',
              route: '/ai/visualization/3d-analytics',
              icon: 'View3D',
              component: '/ai/visualization/3d-analytics.vue'
            },
            {
              id: 'ai-evaluation',
              title: 'AI评估中心',
              route: '/ai/evaluation',
              icon: 'Assessment',
              component: '/ai/evaluation/index.vue'
            },
            {
              id: 'ai-optimizer',
              title: 'AI优化器',
              route: '/ai/optimizer',
              icon: 'Tune',
              component: '/ai/optimizer/index.vue'
            },
            {
              id: 'ai-planner',
              title: 'AI规划师',
              route: '/ai/planner',
              icon: 'EventNote',
              component: '/ai/planner/index.vue'
            }
          ]
        },
        {
          id: 'online-chat',
          title: '在线聊天',
          route: '/chat',
          icon: 'Chat',
          component: '/chat/index.vue'
        }
      ]
    },
    {
      id: 'principal-management',
      title: '👑 园长管理',
      order: 7,
      items: [
        {
          id: 'principal-dashboard',
          title: '园长仪表板',
          route: '/principal/dashboard',
          icon: 'Dashboard',
          component: '/principal/Dashboard.vue'
        },
        {
          id: 'principal-activities',
          title: '园长活动管理',
          route: '/principal/activities',
          icon: 'Event',
          component: '/principal/Activities.vue'
        },
        {
          id: 'customer-pool',
          title: '客户池管理',
          route: '/principal/customer-pool',
          icon: 'People',
          component: '/principal/CustomerPool.vue'
        },
        {
          id: 'marketing-analysis',
          title: '营销分析',
          route: '/principal/marketing-analysis',
          icon: 'Analytics',
          component: '/principal/MarketingAnalysis.vue'
        },
        {
          id: 'performance-management',
          title: '绩效管理',
          route: '/principal/performance',
          icon: 'TrendingUp',
          component: '/principal/Performance.vue'
        },
        {
          id: 'performance-rules',
          title: '绩效规则',
          route: '/principal/performance-rules',
          icon: 'Rule',
          component: '/principal/PerformanceRules.vue'
        },
        {
          id: 'intelligent-dashboard',
          title: '智能决策仪表板',
          route: '/principal/decision-support/intelligent-dashboard',
          icon: 'Dashboard',
          component: '/principal/decision-support/intelligent-dashboard.vue'
        }
      ]
    },
    {
      id: 'teacher-management',
      title: '👨‍🏫 教师管理',
      order: 8,
      items: [
        {
          id: 'teacher-overview',
          title: '教师概览',
          route: '/teacher',
          icon: 'Person',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-list',
          title: '教师列表',
          route: '/teacher/list',
          icon: 'List',
          component: '/teacher/TeacherList.vue'
        },
        {
          id: 'teacher-performance',
          title: '教师绩效',
          route: '/teacher/performance',
          icon: 'TrendingUp',
          component: '/teacher/performance/[id].vue'
        }
      ]
    },
    {
      id: 'parent-management',
      title: '👨‍👩‍👧‍👦 家长管理',
      order: 9,
      items: [
        {
          id: 'parent-overview',
          title: '家长概览',
          route: '/parent',
          icon: 'People',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-list',
          title: '家长列表',
          route: '/parent/list',
          icon: 'List',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'children-list',
          title: '子女列表',
          route: '/parent/children',
          icon: 'ChildCare',
          component: '/parent/ChildrenList.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'TrendingUp',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'activity-assign',
          title: '活动分配',
          route: '/parent/assign-activity',
          icon: 'Assignment',
          component: '/parent/AssignActivity.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'FollowTheSigns',
          component: '/parent/FollowUp.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'Chat',
          component: '/parent/communication/smart-hub.vue'
        }
      ]
    },
    {
      id: 'class-management',
      title: '🏫 班级管理',
      order: 10,
      items: [
        {
          id: 'class-overview',
          title: '班级概览',
          route: '/class',
          icon: 'Group',
          component: '/class/index.vue'
        },
        {
          id: 'class-create',
          title: '创建班级',
          route: '/dashboard/class-create',
          icon: 'Add',
          component: '/dashboard/ClassCreate.vue'
        },
        {
          id: 'class-list',
          title: '班级列表',
          route: '/dashboard/class-list',
          icon: 'List',
          component: '/dashboard/ClassList.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'Analytics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'class-optimization',
          title: '班级优化',
          route: '/class/optimization',
          icon: 'TrendingUp',
          component: '/class/optimization/ClassOptimization.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'SmartToy',
          component: '/class/smart-management/[id].vue'
        }
      ]
    },
    {
      id: 'student-management',
      title: '🎓 学生管理',
      order: 11,
      items: [
        {
          id: 'student-overview',
          title: '学生概览',
          route: '/student',
          icon: 'School',
          component: '/student/index.vue'
        },
        {
          id: 'student-analytics',
          title: '学生分析',
          route: '/student/analytics',
          icon: 'Analytics',
          component: '/student/analytics/[id].vue'
        }
      ]
    },
    {
      id: 'application-management',
      title: '📋 申请管理',
      order: 12,
      items: [
        {
          id: 'application-overview',
          title: '申请概览',
          route: '/application',
          icon: 'Assignment',
          component: '/application.vue'
        },
        {
          id: 'application-list',
          title: '申请列表',
          route: '/application/list',
          icon: 'List',
          component: '/application/ApplicationList.vue'
        }
      ]
    },
    {
      id: 'customer-management',
      title: '👥 客户管理',
      order: 13,
      items: [
        {
          id: 'customer-overview',
          title: '客户概览',
          route: '/customer',
          icon: 'People',
          component: '/customer/index.vue'
        },
        {
          id: 'intelligent-customer-management',
          title: '智能客户管理',
          route: '/customer/lifecycle/intelligent-management',
          icon: 'SmartToy',
          component: '/customer/lifecycle/intelligent-management.vue'
        }
      ]
    },
    {
      id: 'analytics-reports',
      title: '📊 分析报告',
      order: 14,
      items: [
        {
          id: 'statistics-overview',
          title: '统计概览',
          route: '/statistics',
          icon: 'Assessment',
          component: '/statistics/index.vue'
        },
        {
          id: 'report-builder',
          title: '报告构建器',
          route: '/analytics/report-builder',
          icon: 'Report',
          component: '/analytics/ReportBuilder.vue'
        },
        {
          id: 'dashboard-analytics',
          title: '仪表板分析',
          route: '/dashboard/analytics',
          icon: 'Analytics',
          children: [
            {
              id: 'enrollment-trends',
              title: '招生趋势',
              route: '/dashboard/analytics/enrollment-trends',
              icon: 'TrendingUp',
              component: '/dashboard/analytics/EnrollmentTrends.vue'
            },
            {
              id: 'financial-analysis',
              title: '财务分析',
              route: '/dashboard/analytics/financial-analysis',
              icon: 'AttachMoney',
              component: '/dashboard/analytics/FinancialAnalysis.vue'
            },
            {
              id: 'teacher-effectiveness',
              title: '教师效能',
              route: '/dashboard/analytics/teacher-effectiveness',
              icon: 'TrendingUp',
              component: '/dashboard/analytics/TeacherEffectiveness.vue'
            }
          ]
        }
      ]
    },
    {
      id: 'system-management',
      title: '⚙️ 系统管理',
      order: 15,
      items: [
        {
          id: 'system-dashboard',
          title: '系统仪表板',
          route: '/system/dashboard',
          icon: 'Dashboard',
          component: '/system/Dashboard.vue'
        },
        {
          id: 'user-management',
          title: '用户管理',
          route: '/system/users',
          icon: 'Person',
          component: '/system/users/index.vue'
        },
        {
          id: 'role-management',
          title: '角色管理',
          route: '/system/roles',
          icon: 'Group',
          component: '/system/roles/index.vue'
        },
        {
          id: 'permission-management',
          title: '权限管理',
          route: '/system/permissions',
          icon: 'Security',
          component: '/system/permissions.vue'
        },
        {
          id: 'system-settings',
          title: '系统设置',
          route: '/system/settings',
          icon: 'Settings',
          component: '/system/settings/index.vue'
        },
        {
          id: 'system-log',
          title: '系统日志',
          route: '/system/log',
          icon: 'History',
          component: '/system/Log.vue'
        },
        {
          id: 'data-backup',
          title: '数据备份',
          route: '/system/backup',
          icon: 'Backup',
          component: '/system/Backup.vue'
        },
        {
          id: 'security-settings',
          title: '安全设置',
          route: '/system/security',
          icon: 'Shield',
          component: '/system/Security.vue'
        },
        {
          id: 'message-template',
          title: '消息模板',
          route: '/system/message-template',
          icon: 'Message',
          component: '/system/MessageTemplate.vue'
        },
        {
          id: 'ai-model-config',
          title: 'AI模型配置',
          route: '/system/ai-model-config',
          icon: 'SmartToy',
          component: '/system/AIModelConfig.vue'
        }
      ]
    }
  ]
};

// 👑 园长 (Principal) - 管理权限配置
export const completePrincipalNavigation: CompleteRoleNavigationConfig = {
  role: 'principal',
  sections: [
    {
      id: 'dashboard',
      title: '🏠 工作台',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'Dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'campus-overview',
          title: '校园概览',
          route: '/dashboard/campus-overview',
          icon: 'School',
          component: '/dashboard/CampusOverview.vue'
        },
        {
          id: 'data-statistics',
          title: '数据统计',
          route: '/dashboard/data-statistics',
          icon: 'TrendingUp',
          component: '/dashboard/DataStatistics.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'Notification',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'Calendar',
          component: '/dashboard/Schedule.vue'
        }
      ]
    },
    {
      id: 'principal-workspace',
      title: '👑 园长工作台',
      order: 2,
      items: [
        {
          id: 'principal-dashboard',
          title: '园长仪表板',
          route: '/principal/dashboard',
          icon: 'Dashboard',
          component: '/principal/Dashboard.vue'
        },
        {
          id: 'performance-management',
          title: '绩效管理',
          route: '/principal/performance',
          icon: 'TrendingUp',
          component: '/principal/Performance.vue'
        },
        {
          id: 'performance-rules',
          title: '绩效规则',
          route: '/principal/performance-rules',
          icon: 'Rule',
          component: '/principal/PerformanceRules.vue'
        },
        {
          id: 'marketing-analysis',
          title: '营销分析',
          route: '/principal/marketing-analysis',
          icon: 'Analytics',
          component: '/principal/MarketingAnalysis.vue'
        },
        {
          id: 'customer-pool',
          title: '客户池管理',
          route: '/principal/customer-pool',
          icon: 'People',
          component: '/principal/CustomerPool.vue'
        },
        {
          id: 'principal-activities',
          title: '活动管理',
          route: '/principal/activities',
          icon: 'Event',
          component: '/principal/Activities.vue'
        },
        {
          id: 'intelligent-dashboard',
          title: '智能决策仪表板',
          route: '/principal/decision-support/intelligent-dashboard',
          icon: 'Dashboard',
          component: '/principal/decision-support/intelligent-dashboard.vue'
        }
      ]
    },
    {
      id: 'poster-management',
      title: '🎨 海报管理',
      order: 3,
      items: [
        {
          id: 'poster-editor',
          title: '海报编辑器',
          route: '/principal/poster-editor',
          icon: 'Edit',
          component: '/principal/PosterEditor.vue'
        },
        {
          id: 'poster-generator',
          title: '海报生成器',
          route: '/principal/poster-generator',
          icon: 'AutoAwesome',
          component: '/principal/PosterGenerator.vue'
        },
        {
          id: 'poster-templates',
          title: '海报模板',
          route: '/principal/poster-templates',
          icon: 'Template',
          component: '/principal/PosterTemplates.vue'
        }
      ]
    },
    {
      id: 'enrollment-management',
      title: '🎓 招生管理',
      order: 4,
      items: [
        {
          id: 'enrollment-overview',
          title: '招生概览',
          route: '/enrollment',
          icon: 'UserPlus',
          component: '/enrollment/index.vue'
        },
        {
          id: 'enrollment-plan',
          title: '招生计划',
          route: '/enrollment-plan',
          icon: 'FileText',
          component: '/enrollment-plan.vue'
        },
        {
          id: 'ai-enrollment-strategy',
          title: '🤖 AI招生策略',
          route: '/enrollment-plan/ai-forecasting',
          icon: 'Brain',
          component: '/enrollment-plan/ai-forecasting.vue'
        },
        {
          id: 'enrollment-analytics',
          title: '招生分析',
          route: '/enrollment-plan/analytics/enrollment-analytics',
          icon: 'Analytics',
          component: '/enrollment-plan/analytics/enrollment-analytics.vue'
        }
      ]
    },
    {
      id: 'marketing-management',
      title: '📢 营销管理',
      order: 5,
      items: [
        {
          id: 'marketing-overview',
          title: '营销概览',
          route: '/marketing',
          icon: 'Megaphone',
          component: '/marketing.vue'
        },
        {
          id: 'intelligent-marketing',
          title: '智能营销引擎',
          route: '/marketing/automation/intelligent-engine',
          icon: 'Brain',
          component: '/marketing/automation/intelligent-engine.vue'
        },
        {
          id: 'advertisement-management',
          title: '广告管理',
          route: '/advertisement',
          icon: 'AdUnits',
          component: '/advertisement/index.vue'
        }
      ]
    },
    {
      id: 'activity-management',
      title: '🎯 活动管理',
      order: 6,
      items: [
        {
          id: 'activity-overview',
          title: '活动概览',
          route: '/activity',
          icon: 'Event',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-intelligent-analysis',
          title: '智能活动分析',
          route: '/activity/analytics/intelligent-analysis',
          icon: 'Analytics',
          component: '/activity/analytics/intelligent-analysis.vue'
        }
      ]
    },
    {
      id: 'teacher-management',
      title: '👨‍🏫 教师管理',
      order: 7,
      items: [
        {
          id: 'teacher-overview',
          title: '教师概览',
          route: '/teacher',
          icon: 'Person',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-list',
          title: '教师列表',
          route: '/teacher/list',
          icon: 'List',
          component: '/teacher/TeacherList.vue'
        },
        {
          id: 'teacher-performance',
          title: '教师绩效',
          route: '/teacher/performance',
          icon: 'TrendingUp',
          component: '/teacher/performance/[id].vue'
        }
      ]
    },
    {
      id: 'class-management',
      title: '🏫 班级管理',
      order: 8,
      items: [
        {
          id: 'class-overview',
          title: '班级概览',
          route: '/class',
          icon: 'Group',
          component: '/class/index.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'Analytics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'SmartToy',
          component: '/class/smart-management/[id].vue'
        }
      ]
    },
    {
      id: 'student-management',
      title: '🎓 学生管理',
      order: 9,
      items: [
        {
          id: 'student-overview',
          title: '学生概览',
          route: '/student',
          icon: 'School',
          component: '/student/index.vue'
        }
      ]
    },
    {
      id: 'parent-management',
      title: '👨‍👩‍👧‍👦 家长管理',
      order: 10,
      items: [
        {
          id: 'parent-overview',
          title: '家长概览',
          route: '/parent',
          icon: 'People',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-list',
          title: '家长列表',
          route: '/parent/list',
          icon: 'List',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'Chat',
          component: '/parent/communication/smart-hub.vue'
        }
      ]
    },
    {
      id: 'customer-management',
      title: '👥 客户管理',
      order: 11,
      items: [
        {
          id: 'customer-overview',
          title: '客户概览',
          route: '/customer',
          icon: 'People',
          component: '/customer/index.vue'
        },
        {
          id: 'intelligent-customer-management',
          title: '智能客户管理',
          route: '/customer/lifecycle/intelligent-management',
          icon: 'SmartToy',
          component: '/customer/lifecycle/intelligent-management.vue'
        }
      ]
    },
    {
      id: 'analytics-reports',
      title: '📊 分析报告',
      order: 12,
      items: [
        {
          id: 'statistics-overview',
          title: '统计概览',
          route: '/statistics',
          icon: 'Assessment',
          component: '/statistics/index.vue'
        },
        {
          id: 'report-builder',
          title: '报告构建器',
          route: '/analytics/report-builder',
          icon: 'Report',
          component: '/analytics/ReportBuilder.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: '🤖 AI功能',
      order: 13,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'SmartToy',
          component: '/ai.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天',
          route: '/ai/chat',
          icon: 'Chat',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'ai-advanced-features',
          title: 'AI高级功能',
          route: '/ai/advanced',
          icon: 'AutoAwesome',
          children: [
            {
              id: 'ai-evaluation',
              title: 'AI评估中心',
              route: '/ai/evaluation',
              icon: 'Assessment',
              component: '/ai/evaluation/index.vue'
            },
            {
              id: 'ai-optimizer',
              title: 'AI优化器',
              route: '/ai/optimizer',
              icon: 'Tune',
              component: '/ai/optimizer/index.vue'
            },
            {
              id: 'ai-planner',
              title: 'AI规划师',
              route: '/ai/planner',
              icon: 'EventNote',
              component: '/ai/planner/index.vue'
            }
          ]
        },
        {
          id: 'online-chat',
          title: '在线聊天',
          route: '/chat',
          icon: 'Chat',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 👨‍🏫 教师 (Teacher) - 教学权限配置
export const completeTeacherNavigation: CompleteRoleNavigationConfig = {
  role: 'teacher',
  sections: [
    {
      id: 'dashboard',
      title: '🏠 工作台',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'Dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'Calendar',
          component: '/dashboard/Schedule.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'Notification',
          component: '/dashboard/ImportantNotices.vue'
        }
      ]
    },
    {
      id: 'teacher-workspace',
      title: '👨‍🏫 教师工作',
      order: 2,
      items: [
        {
          id: 'teacher-info',
          title: '个人信息',
          route: '/teacher',
          icon: 'Person',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-detail',
          title: '教师详情',
          route: '/teacher/detail',
          icon: 'Info',
          component: '/teacher/TeacherDetail.vue'
        },
        {
          id: 'teacher-edit',
          title: '信息编辑',
          route: '/teacher/edit',
          icon: 'Edit',
          component: '/teacher/TeacherEdit.vue'
        },
        {
          id: 'teacher-performance',
          title: '绩效查看',
          route: '/teacher/performance',
          icon: 'TrendingUp',
          component: '/teacher/performance/[id].vue'
        }
      ]
    },
    {
      id: 'class-management',
      title: '🏫 班级管理',
      order: 3,
      items: [
        {
          id: 'class-overview',
          title: '班级概览',
          route: '/class',
          icon: 'Group',
          component: '/class/index.vue'
        },
        {
          id: 'class-students',
          title: '学生管理',
          route: '/class/students',
          icon: 'People',
          component: '/class/students/id.vue'
        },
        {
          id: 'class-teachers',
          title: '教师协作',
          route: '/class/teachers',
          icon: 'Group',
          component: '/class/teachers/id.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'Analytics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'class-optimization',
          title: '班级优化',
          route: '/class/optimization',
          icon: 'TrendingUp',
          component: '/class/optimization/ClassOptimization.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'SmartToy',
          component: '/class/smart-management/[id].vue'
        }
      ]
    },
    {
      id: 'student-management',
      title: '🎓 学生管理',
      order: 4,
      items: [
        {
          id: 'student-overview',
          title: '学生概览',
          route: '/student',
          icon: 'GraduationCap',
          component: '/student/index.vue'
        },
        {
          id: 'student-analytics',
          title: '学生分析',
          route: '/student/analytics',
          icon: 'Analytics',
          component: '/student/analytics/[id].vue'
        }
      ]
    },
    {
      id: 'parent-communication',
      title: '👨‍👩‍👧‍👦 家长沟通',
      order: 5,
      items: [
        {
          id: 'parent-list',
          title: '家长列表',
          route: '/parent/list',
          icon: 'List',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'parent-detail',
          title: '家长详情',
          route: '/parent/detail',
          icon: 'Info',
          component: '/parent/ParentDetail.vue'
        },
        {
          id: 'parent-communication',
          title: '家园沟通',
          route: '/parent/communication/smart-hub',
          icon: 'Chat',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'TrendingUp',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'FollowTheSigns',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'activity-management',
      title: '🎯 活动管理',
      order: 6,
      items: [
        {
          id: 'activity-overview',
          title: '活动概览',
          route: '/activity',
          icon: 'Calendar',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-list',
          title: '活动列表',
          route: '/activity/list',
          icon: 'List',
          component: '/activity/ActivityList.vue'
        },
        {
          id: 'activity-create',
          title: '活动创建',
          route: '/activity/create',
          icon: 'Add',
          component: '/activity/ActivityCreate.vue'
        },
        {
          id: 'activity-assign',
          title: '活动分配',
          route: '/parent/assign-activity',
          icon: 'Assignment',
          component: '/parent/AssignActivity.vue'
        }
      ]
    },
    {
      id: 'enrollment-support',
      title: '🎓 招生协助',
      order: 7,
      items: [
        {
          id: 'enrollment-info',
          title: '招生信息',
          route: '/enrollment',
          icon: 'GraduationCap',
          component: '/enrollment/index.vue'
        },
        {
          id: 'application-assist',
          title: '申请协助',
          route: '/application/list',
          icon: 'Assignment',
          component: '/application/ApplicationList.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: '🤖 AI功能',
      order: 8,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'Brain',
          component: '/ai.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天',
          route: '/ai/chat',
          icon: 'Chat',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'online-chat',
          title: '在线聊天',
          route: '/chat',
          icon: 'Chat',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 👨‍👩‍👧‍👦 家长 (Parent) - 服务权限配置
export const completeParentNavigation: CompleteRoleNavigationConfig = {
  role: 'parent',
  sections: [
    {
      id: 'dashboard',
      title: '🏠 工作台',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '个人概览',
          route: '/dashboard',
          icon: 'Dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'Notification',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'Calendar',
          component: '/dashboard/Schedule.vue'
        }
      ]
    },
    {
      id: 'parent-service',
      title: '👨‍👩‍👧‍👦 家长服务',
      order: 2,
      items: [
        {
          id: 'parent-info',
          title: '个人信息',
          route: '/parent',
          icon: 'Person',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-detail',
          title: '家长详情',
          route: '/parent/detail',
          icon: 'Info',
          component: '/parent/ParentDetail.vue'
        },
        {
          id: 'parent-edit',
          title: '信息编辑',
          route: '/parent/edit',
          icon: 'Edit',
          component: '/parent/ParentEdit.vue'
        },
        {
          id: 'children-list',
          title: '子女列表',
          route: '/parent/children',
          icon: 'ChildCare',
          component: '/parent/ChildrenList.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'TrendingUp',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'Chat',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'FollowTheSigns',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'activity-participation',
      title: '🎯 活动参与',
      order: 3,
      items: [
        {
          id: 'activity-overview',
          title: '活动概览',
          route: '/activity',
          icon: 'Event',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-list',
          title: '活动列表',
          route: '/activity/list',
          icon: 'List',
          component: '/activity/ActivityList.vue'
        },
        {
          id: 'activity-participation-record',
          title: '参与记录',
          route: '/parent/assign-activity',
          icon: 'Assignment',
          component: '/parent/AssignActivity.vue'
        }
      ]
    },
    {
      id: 'child-learning',
      title: '🎓 学习情况',
      order: 4,
      items: [
        {
          id: 'child-learning-overview',
          title: '学习概览',
          route: '/student/detail',
          icon: 'School',
          component: '/student/detail/[id].vue'
        },
        {
          id: 'class-info',
          title: '班级信息',
          route: '/class/detail',
          icon: 'Group',
          component: '/class/detail/[id].vue'
        }
      ]
    },
    {
      id: 'communication',
      title: '💬 沟通交流',
      order: 5,
      items: [
        {
          id: 'teacher-communication',
          title: '教师沟通',
          route: '/parent/communication/smart-hub',
          icon: 'Chat',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'follow-up-record',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'FollowTheSigns',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: '🤖 AI功能',
      order: 6,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'SmartToy',
          component: '/ai.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天',
          route: '/ai/chat',
          icon: 'Chat',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'ai-advanced-features',
          title: 'AI高级功能',
          route: '/ai/advanced',
          icon: 'AutoAwesome',
          children: [
            {
              id: 'ai-evaluation',
              title: 'AI评估中心',
              route: '/ai/evaluation',
              icon: 'Assessment',
              component: '/ai/evaluation/index.vue'
            },
            {
              id: 'ai-optimizer',
              title: 'AI优化器',
              route: '/ai/optimizer',
              icon: 'Tune',
              component: '/ai/optimizer/index.vue'
            },
            {
              id: 'ai-planner',
              title: 'AI规划师',
              route: '/ai/planner',
              icon: 'EventNote',
              component: '/ai/planner/index.vue'
            }
          ]
        },
        {
          id: 'online-chat',
          title: '在线聊天',
          route: '/chat',
          icon: 'Chat',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 角色导航配置映射
export const completeRoleNavigationMap: Record<string, CompleteRoleNavigationConfig> = {
  admin: completeAdminNavigation,
  principal: completePrincipalNavigation,
  teacher: completeTeacherNavigation,
  parent: completeParentNavigation
};

// 获取角色导航配置
export function getCompleteRoleNavigation(role: string): CompleteRoleNavigationConfig {
  return completeRoleNavigationMap[role] || completeParentNavigation;
}

// 统计信息
export const completeRoleNavigationStats = {
  admin: {
    sections: completeAdminNavigation.sections.length,
    items: completeAdminNavigation.sections.reduce((acc, section) => acc + section.items.length, 0),
    totalPages: 85 // 基于扫描结果
  },
  principal: {
    sections: completePrincipalNavigation.sections.length,
    items: completePrincipalNavigation.sections.reduce((acc, section) => acc + section.items.length, 0),
    totalPages: 67
  },
  teacher: {
    sections: completeTeacherNavigation.sections.length,
    items: completeTeacherNavigation.sections.reduce((acc, section) => acc + section.items.length, 0),
    totalPages: 43
  },
  parent: {
    sections: completeParentNavigation.sections.length,
    items: completeParentNavigation.sections.reduce((acc, section) => acc + section.items.length, 0),
    totalPages: 28
  }
};

// 功能分类统计
export const featureStats = {
  coreFeatures: {
    dashboard: 12,
    enrollment: 18,
    marketing: 8,
    poster: 3,
    activity: 7,
    ai: 12
  },
  managementFeatures: {
    principal: 10,
    teacher: 8,
    parent: 12,
    class: 9,
    student: 6,
    customer: 4
  },
  systemFeatures: {
    user: 3,
    role: 2,
    permission: 2,
    system: 10,
    analytics: 8
  }
};

export default {
  completeAdminNavigation,
  completePrincipalNavigation,
  completeTeacherNavigation,
  completeParentNavigation,
  completeRoleNavigationMap,
  getCompleteRoleNavigation,
  completeRoleNavigationStats,
  featureStats
};