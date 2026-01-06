/**
 * 页面路由配置
 * 定义所有需要测试的页面路由
 */

export interface PageRoute {
  path: string
  name: string
  title: string
  description: string
  category: string
  requiredRole?: string[]
  component?: string
  expectsData?: boolean
  validationChecks?: string[]
}

// 页面路由配置
export const PAGE_ROUTES: Record<string, PageRoute[]> = {
  // 仪表板类目
  dashboard: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      title: '仪表板',
      description: '主仪表板页面',
      category: '仪表板',
      expectsData: true,
      validationChecks: ['stats', 'charts', 'notifications']
    }
  ],

  // 用户管理类目
  'user-management': [
    {
      path: '/user-center',
      name: 'UserCenter',
      title: '用户中心',
      description: '用户管理主页面',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['userList', 'filters', 'search']
    },
    {
      path: '/user-center/create',
      name: 'UserCreate',
      title: '创建用户',
      description: '创建新用户页面',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      validationChecks: ['form', 'validation', 'permissions']
    },
    {
      path: '/user-center/:id/edit',
      name: 'UserEdit',
      title: '编辑用户',
      description: '编辑用户信息页面',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['formData', 'roleAssignment']
    }
  ],

  // 教学管理类目
  'teaching-management': [
    {
      path: '/class-center',
      name: 'ClassCenter',
      title: '班级中心',
      description: '班级管理主页面',
      category: '教学管理',
      expectsData: true,
      validationChecks: ['classList', 'stats', 'filters']
    },
    {
      path: '/class-center/create',
      name: 'ClassCreate',
      title: '创建班级',
      description: '创建新班级页面',
      category: '教学管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      validationChecks: ['form', 'teacherSelect', 'capacity']
    },
    {
      path: '/student-center',
      name: 'StudentCenter',
      title: '学生中心',
      description: '学生管理主页面',
      category: '教学管理',
      expectsData: true,
      validationChecks: ['studentList', 'filters', 'search']
    },
    {
      path: '/student-center/create',
      name: 'StudentCreate',
      title: '创建学生',
      description: '创建新学生页面',
      category: '教学管理',
      requiredRole: ['ADMIN', 'TEACHER'],
      validationChecks: ['form', 'parentSelect', 'classAssignment']
    },
    {
      path: '/teacher-center',
      name: 'TeacherCenter',
      title: '教师中心',
      description: '教师管理主页面',
      category: '教学管理',
      expectsData: true,
      validationChecks: ['teacherList', 'filters', 'stats']
    }
  ],

  // 招生管理类目
  'enrollment-management': [
    {
      path: '/enrollment-center',
      name: 'EnrollmentCenter',
      title: '招生中心',
      description: '招生管理主页面',
      category: '招生管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      expectsData: true,
      validationChecks: ['applications', 'stats', 'pipeline']
    },
    {
      path: '/enrollment-center/applications',
      name: 'Applications',
      title: '申请管理',
      description: '入学申请管理页面',
      category: '招生管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      expectsData: true,
      validationChecks: ['applicationList', 'statusFilters', 'actions']
    },
    {
      path: '/enrollment-center/interviews',
      name: 'Interviews',
      title: '面试管理',
      description: '面试安排管理页面',
      category: '招生管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      expectsData: true,
      validationChecks: ['interviewList', 'calendar', 'scheduling']
    }
  ],

  // 活动管理类目
  'activity-management': [
    {
      path: '/activity-center',
      name: 'ActivityCenter',
      title: '活动中心',
      description: '活动管理主页面',
      category: '活动管理',
      expectsData: true,
      validationChecks: ['activityList', 'filters', 'stats']
    },
    {
      path: '/activity-center/create',
      name: 'ActivityCreate',
      title: '创建活动',
      description: '创建新活动页面',
      category: '活动管理',
      requiredRole: ['ADMIN', 'TEACHER', 'PRINCIPAL'],
      validationChecks: ['form', 'dateSelect', 'capacity']
    },
    {
      path: '/activity-center/:id',
      name: 'ActivityDetail',
      title: '活动详情',
      description: '活动详情页面',
      category: '活动管理',
      expectsData: true,
      validationChecks: ['activityInfo', 'participants', 'gallery']
    }
  ],

  // 家长互动类目
  'parent-interaction': [
    {
      path: '/parent-center',
      name: 'ParentCenter',
      title: '家长中心',
      description: '家长服务主页面',
      category: '家长互动',
      expectsData: true,
      validationChecks: ['children', 'notifications', 'activities']
    },
    {
      path: '/parent-center/children/:id',
      name: 'ChildDetail',
      title: '孩子详情',
      description: '孩子信息详情页面',
      category: '家长互动',
      expectsData: true,
      validationChecks: ['childInfo', 'growth', 'attendance']
    },
    {
      path: '/parent-center/communication',
      name: 'Communication',
      title: '沟通中心',
      description: '家长沟通页面',
      category: '家长互动',
      expectsData: true,
      validationChecks: ['messages', 'teachers', 'history']
    },
    {
      path: '/parent-center/activities',
      name: 'ParentActivities',
      title: '活动报名',
      description: '活动报名页面',
      category: '家长互动',
      expectsData: true,
      validationChecks: ['availableActivities', 'registrations', 'status']
    }
  ],

  // 系统管理类目
  'system-management': [
    {
      path: '/system-center',
      name: 'SystemCenter',
      title: '系统中心',
      description: '系统管理主页面',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['systemStatus', 'settings', 'logs']
    },
    {
      path: '/system-center/settings',
      name: 'SystemSettings',
      title: '系统设置',
      description: '系统配置页面',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['settingsForm', 'saveOptions']
    },
    {
      path: '/permission-center',
      name: 'PermissionCenter',
      title: '权限中心',
      description: '权限管理页面',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['roleList', 'permissions', 'assignments']
    }
  ],

  // AI助手类目
  'ai-assistant': [
    {
      path: '/ai-center',
      name: 'AiCenter',
      title: 'AI助手中心',
      description: 'AI助手主页面',
      category: 'AI助手',
      expectsData: true,
      validationChecks: ['chatInterface', 'memoryStats', 'models']
    },
    {
      path: '/ai-center/chat',
      name: 'AiChat',
      title: 'AI对话',
      description: 'AI对话页面',
      category: 'AI助手',
      validationChecks: ['chatBox', 'history', 'settings']
    },
    {
      path: '/ai-center/memory',
      name: 'AiMemory',
      title: 'AI记忆',
      description: 'AI记忆管理页面',
      category: 'AI助手',
      expectsData: true,
      validationChecks: ['memoryList', 'search', 'management']
    }
  ],

  // 营销管理类目
  'marketing-management': [
    {
      path: '/marketing-center',
      name: 'MarketingCenter',
      title: '营销中心',
      description: '营销管理主页面',
      category: '营销管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      expectsData: true,
      validationChecks: ['campaigns', 'stats', 'analytics']
    },
    {
      path: '/advertisement-center',
      name: 'AdvertisementCenter',
      title: '广告中心',
      description: '广告管理页面',
      category: '营销管理',
      requiredRole: ['ADMIN'],
      expectsData: true,
      validationChecks: ['adList', 'placements', 'performance']
    }
  ]
}

// 获取所有页面路由
export function getAllPageRoutes(): PageRoute[] {
  return Object.values(PAGE_ROUTES).flat()
}

// 根据角色获取页面路由
export function getPageRoutesByRole(role: string): PageRoute[] {
  return getAllPageRoutes().filter(route => {
    if (!route.requiredRole) return true
    return route.requiredRole.includes(role)
  })
}

// 根据分类获取页面路由
export function getPageRoutesByCategory(category: string): PageRoute[] {
  return getAllPageRoutes().filter(route =>
    route.category === category
  )
}

// 获取需要数据的页面
export function getPagesRequiringData(): PageRoute[] {
  return getAllPageRoutes().filter(route =>
    route.expectsData === true
  )
}

// 页面路由统计
export function getPageRouteStats() {
  const routes = getAllPageRoutes()
  const stats = {
    total: routes.length,
    byCategory: {} as Record<string, number>,
    requiringData: routes.filter(r => r.expectsData).length,
    restrictedToRoles: routes.filter(r => r.requiredRole).length
  }

  routes.forEach(route => {
    stats.byCategory[route.category] =
      (stats.byCategory[route.category] || 0) + 1
  })

  return stats
}