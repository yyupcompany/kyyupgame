/**
 * 用户管理相关类型定义
 */

import { PaginationParams } from './api-response';

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',     // 激活
  INACTIVE = 'INACTIVE', // 未激活
  LOCKED = 'LOCKED',     // 锁定
  SUSPENDED = 'SUSPENDED' // 暂停
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'ADMIN',           // 系统管理员
  PRINCIPAL = 'PRINCIPAL',   // 园长
  TEACHER = 'TEACHER',       // 教师
  PARENT = 'PARENT',         // 家长
  STAFF = 'STAFF'            // 员工
}

/**
 * 用户基础信息接口
 */
export interface User {
  id: number;
  username: string;
  email?: string;
  realName?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  role?: UserRole;
  roles?: UserRole[];
  department?: string;
  position?: string;
  permissions?: string[];
  kindergartenId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * 用户详细信息接口
 */
export interface UserDetail extends User {
  profile?: {
    gender?: 'MALE' | 'FEMALE';
    birthday?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  settings?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
  };
}

/**
 * 用户简要信息接口
 */
export interface UserBrief {
  id: string | number;
  username: string;
  realName?: string;
  avatar?: string;
  role?: UserRole;
  status: UserStatus;
}

/**
 * 用户创建参数
 */
export interface CreateUserParams {
  username: string;
  email?: string;
  password: string;
  realName?: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  department?: string;
  position?: string;
  kindergartenId?: string | number;
}

/**
 * 用户更新参数
 */
export interface UpdateUserParams {
  email?: string;
  realName?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
  department?: string;
  position?: string;
  role?: UserRole;
}

/**
 * 用户查询参数
 */
export interface UserQueryParams extends PaginationParams {
  keyword?: string;
  status?: UserStatus;
  role?: UserRole;
  department?: string;
  kindergartenId?: string | number;
  startDate?: string;
  endDate?: string;
}

/**
 * 用户登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
  captcha?: string;
}

/**
 * 用户登录响应
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
  message?: string;
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  success: boolean;
  user: UserDetail;
  roles: string[];
  permissions: string[];
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 重置密码参数
 */
export interface ResetPasswordParams {
  userId: string | number;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 用户权限信息
 */
export interface UserPermission {
  id: string | number;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * 用户角色信息
 */
export interface UserRoleInfo {
  id: string | number;
  name: string;
  code: string;
  description?: string;
  permissions: UserPermission[];
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  roleDistribution: {
    [key in UserRole]?: number;
  };
  statusDistribution: {
    [key in UserStatus]?: number;
  };
}