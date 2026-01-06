import requestInstance, { type ApiResponse } from '../../utils/request';
import {
  transformUserData,
  transformListResponse,
  transformUserFormData
} from '../../utils/dataTransform';

// 解构出需要的方法
const { request } = requestInstance;

// 系统API端点配置 - 与后端路由对齐
const SYSTEM_ENDPOINTS = {
  // 系统基础接口
  HEALTH: '/system/health',
  INFO: '/system/info',
  VERSION: '/system/version',
  DOCS: '/system/docs',
  
  // 测试接口
  TEST_DATABASE: '/system/test/database',
  TEST_EMAIL: '/system/test/email',
  TEST_SMS: '/system/test/sms',
  
  // 系统功能
  UPLOAD: '/system/upload',
  CACHE_CLEAR: '/system/cache/clear',
  LOGS: '/system-logs',
  
  // 用户管理接口 (对应 user.routes.ts)
  USERS: '/users',
  USER_BY_ID: (id: number | string) => `/users/${id}`,
  USER_ME: '/users/me',
  USER_PROFILE: '/users/profile',
  USER_STATUS: (id: number | string) => `/users/${id}/status`,
  USER_CHANGE_PASSWORD: (id: number | string) => `/users/${id}/change-password`,
  
  // 角色管理接口 (对应 role.routes.ts)
  ROLES: '/roles',
  ROLE_BY_ID: (id: number | string) => `/roles/${id}`,
  MY_ROLES: '/roles/my-roles',
  CHECK_ROLE: (roleCode: string) => `/roles/check/${roleCode}`,
  
  // 权限管理接口 (对应 permission.routes.ts)
  PERMISSIONS: '/permissions',
  PERMISSION_BY_ID: (id: number | string) => `/permissions/${id}`,
  MY_PAGES: '/permissions/my-pages',
  CHECK_PAGE: (pagePath: string) => `/permissions/check/${pagePath}`,
  ROLE_PAGES: (roleId: number | string) => `/permissions/roles/${roleId}`,
  UPDATE_ROLE_PAGES: (roleId: number | string) => `/permissions/roles/${roleId}`,
};

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked'
}

/**
 * 权限类型枚举
 */
export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api'
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  [key: string]: any;
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * 用户信息接口
 */
export interface User {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  mobile?: string;
  status: UserStatus;
  roles?: Role[];
  lastLoginTime?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户创建/更新参数接口
 */
export interface UserParams {
  username: string;
  password?: string;
  realName?: string;
  email?: string;
  mobile?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/**
 * 角色信息接口
 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions?: Permission[];
  status: 'active' | 'inactive';
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色创建/更新参数接口
 */
export interface RoleParams {
  name: string;
  code: string;
  description?: string;
  status?: 'active' | 'inactive';
  permissionIds?: number[];
}

/**
 * 权限信息接口
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: PermissionType;
  parentId?: number;
  children?: Permission[];
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 权限创建/更新参数接口
 */
export interface PermissionParams {
  code: string;
  name: string;
  description?: string;
  type: PermissionType;
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: 'active' | 'inactive';
}

/**
 * 系统信息接口
 */
export interface SystemInfo {
  name: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  platform: string;
  node_version: string;
}

/**
 * 系统状态接口
 */
export interface SystemStatus {
  status: 'online' | 'offline';
  timestamp: string;
  uptime: number;
  version: string;
}

/**
 * 版本信息接口
 */
export interface VersionInfo {
  version: string;
  build: string;
  environment: string;
  api_version: string;
  last_updated: string;
}

/**
 * 测试邮件参数接口
 */
export interface TestEmailParams {
  to: string;
  subject: string;
  content: string;
  mailConfig?: {
    driver: string;
    host: string;
    port: string;
    username: string;
    password: string;
  };
}

/**
 * 测试短信参数接口
 */
export interface TestSmsParams {
  phone: string;
  content: string;
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
 * 系统日志接口
 */
export interface SystemLog {
  id: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: number;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * 系统日志查询参数接口
 */
export interface SystemLogParams extends PaginationParams {
  level?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

// ==================== 系统基础 API ====================

/**
 * 获取系统状态
 */
export function getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
  return request({
    url: SYSTEM_ENDPOINTS.HEALTH,
    method: 'get'
  });
}

/**
 * 获取系统健康状态
 */
export function getSystemHealth(): Promise<ApiResponse<SystemStatus>> {
  return request({
    url: SYSTEM_ENDPOINTS.HEALTH,
    method: 'get'
  });
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
  return request({
    url: SYSTEM_ENDPOINTS.INFO,
    method: 'get'
  });
}

/**
 * 获取版本信息
 */
export function getVersionInfo(): Promise<ApiResponse<VersionInfo>> {
  return request({
    url: SYSTEM_ENDPOINTS.VERSION,
    method: 'get'
  });
}

/**
 * 测试数据库连接
 */
export function testDatabaseConnection(): Promise<ApiResponse<{
  status: string;
  test_query: any;
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.TEST_DATABASE,
    method: 'get'
  });
}

/**
 * 发送测试邮件
 */
export function sendTestMail(data: TestEmailParams): Promise<ApiResponse<{
  status: string;
  to: string;
  subject: string;
  content: string;
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.TEST_EMAIL,
    method: 'post',
    data
  });
}

/**
 * 发送测试短信
 */
export function sendTestSms(data: TestSmsParams): Promise<ApiResponse<{
  status: string;
  phone: string;
  content: string;
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.TEST_SMS,
    method: 'post',
    data
  });
}

/**
 * 测试存储配置
 */
export function testStorageConfig(data: FormData): Promise<ApiResponse<{
  url: string;
  filename: string;
  size: number;
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.UPLOAD,
    method: 'post',
    data
  });
}

/**
 * 清理系统缓存
 */
export function clearSystemCache(): Promise<ApiResponse<{
  status: string;
  cleared_items: string[];
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.CACHE_CLEAR,
    method: 'post'
  });
}

// ==================== 用户管理 API ====================

/**
 * 获取用户列表
 */
export function getUsers(params?: PaginationParams): Promise<ApiResponse<PaginatedResult<User>>> {
  return request({
    url: SYSTEM_ENDPOINTS.USERS,
    method: 'get',
    params
  }).then(response => {
    return transformListResponse(response, transformUserData);
  });
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number | string): Promise<ApiResponse<User>> {
  return request({
    url: SYSTEM_ENDPOINTS.USER_BY_ID(id),
    method: 'get'
  }).then(response => {
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<ApiResponse<User>> {
  return request({
    url: SYSTEM_ENDPOINTS.USER_ME,
    method: 'get'
  });
}

/**
 * 获取用户资料
 */
export function getUserProfile(): Promise<ApiResponse<User>> {
  return request({
    url: SYSTEM_ENDPOINTS.USER_PROFILE,
    method: 'get'
  });
}

/**
 * 创建用户
 */
export function createUser(data: UserParams): Promise<ApiResponse<User>> {
  const transformedData = transformUserFormData(data);
  return request({
    url: SYSTEM_ENDPOINTS.USERS,
    method: 'post',
    data: transformedData
  }).then(response => {
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

/**
 * 更新用户信息
 */
export function updateUser(id: number | string, data: Partial<UserParams>): Promise<ApiResponse<User>> {
  const transformedData = transformUserFormData(data);
  return request({
    url: SYSTEM_ENDPOINTS.USER_BY_ID(id),
    method: 'put',
    data: transformedData
  }).then(response => {
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
    url: SYSTEM_ENDPOINTS.USER_BY_ID(id),
    method: 'delete'
  });
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id: number | string, status: UserStatus, reason?: string): Promise<ApiResponse<{
  id: number;
  status: UserStatus;
  reason?: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.USER_STATUS(id),
    method: 'patch',
    data: { status, reason }
  });
}

/**
 * 修改用户密码
 */
export function changeUserPassword(id: number | string, data: ChangePasswordParams): Promise<ApiResponse<void>> {
  return request({
    url: SYSTEM_ENDPOINTS.USER_CHANGE_PASSWORD(id),
    method: 'post',
    data
  });
}

/**
 * 更新用户角色
 */
export function updateUserRoles(userId: string, roleIds: string[]): Promise<ApiResponse<User>> {
  return request({
    url: `${SYSTEM_ENDPOINTS.USERS}/${userId}/roles`,
    method: 'put',
    data: { roleIds }
  }).then(response => {
    if (response.data) {
      response.data = transformUserData(response.data);
    }
    return response;
  });
}

// ==================== 角色管理 API ====================

/**
 * 获取角色列表
 */
export function getRoles(params?: PaginationParams): Promise<ApiResponse<Role[] | PaginatedResult<Role>>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLES,
    method: 'get',
    params
  });
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id: number | string): Promise<ApiResponse<Role>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLE_BY_ID(id),
    method: 'get'
  });
}

/**
 * 获取当前用户的角色
 */
export function getMyRoles(): Promise<ApiResponse<Role[]>> {
  return request({
    url: SYSTEM_ENDPOINTS.MY_ROLES,
    method: 'get'
  });
}

/**
 * 检查用户是否有指定角色
 */
export function checkUserRole(roleCode: string): Promise<ApiResponse<{
  hasRole: boolean;
  roleCode: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.CHECK_ROLE(roleCode),
    method: 'get'
  });
}

/**
 * 创建角色
 */
export function createRole(data: RoleParams): Promise<ApiResponse<Role>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLES,
    method: 'post',
    data
  });
}

/**
 * 更新角色
 */
export function updateRole(id: number | string, data: Partial<RoleParams>): Promise<ApiResponse<Role>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLE_BY_ID(id),
    method: 'put',
    data
  });
}

/**
 * 删除角色
 */
export function deleteRole(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLE_BY_ID(id),
    method: 'delete'
  });
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number | string, status: 'active' | 'inactive'): Promise<ApiResponse<Role>> {
  return updateRole(id, { status });
}

// ==================== 权限管理 API ====================

/**
 * 获取权限树
 */
export function getPermissionTree(): Promise<ApiResponse<Permission[]>> {
  return request({
    url: SYSTEM_ENDPOINTS.PERMISSIONS,
    method: 'get'
  });
}

/**
 * 获取权限详情
 */
export function getPermissionDetail(id: number | string): Promise<ApiResponse<Permission>> {
  return request({
    url: SYSTEM_ENDPOINTS.PERMISSION_BY_ID(id),
    method: 'get'
  });
}

/**
 * 获取当前用户可访问的页面列表
 */
export function getUserPagePermissions(): Promise<ApiResponse<{
  userId: number;
  pages: Permission[];
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.MY_PAGES,
    method: 'get'
  });
}

/**
 * 检查页面访问权限
 */
export function checkPageAccess(pagePath: string): Promise<ApiResponse<{
  userId: number;
  pagePath: string;
  hasAccess: boolean;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.CHECK_PAGE(pagePath),
    method: 'get'
  });
}

/**
 * 获取角色的页面权限
 */
export function getRolePagePermissions(roleId: number | string): Promise<ApiResponse<{
  role: Role;
  pages: Permission[];
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.ROLE_PAGES(roleId),
    method: 'get'
  });
}

/**
 * 更新角色的页面权限
 */
export function updateRolePagePermissions(roleId: number | string, permissionIds: number[]): Promise<ApiResponse<{
  roleId: number;
  permissionIds: number[];
  message: string;
}>> {
  return request({
    url: SYSTEM_ENDPOINTS.UPDATE_ROLE_PAGES(roleId),
    method: 'put',
    data: { permissionIds }
  });
}

/**
 * 创建权限
 */
export function createPermission(data: PermissionParams): Promise<ApiResponse<Permission>> {
  return request({
    url: SYSTEM_ENDPOINTS.PERMISSIONS,
    method: 'post',
    data
  });
}

/**
 * 更新权限
 */
export function updatePermission(id: number | string, data: Partial<PermissionParams>): Promise<ApiResponse<Permission>> {
  return request({
    url: SYSTEM_ENDPOINTS.PERMISSION_BY_ID(id),
    method: 'put',
    data
  });
}

/**
 * 删除权限
 */
export function deletePermission(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: SYSTEM_ENDPOINTS.PERMISSION_BY_ID(id),
    method: 'delete'
  });
}

/**
 * 获取角色权限列表
 */
export function getRolePermissions(id: number | string): Promise<ApiResponse<Permission[]>> {
  return getRolePagePermissions(id).then(response => ({
    ...response,
    data: response.data?.pages || []
  }));
}

/**
 * 分配角色权限
 */
export function assignRolePermissions(id: number | string, permissionIds: number[]): Promise<ApiResponse<Role>> {
  return updateRolePagePermissions(id, permissionIds).then(response => ({
    ...response,
    data: { id: Number(id) } as Role
  }));
}

// ==================== 系统日志 API ====================

/**
 * 获取系统日志列表
 */
export function getSystemLogs(params?: SystemLogParams): Promise<ApiResponse<PaginatedResult<SystemLog>>> {
  return request({
    url: SYSTEM_ENDPOINTS.LOGS,
    method: 'get',
    params
  });
}

/**
 * 导出系统日志
 */
export function exportSystemLogs(params?: Record<string, any>): Promise<ApiResponse<{ url: string }>> {
  return request({
    url: `${SYSTEM_ENDPOINTS.LOGS}/export`,
    method: 'get',
    params
  });
}

/**
 * 删除系统日志
 */
export function deleteSystemLog(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: `${SYSTEM_ENDPOINTS.LOGS}/${id}`,
    method: 'delete'
  });
}

/**
 * 清理系统日志
 */
export function clearSystemLogs(params?: Record<string, any>): Promise<ApiResponse<void>> {
  return request({
    url: `${SYSTEM_ENDPOINTS.LOGS}/clear`,
    method: 'delete',
    data: params
  });
}

// ==================== 兼容性API (保持向后兼容) ====================

/**
 * @deprecated 使用 getSystemInfo 替代
 */
// export const getSystemStats = getSystemInfo; // 已移除重复定义

/**
 * @deprecated 使用 getSystemHealth 替代
 */
export const getSystemPerformance = getSystemHealth;

/**
 * @deprecated 使用 getSystemLogs 替代
 */
export const getSystemOperationLogs = getSystemLogs;

/**
 * 获取系统设置 (兼容性方法)
 */
export function getSettings(group?: string): Promise<ApiResponse<any[]>> {
  return request({
    url: '/api15527',
    method: 'get',
    params: group ? { group } : undefined
  });
}

/**
 * 更新系统设置 (兼容性方法)
 */
export function updateSettings(group: string, settings: any[]): Promise<ApiResponse<any[]>> {
  return request({
    url: '/api15765',
    method: 'put',
    data: { group, settings }
  });
}

// ==================== 消息模板管理 API ====================

/**
 * 消息模板接口
 */
export interface MessageTemplate {
  id: string;
  code: string;
  name: string;
  type: 'email' | 'sms' | 'notification' | 'wechat';
  title: string;
  content: string;
  params?: string;
  description?: string;
  status: number;
  isSystem: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 模板统计接口
 */
export interface MessageTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  systemTemplates: number;
  customTemplates: number;
}

/**
 * 获取消息模板列表
 */
export function getMessageTemplates(params?: PaginationParams): Promise<ApiResponse<PaginatedResult<MessageTemplate>>> {
  return request({
    url: '/api16571',
    method: 'get',
    params
  });
}

/**
 * 获取消息模板统计
 */
export function getMessageTemplateStats(): Promise<ApiResponse<MessageTemplateStats>> {
  return request({
    url: '/api16775',
    method: 'get'
  });
}

/**
 * 创建消息模板
 */
export function createMessageTemplate(data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>> {
  return request({
    url: '/api16994',
    method: 'post',
    data
  });
}

/**
 * 更新消息模板
 */
export function updateMessageTemplate(id: string, data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>> {
  return request({
    url: `/system/message-templates/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除消息模板
 */
export function deleteMessageTemplate(id: string): Promise<ApiResponse<void>> {
  return request({
    url: `/system/message-templates/${id}`,
    method: 'delete'
  });
}

/**
 * 更新模板状态
 */
export function updateMessageTemplateStatus(id: string, status: number): Promise<ApiResponse<void>> {
  return request({
    url: `/system/message-templates/${id}/status`,
    method: 'put',
    data: { status }
  });
}

/**
 * 批量删除消息模板
 */
export function batchDeleteMessageTemplates(ids: string[]): Promise<ApiResponse<void>> {
  return request({
    url: '/api17869',
    method: 'post',
    data: { ids }
  });
}

// ==================== AI模型管理 API ====================

/**
 * AI模型接口
 */
export interface AIModel {
  id: string;
  name: string;
  modelName?: string;
  displayName?: string;
  provider: string;
  type: string;
  capabilities?: string[];
  version: string;
  endpoint: string;
  apiEndpoint?: string;
  apiKey: string;
  organizationId?: string;
  authType: string;
  maxTokens: number;
  contextWindow?: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  timeout: number;
  retryCount: number;
  rateLimit: number;
  dailyCostLimit: number;
  status: number;
  isActive?: boolean;
  isDefault?: boolean;
  health?: string;
  requestCount?: number;
  cost?: number;
  lastUsed?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * AI模型统计接口
 */
export interface AIModelStats {
  totalModels: number;
  activeModels: number;
  totalRequests: number;
  totalCost: number;
}

/**
 * 获取AI模型列表
 */
export function getAIModels(params?: PaginationParams): Promise<ApiResponse<PaginatedResult<AIModel>>> {
  return request({
    url: '/api19046',
    method: 'get',
    params
  });
}

/**
 * 获取AI模型统计
 */
export function getAIModelStats(): Promise<ApiResponse<AIModelStats>> {
  return request({
    url: '/api19226',
    method: 'get'
  });
}

/**
 * 创建AI模型
 */
export function createAIModel(data: Partial<AIModel>): Promise<ApiResponse<AIModel>> {
  return request({
    url: '/api19413',
    method: 'post',
    data
  });
}

/**
 * 更新AI模型
 */
export function updateAIModel(id: string, data: Partial<AIModel>): Promise<ApiResponse<AIModel>> {
  return request({
    url: `/system/ai-models/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除AI模型
 */
export function deleteAIModel(id: string): Promise<ApiResponse<void>> {
  return request({
    url: `/system/ai-models/${id}`,
    method: 'delete'
  });
}

/**
 * 更新AI模型状态
 */
export function updateAIModelStatus(id: string, status: number): Promise<ApiResponse<void>> {
  return request({
    url: `/system/ai-models/${id}/status`,
    method: 'put',
    data: { status }
  });
}

/**
 * 测试AI模型
 */
export function testAIModel(id: string, data: { message: string }): Promise<ApiResponse<{
  success: boolean;
  response?: string;
  responseTime?: number;
  tokensUsed?: number;
  cost?: number;
  error?: string;
}>> {
  return request({
    url: `/system/ai-models/${id}/test`,
    method: 'post',
    data
  });
}

/**
 * 批量测试AI模型
 */
export function batchTestAIModels(ids: string[]): Promise<ApiResponse<void>> {
  return request({
    url: '/api20544',
    method: 'post',
    data: { ids }
  });
}

/**
 * 批量删除AI模型
 */
export function batchDeleteAIModels(ids: string[]): Promise<ApiResponse<void>> {
  return request({
    url: '/api20752',
    method: 'post',
    data: { ids }
  });
}

// ==================== 系统仪表盘 API ====================

/**
 * 系统统计数据接口
 */
export interface SystemStats {
  userCount: number;
  activeUsers: number;
  roleCount: number;
  permissionCount: number;
  todayLogCount: number;
  errorLogCount: number;
  uptime: string;
  cpuUsage: number;
}

/**
 * 系统详细信息接口
 */
export interface SystemDetailInfo {
  version: string;
  lastUpdate: string;
  os: string;
  database: string;
  memoryUsage: string;
  diskSpace: string;
}

/**
 * 获取系统统计数据
 */
export function getSystemStats(): Promise<ApiResponse<SystemStats>> {
  return requestInstance.get('/system/stats');
}

/**
 * 获取系统详细信息
 */
export function getSystemDetailInfo(): Promise<ApiResponse<SystemDetailInfo>> {
  return requestInstance.get('/system/detail-info');
}