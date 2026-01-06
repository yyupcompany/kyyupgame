// 用户模块API服务
import requestInstance, { type ApiResponse } from '../../utils/request';
import { AUTH_ENDPOINTS, USER_ENDPOINTS, UPLOAD_ENDPOINTS, SYSTEM_USER_ENDPOINTS } from '../endpoints';
import { transformUserData, transformListResponse, transformUserFormData } from '../../utils/dataTransform';

// 解构出需要的方法
const { request } = requestInstance;

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STAFF = 'STAFF'
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  roleId?: number;
  department?: string;
  phone?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * 登录参数接口
 */
export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  token: string;
  user: UserInfo;
}

/**
 * 用户信息响应接口
 */
export interface UserInfoResponse {
  user: UserInfo;
  roles: string[];
  permissions: string[];
}

/**
 * 修改密码参数接口
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 用户查询参数接口
 */
export interface UserQueryParams {
  page?: number;
  size?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: number;
  department?: string;
}

/**
 * 用户创建/更新参数接口
 */
export interface UserParams {
  username: string;
  email?: string;
  password?: string;
  role?: string;
  roleId?: number;
  department?: string;
  phone?: string;
  status?: number;
}

// ==================== 认证相关 API ====================

/**
 * 用户登录
 */
export function login(data: LoginParams): Promise<ApiResponse<LoginResponse>> {
  return request({
    url: AUTH_ENDPOINTS.LOGIN,
    method: 'post',
    data
  });
}

/**
 * 用户登出
 */
export function logout(): Promise<ApiResponse<void>> {
  return request({
    url: AUTH_ENDPOINTS.LOGOUT,
    method: 'post'
  });
}

/**
 * 修改用户密码
 */
export function changePassword(data: ChangePasswordParams): Promise<ApiResponse<{ success: boolean, message: string }>> {
  return request({
    url: AUTH_ENDPOINTS.CHANGE_PASSWORD,
    method: 'post',
    data
  });
}

// ==================== 用户信息管理 API ====================

/**
 * 获取当前用户信息
 */
export function getUserInfo(): Promise<ApiResponse<UserInfoResponse>> {
  return request({
    url: USER_ENDPOINTS.GET_PROFILE,
    method: 'get'
  });
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<ApiResponse<UserInfo>> {
  return request({
    url: USER_ENDPOINTS.UPDATE_PROFILE,
    method: 'put',
    data
  });
}

/**
 * 上传用户头像
 */
export function uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
  return request({
    url: UPLOAD_ENDPOINTS.AVATAR,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    } as any,
    data: formData
  });
}

// ==================== 用户管理 API ====================

/**
 * 获取用户列表
 */
export function getUserList(params?: UserQueryParams): Promise<ApiResponse<{
  items: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request({
    url: USER_ENDPOINTS.BASE,
    method: 'get',
    params
  }).then(response => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformUserData);
  });
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number | string): Promise<ApiResponse<UserInfo>> {
  return request({
    url: USER_ENDPOINTS.GET_BY_ID(id),
    method: 'get'
  }).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 创建用户
 */
export function createUser(data: UserParams): Promise<ApiResponse<UserInfo>> {
  // 转换表单数据
  const transformedData = transformUserFormData(data);
  
  return request({
    url: USER_ENDPOINTS.BASE,
    method: 'post',
    data: transformedData
  }).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 更新用户
 */
export function updateUser(id: number | string, data: Partial<UserParams>): Promise<ApiResponse<UserInfo>> {
  // 转换表单数据
  const transformedData = transformUserFormData(data);
  
  return request({
    url: USER_ENDPOINTS.GET_BY_ID(id),
    method: 'put',
    data: transformedData
  }).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 删除用户
 */
export function deleteUser(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: USER_ENDPOINTS.GET_BY_ID(id),
    method: 'delete'
  });
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id: number | string, status: number): Promise<ApiResponse<UserInfo>> {
  return request({
    url: SYSTEM_USER_ENDPOINTS.UPDATE_STATUS(id),
    method: 'put',
    data: { status }
  }).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id: number | string): Promise<ApiResponse<{ password: string }>> {
  return request({
    url: SYSTEM_USER_ENDPOINTS.RESET_PASSWORD(id),
    method: 'post'
  });
} 