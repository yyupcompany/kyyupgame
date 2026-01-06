/**
 * API端点配置
 * 定义所有需要测试的API端点
 */

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  category: string
  requiredRole?: string[]
  expectedStatus?: number
  validationSchema?: object
}

// API端点分类配置
export const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
  // 认证相关
  auth: [
    {
      path: '/api/auth/login',
      method: 'POST',
      description: '用户登录',
      category: '认证',
      expectedStatus: 200
    },
    {
      path: '/api/auth/logout',
      method: 'POST',
      description: '用户登出',
      category: '认证',
      expectedStatus: 200
    },
    {
      path: '/api/auth/refresh',
      method: 'POST',
      description: '刷新Token',
      category: '认证',
      expectedStatus: 200
    },
    {
      path: '/api/auth/profile',
      method: 'GET',
      description: '获取用户信息',
      category: '认证',
      expectedStatus: 200
    }
  ],

  // 用户管理
  users: [
    {
      path: '/api/users',
      method: 'GET',
      description: '获取用户列表',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    },
    {
      path: '/api/users/:id',
      method: 'GET',
      description: '获取用户详情',
      category: '用户管理',
      expectedStatus: 200
    },
    {
      path: '/api/users',
      method: 'POST',
      description: '创建用户',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 201
    },
    {
      path: '/api/users/:id',
      method: 'PUT',
      description: '更新用户',
      category: '用户管理',
      expectedStatus: 200
    },
    {
      path: '/api/users/:id',
      method: 'DELETE',
      description: '删除用户',
      category: '用户管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    }
  ],

  // 教师管理
  teachers: [
    {
      path: '/api/teachers',
      method: 'GET',
      description: '获取教师列表',
      category: '教师管理',
      expectedStatus: 200
    },
    {
      path: '/api/teachers/:id',
      method: 'GET',
      description: '获取教师详情',
      category: '教师管理',
      expectedStatus: 200
    },
    {
      path: '/api/teachers/:id/classes',
      method: 'GET',
      description: '获取教师班级',
      category: '教师管理',
      expectedStatus: 200
    },
    {
      path: '/api/teachers/:id/schedule',
      method: 'GET',
      description: '获取教师课表',
      category: '教师管理',
      expectedStatus: 200
    }
  ],

  // 学生管理
  students: [
    {
      path: '/api/students',
      method: 'GET',
      description: '获取学生列表',
      category: '学生管理',
      expectedStatus: 200
    },
    {
      path: '/api/students/:id',
      method: 'GET',
      description: '获取学生详情',
      category: '学生管理',
      expectedStatus: 200
    },
    {
      path: '/api/students',
      method: 'POST',
      description: '创建学生',
      category: '学生管理',
      requiredRole: ['ADMIN', 'TEACHER'],
      expectedStatus: 201
    },
    {
      path: '/api/students/:id',
      method: 'PUT',
      description: '更新学生信息',
      category: '学生管理',
      expectedStatus: 200
    },
    {
      path: '/api/students/:id/growth',
      method: 'GET',
      description: '获取学生成长记录',
      category: '学生管理',
      expectedStatus: 200
    }
  ],

  // 班级管理
  classes: [
    {
      path: '/api/classes',
      method: 'GET',
      description: '获取班级列表',
      category: '班级管理',
      expectedStatus: 200
    },
    {
      path: '/api/classes/:id',
      method: 'GET',
      description: '获取班级详情',
      category: '班级管理',
      expectedStatus: 200
    },
    {
      path: '/api/classes',
      method: 'POST',
      description: '创建班级',
      category: '班级管理',
      requiredRole: ['ADMIN', 'PRINCIPAL'],
      expectedStatus: 201
    },
    {
      path: '/api/classes/:id/students',
      method: 'GET',
      description: '获取班级学生',
      category: '班级管理',
      expectedStatus: 200
    },
    {
      path: '/api/classes/:id/schedule',
      method: 'GET',
      description: '获取班级课程表',
      category: '班级管理',
      expectedStatus: 200
    }
  ],

  // 活动管理
  activities: [
    {
      path: '/api/activities',
      method: 'GET',
      description: '获取活动列表',
      category: '活动管理',
      expectedStatus: 200
    },
    {
      path: '/api/activities/:id',
      method: 'GET',
      description: '获取活动详情',
      category: '活动管理',
      expectedStatus: 200
    },
    {
      path: '/api/activities',
      method: 'POST',
      description: '创建活动',
      category: '活动管理',
      requiredRole: ['ADMIN', 'TEACHER', 'PRINCIPAL'],
      expectedStatus: 201
    },
    {
      path: '/api/activities/:id/register',
      method: 'POST',
      description: '活动报名',
      category: '活动管理',
      expectedStatus: 201
    },
    {
      path: '/api/activities/:id/participants',
      method: 'GET',
      description: '获取活动参与者',
      category: '活动管理',
      expectedStatus: 200
    }
  ],

  // 家长管理
  parents: [
    {
      path: '/api/parents',
      method: 'GET',
      description: '获取家长列表',
      category: '家长管理',
      expectedStatus: 200
    },
    {
      path: '/api/parents/:id',
      method: 'GET',
      description: '获取家长详情',
      category: '家长管理',
      expectedStatus: 200
    },
    {
      path: '/api/parents/:id/children',
      method: 'GET',
      description: '获取家长孩子',
      category: '家长管理',
      expectedStatus: 200
    },
    {
      path: '/api/parents/:id/messages',
      method: 'GET',
      description: '获取家长消息',
      category: '家长管理',
      expectedStatus: 200
    }
  ],

  // 系统管理
  system: [
    {
      path: '/api/system/settings',
      method: 'GET',
      description: '获取系统设置',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    },
    {
      path: '/api/system/settings',
      method: 'PUT',
      description: '更新系统设置',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    },
    {
      path: '/api/system/logs',
      method: 'GET',
      description: '获取系统日志',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    },
    {
      path: '/api/system/backup',
      method: 'POST',
      description: '系统备份',
      category: '系统管理',
      requiredRole: ['ADMIN'],
      expectedStatus: 200
    }
  ],

  // 权限管理
  permissions: [
    {
      path: '/api/dynamic-permissions/dynamic-routes',
      method: 'GET',
      description: '获取动态路由',
      category: '权限管理',
      expectedStatus: 200
    },
    {
      path: '/api/dynamic-permissions/user-permissions',
      method: 'GET',
      description: '获取用户权限',
      category: '权限管理',
      expectedStatus: 200
    },
    {
      path: '/api/dynamic-permissions/check-permission',
      method: 'POST',
      description: '检查权限',
      category: '权限管理',
      expectedStatus: 200
    }
  ],

  // AI助手
  ai: [
    {
      path: '/api/ai/chat',
      method: 'POST',
      description: 'AI对话',
      category: 'AI助手',
      expectedStatus: 200
    },
    {
      path: '/api/ai/memory',
      method: 'GET',
      description: '获取AI记忆',
      category: 'AI助手',
      expectedStatus: 200
    },
    {
      path: '/api/ai/models',
      method: 'GET',
      description: '获取AI模型',
      category: 'AI助手',
      expectedStatus: 200
    }
  ]
}

// 获取所有API端点
export function getAllApiEndpoints(): ApiEndpoint[] {
  return Object.values(API_ENDPOINTS).flat()
}

// 根据角色获取API端点
export function getApiEndpointsByRole(role: string): ApiEndpoint[] {
  return getAllApiEndpoints().filter(endpoint => {
    if (!endpoint.requiredRole) return true
    return endpoint.requiredRole.includes(role)
  })
}

// 根据分类获取API端点
export function getApiEndpointsByCategory(category: string): ApiEndpoint[] {
  return getAllApiEndpoints().filter(endpoint =>
    endpoint.category === category
  )
}

// API端点统计
export function getApiEndpointStats() {
  const endpoints = getAllApiEndpoints()
  const stats = {
    total: endpoints.length,
    byCategory: {} as Record<string, number>,
    byMethod: {} as Record<string, number>
  }

  endpoints.forEach(endpoint => {
    stats.byCategory[endpoint.category] =
      (stats.byCategory[endpoint.category] || 0) + 1
    stats.byMethod[endpoint.method] =
      (stats.byMethod[endpoint.method] || 0) + 1
  })

  return stats
}