/**
 * 移动端统一类型定义文件
 * 包含认证、仪表盘等核心业务类型
 */

// ===== 认证相关类型 =====

export interface LoginCredentials {
  phone: string
  password: string
  rememberMe?: boolean
}

export interface CodeLoginCredentials {
  phone: string
  code: string
  password?: string
  role?: 'parent' | 'teacher' | 'admin'
  autoRegister?: boolean
}

export interface UserInfo {
  token: string
  username: string
  displayName: string
  role: string
  roles: string[]
  permissions: string[]
  email?: string
  avatar?: string
  id: string
  isAdmin: boolean
  status: string
  tenant?: any
  tenants?: any[]
}

// ===== 仪表盘相关类型 =====

export interface StatCard {
  id: string
  label: string
  value: string
  change: number
  icon: string
  type: 'primary' | 'success' | 'warning' | 'danger'
  badge?: number | string
  badgeType?: string
}

export interface NoticeItem {
  id: string
  content: string
  icon: string
  color: string
  type: string
  url?: string
}

export interface ActionItem {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  enabled: boolean
  path?: string
  action?: string
  badge?: number
}

export interface TodoItem {
  id: string
  title: string
  deadline: Date
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  description?: string
}

export interface ActivityItem {
  id: string
  content: string
  createdAt: Date
  avatar?: string
  icon: string
  type: string
}

export interface RecommendationItem {
  id: string
  title: string
  description: string
  icon: string
  primaryAction: string
  type: string
}

// ===== API响应类型 =====

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  code?: number
}

export interface ListResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ===== 租户相关类型 =====

export interface TenantInfo {
  tenantCode: string
  tenantName: string
  domain: string
  hasAccount: boolean
  role?: string
  lastLoginAt?: string
  loginCount: number
  status: 'active' | 'suspended' | 'deleted'
}

// ===== 统计数据类型 =====

export interface DashboardStats {
  userCount: number
  studentCount: number
  classCount: number
  activityCount: number
  enrollmentCount: number
  teacherCount: number
  pendingTasks?: number
  unreadNotifications?: number
  urgentNotifications?: number
  lastMonthStudentCount?: number
  lastMonthClassCount?: number
  lastMonthActivityCount?: number
}

// ===== 设备和环境类型 =====

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isIOS: boolean
  isAndroid: boolean
  screenWidth: number
  screenHeight: number
}

// ===== 主题和样式类型 =====

export interface ThemeColors {
  primary: string
  success: string
  warning: string
  danger: string
  info: string
}

// 导出所有类型
export type {
  // 认证
  LoginCredentials,
  CodeLoginCredentials,
  UserInfo,

  // 仪表盘
  StatCard,
  NoticeItem,
  ActionItem,
  TodoItem,
  ActivityItem,
  RecommendationItem,

  // API
  ApiResponse,
  ListResponse,

  // 业务
  TenantInfo,
  DashboardStats,
  DeviceInfo,
  ThemeColors
}

// 默认导出
export default {
  // 认证相关
  LoginCredentials,
  CodeLoginCredentials,
  UserInfo,

  // 仪表盘相关
  StatCard,
  NoticeItem,
  ActionItem,
  TodoItem,
  ActivityItem,
  RecommendationItem,

  // API相关
  ApiResponse,
  ListResponse,

  // 业务相关
  TenantInfo,
  DashboardStats,
  DeviceInfo,
  ThemeColors
}