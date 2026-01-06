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

// 招生管理菜单 - 精简结构，路径对齐后端API
export const enrollmentSection: NavigationSection = {
  id: 'enrollment',
  title: '招生管理',
  items: [
    {
      id: 'enrollment-plan',
      title: '招生计划',
      route: '/enrollment-plans',  // 修复：对齐后端 /api/enrollment-plans
      icon: 'enrollment',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '招生计划']
      }
    },
    {
      id: 'enrollment-applications',
      title: '招生申请',
      route: '/enrollment-applications',  // 修复：对齐后端 /api/enrollment-applications
      icon: 'document',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '招生申请']
      }
    },
    {
      id: 'enrollment-consultations',
      title: '招生咨询',
      route: '/enrollment-consultations',  // 新增：对齐后端 /api/enrollment-consultations
      icon: 'chat-square',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '招生咨询']
      }
    },
    {
      id: 'customer-pool',
      title: '客户池',
      route: '/customer-pool',  // 修复：对齐后端 /api/customer-pool
      icon: 'customers',
      meta: {
        requiresAuth: true,
        breadcrumb: ['招生管理', '客户池']
      }
    }
  ],
  permission: 'ENROLLMENT_VIEW'
};

// 教学管理菜单 - 精简结构，路径对齐后端API
export const teachingSection: NavigationSection = {
  id: 'teaching',
  title: '教学管理',
  items: [
    {
      id: 'teacher-management',
      title: '教师管理',
      route: '/teacher',  // 修复：对齐后端 /api/teachers
      icon: 'teachers',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '教师管理']
      }
    },
    {
      id: 'student-management',
      title: '学生管理',
      route: '/student',  // 修复：对齐后端 /api/students
      icon: 'user-group',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '学生管理']
      }
    },
    {
      id: 'class-management',
      title: '班级管理',
      route: '/class',  // 修复：对齐后端 /api/classes
      icon: 'classes',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '班级管理']
      }
    },
    {
      id: 'parent-management',
      title: '家长管理',
      route: '/parent',  // 修复：对齐后端 /api/parents
      icon: 'user-group',
      meta: {
        requiresAuth: true,
        breadcrumb: ['教学管理', '家长管理']
      }
    }
  ],
  permission: 'TEACHING_VIEW'
};

// 活动管理菜单 - 精简为单个主入口，路径对齐后端API
export const activitySection: NavigationSection = {
  id: 'activity',
  title: '活动管理',
  items: [
    {
      id: 'activity-management',
      title: '活动管理',
      route: '/activity',  // 修复：对齐后端 /api/activities
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
      route: '/aiassistant',
      icon: 'ai-center',
      meta: {
        requiresAuth: true,
        breadcrumb: ['AI功能']
      }
    },
    {
      id: 'ai-query',
      title: 'AI智能查询',
      route: '/ai/query',
      icon: 'statistics',
      meta: {
        requiresAuth: true,
        breadcrumb: ['AI功能', 'AI智能查询']
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

// 营销管理菜单 - 新增精简结构，路径对齐后端API
export const marketingSection: NavigationSection = {
  id: 'marketing',
  title: '营销管理',
  items: [
    {
      id: 'marketing-campaigns',
      title: '营销活动',
      route: '/marketing-campaigns',  // 修复：对齐后端 /api/marketing-campaigns
      icon: 'marketing',
      meta: {
        requiresAuth: true,
        breadcrumb: ['营销管理', '营销活动']
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

// 其他功能菜单 - 保持简单结构，路径对齐后端API
export const otherSection: NavigationSection = {
  id: 'other',
  title: '其他功能',
  items: [
    {
      id: 'statistics',
      title: '统计分析',
      route: '/statistics',  // 保持不变：已对齐后端 /api/statistics
      icon: 'statistics',
      meta: {
        requiresAuth: true,
        breadcrumb: ['其他功能', '统计分析']
      }
    },
    {
      id: 'performance-evaluations',
      title: '绩效评估',
      route: '/performance-evaluations',  // 新增：对齐后端 /api/performance-evaluations
      icon: 'principal',
      meta: {
        requiresAuth: true,
        breadcrumb: ['其他功能', '绩效评估']
      }
    }
  ]
};

// 导出重构后的导航配置
export const navigation: NavigationSection[] = [
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

// 为了兼容性，保留原有的导出名称
export const navigationConfig: NavigationSection[] = navigation;

// 重构后的导航统计
export const navigationStats = {
  totalSections: navigation.length,
  totalMainItems: navigation.reduce((acc, section) => acc + section.items.length, 0),
  reduction: {
    before: 119, // 原来的侧边栏路由数量
    after: navigation.reduce((acc, section) => acc + section.items.length, 0),
    percentage: Math.round((1 - navigation.reduce((acc, section) => acc + section.items.length, 0) / 119) * 100)
  }
};

// 根据用户角色和权限过滤导航菜单的工具函数
export function filterNavigationByRole(
  sections: NavigationSection[], 
  userRole: string, 
  userPermissions: string[] = []
): NavigationSection[] {
  // 检查是否有通配符权限或是admin角色
  const hasFullAccess = userPermissions.includes('*') || userRole === 'admin' || userRole === 'ADMIN';
  
  return sections.filter(section => {
    // 如果有全部权限，跳过权限检查
    if (!hasFullAccess) {
      // 检查章节权限
      if (section.permission && !userPermissions.includes(section.permission)) {
        return false;
      }
      
      // 检查章节角色
      if (section.roles && !section.roles.includes(userRole)) {
        return false;
      }
    }
    
    // 过滤章节内的菜单项
    section.items = section.items.filter(item => {
      if (!hasFullAccess) {
        if (item.permission && !userPermissions.includes(item.permission)) {
          return false;
        }
        
        if (item.roles && !item.roles.includes(userRole)) {
          return false;
        }
      }
      
      return true;
    });
    
    return section.items.length > 0;
  });
}

// 路由匹配辅助函数
function isRouteMatch(currentPath: string, routePath: string): boolean {
  if (currentPath === routePath) return true;
  
  // 处理动态路由参数
  if (routePath.includes(':')) {
    const routePattern = routePath.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(currentPath);
  }
  
  return false;
}

// 根据路径查找菜单项的工具函数
export function findMenuItemByPath(path: string, sections: NavigationSection[]): NavigationItem | null {
  for (const section of sections) {
    for (const item of section.items) {
      // 检查主菜单项
      if (isRouteMatch(path, item.route)) {
        return item;
      }
      
      // 检查子菜单项
      if (item.children) {
        for (const child of item.children) {
          if (isRouteMatch(path, child.route)) {
            return child;
          }
        }
      }
    }
  }
  
  return null;
}

// 根据路径生成面包屑的工具函数
export function getBreadcrumb(path: string, sections: NavigationSection[]): string[] {
  const menuItem = findMenuItemByPath(path, sections);
  if (menuItem?.meta?.breadcrumb) {
    return menuItem.meta.breadcrumb;
  }
  
  // 如果没有预定义面包屑，根据路径生成
  const pathSegments = path.split('/').filter(Boolean);
  const breadcrumbs = ['首页'];
  
  for (const segment of pathSegments) {
    // 路径到标题的映射（已更新为复数形式以对齐后端API）
    const titleMap: Record<string, string> = {
      'dashboard': '工作台',
      'enrollment-plans': '招生计划',
      'enrollment-applications': '招生申请',
      'enrollment-consultations': '招生咨询',
      'teachers': '教师管理',
      'students': '学生管理',
      'classes': '班级管理',
      'parents': '家长管理',
      'activities': '活动管理',
      'marketing-campaigns': '营销活动',
      'customer-pool': '客户池',
      'performance-evaluations': '绩效评估',
      'ai': 'AI功能',
      'chat': 'AI聊天',
      'analytics': '分析报告',
      'principal': '园长工作台',
      'system': '系统管理',
      'statistics': '统计分析'
    };
    
    const title = titleMap[segment] || segment;
    breadcrumbs.push(title);
  }
  
  return breadcrumbs;
}