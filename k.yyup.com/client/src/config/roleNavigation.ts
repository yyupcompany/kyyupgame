/**
 * 基于claude.md文档的4角色侧边栏权限配置
 * 管理员、园长、教师、家长的完整权限映射
 */

export interface RoleNavigationItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  component?: string;
  meta?: {
    requiresAuth?: boolean;
    keepAlive?: boolean;
    breadcrumb?: string[];
  };
}

export interface RoleNavigationSection {
  id: string;
  title: string;
  items: RoleNavigationItem[];
  order: number;
}

export interface RoleNavigationConfig {
  role: string;
  sections: RoleNavigationSection[];
}

// 管理员 (Admin) - 全权限配置
export const adminNavigation: RoleNavigationConfig = {
  role: 'admin',
  sections: [
    {
      id: 'dashboard',
      title: '工作台模块',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'campus-overview',
          title: '校园概览',
          route: '/dashboard/campus-overview',
          icon: 'location',
          component: '/dashboard/CampusOverview.vue'
        },
        {
          id: 'data-statistics',
          title: '数据统计',
          route: '/dashboard/data-statistics',
          icon: 'statistics',
          component: '/dashboard/DataStatistics.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'activities',
          component: '/dashboard/Schedule.vue'
        },
        {
          id: 'custom-layout',
          title: '自定义布局',
          route: '/dashboard/custom-layout',
          icon: 'M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z',
          component: '/dashboard/CustomLayout.vue'
        }
      ]
    },
    {
      id: 'system-management',
      title: '系统管理模块',
      order: 2,
      items: [
        {
          id: 'user-management',
          title: '用户管理',
          route: '/system/users',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
          component: '/system/users/index.vue'
        },
        {
          id: 'role-management',
          title: '角色管理',
          route: '/system/roles',
          icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
          component: '/system/roles/index.vue'
        },
        {
          id: 'permission-management',
          title: '权限管理',
          route: '/system/permissions',
          icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z',
          component: '/system/permissions.vue'
        },
        {
          id: 'system-settings',
          title: '系统设置',
          route: '/system/settings',
          icon: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z',
          component: '/system/settings/index.vue'
        },
        {
          id: 'system-log',
          title: '系统日志',
          route: '/system/log',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/system/Log.vue'
        },
        {
          id: 'data-backup',
          title: '数据备份',
          route: '/system/backup',
          icon: 'M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z',
          component: '/system/Backup.vue'
        },
        {
          id: 'security-settings',
          title: '安全设置',
          route: '/system/security',
          icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z',
          component: '/system/Security.vue'
        },
        {
          id: 'message-template',
          title: '消息模板',
          route: '/system/message-template',
          icon: 'chat-square',
          component: '/system/MessageTemplate.vue'
        },
        {
          id: 'ai-model-config',
          title: 'AI模型配置',
          route: '/system/ai-model-config',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/system/AIModelConfig.vue'
        }
      ]
    },
    {
      id: 'principal-management',
      title: '园长管理模块',
      order: 3,
      items: [
        {
          id: 'principal-dashboard',
          title: '园长工作台',
          route: '/principal/dashboard',
          icon: 'dashboard',
          component: '/principal/Dashboard.vue'
        },
        {
          id: 'performance-management',
          title: '绩效管理',
          route: '/principal/performance',
          icon: 'statistics',
          component: '/principal/Performance.vue'
        },
        {
          id: 'performance-rules',
          title: '绩效规则',
          route: '/principal/performance-rules',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/principal/PerformanceRules.vue'
        },
        {
          id: 'marketing-analysis',
          title: '营销分析',
          route: '/principal/marketing-analysis',
          icon: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1z',
          component: '/principal/MarketingAnalysis.vue'
        },
        {
          id: 'customer-pool',
          title: '客户池管理',
          route: '/principal/customer-pool',
          icon: 'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91z',
          component: '/principal/CustomerPool.vue'
        },
        {
          id: 'poster-editor',
          title: '海报编辑器',
          route: '/principal/poster-editor',
          icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
          component: '/principal/PosterEditor.vue'
        },
        {
          id: 'poster-generator',
          title: '海报生成器',
          route: '/principal/poster-generator',
          icon: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z',
          component: '/principal/PosterGenerator.vue'
        },
        {
          id: 'poster-templates',
          title: '海报模板',
          route: '/principal/poster-templates',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/principal/PosterTemplates.vue'
        },
        {
          id: 'intelligent-dashboard',
          title: '智能决策仪表板',
          route: '/principal/decision-support/intelligent-dashboard',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/principal/decision-support/intelligent-dashboard.vue'
        }
      ]
    },
    {
      id: 'teacher-management',
      title: '教师管理模块',
      order: 4,
      items: [
        {
          id: 'teacher-info',
          title: '教师信息管理',
          route: '/teacher',
          icon: 'teachers',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-list',
          title: '教师列表',
          route: '/teacher/list',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/teacher/TeacherList.vue'
        },
        {
          id: 'teacher-performance',
          title: '教师绩效',
          route: '/teacher/performance',
          icon: 'statistics',
          component: '/teacher/performance/[id].vue'
        },
        {
          id: 'class-management',
          title: '班级管理',
          route: '/class',
          icon: 'classes',
          component: '/class/index.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'statistics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'class-optimization',
          title: '班级优化',
          route: '/class/optimization',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/optimization/ClassOptimization.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/smart-management/[id].vue'
        },
        {
          id: 'student-management',
          title: '学生管理',
          route: '/student',
          icon: 'customers',
          component: '/student/index.vue'
        }
      ]
    },
    {
      id: 'parent-management',
      title: '家长管理模块',
      order: 5,
      items: [
        {
          id: 'parent-info',
          title: '家长信息管理',
          route: '/parent',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-list',
          title: '家长列表',
          route: '/parent/list',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'children-list',
          title: '子女列表',
          route: '/parent/children',
          icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z',
          component: '/parent/ChildrenList.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'customers',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'activity-assign',
          title: '活动分配',
          route: '/parent/assign-activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/parent/AssignActivity.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/parent/FollowUp.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'chat-square',
          component: '/parent/communication/smart-hub.vue'
        }
      ]
    },
    {
      id: 'business-management',
      title: '业务管理模块',
      order: 6,
      items: [
        {
          id: 'enrollment-management',
          title: '招生管理',
          route: '/enrollment',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/enrollment/index.vue'
        },
        {
          id: 'enrollment-plan',
          title: '招生计划',
          route: '/enrollment-plan',
          icon: 'enrollment',
          component: '/enrollment-plan.vue'
        },
        {
          id: 'activity-management',
          title: '活动管理',
          route: '/activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/index.vue'
        },
        {
          id: 'application-management',
          title: '申请管理',
          route: '/application',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/application.vue'
        },
        {
          id: 'customer-management',
          title: '客户管理',
          route: '/customer',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/customer/index.vue'
        },
        {
          id: 'marketing-management',
          title: '营销管理',
          route: '/marketing',
          icon: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
          component: '/marketing.vue'
        },
        {
          id: 'statistics-analysis',
          title: '统计分析',
          route: '/statistics',
          icon: 'statistics',
          component: '/statistics/index.vue'
        },
        {
          id: 'report-builder',
          title: '报告构建器',
          route: '/analytics/report-builder',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/analytics/ReportBuilder.vue'
        },
        {
          id: 'advertisement-management',
          title: '广告管理',
          route: '/advertisement',
          icon: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z',
          component: '/advertisement/index.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: 'AI功能模块',
      order: 7,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai.vue'
        },
        {
          id: 'ai-assistant-page',
          title: 'AI智能助手页面',
          route: '/ai/assistant',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/AIAssistantPage.vue'
        },
        {
          id: 'ai-query',
          title: 'AI智能查询',
          route: '/ai/query',
          icon: 'statistics',
          component: '/ai/AIQueryInterface.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天界面',
          route: '/ai/chat',
          icon: 'chat-square',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'ai-expert-consultation',
          title: 'AI专家咨询',
          route: '/ai/expert-consultation',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/ExpertConsultationPage.vue'
        },
        {
          id: 'ai-memory-management',
          title: 'AI记忆管理',
          route: '/ai/memory-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/MemoryManagementPage.vue'
        },
        {
          id: 'ai-model-management',
          title: 'AI模型管理',
          route: '/ai/model-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/ModelManagementPage.vue'
        },
        {
          id: 'chat-function',
          title: '聊天功能',
          route: '/chat',
          icon: 'chat-square',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 园长 (Principal) - 管理权限配置
export const principalNavigation: RoleNavigationConfig = {
  role: 'principal',
  sections: [
    {
      id: 'dashboard',
      title: '工作台模块',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'campus-overview',
          title: '校园概览',
          route: '/dashboard/campus-overview',
          icon: 'location',
          component: '/dashboard/CampusOverview.vue'
        },
        {
          id: 'data-statistics',
          title: '数据统计',
          route: '/dashboard/data-statistics',
          icon: 'statistics',
          component: '/dashboard/DataStatistics.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'activities',
          component: '/dashboard/Schedule.vue'
        }
      ]
    },
    {
      id: 'principal-dashboard',
      title: '园长工作台模块',
      order: 2,
      items: [
        {
          id: 'principal-dashboard-main',
          title: '园长专属仪表板',
          route: '/principal/dashboard',
          icon: 'dashboard',
          component: '/principal/Dashboard.vue'
        },
        {
          id: 'performance-management',
          title: '绩效管理',
          route: '/principal/performance',
          icon: 'statistics',
          component: '/principal/Performance.vue'
        },
        {
          id: 'performance-rules',
          title: '绩效规则设置',
          route: '/principal/performance-rules',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/principal/PerformanceRules.vue'
        },
        {
          id: 'marketing-analysis',
          title: '营销分析',
          route: '/principal/marketing-analysis',
          icon: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
          component: '/principal/MarketingAnalysis.vue'
        },
        {
          id: 'customer-pool',
          title: '客户池管理',
          route: '/principal/customer-pool',
          icon: 'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91z',
          component: '/principal/CustomerPool.vue'
        },
        {
          id: 'activities-management',
          title: '活动管理',
          route: '/principal/activities',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/principal/Activities.vue'
        },
        {
          id: 'poster-editor',
          title: '海报编辑器',
          route: '/principal/poster-editor',
          icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z',
          component: '/principal/PosterEditor.vue'
        },
        {
          id: 'poster-generator',
          title: '海报生成器',
          route: '/principal/poster-generator',
          icon: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/principal/PosterGenerator.vue'
        },
        {
          id: 'poster-templates',
          title: '海报模板管理',
          route: '/principal/poster-templates',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/principal/PosterTemplates.vue'
        },
        {
          id: 'intelligent-dashboard',
          title: '智能决策仪表板',
          route: '/principal/decision-support/intelligent-dashboard',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/principal/decision-support/intelligent-dashboard.vue'
        }
      ]
    },
    {
      id: 'teacher-management',
      title: '教师管理模块',
      order: 3,
      items: [
        {
          id: 'teacher-info',
          title: '教师信息管理',
          route: '/teacher',
          icon: 'teachers',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-list',
          title: '教师列表',
          route: '/teacher/list',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/teacher/TeacherList.vue'
        },
        {
          id: 'teacher-performance',
          title: '教师绩效',
          route: '/teacher/performance',
          icon: 'statistics',
          component: '/teacher/performance/[id].vue'
        },
        {
          id: 'class-management',
          title: '班级管理',
          route: '/class',
          icon: 'classes',
          component: '/class/index.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'statistics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'class-optimization',
          title: '班级优化',
          route: '/class/optimization',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/optimization/ClassOptimization.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/smart-management/[id].vue'
        },
        {
          id: 'student-management',
          title: '学生管理',
          route: '/student',
          icon: 'customers',
          component: '/student/index.vue'
        }
      ]
    },
    {
      id: 'parent-management',
      title: '家长管理模块',
      order: 4,
      items: [
        {
          id: 'parent-info',
          title: '家长信息管理',
          route: '/parent',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-list',
          title: '家长列表',
          route: '/parent/list',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'chat-square',
          component: '/parent/communication/smart-hub.vue'
        }
      ]
    },
    {
      id: 'business-management',
      title: '业务管理模块',
      order: 5,
      items: [
        {
          id: 'enrollment-management',
          title: '招生管理',
          route: '/enrollment',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/enrollment/index.vue'
        },
        {
          id: 'enrollment-plan',
          title: '招生计划',
          route: '/enrollment-plan',
          icon: 'enrollment',
          component: '/enrollment-plan.vue'
        },
        {
          id: 'activity-management',
          title: '活动管理',
          route: '/activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/index.vue'
        },
        {
          id: 'customer-management',
          title: '客户管理',
          route: '/customer',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/customer/index.vue'
        },
        {
          id: 'marketing-management',
          title: '营销管理',
          route: '/marketing',
          icon: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
          component: '/marketing.vue'
        },
        {
          id: 'statistics-analysis',
          title: '统计分析',
          route: '/statistics',
          icon: 'statistics',
          component: '/statistics/index.vue'
        },
        {
          id: 'report-builder',
          title: '报告构建器',
          route: '/analytics/report-builder',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/analytics/ReportBuilder.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: 'AI功能模块',
      order: 6,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai.vue'
        },
        {
          id: 'ai-assistant-page',
          title: 'AI智能助手页面',
          route: '/ai/assistant',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/AIAssistantPage.vue'
        },
        {
          id: 'ai-query',
          title: 'AI智能查询',
          route: '/ai/query',
          icon: 'statistics',
          component: '/ai/AIQueryInterface.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天界面',
          route: '/ai/chat',
          icon: 'chat-square',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'ai-expert-consultation',
          title: 'AI专家咨询',
          route: '/ai/expert-consultation',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/ExpertConsultationPage.vue'
        },
        {
          id: 'ai-memory-management',
          title: 'AI记忆管理',
          route: '/ai/memory-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/MemoryManagementPage.vue'
        },
        {
          id: 'ai-model-management',
          title: 'AI模型管理',
          route: '/ai/model-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai/ModelManagementPage.vue'
        },
        {
          id: 'chat-function',
          title: '聊天功能',
          route: '/chat',
          icon: 'chat-square',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 教师 (Teacher) - 教学权限配置
export const teacherNavigation: RoleNavigationConfig = {
  role: 'teacher',
  sections: [
    {
      id: 'dashboard',
      title: '工作台模块',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '数据概览',
          route: '/dashboard',
          icon: 'dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'activities',
          component: '/dashboard/Schedule.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知',
          route: '/dashboard/important-notices',
          icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
          component: '/dashboard/ImportantNotices.vue'
        }
      ]
    },
    {
      id: 'teacher-work',
      title: '教师工作模块',
      order: 2,
      items: [
        {
          id: 'teacher-info',
          title: '教师个人信息管理',
          route: '/teacher',
          icon: 'teachers',
          component: '/teacher/index.vue'
        },
        {
          id: 'teacher-detail',
          title: '教师详情',
          route: '/teacher/detail',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/teacher/TeacherDetail.vue'
        },
        {
          id: 'teacher-edit',
          title: '教师编辑',
          route: '/teacher/edit',
          icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z',
          component: '/teacher/TeacherEdit.vue'
        },
        {
          id: 'teacher-performance',
          title: '教师绩效查看',
          route: '/teacher/performance',
          icon: 'statistics',
          component: '/teacher/performance/[id].vue'
        }
      ]
    },
    {
      id: 'class-management',
      title: '班级管理模块',
      order: 3,
      items: [
        {
          id: 'class-info',
          title: '班级信息管理',
          route: '/class',
          icon: 'classes',
          component: '/class/index.vue'
        },
        {
          id: 'class-detail',
          title: '班级详情',
          route: '/class/detail',
          icon: 'classes',
          component: '/class/detail/[id].vue'
        },
        {
          id: 'class-students',
          title: '班级学生管理',
          route: '/class/students',
          icon: 'customers',
          component: '/class/students/id.vue'
        },
        {
          id: 'class-teachers',
          title: '班级教师管理',
          route: '/class/teachers',
          icon: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
          component: '/class/teachers/id.vue'
        },
        {
          id: 'class-analytics',
          title: '班级分析',
          route: '/class/analytics',
          icon: 'statistics',
          component: '/class/analytics/ClassAnalytics.vue'
        },
        {
          id: 'class-optimization',
          title: '班级优化',
          route: '/class/optimization',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/optimization/ClassOptimization.vue'
        },
        {
          id: 'smart-class-management',
          title: '智能班级管理',
          route: '/class/smart-management',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/class/smart-management/[id].vue'
        }
      ]
    },
    {
      id: 'student-management',
      title: '学生管理模块',
      order: 4,
      items: [
        {
          id: 'student-info',
          title: '学生信息管理',
          route: '/student',
          icon: 'customers',
          component: '/student/index.vue'
        },
        {
          id: 'student-detail',
          title: '学生详情',
          route: '/student/detail',
          icon: 'customers',
          component: '/student/detail/[id].vue'
        },
        {
          id: 'student-analytics',
          title: '学生分析',
          route: '/student/analytics',
          icon: 'statistics',
          component: '/student/analytics/[id].vue'
        }
      ]
    },
    {
      id: 'parent-service',
      title: '家长服务模块',
      order: 5,
      items: [
        {
          id: 'parent-info',
          title: '家长信息查看',
          route: '/parent/list',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/ParentList.vue'
        },
        {
          id: 'parent-detail',
          title: '家长详情',
          route: '/parent/detail',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/ParentDetail.vue'
        },
        {
          id: 'parent-communication',
          title: '家园沟通功能',
          route: '/parent/communication/smart-hub',
          icon: 'chat-square',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'customers',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录',
          route: '/parent/follow-up',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'activity-management',
      title: '活动管理模块',
      order: 6,
      items: [
        {
          id: 'activity-participation',
          title: '活动参与和管理',
          route: '/activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-list',
          title: '活动列表',
          route: '/activity/list',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/ActivityList.vue'
        },
        {
          id: 'activity-detail',
          title: '活动详情',
          route: '/activity/detail',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/ActivityDetail.vue'
        },
        {
          id: 'activity-create',
          title: '活动创建和编辑',
          route: '/activity/create',
          icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
          component: '/activity/ActivityCreate.vue'
        },
        {
          id: 'activity-assign',
          title: '活动分配',
          route: '/parent/assign-activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/parent/AssignActivity.vue'
        }
      ]
    },
    {
      id: 'partial-enrollment',
      title: '部分招生功能',
      order: 7,
      items: [
        {
          id: 'enrollment-info',
          title: '招生信息查看',
          route: '/enrollment',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/enrollment/index.vue'
        },
        {
          id: 'application-assist',
          title: '申请处理协助',
          route: '/application/list',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/application/ApplicationList.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: 'AI功能模块',
      order: 8,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天界面',
          route: '/ai/chat',
          icon: 'chat-square',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'chat-function',
          title: '聊天功能',
          route: '/chat',
          icon: 'chat-square',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 家长 (Parent) - 服务权限配置
export const parentNavigation: RoleNavigationConfig = {
  role: 'parent',
  sections: [
    {
      id: 'dashboard',
      title: '工作台模块',
      order: 1,
      items: [
        {
          id: 'dashboard-overview',
          title: '个人数据概览',
          route: '/dashboard',
          icon: 'dashboard',
          component: '/dashboard/index.vue'
        },
        {
          id: 'important-notices',
          title: '重要通知查看',
          route: '/dashboard/important-notices',
          icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
          component: '/dashboard/ImportantNotices.vue'
        },
        {
          id: 'schedule',
          title: '日程安排',
          route: '/dashboard/schedule',
          icon: 'activities',
          component: '/dashboard/Schedule.vue'
        }
      ]
    },
    {
      id: 'parent-service',
      title: '家长服务模块',
      order: 2,
      items: [
        {
          id: 'parent-info',
          title: '个人信息管理',
          route: '/parent',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/index.vue'
        },
        {
          id: 'parent-detail',
          title: '家长详情',
          route: '/parent/detail',
          icon: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z',
          component: '/parent/ParentDetail.vue'
        },
        {
          id: 'parent-edit',
          title: '家长编辑',
          route: '/parent/edit',
          icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z',
          component: '/parent/ParentEdit.vue'
        },
        {
          id: 'children-list',
          title: '子女列表',
          route: '/parent/children',
          icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z',
          component: '/parent/ChildrenList.vue'
        },
        {
          id: 'child-growth',
          title: '儿童成长记录',
          route: '/parent/child-growth',
          icon: 'customers',
          component: '/parent/ChildGrowth.vue'
        },
        {
          id: 'smart-communication',
          title: '智能沟通中心',
          route: '/parent/communication/smart-hub',
          icon: 'chat-square',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'follow-up',
          title: '跟进记录查看',
          route: '/parent/follow-up',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'activity-participation',
      title: '活动参与模块',
      order: 3,
      items: [
        {
          id: 'activity-view',
          title: '活动查看和报名',
          route: '/activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/index.vue'
        },
        {
          id: 'activity-list',
          title: '活动列表',
          route: '/activity/list',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/ActivityList.vue'
        },
        {
          id: 'activity-detail',
          title: '活动详情',
          route: '/activity/detail',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/activity/ActivityDetail.vue'
        },
        {
          id: 'activity-participation-record',
          title: '活动参与记录',
          route: '/parent/assign-activity',
          icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
          component: '/parent/AssignActivity.vue'
        }
      ]
    },
    {
      id: 'student-info',
      title: '学生信息模块',
      order: 4,
      items: [
        {
          id: 'child-learning',
          title: '孩子的学习情况查看',
          route: '/student/detail',
          icon: 'customers',
          component: '/student/detail/[id].vue'
        },
        {
          id: 'class-info',
          title: '班级信息查看',
          route: '/class/detail',
          icon: 'classes',
          component: '/class/detail/[id].vue'
        }
      ]
    },
    {
      id: 'communication',
      title: '沟通交流模块',
      order: 5,
      items: [
        {
          id: 'teacher-communication',
          title: '与教师的沟通记录',
          route: '/parent/communication/smart-hub',
          icon: 'chat-square',
          component: '/parent/communication/smart-hub.vue'
        },
        {
          id: 'follow-up-record',
          title: '跟进记录查看',
          route: '/parent/follow-up',
          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z',
          component: '/parent/FollowUp.vue'
        }
      ]
    },
    {
      id: 'ai-functions',
      title: 'AI功能模块',
      order: 6,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI助手',
          route: '/ai',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
          component: '/ai.vue'
        },
        {
          id: 'ai-chat',
          title: 'AI聊天界面',
          route: '/ai/chat',
          icon: 'chat-square',
          component: '/ai/ChatInterface.vue'
        },
        {
          id: 'chat-function',
          title: '聊天功能',
          route: '/chat',
          icon: 'chat-square',
          component: '/chat/index.vue'
        }
      ]
    }
  ]
};

// 角色导航配置映射
export const roleNavigationMap: Record<string, RoleNavigationConfig> = {
  admin: adminNavigation,
  principal: principalNavigation,
  teacher: teacherNavigation,
  parent: parentNavigation
};

// 获取角色导航配置
export function getRoleNavigation(role: string): RoleNavigationConfig {
  return roleNavigationMap[role] || parentNavigation; // 默认返回家长权限
}

// 统计信息
export const roleNavigationStats = {
  admin: {
    sections: adminNavigation.sections.length,
    items: adminNavigation.sections.reduce((acc, section) => acc + section.items.length, 0)
  },
  principal: {
    sections: principalNavigation.sections.length,
    items: principalNavigation.sections.reduce((acc, section) => acc + section.items.length, 0)
  },
  teacher: {
    sections: teacherNavigation.sections.length,
    items: teacherNavigation.sections.reduce((acc, section) => acc + section.items.length, 0)
  },
  parent: {
    sections: parentNavigation.sections.length,
    items: parentNavigation.sections.reduce((acc, section) => acc + section.items.length, 0)
  }
};

// 权限继承关系验证
export function validateRoleHierarchy(): boolean {
  const adminItems = adminNavigation.sections.reduce((acc, section) => acc + section.items.length, 0);
  const principalItems = principalNavigation.sections.reduce((acc, section) => acc + section.items.length, 0);
  const teacherItems = teacherNavigation.sections.reduce((acc, section) => acc + section.items.length, 0);
  const parentItems = parentNavigation.sections.reduce((acc, section) => acc + section.items.length, 0);
  
  return adminItems >= principalItems && principalItems >= teacherItems && teacherItems >= parentItems;
}