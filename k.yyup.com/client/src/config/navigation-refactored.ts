/**
 * 重构后的导航配置 - 精简侧边栏，将相关功能合并到页面内tabs
 * 解决侧边栏层级混乱问题
 */

export interface NavigationItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  children?: NavigationItem[];
  permission?: string;
  roles?: string[];
  hidden?: boolean;
  meta?: {
    requiresAuth?: boolean;
    keepAlive?: boolean;
    breadcrumb?: string[];
  };
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  roles?: string[];
  permission?: string;
}

// 工作台菜单 - 保持原有结构
export const dashboardSection: NavigationSection = {
  id: 'dashboard',
  title: '工作台',
  items: [
    {
      id: 'dashboard-overview',
      title: '数据概览',
      route: '/dashboard',
      icon: 'dashboard',
      meta: {
        requiresAuth: true,
        keepAlive: true,
        breadcrumb: ['工作台', '数据概览']
      }
    }
  ]
};

// 招生管理菜单 - 精简结构
export const enrollmentSection: NavigationSection = {
  id: 'enrollment',
  title: '招生管理',
  items: [
    {
      id: 'enrollment-plan',
      title: '招生计划',
      route: '/enrollment-plan',
      icon: 'enrollment',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '招生计划']
      }
    },
    {
      id: 'enrollment-activity',
      title: '招生活动',
      route: '/enrollment',
      icon: 'M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 19h16v2H4z',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '招生活动']
      }
    },
    {
      id: 'application-management',
      title: '申请管理',
      route: '/application',
      icon: 'document',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '申请管理']
      }
    },
    {
      id: 'customer-management',
      title: '客户管理',
      route: '/customer',
      icon: 'customers',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '客户管理']
      }
    }
  ],
  permission: 'ENROLLMENT_VIEW'
};

// 教学管理菜单 - 精简结构
export const teachingSection: NavigationSection = {
  id: 'teaching',
  title: '教学管理',
  items: [
    {
      id: 'teacher-management',
      title: '教师管理',
      route: '/teacher',
      icon: 'teachers',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '教师管理']
      }
    },
    {
      id: 'student-management',
      title: '学生管理',
      route: '/student',
      icon: 'user-group',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '学生管理']
      }
    },
    {
      id: 'class-management',
      title: '班级管理',
      route: '/class',
      icon: 'classes',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '班级管理']
      }
    },
    {
      id: 'parent-management',
      title: '家长管理',
      route: '/parent',
      icon: 'user-group',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '家长管理']
      }
    }
  ],
  permission: 'TEACHING_VIEW'
};

// 活动管理菜单 - 精简为单个主入口
export const activitySection: NavigationSection = {
  id: 'activity',
  title: '活动管理',
  items: [
    {
      id: 'activity-management',
      title: '活动管理',
      route: '/activity',
      icon: 'activities',
      meta: {
        requiresAuth: true,
        breadcrumb: ['活动管理']
      }
    }
  ],
  permission: 'ACTIVITY_VIEW'
};

// AI功能菜单 - 精简为单个主入口
export const aiSection: NavigationSection = {
  id: 'ai',
  title: 'AI功能',
  items: [
    {
      id: 'ai-assistant',
      title: 'AI助手',
      route: '/ai',
      icon: 'ai-center',
      meta: {
        requiresAuth: true,
        breadcrumb: ['AI功能']
      }
    },
    {
      id: 'ai-chat',
      title: 'AI聊天',
      route: '/chat',
      icon: 'chat-square',
      meta: {
        requiresAuth: true,
        breadcrumb: ['AI功能', 'AI聊天']
      }
    }
  ],
  permission: 'AI_USE'
};

// 系统管理菜单 - 精简为单个主入口
export const systemSection: NavigationSection = {
  id: 'system',
  title: '系统管理',
  items: [
    {
      id: 'system-management',
      title: '系统管理',
      route: '/system',
      icon: 'system',
      meta: {
        requiresAuth: true,
        breadcrumb: ['系统管理']
      }
    }
  ],
  permission: 'SYSTEM_MANAGE',
  roles: ['admin', 'super_admin']
};

// 园长功能菜单 - 精简为单个主入口
export const principalSection: NavigationSection = {
  id: 'principal',
  title: '园长工作台',
  items: [
    {
      id: 'principal-dashboard',
      title: '园长工作台',
      route: '/principal',
      icon: 'principal',
      meta: {
        requiresAuth: true,
        breadcrumb: ['园长工作台']
      }
    }
  ],
  permission: 'PRINCIPAL_VIEW',
  roles: ['principal', 'admin']
};

// 营销管理菜单 - 新增精简结构
export const marketingSection: NavigationSection = {
  id: 'marketing',
  title: '营销管理',
  items: [
    {
      id: 'marketing-management',
      title: '营销管理',
      route: '/marketing',
      icon: 'marketing',
      meta: {
        requiresAuth: true,
        breadcrumb: ['营销管理']
      }
    }
  ],
  permission: 'MARKETING_VIEW'
};

// 分析报告菜单 - 新增精简结构
export const analyticsSection: NavigationSection = {
  id: 'analytics',
  title: '分析报告',
  items: [
    {
      id: 'analytics-management',
      title: '分析报告',
      route: '/analytics',
      icon: 'statistics',
      meta: {
        requiresAuth: true,
        breadcrumb: ['分析报告']
      }
    }
  ],
  permission: 'ANALYTICS_VIEW'
};

// 其他功能菜单 - 保持简单结构
export const otherSection: NavigationSection = {
  id: 'other',
  title: '其他功能',
  items: [
    {
      id: 'statistics',
      title: '统计分析',
      route: '/statistics',
      icon: 'statistics',
      meta: {
        requiresAuth: true,
        breadcrumb: ['其他功能', '统计分析']
      }
    },
    {
      id: 'advertisement',
      title: '广告管理',
      route: '/advertisement',
      icon: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
      meta: {
        requiresAuth: true,
        breadcrumb: ['其他功能', '广告管理']
      }
    }
  ]
};

// 导出重构后的导航配置
export const refactoredNavigation: NavigationSection[] = [
  dashboardSection,
  enrollmentSection,
  teachingSection,
  activitySection,
  aiSection,
  marketingSection,
  analyticsSection,
  principalSection,
  systemSection,
  otherSection
];

// 重构后的导航统计
export const refactoredNavigationStats = {
  totalSections: refactoredNavigation.length,
  totalMainItems: refactoredNavigation.reduce((acc, section) => acc + section.items.length, 0),
  reduction: {
    before: 119, // 原来的侧边栏路由数量
    after: refactoredNavigation.reduce((acc, section) => acc + section.items.length, 0),
    percentage: Math.round((1 - refactoredNavigation.reduce((acc, section) => acc + section.items.length, 0) / 119) * 100)
  }
};