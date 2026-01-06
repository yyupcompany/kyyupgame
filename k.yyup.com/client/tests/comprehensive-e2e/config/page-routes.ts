/**
 * 页面路由配置
 * 定义所有角色可访问的页面路由
 */

import type { UserRole } from './test-users'

export interface PageRoute {
  path: string
  title: string
  description: string
  roles: UserRole[]
  deviceType?: 'pc' | 'mobile' | 'both'
  category: string
  expectedContent?: string[] // 预期页面应包含的内容
}

/**
 * 所有页面路由配置
 */
export const PAGE_ROUTES: PageRoute[] = [
  // ========== 仪表板 ==========
  {
    path: '/dashboard',
    title: '综合工作台',
    description: '显示全校统计概览、学生数量、教师数量、班级数量等核心指标',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'dashboard',
    expectedContent: ['统计', '数据', '概览']
  },

  // ========== 管理中心 ==========
  {
    path: '/centers',
    title: '管理中心',
    description: '统一管理平台入口',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/personnel',
    title: '人员管理',
    description: '教职工管理、部门管理、岗位管理',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/finance',
    title: '财务管理',
    description: '财务报表、费用管理、缴费记录',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/enrollment',
    title: '招生管理',
    description: '招生计划、招生统计、生源分析',
    roles: ['admin', 'principal', 'teacher'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/activity',
    title: '活动管理',
    description: '活动策划、活动发布、活动统计',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/system',
    title: '系统管理',
    description: '系统设置、用户管理、权限管理',
    roles: ['admin'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/ai',
    title: 'AI中心',
    description: 'AI模型管理、AI配置、AI统计',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },
  {
    path: '/centers/script',
    title: '文案管理',
    description: '文案模板、话术管理',
    roles: ['admin', 'principal'],
    deviceType: 'pc',
    category: 'centers'
  },

  // ========== 教师中心 ==========
  {
    path: '/teacher-center/dashboard',
    title: '教师工作台',
    description: '教师日常工作管理平台',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center',
    expectedContent: ['任务', '学生', '班级']
  },
  {
    path: '/teacher-center/teaching',
    title: '教学管理',
    description: '课程管理、教学资源、教学计划',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/attendance',
    title: '考勤管理',
    description: '学生考勤、教师考勤、考勤统计',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/activities',
    title: '活动管理',
    description: '班级活动、活动报名、活动签到',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/tasks',
    title: '任务管理',
    description: '工作任务、任务分配、任务跟踪',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/student-assessment',
    title: '学生测评',
    description: '学生评估、成长记录、评估报告',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/customer-pool',
    title: '客户池',
    description: '客户管理、客户跟进、客户统计',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },
  {
    path: '/teacher-center/customer-tracking',
    title: '客户跟踪',
    description: '跟进记录、跟进提醒、转化统计',
    roles: ['teacher'],
    deviceType: 'pc',
    category: 'teacher-center'
  },

  // ========== 家长中心 ==========
  {
    path: '/parent-center/dashboard',
    title: '家长工作台',
    description: '家长查看孩子信息的平台',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center',
    expectedContent: ['孩子', '学生', '信息']
  },
  {
    path: '/parent-center/children',
    title: '孩子管理',
    description: '孩子信息、健康记录、成长记录',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center'
  },
  {
    path: '/parent-center/activities',
    title: '活动参与',
    description: '活动报名、活动记录、活动照片',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center'
  },
  {
    path: '/parent-center/assessment',
    title: '成长评估',
    description: '评估报告、成长轨迹、能力发展',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center'
  },
  {
    path: '/parent-center/communication',
    title: '家校沟通',
    description: '消息通知、留言反馈、在线咨询',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center'
  },
  {
    path: '/parent-center/photo-album',
    title: '照片相册',
    description: '活动照片、日常照片、成长记录',
    roles: ['parent'],
    deviceType: 'pc',
    category: 'parent-center'
  },

  // ========== AI助手 ==========
  {
    path: '/ai/assistant',
    title: 'AI助手',
    description: '智能对话助手，支持多种功能',
    roles: ['admin', 'principal', 'teacher', 'parent'],
    deviceType: 'both',
    category: 'ai'
  },

  // ========== 移动端管理中心 ==========
  {
    path: '/mobile/centers',
    title: '移动端管理中心',
    description: '移动端统一管理入口',
    roles: ['admin', 'principal'],
    deviceType: 'mobile',
    category: 'mobile-centers'
  },
  {
    path: '/mobile/centers/analytics-center',
    title: '数据分析中心',
    description: '数据统计、数据分析、数据报表',
    roles: ['admin', 'principal'],
    deviceType: 'mobile',
    category: 'mobile-centers'
  },
  {
    path: '/mobile/centers/enrollment-center',
    title: '招生中心',
    description: '招生管理、招生统计、生源分析',
    roles: ['admin', 'principal'],
    deviceType: 'mobile',
    category: 'mobile-centers'
  },
  {
    path: '/mobile/centers/finance-center',
    title: '财务中心',
    description: '财务报表、费用管理、缴费记录',
    roles: ['admin', 'principal'],
    deviceType: 'mobile',
    category: 'mobile-centers'
  },
  {
    path: '/mobile/centers/personnel-center',
    title: '人员中心',
    description: '员工管理、部门管理、考勤管理',
    roles: ['admin', 'principal'],
    deviceType: 'mobile',
    category: 'mobile-centers'
  },

  // ========== 移动端教师中心 ==========
  {
    path: '/mobile/teacher-center/dashboard',
    title: '移动端教师工作台',
    description: '教师移动端工作平台',
    roles: ['teacher'],
    deviceType: 'mobile',
    category: 'mobile-teacher-center',
    expectedContent: ['任务', '学生', '班级']
  },
  {
    path: '/mobile/teacher-center/attendance',
    title: '移动端考勤管理',
    description: '学生考勤、考勤统计',
    roles: ['teacher'],
    deviceType: 'mobile',
    category: 'mobile-teacher-center'
  },
  {
    path: '/mobile/teacher-center/activities',
    title: '移动端活动管理',
    description: '班级活动、活动管理',
    roles: ['teacher'],
    deviceType: 'mobile',
    category: 'mobile-teacher-center'
  },

  // ========== 移动端家长中心 ==========
  {
    path: '/mobile/parent-center/dashboard',
    title: '移动端家长工作台',
    description: '家长移动端查看平台',
    roles: ['parent'],
    deviceType: 'mobile',
    category: 'mobile-parent-center',
    expectedContent: ['孩子', '学生', '信息']
  },
  {
    path: '/mobile/parent-center/children',
    title: '移动端孩子管理',
    description: '孩子信息查看',
    roles: ['parent'],
    deviceType: 'mobile',
    category: 'mobile-parent-center'
  },
  {
    path: '/mobile/parent-center/activities',
    title: '移动端活动参与',
    description: '活动报名和查看',
    roles: ['parent'],
    deviceType: 'mobile',
    category: 'mobile-parent-center'
  },
  {
    path: '/mobile/parent-center/photo-album',
    title: '移动端照片相册',
    description: '查看孩子活动照片',
    roles: ['parent'],
    deviceType: 'mobile',
    category: 'mobile-parent-center'
  }
]

/**
 * 获取指定角色的所有路由
 */
export function getRoutesForRole(role: UserRole, deviceType: 'pc' | 'mobile' = 'pc'): PageRoute[] {
  return PAGE_ROUTES.filter(
    route =>
      route.roles.includes(role) &&
      (route.deviceType === 'both' || route.deviceType === deviceType || !route.deviceType)
  )
}

/**
 * 获取指定类别的路由
 */
export function getRoutesByCategory(category: string): PageRoute[] {
  return PAGE_ROUTES.filter(route => route.category === category)
}

/**
 * 根据路径获取路由配置
 */
export function getRouteByPath(path: string): PageRoute | undefined {
  return PAGE_ROUTES.find(route => route.path === path)
}
