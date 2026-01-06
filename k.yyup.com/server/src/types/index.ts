/**
 * API核心类型定义
 */

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 登录请求数据
export interface LoginDto {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    realName: string;
    phone: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
  };
  permissions: string[];
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  realName: string;
  phone: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

// 角色信息
export interface RoleInfo {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

// 权限信息
export interface PermissionInfo {
  id: number;
  name: string;
  code: string;
  type: string;
  parentId: number | null;
  path: string;
  component: string | null;
  permission: string | null;
  icon: string | null;
  sort: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

// 分页请求参数
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 用户相关类型
export interface UserDto {
  id: number;
  username: string;
  email: string;
  realName?: string;
  phone?: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  realName?: string;
  phone?: string;
  roleIds?: number[];
  status?: number;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  realName?: string;
  phone?: string;
  status?: number;
  roleIds?: number[];
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 角色相关类型
export interface RoleDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  isSystem: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  permissionIds?: number[];
  status?: number;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  status?: number;
  permissionIds?: number[];
}

// 权限相关类型
export interface PermissionDto {
  id: number;
  name: string;
  code: string;
  type: string;
  parentId: number | null;
  path?: string;
  icon?: string;
  component?: string;
  sort: number;
  status: number;
  isSystem: number;
  createdAt: Date;
  updatedAt: Date;
  children?: PermissionDto[];
}

export interface CreatePermissionDto {
  name: string;
  code: string;
  type: string;
  parentId?: number | null;
  path?: string;
  icon?: string;
  component?: string;
  sort?: number;
  status?: number;
}

export interface UpdatePermissionDto {
  name?: string;
  code?: string;
  type?: string;
  parentId?: number | null;
  path?: string;
  icon?: string;
  component?: string;
  sort?: number;
  status?: number;
} 

export * from './user';
export * from './role';
export * from './permission';
export * from './kindergarten';
export * from './student';
export * from './parent';
export * from './class';
export * from './auth';
export * from './common'; 