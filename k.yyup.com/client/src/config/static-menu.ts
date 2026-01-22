/**
 * 静态菜单配置
 * 替代动态菜单，简化权限系统
 */

export interface MenuItem {
  id: string
  title: string
  path: string
  icon?: string
  component: string
  children?: MenuItem[]
  roles?: string[] // 允许访问的角色，空数组表示所有角色都可以访问
  permissions?: string[] // 需要的权限代码
  meta?: {
    requiresAuth?: boolean
    hidden?: boolean
    isExternal?: boolean
    keepAlive?: boolean
  }
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  admin: ['*'], // 管理员拥有所有权限
  principal: [
    'dashboard:view', 'centers:view', 'teacher-center:view',
    'student:view', 'class:view', 'activity:view', 'parent-center:view',
    'enrollment:view', 'marketing:view', 'finance:view', 'system:view',
    'assessment-analytics:view', 'assessment:view'
  ],
  teacher: [
    'dashboard:view', 'teacher-center:view', 'class:view',
    'student:view', 'activity:view', 'attendance:view', 'teaching:view',
    'teacher-student-assessment:view'
  ],
  parent: [
    'dashboard:view', 'parent-center:view', 'student:view',
    'activity:view', 'communication:view', 'payment:view'
  ]
}

// 静态菜单配置
export const STATIC_MENU_CONFIG: MenuItem[] = [
  // 仪表板 - 所有认证用户都可以访问
  {
    id: 'dashboard',
    title: '仪表板',
    path: '/dashboard',
    icon: 'Dashboard',
    component: 'Dashboard',
    roles: ['admin', 'principal', 'teacher', 'parent'], // ✅ 所有角色都可以访问
    meta: {
      requiresAuth: true
    }
  },

  // 管理中心 - 仅管理员和园长可以访问
  {
    id: 'centers',
    title: '管理中心',
    path: '/centers',
    icon: 'Building',
    component: 'centers/Layout',
    roles: ['admin', 'principal'], // ✅ 只有管理员和园长可以访问
    meta: {
      requiresAuth: true
    },
    children: [
      {
        id: 'centers-personnel',
        title: '人员管理',
        path: '/centers/personnel',
        component: 'centers/PersonnelCenter',
        roles: ['admin', 'principal']
      },
      {
        id: 'centers-script',
        title: '文案管理',
        path: '/centers/script',
        component: 'centers/ScriptCenter',
        roles: ['admin', 'principal'], // ✅ 添加角色限制
        meta: {
          requiresAuth: true
        }
      },
      {
        id: 'centers-ai',
        title: 'AI中心',
        path: '/centers/ai',
        component: 'centers/AICenter',
        roles: ['admin', 'principal'], // ✅ 添加角色限制
        meta: {
          requiresAuth: true
        }
      },
      {
        id: 'centers-activity',
        title: '活动管理',
        path: '/centers/activity',
        component: 'centers/ActivityCenter',
        roles: ['admin', 'principal'], // ✅ 添加角色限制
        meta: {
          requiresAuth: true
        }
      },
      {
        id: 'assessment-analytics',
        title: '测评数据中心',
        path: '/assessment-analytics',
        component: 'assessment-analytics/Layout',
        roles: ['admin', 'principal'],
        meta: {
          requiresAuth: true
        },
        children: [
          {
            id: 'assessment-overview',
            title: '测评总览',
            path: '/assessment-analytics/overview',
            component: 'assessment-analytics/overview',
            roles: ['admin', 'principal']
          },
          {
            id: 'assessment-records',
            title: '测评记录',
            path: '/assessment-analytics/records',
            component: 'assessment-analytics/records',
            roles: ['admin', 'principal']
          },
          {
            id: 'assessment-reports',
            title: '测评报告',
            path: '/assessment-analytics/reports',
            component: 'assessment-analytics/reports',
            roles: ['admin', 'principal']
          },
          {
            id: 'assessment-trends',
            title: '数据趋势',
            path: '/assessment-analytics/trends',
            component: 'assessment-analytics/trends',
            roles: ['admin', 'principal']
          }
        ]
      },
      {
        id: 'centers-enrollment',
        title: '招生管理',
        path: '/centers/enrollment',
        component: 'centers/EnrollmentCenter',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'centers-finance',
        title: '财务管理',
        path: '/centers/finance',
        component: 'centers/FinanceCenter',
        roles: ['admin', 'principal']
      },
      {
        id: 'centers-system',
        title: '系统管理',
        path: '/centers/system',
        component: 'centers/SystemCenter',
        roles: ['admin']
      }
    ]
  },

  // 教师中心 - 仅管理员、园长和教师可以访问
  {
    id: 'teacher-center',
    title: '教师中心',
    path: '/teacher-center',
    icon: 'User',
    component: 'teacher-center/Layout',
    roles: ['admin', 'principal', 'teacher'],
    meta: {
      requiresAuth: true
    },
    children: [
      {
        id: 'teacher-dashboard',
        title: '工作台',
        path: '/teacher-center/dashboard',
        component: 'teacher-center/Dashboard',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'teacher-teaching',
        title: '教学管理',
        path: '/teacher-center/teaching',
        component: 'teacher-center/Teaching',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'teacher-attendance',
        title: '考勤管理',
        path: '/teacher-center/attendance',
        component: 'teacher-center/Attendance',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'teacher-activities',
        title: '活动管理',
        path: '/teacher-center/activities',
        component: 'teacher-center/Activities',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'teacher-tasks',
        title: '任务管理',
        path: '/teacher-center/tasks',
        component: 'teacher-center/Tasks',
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'teacher-student-assessment',
        title: '学生测评',
        path: '/teacher-center/student-assessment',
        component: 'teacher-center/student-assessment',
        roles: ['teacher']
      },
      {
        id: 'teacher-class-contacts',
        title: '班级通讯录',
        path: '/teacher-center/class-contacts',
        component: 'teacher-center/class-contacts',
        roles: ['admin', 'principal', 'teacher']
      }
    ]
  },

  // 家长中心 - 仅家长可以访问
  {
    id: 'parent-center',
    title: '家长中心',
    path: '/parent-center',
    icon: 'Users',
    component: 'parent-center/Layout',
    roles: ['parent', 'admin'], // ✅ 只有家长可以访问
    meta: {
      requiresAuth: true
    },
    children: [
      {
        id: 'parent-dashboard',
        title: '工作台',
        path: '/parent-center/dashboard',
        component: 'parent-center/Dashboard',
        roles: ['parent', 'admin']
      },
      {
        id: 'parent-children',
        title: '孩子管理',
        path: '/parent-center/children',
        component: 'parent-center/Children',
        roles: ['parent', 'admin']
      },
      {
        id: 'parent-activities',
        title: '招生活动',
        path: '/parent-center/activities',
        component: 'parent-center/Activities',
        roles: ['parent', 'admin']
      },
      {
        id: 'parent-assessment',
        title: '成长评估',
        path: '/parent-center/assessment',
        component: 'parent-center/Assessment',
        roles: ['parent', 'admin']
      },
      {
        id: 'parent-communication',
        title: '家校沟通',
        path: '/parent-center/communication',
        component: 'parent-center/Communication',
        roles: ['parent', 'admin']
      }
    ]
  },

  // AI助手 - 所有认证用户都可以访问
  {
    id: 'ai',
    title: 'AI助手',
    path: '/ai',
    icon: 'Robot',
    component: 'ai/Layout',
    roles: ['admin', 'principal', 'teacher', 'parent'], // ✅ 所有角色都可以访问
    meta: {
      requiresAuth: true
    },
    children: [
      {
        id: 'ai-assistant',
        title: '智能助手',
        path: '/ai/assistant',
        component: 'ai/AIAssistant',
        roles: ['admin', 'principal', 'teacher', 'parent']
      },
      {
        id: 'ai-query',
        title: '智能查询',
        path: '/ai/query-interface',
        component: 'ai/AIQueryInterface',
        roles: ['admin', 'principal', 'teacher', 'parent']
      },
      {
        id: 'ai-analysis',
        title: '数据分析',
        path: '/ai/analytics',
        component: 'ai/analytics',
        roles: ['admin', 'principal'] // ✅ 仅管理员和园长可以访问
      },
      {
        id: 'ai-models',
        title: '模型管理',
        path: '/ai/models',
        component: 'ai/models',
        roles: ['admin'] // ✅ 仅管理员可以访问
      }
    ]
  }
]

// 权限守卫配置
export const PERMISSION_GUARD_CONFIG = {
  // 公开路由（无需认证）
  publicRoutes: [
    '/login',
    '/register',
    '/403',
    '/404',
    '/forgot-password',
    '/no-permission'
  ],

  // 角色默认首页
  roleHomePages: {
    admin: '/dashboard',
    principal: '/dashboard',
    teacher: '/teacher-center/dashboard',
    parent: '/parent-center/dashboard'
  },

  // 无权限重定向页面
  noPermissionRoute: '/403'
}

/**
 * 根据用户角色过滤菜单
 */
export function filterMenuByRole(menus: MenuItem[], userRole: string): MenuItem[] {
  return menus.filter(menu => {
    // 检查当前用户是否有权限访问此菜单项
    if (menu.roles && menu.roles.length > 0 && !menu.roles.includes(userRole)) {
      return false
    }

    // 递归过滤子菜单
    if (menu.children) {
      menu.children = filterMenuByRole(menu.children, userRole)
    }

    return true
  })
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || []
  return rolePermissions.includes('*') || rolePermissions.includes(permission)
}

/**
 * 检查用户是否有菜单访问权限
 */
export function hasMenuAccess(userRole: string, menuItem: MenuItem): boolean {
  if (menuItem.roles && menuItem.roles.length > 0) {
    return menuItem.roles.includes(userRole)
  }

  if (menuItem.permissions && menuItem.permissions.length > 0) {
    return menuItem.permissions.some(permission => hasPermission(userRole, permission))
  }

  return true
}