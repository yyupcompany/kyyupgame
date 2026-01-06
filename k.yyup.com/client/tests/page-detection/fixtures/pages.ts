export interface PageConfig {
  path: string
  name: string
  category: string
  requiresAuth: boolean
  roles?: string[]
}

// 核心页面列表 - 基于前端页面VUE.MD分析的21个主功能页面
export const CORE_PAGES: PageConfig[] = [
  // 仪表板模块
  {
    path: '/dashboard',
    name: '仪表板主页',
    category: 'dashboard',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher', 'parent']
  },
  
  // 用户管理模块
  {
    path: '/admin/users',
    name: '用户管理',
    category: 'user-management',
    requiresAuth: true,
    roles: ['admin']
  },
  {
    path: '/admin/roles',
    name: '角色管理',
    category: 'user-management', 
    requiresAuth: true,
    roles: ['admin']
  },
  {
    path: '/admin/permissions',
    name: '权限管理',
    category: 'user-management',
    requiresAuth: true,
    roles: ['admin']
  },
  
  // 教育管理模块
  {
    path: '/teachers',
    name: '教师管理',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  {
    path: '/students',
    name: '学生管理',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  {
    path: '/parents',
    name: '家长管理',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  {
    path: '/classes',
    name: '班级管理',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  
  // 招生管理模块  
  {
    path: '/enrollment/plans',
    name: '招生计划',
    category: 'enrollment',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  {
    path: '/enrollment/applications',
    name: '申请管理',
    category: 'enrollment',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  {
    path: '/enrollment/consultations',
    name: '咨询管理',
    category: 'enrollment',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  
  // 活动管理模块
  {
    path: '/activities',
    name: '活动管理',
    category: 'activities',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  {
    path: '/activities/registrations',
    name: '报名管理',
    category: 'activities',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  
  // AI服务模块
  {
    path: '/ai',
    name: 'AI助手',
    category: 'ai-services',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  {
    path: '/ai/query',
    name: 'AI查询',
    category: 'ai-services',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  
  // 系统管理模块
  {
    path: '/system',
    name: '系统设置',
    category: 'system',
    requiresAuth: true,
    roles: ['admin']
  },
  {
    path: '/system/logs',
    name: '系统日志',
    category: 'system',
    requiresAuth: true,
    roles: ['admin']
  },
  {
    path: '/notifications',
    name: '通知中心',
    category: 'system',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher', 'parent']
  },
  
  // 统计分析
  {
    path: '/statistics',
    name: '数据统计',
    category: 'analytics',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  
  // 个人中心
  {
    path: '/profile',
    name: '个人中心',
    category: 'profile',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher', 'parent']
  },
  
  // 日程管理
  {
    path: '/schedule',
    name: '日程管理',
    category: 'schedule',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  }
]

// 子页面列表 - 重要的子功能页面
export const SUB_PAGES: PageConfig[] = [
  // 用户管理子页面
  {
    path: '/admin/users/add',
    name: '添加用户',
    category: 'user-management',
    requiresAuth: true,
    roles: ['admin']
  },
  
  // 教师管理子页面
  {
    path: '/teachers/add',
    name: '添加教师',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  
  // 学生管理子页面
  {
    path: '/students/add',
    name: '添加学生',
    category: 'education',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  
  // 招生计划子页面
  {
    path: '/enrollment/plans/add',
    name: '新建招生计划',
    category: 'enrollment',
    requiresAuth: true,
    roles: ['admin', 'principal']
  },
  
  // 活动管理子页面
  {
    path: '/activities/add',
    name: '新建活动',
    category: 'activities',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  
  // AI服务子页面
  {
    path: '/ai/conversations',
    name: 'AI对话历史',
    category: 'ai-services',
    requiresAuth: true,
    roles: ['admin', 'principal', 'teacher']
  },
  {
    path: '/ai/models',
    name: 'AI模型配置',
    category: 'ai-services',
    requiresAuth: true,
    roles: ['admin']
  }
]

// 特殊页面列表
export const SPECIAL_PAGES: PageConfig[] = [
  // 登录页面
  {
    path: '/login',
    name: '登录页面',
    category: 'auth',
    requiresAuth: false
  },
  
  // 404错误页面
  {
    path: '/404',
    name: '404错误页面',
    category: 'error',
    requiresAuth: false
  },
  
  // 403权限错误页面
  {
    path: '/403',
    name: '403权限错误页面',
    category: 'error',
    requiresAuth: false
  }
]

// 获取所有页面
export const ALL_PAGES = [...CORE_PAGES, ...SUB_PAGES, ...SPECIAL_PAGES]

// 按分类获取页面
export const getPagesByCategory = (category: string): PageConfig[] => {
  return ALL_PAGES.filter(page => page.category === category)
}

// 按角色获取页面
export const getPagesByRole = (role: string): PageConfig[] => {
  return ALL_PAGES.filter(page => 
    !page.requiresAuth || 
    !page.roles || 
    page.roles.includes(role)
  )
}

// 获取核心页面（用于快速测试）
export const getCorePages = (): PageConfig[] => CORE_PAGES

// 获取需要认证的页面
export const getAuthRequiredPages = (): PageConfig[] => {
  return ALL_PAGES.filter(page => page.requiresAuth)
}

// 页面分类枚举
export enum PageCategory {
  DASHBOARD = 'dashboard',
  USER_MANAGEMENT = 'user-management',
  EDUCATION = 'education', 
  ENROLLMENT = 'enrollment',
  ACTIVITIES = 'activities',
  AI_SERVICES = 'ai-services',
  SYSTEM = 'system',
  ANALYTICS = 'analytics',
  PROFILE = 'profile',
  SCHEDULE = 'schedule',
  AUTH = 'auth',
  ERROR = 'error'
}