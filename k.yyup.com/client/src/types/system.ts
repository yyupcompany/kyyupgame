/**
 * 系统管理模块类型定义
 */

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

// 用户类型
export interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  mobile: string;
  roles: Role[];
  lastLoginTime?: string;
  status: 'active' | 'inactive' | 'ACTIVE' | 'INACTIVE' | 'LOCKED' | UserStatus;
  remark?: string;
}

// 角色类型
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  userCount?: number;
  createTime?: string;
}

// 权限类型
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  children?: Permission[];
}

// 用户日志类型
export interface UserLog {
  id: string;
  userId: string;
  actionTime: string;
  actionType: string;
  actionDesc: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  status: 'success' | 'failure';
}

// 系统日志类型
export interface SystemLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

// 系统设置类型
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  group: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  username?: string;
  realName?: string;
  mobile?: string;
  status?: string;
  roleId?: string;
  items?: User[];
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  items?: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 通用响应结构 - 与后端标准保持一致
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// 系统备份类型
export interface Backup {
  id: number | string;
  name: string;
  size: number;
  type: 'auto' | 'manual';
  content: string[];
  createdAt: string;
  description: string | null;
  filePath: string;
}

// 消息模板类型
export interface MessageTemplate {
  id?: string;
  code: string;
  name: string;
  type: string;
  title: string;
  content: string;
  params: string | null;
  description: string | null;
  status: number;
  isSystem?: boolean;
  version?: number;
}

// 系统公告类型
export interface SystemAnnouncement {
  id?: string;
  title: string;
  content: string;
  status: string;
  publishTime?: string;
  publisher?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 校区信息
 */
export interface Campus {
  id: string;
  name: string;
  address: string;
  phone: string;
  principal: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统用户
 */
export interface SystemUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  status: 'active' | 'locked' | 'disabled';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统角色
 */
export interface SystemRole {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统配置
 */
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
} 